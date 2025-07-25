/**
 * Transaction Validation Service
 * 
 * Handles transaction validation, unusual pattern detection,
 * and user spending pattern analysis
 */

export interface ValidationConfig {
  largeAmountThreshold?: number;
  lowConfidenceThreshold?: number;
  spendingAnalysisMonths?: number;
  standardDeviationMultiplier?: number;
  averageMultiplier?: number;
}

export interface DatabaseClient {
  from(table: string): any;
}

export interface User {
  id: string;
}

export interface ValidatedTransaction {
  is_unusual: boolean;
  unusual_reasons: string[];
  [key: string]: any;
}

export class TransactionValidationService {
  private config: Required<ValidationConfig> = {
    largeAmountThreshold: 5000000, // 5 million VND
    lowConfidenceThreshold: 0.5,
    spendingAnalysisMonths: 3,
    standardDeviationMultiplier: 2.5,
    averageMultiplier: 3
  };

  constructor(config?: ValidationConfig) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Detect unusual transactions based on multiple criteria
   */
  async detectUnusualTransactions(
    transactions: any[],
    user: User,
    database: DatabaseClient
  ): Promise<ValidatedTransaction[]> {
    return Promise.all(
      transactions.map(async (transaction) => {
        const unusualReasons: string[] = [];
        let isUnusual = false;

        // Check 1: Large amount threshold
        if (transaction.amount > this.config.largeAmountThreshold) {
          unusualReasons.push(
            `Large amount: ${transaction.amount.toLocaleString("vi-VN")} VND exceeds ${this.config.largeAmountThreshold.toLocaleString("vi-VN")} VND threshold`
          );
          isUnusual = true;
        }

        // Check 2: Low confidence score
        if (transaction.confidence_score < this.config.lowConfidenceThreshold) {
          unusualReasons.push(
            `Low AI confidence: ${Math.round(transaction.confidence_score * 100)}% confidence is below ${this.config.lowConfidenceThreshold * 100}% threshold`
          );
          isUnusual = true;
        }

        // Check 3: Compare with user's spending patterns
        const spendingPatternResult = await this.analyzeSpendingPattern(
          transaction, 
          user, 
          database
        );
        
        if (spendingPatternResult.isUnusual) {
          unusualReasons.push(spendingPatternResult.reason);
          isUnusual = true;
        }

        // Check 4: Suspicious patterns in text
        const suspiciousPatternResult = this.detectSuspiciousPatterns(transaction);
        if (suspiciousPatternResult.isUnusual) {
          unusualReasons.push(suspiciousPatternResult.reason);
          isUnusual = true;
        }

        // Check 5: Business logic validation
        const businessLogicResult = this.validateBusinessLogic(transaction);
        if (businessLogicResult.isUnusual) {
          unusualReasons.push(businessLogicResult.reason);
          isUnusual = true;
        }

        return {
          ...transaction,
          is_unusual: isUnusual,
          unusual_reasons: unusualReasons,
        };
      })
    );
  }

  /**
   * Analyze user's spending patterns for this category
   */
  private async analyzeSpendingPattern(
    transaction: any,
    user: User,
    database: DatabaseClient
  ): Promise<{ isUnusual: boolean; reason: string }> {
    try {
      if (!transaction.suggested_category_id || transaction.transaction_type !== "expense") {
        return { isUnusual: false, reason: "" };
      }

      // Get user's recent transactions for this category
      const analysisDate = new Date();
      analysisDate.setMonth(analysisDate.getMonth() - this.config.spendingAnalysisMonths);

      const { data: recentTransactions, error } = await database
        .from("expense_transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("expense_category_id", transaction.suggested_category_id)
        .gte("transaction_date", analysisDate.toISOString().split("T")[0])
        .order("transaction_date", { ascending: false })
        .limit(50);

      if (error || !recentTransactions || recentTransactions.length < 5) {
        return { isUnusual: false, reason: "" };
      }

      // Statistical analysis
      const amounts = recentTransactions.map((t) => t.amount);
      const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const standardDeviation = Math.sqrt(
        amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length
      );

      // Flag as unusual if significantly above normal spending
      const threshold = average + this.config.standardDeviationMultiplier * standardDeviation;
      const isSignificantlyHigher = transaction.amount > threshold && 
                                   transaction.amount > average * this.config.averageMultiplier;

      if (isSignificantlyHigher) {
        return {
          isUnusual: true,
          reason: `Unusually high for category: ${transaction.amount.toLocaleString("vi-VN")} VND is ${Math.round(transaction.amount / average)}x your average of ${Math.round(average).toLocaleString("vi-VN")} VND`
        };
      }

      return { isUnusual: false, reason: "" };
    } catch (error) {
      console.warn("Error analyzing spending patterns:", error);
      return { isUnusual: false, reason: "" };
    }
  }

  /**
   * Detect suspicious patterns in transaction text
   */
  private detectSuspiciousPatterns(transaction: any): { isUnusual: boolean; reason: string } {
    const suspiciousPatterns = [
      { pattern: /\b(test|testing|fake|dummy)\b/i, description: "test data indicators" },
      { pattern: /\b999+\b/, description: "repeated 9s (often test data)" },
      { pattern: /\b(lorem|ipsum)\b/i, description: "lorem ipsum placeholder text" },
      { pattern: /\b(asdf|qwerty|123456)\b/i, description: "keyboard mashing patterns" },
      { pattern: /^.{1,2}$/, description: "suspiciously short description" },
      { pattern: /(.)\1{4,}/, description: "repeated characters" }
    ];

    const textToCheck = `${transaction.description || ""} ${transaction.notes || ""}`.toLowerCase();
    
    for (const { pattern, description } of suspiciousPatterns) {
      if (pattern.test(textToCheck)) {
        return {
          isUnusual: true,
          reason: `Suspicious pattern detected: ${description} in "${transaction.description}"`
        };
      }
    }

    return { isUnusual: false, reason: "" };
  }

  /**
   * Validate business logic constraints
   */
  private validateBusinessLogic(transaction: any): { isUnusual: boolean; reason: string } {
    const issues: string[] = [];

    // Amount validation
    if (!transaction.amount || transaction.amount <= 0) {
      issues.push("invalid or zero amount");
    }

    // Extremely large amounts (beyond reasonable daily spending)
    if (transaction.amount > 100000000) { // 100 million VND
      issues.push("amount exceeds reasonable daily spending limit");
    }

    // Description validation
    if (!transaction.description || transaction.description.trim().length === 0) {
      issues.push("missing transaction description");
    }

    // Transaction type validation
    if (!transaction.transaction_type || 
        !['expense', 'income', 'transfer'].includes(transaction.transaction_type)) {
      issues.push("invalid transaction type");
    }

    // Category validation for expenses/income
    if ((transaction.transaction_type === 'expense' || transaction.transaction_type === 'income') &&
        !transaction.suggested_category_id) {
      issues.push("missing category for expense/income transaction");
    }

    // Date validation (if provided)
    if (transaction.extracted_date) {
      const transactionDate = new Date(transaction.extracted_date);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const oneMonthFuture = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      if (transactionDate < oneYearAgo || transactionDate > oneMonthFuture) {
        issues.push("transaction date is unusually far in past or future");
      }
    }

    if (issues.length > 0) {
      return {
        isUnusual: true,
        reason: `Business logic validation failed: ${issues.join(", ")}`
      };
    }

    return { isUnusual: false, reason: "" };
  }

  /**
   * Validate transaction structure and required fields
   */
  validateTransactionStructure(transaction: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    const requiredFields = ['transaction_type', 'amount', 'description'];
    for (const field of requiredFields) {
      if (!transaction[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Type validation
    if (transaction.amount && (typeof transaction.amount !== 'number' || transaction.amount < 0)) {
      errors.push('Amount must be a positive number');
    }

    if (transaction.confidence_score && 
        (typeof transaction.confidence_score !== 'number' || 
         transaction.confidence_score < 0 || 
         transaction.confidence_score > 1)) {
      errors.push('Confidence score must be a number between 0 and 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Update validation configuration
   */
  updateConfig(newConfig: Partial<ValidationConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current validation configuration
   */
  getConfig(): ValidationConfig {
    return { ...this.config };
  }

  /**
   * Get validation statistics for a set of transactions
   */
  getValidationStats(transactions: ValidatedTransaction[]) {
    const total = transactions.length;
    const unusual = transactions.filter(t => t.is_unusual).length;
    const normal = total - unusual;

    const reasonCounts = transactions
      .filter(t => t.is_unusual)
      .reduce((acc, t) => {
        t.unusual_reasons.forEach(reason => {
          const category = this.categorizeUnusualReason(reason);
          acc[category] = (acc[category] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

    return {
      total,
      normal,
      unusual,
      unusualPercentage: total > 0 ? Math.round((unusual / total) * 100) : 0,
      reasonBreakdown: reasonCounts
    };
  }

  /**
   * Categorize unusual reasons for statistics
   */
  private categorizeUnusualReason(reason: string): string {
    if (reason.includes('Large amount')) return 'Large Amount';
    if (reason.includes('Low AI confidence')) return 'Low Confidence';
    if (reason.includes('Unusually high for category')) return 'Spending Pattern';
    if (reason.includes('Suspicious pattern')) return 'Suspicious Text';
    if (reason.includes('Business logic')) return 'Business Logic';
    return 'Other';
  }
}