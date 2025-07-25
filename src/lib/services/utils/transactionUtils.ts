/**
 * Transaction Utilities
 * 
 * Common helper functions for transaction processing and manipulation
 */

export interface Transaction {
  transaction_type: string;
  amount: number;
  description: string;
  suggested_category_id?: string;
  suggested_category_name?: string;
  confidence_score?: number;
  extracted_date?: string;
  tags?: string[];
  merchant?: string;
  notes?: string;
  is_unusual?: boolean;
  unusual_reasons?: string[];
}

export class TransactionUtils {
  /**
   * Convert Vietnamese amount strings to numbers
   */
  static parseVietnameseAmount(amountStr: string): number {
    if (!amountStr || typeof amountStr !== 'string') return 0;

    const cleanStr = amountStr.toLowerCase().trim();
    
    // Handle different Vietnamese number formats
    const patterns = [
      { regex: /(\d+(?:\.\d+)?)\s*tr(?:iệu)?/g, multiplier: 1000000 },
      { regex: /(\d+(?:\.\d+)?)\s*k/g, multiplier: 1000 },
      { regex: /(\d+(?:\.\d+)?)\s*(?:đồng|vnd)/g, multiplier: 1 },
      { regex: /(\d+(?:\.\d+)?)/g, multiplier: 1 }
    ];

    for (const { regex, multiplier } of patterns) {
      const match = cleanStr.match(regex);
      if (match) {
        const numberMatch = match[0].match(/(\d+(?:\.\d+)?)/);
        if (numberMatch) {
          return parseFloat(numberMatch[1]) * multiplier;
        }
      }
    }

    return 0;
  }

  /**
   * Format amount to Vietnamese currency
   */
  static formatVietnameseCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} triệu VND`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k VND`;
    } else {
      return `${amount.toLocaleString('vi-VN')} VND`;
    }
  }

  /**
   * Extract transaction date from Vietnamese text
   */
  static extractVietnameseDate(text: string, currentDate = new Date()): string | null {
    const cleanText = text.toLowerCase().trim();
    
    // Relative date patterns
    const relativePatterns = [
      {
        pattern: /hôm\s+qua|hqua/,
        offset: -1
      },
      {
        pattern: /hôm\s+nay|hnay/,
        offset: 0
      },
      {
        pattern: /ngày\s+mai|mai/,
        offset: 1
      },
      {
        pattern: /(\d+)\s+ngày\s+trước/,
        offset: (match: RegExpMatchArray) => -parseInt(match[1])
      }
    ];

    for (const { pattern, offset } of relativePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        const days = typeof offset === 'function' ? offset(match) : offset;
        const targetDate = new Date(currentDate);
        targetDate.setDate(targetDate.getDate() + days);
        return targetDate.toISOString().split('T')[0];
      }
    }

    // Specific date patterns (DD/MM/YYYY, DD-MM-YYYY)
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/
    ];

    for (const pattern of datePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        let [, day, month, year] = match;
        
        // Handle 2-digit year
        if (year.length === 2) {
          const currentYear = currentDate.getFullYear();
          const currentCentury = Math.floor(currentYear / 100) * 100;
          year = (currentCentury + parseInt(year)).toString();
        }

        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (date.getTime()) {
          return date.toISOString().split('T')[0];
        }
      }
    }

    return null;
  }

  /**
   * Generate appropriate tags based on transaction content
   */
  static generateTags(transaction: Transaction): string[] {
    const tags: string[] = [];
    const description = (transaction.description || '').toLowerCase();

    // Confidence-based tags
    if (transaction.confidence_score && transaction.confidence_score < 0.6) {
      tags.push('#low-confidence');
    }
    if (transaction.confidence_score && transaction.confidence_score >= 0.9) {
      tags.push('#high-confidence');
    }

    // Unusual transaction tags
    if (transaction.is_unusual) {
      tags.push('#unusual');
    }

    // Amount-based tags
    if (transaction.amount >= 5000000) { // 5 million VND
      tags.push('#large-amount');
    }

    // Content-based tags
    const contentPatterns = [
      { pattern: /taxi|grab|uber/, tag: '#ride-sharing' },
      { pattern: /cafe|cà phê|coffee|cf/, tag: '#cafe' },
      { pattern: /ăn\s+sáng|breakfast/, tag: '#breakfast' },
      { pattern: /ăn\s+trưa|lunch/, tag: '#lunch' },
      { pattern: /ăn\s+tối|dinner/, tag: '#dinner' },
      { pattern: /xăng|bơm\s+xe|fuel/, tag: '#fuel' },
      { pattern: /siêu\s+thị|supermarket/, tag: '#grocery' },
      { pattern: /online|mua\s+online/, tag: '#online-purchase' },
      { pattern: /tiền\s+mặt|cash/, tag: '#cash' },
      { pattern: /chuyển\s+khoản|transfer/, tag: '#transfer' }
    ];

    for (const { pattern, tag } of contentPatterns) {
      if (pattern.test(description)) {
        tags.push(tag);
      }
    }

    return tags.slice(0, 5); // Limit to 5 tags
  }

  /**
   * Clean and normalize transaction description
   */
  static normalizeDescription(description: string): string {
    if (!description) return '';

    return description
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[^\w\s\-.,áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]/g, '') // Keep Vietnamese characters
      .substring(0, 100); // Limit length
  }

  /**
   * Merge duplicate transactions
   */
  static mergeDuplicateTransactions(transactions: Transaction[]): Transaction[] {
    const merged: Transaction[] = [];
    const seen = new Set<string>();

    for (const transaction of transactions) {
      // Create a key for duplicate detection
      const key = `${transaction.transaction_type}_${transaction.amount}_${transaction.description}_${transaction.extracted_date}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(transaction);
      } else {
        // If duplicate found, enhance the existing one with additional info
        const existing = merged.find(t => 
          t.transaction_type === transaction.transaction_type &&
          t.amount === transaction.amount &&
          t.description === transaction.description &&
          t.extracted_date === transaction.extracted_date
        );

        if (existing) {
          // Merge tags
          if (transaction.tags) {
            existing.tags = [...new Set([...(existing.tags || []), ...transaction.tags])];
          }
          
          // Take higher confidence score
          if (transaction.confidence_score && 
              (!existing.confidence_score || transaction.confidence_score > existing.confidence_score)) {
            existing.confidence_score = transaction.confidence_score;
          }

          // Merge notes
          if (transaction.notes && existing.notes !== transaction.notes) {
            existing.notes = existing.notes ? 
              `${existing.notes}; ${transaction.notes}` : 
              transaction.notes;
          }
        }
      }
    }

    return merged;
  }

  /**
   * Sort transactions by confidence and relevance
   */
  static sortTransactionsByRelevance(transactions: Transaction[]): Transaction[] {
    return transactions.sort((a, b) => {
      // First by confidence score (descending)
      const confidenceDiff = (b.confidence_score || 0) - (a.confidence_score || 0);
      if (Math.abs(confidenceDiff) > 0.1) return confidenceDiff;

      // Then by amount (descending for expenses, ascending for income)
      if (a.transaction_type === 'expense' && b.transaction_type === 'expense') {
        return b.amount - a.amount;
      }
      if (a.transaction_type === 'income' && b.transaction_type === 'income') {
        return b.amount - a.amount;
      }

      // Then by transaction type priority (income > expense > transfer)
      const typePriority = { 'income': 3, 'expense': 2, 'transfer': 1 };
      const aPriority = typePriority[a.transaction_type as keyof typeof typePriority] || 0;
      const bPriority = typePriority[b.transaction_type as keyof typeof typePriority] || 0;
      
      return bPriority - aPriority;
    });
  }

  /**
   * Validate transaction structure
   */
  static validateTransaction(transaction: Transaction): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!transaction.transaction_type) {
      errors.push('Missing transaction type');
    } else if (!['expense', 'income', 'transfer'].includes(transaction.transaction_type)) {
      errors.push('Invalid transaction type');
    }

    if (!transaction.amount || transaction.amount <= 0) {
      errors.push('Invalid or missing amount');
    }

    if (!transaction.description || transaction.description.trim().length === 0) {
      errors.push('Missing description');
    }

    // Amount validation
    if (transaction.amount > 1000000000) { // 1 billion VND
      errors.push('Amount exceeds reasonable limit');
    }

    // Confidence score validation
    if (transaction.confidence_score !== undefined && 
        (transaction.confidence_score < 0 || transaction.confidence_score > 1)) {
      errors.push('Invalid confidence score (must be 0-1)');
    }

    // Date validation
    if (transaction.extracted_date) {
      const date = new Date(transaction.extracted_date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid date format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate transaction completeness score
   */
  static calculateCompletenessScore(transaction: Transaction): number {
    let score = 0;

    // Base fields (required)
    if (transaction.transaction_type) score += 0.2;
    if (transaction.amount > 0) score += 0.2;
    if (transaction.description) score += 0.2;

    // Enhanced fields
    if (transaction.suggested_category_id) score += 0.15;
    if (transaction.suggested_category_name) score += 0.05;
    if (transaction.extracted_date) score += 0.1;
    if (transaction.merchant) score += 0.05;
    if (transaction.tags && transaction.tags.length > 0) score += 0.03;
    if (transaction.confidence_score && transaction.confidence_score > 0.7) score += 0.02;

    return Math.min(score, 1.0);
  }

  /**
   * Generate transaction summary for analytics
   */
  static generateTransactionSummary(transactions: Transaction[]): any {
    const summary = {
      total: transactions.length,
      by_type: { expense: 0, income: 0, transfer: 0 },
      total_amount: { expense: 0, income: 0, transfer: 0 },
      confidence_stats: {
        high: 0, // >= 0.8
        medium: 0, // 0.5 - 0.8
        low: 0 // < 0.5
      },
      unusual_count: 0,
      average_confidence: 0,
      completeness_average: 0
    };

    let totalConfidence = 0;
    let totalCompleteness = 0;

    for (const transaction of transactions) {
      // Type counting
      if (summary.by_type.hasOwnProperty(transaction.transaction_type)) {
        summary.by_type[transaction.transaction_type as keyof typeof summary.by_type]++;
        summary.total_amount[transaction.transaction_type as keyof typeof summary.total_amount] += transaction.amount;
      }

      // Confidence scoring
      const confidence = transaction.confidence_score || 0.5;
      totalConfidence += confidence;
      
      if (confidence >= 0.8) summary.confidence_stats.high++;
      else if (confidence >= 0.5) summary.confidence_stats.medium++;
      else summary.confidence_stats.low++;

      // Other stats
      if (transaction.is_unusual) summary.unusual_count++;
      totalCompleteness += this.calculateCompletenessScore(transaction);
    }

    summary.average_confidence = transactions.length > 0 ? totalConfidence / transactions.length : 0;
    summary.completeness_average = transactions.length > 0 ? totalCompleteness / transactions.length : 0;

    return summary;
  }
}