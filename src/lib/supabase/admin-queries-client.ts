// src/lib/supabase/admin-queries-client.ts
// Client-side admin database queries for management interfaces

import { createClient } from './client'
import type { 
  Bank, 
  BankInterestRate, 
  Achievement, 
  Notification, 
  UserProfile 
} from './types'

export class AdminQueriesClient {
  private static getClient() {
    return createClient()
  }

  // ===== BANK MANAGEMENT =====
  static async getAllBanks(): Promise<Bank[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('bank_name', { ascending: true })

    if (error) {
      console.error('Error fetching banks:', error)
      throw new Error('Failed to fetch banks')
    }

    return data || []
  }

  static async createBank(bankData: Omit<Bank, 'id' | 'created_at' | 'updated_at'>): Promise<Bank> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('banks')
      .insert({
        ...bankData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating bank:', error)
      throw new Error('Failed to create bank')
    }

    return data
  }

  static async updateBank(id: string, updates: Partial<Bank>): Promise<Bank> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('banks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bank:', error)
      throw new Error('Failed to update bank')
    }

    return data
  }

  static async deleteBank(id: string): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bank:', error)
      throw new Error('Failed to delete bank')
    }
  }

  // ===== INTEREST RATE MANAGEMENT =====
  static async getAllInterestRates(): Promise<(BankInterestRate & { bank_name?: string; bank_code?: string })[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('bank_interest_rates')
      .select(`
        *,
        banks!inner(bank_name, bank_code)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching interest rates:', error)
      throw new Error('Failed to fetch interest rates')
    }

    // Flatten the bank data
    return (data || []).map(rate => ({
      ...rate,
      bank_name: (rate.banks as any)?.bank_name,
      bank_code: (rate.banks as any)?.bank_code
    }))
  }

  static async createInterestRate(rateData: Omit<BankInterestRate, 'id' | 'created_at' | 'updated_at'>): Promise<BankInterestRate> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('bank_interest_rates')
      .insert({
        ...rateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating interest rate:', error)
      throw new Error('Failed to create interest rate')
    }

    return data
  }

  static async updateInterestRate(id: string, updates: Partial<BankInterestRate>): Promise<BankInterestRate> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('bank_interest_rates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating interest rate:', error)
      throw new Error('Failed to update interest rate')
    }

    return data
  }

  static async deleteInterestRate(id: string): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('bank_interest_rates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting interest rate:', error)
      throw new Error('Failed to delete interest rate')
    }
  }

  // ===== BATCH OPERATIONS =====
  static async bulkUpdateBankStatus(bankIds: string[], isActive: boolean): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('banks')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .in('id', bankIds)

    if (error) {
      console.error('Error bulk updating banks:', error)
      throw new Error('Failed to bulk update banks')
    }
  }

  static async bulkUpdateUserStatus(userIds: string[], isActive: boolean): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)

    if (error) {
      console.error('Error bulk updating users:', error)
      throw new Error('Failed to bulk update users')
    }
  }

  // ===== EXPORT FUNCTIONALITY =====
  static async exportData(table: string, format: 'csv' | 'json' = 'csv') {
    const supabase = this.getClient()
    let query = supabase.from(table as any).select('*')

    // Add joins for related data
    if (table === 'bank_interest_rates') {
      query = supabase.from(table as any).select('*, banks(bank_name, bank_code)')
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error exporting ${table}:`, error)
      throw new Error(`Failed to export ${table}`)
    }

    return data || []
  }
}