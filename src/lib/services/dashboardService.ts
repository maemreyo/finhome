// src/lib/services/dashboardService.ts
// Database service functions for dashboard analytics and data integration

import { supabase } from '@/lib/supabase/client'
import type { 
  FinancialPlan, 
  AnalyticsMetric, 
  FinancialScenario, 
  Notification, 
  Achievement,
  UserAchievement,
  UserExperience,
  MarketInsight,
  FaqItem,
  SupportTicket
} from '@/lib/supabase/types'

export class DashboardService {
  private static getClient() {
    return supabase
  }

  // ===== DASHBOARD METRICS =====
  static async getDashboardMetrics(userId: string) {
    const supabase = this.getClient()
    
    try {
      // Get financial plans count
      const { data: plansData, error: plansError } = await supabase
        .from('financial_plans')
        .select('id, status')
        .eq('user_id', userId)

      // For now, use empty array for properties since the table isn't in the types yet
      const propertiesData: any[] = []

      // Get user experience points (handle missing data gracefully)
      let experienceData = null
      try {
        const { data, error: experienceError } = await supabase
          .from('user_experience')
          .select('total_experience, current_level')
          .eq('user_id', userId)
          .maybeSingle()
        
        if (!experienceError && data) {
          experienceData = data
        }
      } catch (error) {
        // Silently handle missing table or RLS issues
        experienceData = null
      }

      // Get unread notifications count
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', false)

      // Calculate metrics
      const totalPlans = plansData?.length || 0
      const activePlans = plansData?.filter(p => p.status === 'active').length || 0
      const totalPortfolioValue = propertiesData?.reduce((sum, p) => sum + (p.current_value || 0), 0) || 0
      const monthlyRentalIncome = propertiesData?.reduce((sum, p) => sum + (p.monthly_rental_income || 0), 0) || 0
      const experiencePoints = experienceData?.total_experience || 0
      const currentLevel = experienceData?.current_level || 1
      const unreadNotifications = notificationsData?.length || 0

      return {
        total_plans: totalPlans,
        active_plans: activePlans,
        total_portfolio_value: totalPortfolioValue,
        monthly_rental_income: monthlyRentalIncome,
        portfolio_roi: totalPortfolioValue > 0 ? (monthlyRentalIncome * 12 / totalPortfolioValue) * 100 : 0,
        experience_points: experiencePoints,
        current_level: currentLevel,
        unread_notifications: unreadNotifications
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      // Return fallback data
      return {
        total_plans: 0,
        active_plans: 0,
        total_portfolio_value: 0,
        monthly_rental_income: 0,
        portfolio_roi: 0,
        experience_points: 0,
        current_level: 1,
        unread_notifications: 0
      }
    }
  }

  // ===== ANALYTICS METRICS =====
  static async getAnalyticsMetrics(userId: string, period?: { start: string; end: string }) {
    const supabase = this.getClient()
    
    let query = supabase
      .from('analytics_metrics')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false })

    if (period) {
      query = query
        .gte('period_start', period.start)
        .lte('period_end', period.end)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching analytics metrics:', error)
      return []
    }

    return data || []
  }

  static async getMetricsByType(userId: string, metricType: 'currency' | 'percentage' | 'count' | 'ratio') {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('analytics_metrics')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('metric_type', metricType)
      .order('period_end', { ascending: false })
      .limit(12) // Last 12 data points

    if (error) {
      console.error('Error fetching metrics by type:', error)
      return []
    }

    return data || []
  }

  // ===== FINANCIAL SCENARIOS =====
  static async getFinancialScenarios(userId: string) {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('financial_scenarios')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching financial scenarios:', error)
      return []
    }

    return data || []
  }

  static async getScenariosByType(userId: string, scenarioType: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test') {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('financial_scenarios')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('scenario_type', scenarioType)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching scenarios by type:', error)
      return []
    }

    return data || []
  }

  // ===== NOTIFICATIONS =====
  static async getNotifications(userId: string, limit: number = 10) {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  }

  static async getUnreadNotifications(userId: string) {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('is_read', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching unread notifications:', error)
      return []
    }

    return data || []
  }

  static async markNotificationAsRead(id: string) {
    const supabase = this.getClient()
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // ===== ACHIEVEMENTS =====
  static async getUserAchievements(userId: string) {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (
          id,
          name,
          description,
          badge_icon,
          achievement_type,
          experience_points,
          is_hidden
        )
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (error) {
      console.error('Error fetching user achievements:', error)
      return []
    }

    return data || []
  }

  static async getAvailableAchievements() {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .eq('is_hidden', false)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching available achievements:', error)
      return []
    }

    return data || []
  }

  static async getUserExperience(userId: string) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('user_experience')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.warn('Error fetching user experience:', error)
        return this.getDefaultUserExperience(userId)
      }

      // Return data if found, otherwise return default
      return data || this.getDefaultUserExperience(userId)
    } catch (error) {
      console.warn('User experience table not available:', error)
      return this.getDefaultUserExperience(userId)
    }
  }

  private static getDefaultUserExperience(userId: string) {
    return {
      id: userId,
      user_id: userId,
      total_experience: 0,
      current_level: 1,
      experience_in_level: 0,
      experience_to_next_level: 100,
      plans_created: 0,
      calculations_performed: 0,
      properties_viewed: 0,
      achievements_unlocked: 0,
      days_active: 0,
      current_login_streak: 0,
      longest_login_streak: 0,
      last_activity_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // ===== MARKET INSIGHTS =====
  static async getMarketInsights(limit: number = 5) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('market_insights')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching market insights:', error)
        // Return fallback data when table doesn't exist
        return []
      }

      return data || []
    } catch (error) {
      console.error('Database connection error:', error)
      return []
    }
  }

  static async getFeaturedMarketInsights() {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('market_insights')
      .select('*')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error fetching featured market insights:', error)
      return []
    }

    return data || []
  }

  static async getMarketSummary() {
    const supabase = this.getClient()
    
    // Use the utility function from the migration
    const { data, error } = await supabase
      .rpc('get_dashboard_market_summary')

    if (error) {
      console.error('Error fetching market summary:', error)
      return []
    }

    return data || []
  }

  // ===== FAQ ITEMS =====
  static async getFaqItems(category?: string) {
    const supabase = this.getClient()
    
    let query = supabase
      .from('faq_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching FAQ items:', error)
      return []
    }

    return data || []
  }

  static async getFaqCategories() {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('faq_items')
      .select('category')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching FAQ categories:', error)
      return []
    }

    // Get unique categories from the data
    const uniqueCategories = [...new Set(data?.map(item => item.category))]
    return uniqueCategories || []
  }

  // ===== SUPPORT TICKETS =====
  static async getSupportTickets(userId: string) {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching support tickets:', error)
      return []
    }

    return data || []
  }

  static async createSupportTicket(userId: string, ticketData: {
    subject: string
    description: string
    category: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
  }) {
    const supabase = this.getClient()
    
    // Generate ticket number
    const ticketNumber = `TICK-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        ticket_number: ticketNumber,
        subject: ticketData.subject,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority || 'medium',
        status: 'open'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating support ticket:', error)
      throw error
    }

    return data
  }

  // ===== FINANCIAL PLANS (for Laboratory) =====
  static async getFinancialPlans(userId: string) {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('financial_plans')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching financial plans:', error)
      return []
    }

    return data || []
  }

  static async getPublicFinancialPlans() {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('financial_plans')
      .select('*')
      .eq('is_public', true)
      .order('view_count', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching public financial plans:', error)
      return []
    }

    return data || []
  }

  // ===== SERVER-SIDE FUNCTIONS =====
  static async getServerDashboardMetrics(userId: string) {
    // For now, just use the client-side function
    return await this.getDashboardMetrics(userId)
  }

  static async getServerMarketInsights(limit: number = 5) {
    const supabase = this.getClient()
    
    const { data, error } = await supabase
      .from('market_insights')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching server market insights:', error)
      return []
    }

    return data || []
  }
}