// src/lib/supabase/admin-queries.ts
// Admin database queries for management interfaces

import { createAdminClient } from './server'
import type { 
  Bank, 
  BankInterestRate, 
  Achievement, 
  Notification, 
  UserProfile 
} from './types'

export class AdminQueries {
  private static adminClient = createAdminClient()

  // ===== BANK MANAGEMENT =====
  static async getAllBanks(): Promise<Bank[]> {
    const { data, error } = await this.adminClient
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
    const { data, error } = await this.adminClient
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
    const { data, error } = await this.adminClient
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
    const { error } = await this.adminClient
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
    const { data, error } = await this.adminClient
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
    const { data, error } = await this.adminClient
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
    const { data, error } = await this.adminClient
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
    const { error } = await this.adminClient
      .from('bank_interest_rates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting interest rate:', error)
      throw new Error('Failed to delete interest rate')
    }
  }

  // ===== ACHIEVEMENT MANAGEMENT =====
  static async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await this.adminClient
      .from('achievements')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching achievements:', error)
      throw new Error('Failed to fetch achievements')
    }

    return data || []
  }

  static async createAchievement(achievementData: Omit<Achievement, 'id' | 'created_at' | 'updated_at'>): Promise<Achievement> {
    const { data, error } = await this.adminClient
      .from('achievements')
      .insert({
        ...achievementData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating achievement:', error)
      throw new Error('Failed to create achievement')
    }

    return data
  }

  static async updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement> {
    const { data, error } = await this.adminClient
      .from('achievements')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating achievement:', error)
      throw new Error('Failed to update achievement')
    }

    return data
  }

  static async deleteAchievement(id: string): Promise<void> {
    const { error } = await this.adminClient
      .from('achievements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting achievement:', error)
      throw new Error('Failed to delete achievement')
    }
  }

  // ===== NOTIFICATION MANAGEMENT =====
  static async getAllNotifications(): Promise<Notification[]> {
    const { data, error } = await this.adminClient
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      throw new Error('Failed to fetch notifications')
    }

    return data || []
  }

  static async createNotification(notificationData: Omit<Notification, 'id' | 'created_at' | 'read_at'>): Promise<Notification> {
    const { data, error } = await this.adminClient
      .from('notifications')
      .insert({
        ...notificationData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      throw new Error('Failed to create notification')
    }

    return data
  }

  static async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification> {
    const { data, error } = await this.adminClient
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating notification:', error)
      throw new Error('Failed to update notification')
    }

    return data
  }

  static async deleteNotification(id: string): Promise<void> {
    const { error } = await this.adminClient
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting notification:', error)
      throw new Error('Failed to delete notification')
    }
  }

  // ===== USER MANAGEMENT =====
  static async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await this.adminClient
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      throw new Error('Failed to fetch users')
    }

    return data || []
  }

  static async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await this.adminClient
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw new Error('Failed to update user')
    }

    return data
  }

  static async deleteUser(id: string): Promise<void> {
    // First delete from auth.users (cascades to user_profiles)
    const { error } = await this.adminClient.auth.admin.deleteUser(id)

    if (error) {
      console.error('Error deleting user:', error)
      throw new Error('Failed to delete user')
    }
  }

  // ===== ANALYTICS AND REPORTING =====
  static async getRecentActivity(limit: number = 50) {
    const { data, error } = await this.adminClient
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }

    return data || []
  }

  static async getUserAnalytics() {
    const { data, error } = await this.adminClient
      .from('user_profiles')
      .select('subscription_tier, is_active, created_at')

    if (error) {
      console.error('Error fetching user analytics:', error)
      return {
        byTier: { free: 0, premium: 0, professional: 0 },
        byStatus: { active: 0, inactive: 0 },
        newUsersLast7Days: 0
      }
    }

    const users = data || []
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return {
      byTier: {
        free: users.filter(u => u.subscription_tier === 'free').length,
        premium: users.filter(u => u.subscription_tier === 'premium').length,
        professional: users.filter(u => u.subscription_tier === 'professional').length
      },
      byStatus: {
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length
      },
      newUsersLast7Days: users.filter(u => 
        new Date(u.created_at) > sevenDaysAgo
      ).length
    }
  }

  // ===== BATCH OPERATIONS =====
  static async bulkUpdateBankStatus(bankIds: string[], isActive: boolean): Promise<void> {
    const { error } = await this.adminClient
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
    const { error } = await this.adminClient
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
    let query = this.adminClient.from(table as any).select('*')

    // Add joins for related data
    if (table === 'bank_interest_rates') {
      query = this.adminClient.from(table as any).select('*, banks(bank_name, bank_code)')
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error exporting ${table}:`, error)
      throw new Error(`Failed to export ${table}`)
    }

    return data || []
  }
}