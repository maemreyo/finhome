/**
 * Data Access Service
 * 
 * Handles all database operations and queries for transaction parsing
 * Centralizes database access patterns and error handling
 */

export interface DatabaseClient {
  from(table: string): any;
  auth: {
    getUser(): Promise<{ data: { user: any | null }; error: any }>;
  };
}

export interface User {
  id: string;
  email?: string;
  created_at?: string;
}

export interface CategoryData {
  id: string;
  name_vi: string;
  name_en: string;
  category_key: string;
  description_vi?: string;
  description_en?: string;
  parent_id?: string;
  is_active: boolean;
}

export interface WalletData {
  id: string;
  name: string;
  wallet_type: string;
  currency: string;
  is_active?: boolean; // Optional since some wallet tables may not have this column
}

export interface UserCorrectionData {
  id: string;
  user_id: string;
  input_text: string;
  corrected_category: string;
  correction_type: string;
  created_at: string;
}

export interface TransactionData {
  id?: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  description: string;
  transaction_date: string;
  expense_category_id?: string;
  income_category_id?: string;
  wallet_id?: string;
  tags?: string[];
  merchant?: string;
  notes?: string;
  confidence_score?: number;
  is_unusual?: boolean;
  unusual_reasons?: string[];
  created_at?: string;
  updated_at?: string;
}

export class DataAccessService {
  constructor(private database: DatabaseClient) {}

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await this.database.auth.getUser();
      
      if (error) {
        console.error("Error getting current user:", error);
        return { user: null, error };
      }

      return { user: data?.user || null, error: null };
    } catch (error) {
      console.error("Database error getting user:", error);
      return { user: null, error };
    }
  }

  /**
   * Get all active expense categories (global/system-wide)
   */
  async getExpenseCategories(userId: string): Promise<{ data: CategoryData[]; error: any }> {
    try {
      const { data, error } = await this.database
        .from("expense_categories")
        .select("*")
        .eq("is_active", true)
        .order("name_vi");

      if (error) {
        console.error("Error fetching expense categories:", error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Database error fetching expense categories:", error);
      return { data: [], error };
    }
  }

  /**
   * Get all active income categories (global/system-wide)
   */
  async getIncomeCategories(userId: string): Promise<{ data: CategoryData[]; error: any }> {
    try {
      const { data, error } = await this.database
        .from("income_categories")
        .select("*")
        .eq("is_active", true)
        .order("name_vi");

      if (error) {
        console.error("Error fetching income categories:", error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Database error fetching income categories:", error);
      return { data: [], error };
    }
  }

  /**
   * Get all active wallets for a user
   */
  async getWallets(userId: string): Promise<{ data: WalletData[]; error: any }> {
    try {
      const { data, error } = await this.database
        .from("expense_wallets")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) {
        console.error("Error fetching wallets:", error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Database error fetching wallets:", error);
      return { data: [], error };
    }
  }

  /**
   * Get recent user corrections for learning patterns
   */
  async getRecentUserCorrections(
    userId: string, 
    limit: number = 10
  ): Promise<{ data: UserCorrectionData[]; error: any }> {
    try {
      const { data, error } = await this.database
        .from("user_ai_corrections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        // If table doesn't exist, return empty array (not critical)
        if (error.code === '42P01') {
          console.log("User corrections table not available yet, continuing without corrections");
          return { data: [], error: null };
        }
        
        console.error("Error fetching user corrections:", error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Database error fetching user corrections:", error);
      return { data: [], error: null }; // Continue without corrections
    }
  }

  /**
   * Get user's recent transactions for spending pattern analysis
   */
  async getRecentTransactionsForCategory(
    userId: string,
    categoryId: string,
    months: number = 3,
    limit: number = 50
  ): Promise<{ data: TransactionData[]; error: any }> {
    try {
      const analysisDate = new Date();
      analysisDate.setMonth(analysisDate.getMonth() - months);

      const { data, error } = await this.database
        .from("expense_transactions")
        .select("amount, transaction_date, description")
        .eq("user_id", userId)
        .eq("expense_category_id", categoryId)
        .gte("transaction_date", analysisDate.toISOString().split("T")[0])
        .order("transaction_date", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching recent transactions:", error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Database error fetching recent transactions:", error);
      return { data: [], error };
    }
  }

  /**
   * Save parsed transactions to database
   */
  async saveTransactions(transactions: TransactionData[]): Promise<{ data: any[]; error: any }> {
    try {
      const transactionsToSave = transactions.map(transaction => ({
        ...transaction,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Separate expense and income transactions
      const expenseTransactions = transactionsToSave.filter(t => t.transaction_type === 'expense');
      const incomeTransactions = transactionsToSave.filter(t => t.transaction_type === 'income');
      const transferTransactions = transactionsToSave.filter(t => t.transaction_type === 'transfer');

      const results = [];

      // Save expense transactions
      if (expenseTransactions.length > 0) {
        const { data, error } = await this.database
          .from("expense_transactions")
          .insert(expenseTransactions.map(t => ({
            user_id: t.user_id,
            amount: t.amount,
            description: t.description,
            transaction_date: t.transaction_date,
            expense_category_id: t.expense_category_id,
            wallet_id: t.wallet_id,
            tags: t.tags,
            merchant: t.merchant,
            notes: t.notes,
            confidence_score: t.confidence_score,
            is_unusual: t.is_unusual,
            unusual_reasons: t.unusual_reasons,
            created_at: t.created_at,
            updated_at: t.updated_at
          })))
          .select();

        if (error) {
          console.error("Error saving expense transactions:", error);
          return { data: [], error };
        }

        results.push(...(data || []));
      }

      // Save income transactions
      if (incomeTransactions.length > 0) {
        const { data, error } = await this.database
          .from("income_transactions")
          .insert(incomeTransactions.map(t => ({
            user_id: t.user_id,
            amount: t.amount,
            description: t.description,
            transaction_date: t.transaction_date,
            income_category_id: t.income_category_id,
            wallet_id: t.wallet_id,
            tags: t.tags,
            merchant: t.merchant,
            notes: t.notes,
            confidence_score: t.confidence_score,
            is_unusual: t.is_unusual,
            unusual_reasons: t.unusual_reasons,
            created_at: t.created_at,
            updated_at: t.updated_at
          })))
          .select();

        if (error) {
          console.error("Error saving income transactions:", error);
          return { data: [], error };
        }

        results.push(...(data || []));
      }

      // Save transfer transactions (if table exists)
      if (transferTransactions.length > 0) {
        const { data, error } = await this.database
          .from("transfer_transactions")
          .insert(transferTransactions.map(t => ({
            user_id: t.user_id,
            amount: t.amount,
            description: t.description,
            transaction_date: t.transaction_date,
            from_wallet_id: t.wallet_id,
            to_wallet_id: null, // Would need to be determined from transaction data
            notes: t.notes,
            confidence_score: t.confidence_score,
            is_unusual: t.is_unusual,
            unusual_reasons: t.unusual_reasons,
            created_at: t.created_at,
            updated_at: t.updated_at
          })))
          .select();

        if (error) {
          console.error("Error saving transfer transactions:", error);
          return { data: [], error };
        }

        results.push(...(data || []));
      }

      return { data: results, error: null };
    } catch (error) {
      console.error("Database error saving transactions:", error);
      return { data: [], error };
    }
  }

  /**
   * Log parsing attempts for analytics
   */
  async logParsingAttempt(
    userId: string,
    inputText: string,
    resultSummary: string,
    parsingMetadata: any
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await this.database
        .from("parsing_logs")
        .insert({
          user_id: userId,
          input_text: inputText.substring(0, 500), // Limit text length
          result_summary: resultSummary,
          parsing_metadata: parsingMetadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Error logging parsing attempt:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Database error logging parsing attempt:", error);
      return { data: null, error };
    }
  }

  /**
   * Get parsing statistics for user analytics
   */
  async getParsingStats(
    userId: string,
    days: number = 30
  ): Promise<{ data: any; error: any }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.database
        .from("parsing_logs")
        .select("result_summary, parsing_metadata, created_at")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching parsing stats:", error);
        return { data: null, error };
      }

      // Process stats
      const logs: any[] = data || [];
      const stats = {
        total_attempts: logs.length,
        successful_parses: logs.filter(l => l.parsing_metadata?.total_transactions_found > 0).length,
        average_confidence: logs.reduce((sum, l) => sum + (l.parsing_metadata?.average_confidence || 0), 0) / logs.length,
        total_transactions_parsed: logs.reduce((sum, l) => sum + (l.parsing_metadata?.total_transactions_found || 0), 0),
        fallback_usage: logs.filter(l => l.parsing_metadata?.fallback_method).length,
        high_confidence_rate: logs.filter(l => (l.parsing_metadata?.average_confidence || 0) >= 0.8).length / logs.length
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error("Database error fetching parsing stats:", error);
      return { data: null, error };
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<{ healthy: boolean; error?: any }> {
    try {
      const { data, error } = await this.database
        .from("expense_categories")
        .select("id")
        .limit(1);

      if (error) {
        return { healthy: false, error };
      }

      return { healthy: true };
    } catch (error) {
      return { healthy: false, error };
    }
  }

  /**
   * Get database connection info for debugging
   */
  getConnectionInfo(): any {
    return {
      type: "supabase",
      connected: !!this.database,
      timestamp: new Date().toISOString()
    };
  }
}