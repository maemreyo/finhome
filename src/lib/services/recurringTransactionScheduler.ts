// src/lib/services/recurringTransactionScheduler.ts
// Service for managing recurring transaction scheduling
import { createClient } from '@/lib/supabase/client'

export interface RecurringTransactionStatus {
  dueTransactions: Array<{
    id: string
    name: string
    amount: number
    transaction_type: 'expense' | 'income' | 'transfer'
    next_due_date: string
    frequency: string
  }>
  upcomingTransactions: Array<{
    id: string
    name: string
    amount: number
    transaction_type: 'expense' | 'income' | 'transfer'
    next_due_date: string
    frequency: string
  }>
  processingStatus: {
    hasDueTransactions: boolean
    dueCount: number
    upcomingCount: number
  }
}

export class RecurringTransactionScheduler {
  private supabase = createClient()

  /**
   * Get the status of recurring transactions for the current user
   */
  async getRecurringTransactionStatus(): Promise<RecurringTransactionStatus> {
    try {
      const response = await fetch('/api/expenses/recurring/process', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recurring transaction status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching recurring transaction status:', error)
      return {
        dueTransactions: [],
        upcomingTransactions: [],
        processingStatus: {
          hasDueTransactions: false,
          dueCount: 0,
          upcomingCount: 0,
        }
      }
    }
  }

  /**
   * Manually trigger processing of due recurring transactions
   * This would typically be called by a cron job or scheduled task
   */
  async processRecurringTransactions(apiKey: string): Promise<{
    success: boolean
    processedCount: number
    errorCount: number
    processedTransactions: any[]
    errors: any[]
  }> {
    try {
      const response = await fetch('/api/expenses/recurring/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to process recurring transactions')
      }

      return await response.json()
    } catch (error) {
      console.error('Error processing recurring transactions:', error)
      return {
        success: false,
        processedCount: 0,
        errorCount: 1,
        processedTransactions: [],
        errors: [{ error: error instanceof Error ? error.message : 'Unknown error' }]
      }
    }
  }

  /**
   * Get user's recurring transactions with optional filtering
   */
  async getRecurringTransactions(filters?: {
    is_active?: boolean
    transaction_type?: 'expense' | 'income' | 'transfer'
  }) {
    try {
      const params = new URLSearchParams()
      
      if (filters?.is_active !== undefined) {
        params.append('is_active', filters.is_active.toString())
      }
      if (filters?.transaction_type) {
        params.append('transaction_type', filters.transaction_type)
      }

      const response = await fetch(`/api/expenses/recurring?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recurring transactions')
      }

      const data = await response.json()
      return data.recurringTransactions || []
    } catch (error) {
      console.error('Error fetching recurring transactions:', error)
      return []
    }
  }

  /**
   * Create a new recurring transaction
   */
  async createRecurringTransaction(data: {
    name: string
    wallet_id: string
    transaction_type: 'expense' | 'income' | 'transfer'
    amount: number
    description?: string
    expense_category_id?: string
    income_category_id?: string
    transfer_to_wallet_id?: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    frequency_interval: number
    start_date: string
    end_date?: string
    max_occurrences?: number
  }) {
    try {
      const response = await fetch('/api/expenses/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create recurring transaction')
      }

      const result = await response.json()
      return result.recurringTransaction
    } catch (error) {
      console.error('Error creating recurring transaction:', error)
      throw error
    }
  }

  /**
   * Update an existing recurring transaction
   */
  async updateRecurringTransaction(id: string, data: Partial<{
    name: string
    wallet_id: string
    transaction_type: 'expense' | 'income' | 'transfer'
    amount: number
    description: string
    expense_category_id: string
    income_category_id: string
    transfer_to_wallet_id: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    frequency_interval: number
    start_date: string
    end_date: string
    max_occurrences: number
    is_active: boolean
  }>) {
    try {
      const response = await fetch(`/api/expenses/recurring/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update recurring transaction')
      }

      const result = await response.json()
      return result.recurringTransaction
    } catch (error) {
      console.error('Error updating recurring transaction:', error)
      throw error
    }
  }

  /**
   * Delete (deactivate) a recurring transaction
   */
  async deleteRecurringTransaction(id: string) {
    try {
      const response = await fetch(`/api/expenses/recurring/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete recurring transaction')
      }

      return true
    } catch (error) {
      console.error('Error deleting recurring transaction:', error)
      throw error
    }
  }

  /**
   * Calculate the next due date for a recurring transaction
   */
  static calculateNextDueDate(
    lastDate: Date, 
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly', 
    interval: number
  ): Date {
    const nextDate = new Date(lastDate)
    
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval)
        break
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (interval * 7))
        break
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval)
        break
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + interval)
        break
    }
    
    return nextDate
  }

  /**
   * Format frequency text for display
   */
  static formatFrequencyText(frequency: string, interval: number): string {
    if (interval === 1) {
      switch (frequency) {
        case 'daily': return 'Daily'
        case 'weekly': return 'Weekly'
        case 'monthly': return 'Monthly'
        case 'yearly': return 'Yearly'
        default: return frequency
      }
    } else {
      switch (frequency) {
        case 'daily': return `Every ${interval} days`
        case 'weekly': return `Every ${interval} weeks`
        case 'monthly': return `Every ${interval} months`
        case 'yearly': return `Every ${interval} years`
        default: return `Every ${interval} ${frequency}`
      }
    }
  }

  /**
   * Check if a recurring transaction should be ended
   */
  static shouldEndRecurring(
    occurrencesCreated: number,
    maxOccurrences?: number,
    endDate?: string
  ): boolean {
    // Check max occurrences
    if (maxOccurrences && occurrencesCreated >= maxOccurrences) {
      return true
    }
    
    // Check end date
    if (endDate) {
      const end = new Date(endDate)
      const today = new Date()
      if (today > end) {
        return true
      }
    }
    
    return false
  }
}

// Export singleton instance
export const recurringTransactionScheduler = new RecurringTransactionScheduler()