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
  SupportTicket,
  PlanMilestone,
  PlanMilestoneInsert,
  PlanMilestoneUpdate,
  UserFavorite,
  UserFavoriteInsert
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
        // Return sample data when table doesn't exist
        return this.getSampleMarketInsights(limit)
      }

      // Return real data if available, otherwise sample data
      return data && data.length > 0 ? data : this.getSampleMarketInsights(limit)
    } catch (error) {
      console.error('Database connection error:', error)
      return this.getSampleMarketInsights(limit)
    }
  }

  private static getSampleMarketInsights(limit: number = 5) {
    const sampleInsights = [
      {
        id: 'sample-1',
        title: 'Thị trường căn hộ TP.HCM tăng trước 8.5% trong Q3/2024',
        content: 'Theo báo cáo mới nhất từ các sàn giao dịch bất động sản, giá căn hộ tại TP.HCM đã tăng trung bình 8.5% trong quý 3 năm 2024, chủ yếu do nguồn cung hạn chế và nhu cầu cao từ người mua để ở.',
        insight_type: 'Xu hướng thị trường',
        location: 'TP.Hồ Chí Minh',
        impact_score: 8.5,
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: true,
        category: 'price_trend',
        source: 'Batdongsan.com.vn'
      },
      {
        id: 'sample-2',
        title: 'Lãi suất vay mua nhà giảm xuống mức thấp nhất trong 2 năm',
        content: 'Các ngân hàng lớn đã điều chỉnh giảm lãi suất vay mua nhà còn 7.2-7.8%/năm, tạo cơ hội tốt cho người có nhu cầu mua nhà trong thời gian tới. Đây là mức thấp nhất kể từ đầu năm 2022.',
        insight_type: 'Chính sách tài chính',
        location: 'Toàn quốc',
        impact_score: 9.2,
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: true,
        category: 'interest_rate',
        source: 'Ngân hàng Nhà nước'
      },
      {
        id: 'sample-3',
        title: 'Khu Đông TP.HCM tiếp tục dẫn đầu về tốc độ tăng giá',
        content: 'Các dự án tại khu Đông như Thủ Đức, Quận 2, Quận 9 ghi nhận mức tăng giá mạnh nhất với 12-15% so với cùng kỳ năm trước nhờ hạ tầng giao thông được cải thiện và quy hoạch đô thị hiện đại.',
        insight_type: 'Phân tích khu vực',
        location: 'Khu Đông TP.HCM',
        impact_score: 7.8,
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: false,
        category: 'regional_analysis',
        source: 'CBRE Vietnam'
      },
      {
        id: 'sample-4',
        title: 'Nhu cầu thuê nhà tăng mạnh sau khi các công ty quay lại văn phòng',
        content: 'Thị trường cho thuê nhà ở TP.HCM và Hà Nội phục hồi mạnh mẽ với tỷ lệ lấp đầy tăng 25% so với cùng kỳ năm trước. Giá thuê căn hộ dịch vụ tăng trung bình 10-15%.',
        insight_type: 'Thị trường cho thuê',
        location: 'TP.HCM & Hà Nội',
        impact_score: 6.9,
        published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: false,
        category: 'rental_market',
        source: 'Savills Vietnam'
      },
      {
        id: 'sample-5',
        title: 'Chính phủ đang xem xét các chính sách hỗ trợ người mua nhà lần đầu',
        content: 'Bộ Xây dựng đang nghiên cứu gói hỗ trợ vay ưu đãi dành cho người mua nhà lần đầu với lãi suất 0% trong 2 năm đầu và các ưu đãi về thuế. Dự kiến sẽ có thông tin chính thức trong Q4/2024.',
        insight_type: 'Chính sách',
        location: 'Toàn quốc',
        impact_score: 9.5,
        published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: true,
        category: 'government_policy',
        source: 'Bộ Xây dựng'
      }
    ]

    return sampleInsights.slice(0, limit)
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

  // ===== PROPERTIES =====
  static async getProperties(limit: number = 10) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'for_sale')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching properties:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching properties:', error)
      return []
    }
  }

  static async getUserInterestedProperties(userId: string) {
    const supabase = this.getClient()
    
    try {
      // For now, we'll get properties based on user's financial plans
      // since there's no direct user-property favorites table
      const plans = await this.getFinancialPlans(userId)
      const properties = await this.getProperties(20)
      
      // Filter properties that match user's plan criteria
      const interestedProperties = properties.filter(property => {
        return plans.some(plan => 
          plan.target_property_type === property.property_type &&
          (plan.target_location?.includes(property.district) || 
           plan.target_location?.includes(property.city))
        )
      })

      return interestedProperties.slice(0, 10)
    } catch (error) {
      console.error('Error fetching user interested properties:', error)
      return []
    }
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

  // ===== USER PREFERENCES =====
  static async getUserPreferences(userId: string) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.warn('Error fetching user preferences:', error)
        return this.getDefaultUserPreferences(userId)
      }

      // Return data if found, otherwise return default
      return data || this.getDefaultUserPreferences(userId)
    } catch (error) {
      console.warn('User preferences table not available:', error)
      return this.getDefaultUserPreferences(userId)
    }
  }

  private static getDefaultUserPreferences(userId: string) {
    return {
      id: crypto.randomUUID(),
      user_id: userId,
      email_notifications: true,
      push_notifications: true,
      achievement_notifications: true,
      market_update_notifications: true,
      payment_reminder_notifications: true,
      theme: 'light' as const,
      dashboard_layout: 'grid' as const,
      dashboard_widgets: {},
      profile_visibility: 'private' as const,
      allow_data_sharing: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  static async updateUserPreferences(userId: string, preferences: Partial<{
    email_notifications: boolean
    push_notifications: boolean
    achievement_notifications: boolean
    market_update_notifications: boolean
    payment_reminder_notifications: boolean
    theme: 'light' | 'dark'
    dashboard_layout: 'grid' | 'list'
    dashboard_widgets: any
    profile_visibility: 'public' | 'private' | 'friends'
    allow_data_sharing: boolean
  }>) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error updating user preferences:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  static async getUserProfile(userId: string) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  static async updateUserProfile(userId: string, profile: Partial<{
    full_name: string
    phone: string
    company: string
    monthly_income: number
    city: string
    district: string
    address: string
    currency: string
    language: string
    timezone: string
    preferred_language: string
  }>) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
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

  // ===== PLAN PROGRESS TRACKING =====
  static async getPlanProgress(planId: string) {
    const supabase = this.getClient()
    
    try {
      // Get plan with progress fields
      const { data: plan, error: planError } = await supabase
        .from('financial_plans')
        .select(`
          *,
          plan_milestones(*),
          plan_status_history(*)
        `)
        .eq('id', planId)
        .single()

      if (planError) throw planError

      // Calculate savings progress if we have the data
      const savingsProgress = plan.current_savings && plan.down_payment 
        ? Math.min(100, (plan.current_savings / plan.down_payment) * 100)
        : 0

      return {
        totalProgress: plan.total_progress || 0,
        financialProgress: plan.financial_progress || 0,
        savingsProgress,
        savingsTarget: plan.down_payment || 0,
        currentSavings: plan.current_savings || 0,
        monthlyContribution: plan.monthly_contribution || 0,
        estimatedCompletionDate: plan.estimated_completion_date 
          ? new Date(plan.estimated_completion_date) 
          : null,
        milestones: plan.plan_milestones || [],
        statusHistory: plan.plan_status_history || []
      }
    } catch (error) {
      console.error('Error getting plan progress:', error)
      return null
    }
  }

  static async updatePlanProgress(planId: string, updates: {
    total_progress?: number
    financial_progress?: number
    monthly_contribution?: number
    estimated_completion_date?: string | null
    current_savings?: number
  }) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('financial_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating plan progress:', error)
      throw error
    }
  }

  static async getPlanMilestones(planId: string) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('plan_milestones')
        .select('*')
        .eq('plan_id', planId)
        .order('target_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting plan milestones:', error)
      return []
    }
  }

  static async createPlanMilestone(milestone: {
    plan_id: string
    title: string
    description?: string
    category?: 'financial' | 'legal' | 'property' | 'admin' | 'personal'
    priority?: 'low' | 'medium' | 'high'
    required_amount?: number
    target_date?: string
  }) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('plan_milestones')
        .insert(milestone)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating plan milestone:', error)
      throw error
    }
  }

  static async updatePlanMilestone(milestoneId: string, updates: {
    title?: string
    description?: string
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    priority?: 'low' | 'medium' | 'high'
    current_amount?: number
    target_date?: string
    completed_date?: string
  }) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('plan_milestones')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating plan milestone:', error)
      throw error
    }
  }

  static async deletePlanMilestone(milestoneId: string) {
    const supabase = this.getClient()
    
    try {
      const { error } = await supabase
        .from('plan_milestones')
        .delete()
        .eq('id', milestoneId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting plan milestone:', error)
      throw error
    }
  }

  // ===== FAVORITES MANAGEMENT =====
  static async getUserFavorites(userId: string, entityType?: 'property' | 'financial_plan' | 'bank' | 'scenario') {
    const supabase = this.getClient()
    
    try {
      let query = supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)

      if (entityType) {
        query = query.eq('entity_type', entityType)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting user favorites:', error)
      return []
    }
  }

  static async addToFavorites(userId: string, entityType: 'property' | 'financial_plan' | 'bank' | 'scenario', entityId: string) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding to favorites:', error)
      throw error
    }
  }

  static async removeFromFavorites(userId: string, entityType: 'property' | 'financial_plan' | 'bank' | 'scenario', entityId: string) {
    const supabase = this.getClient()
    
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)

      if (error) throw error
    } catch (error) {
      console.error('Error removing from favorites:', error)
      throw error
    }
  }

  static async isFavorite(userId: string, entityType: 'property' | 'financial_plan' | 'bank' | 'scenario', entityId: string) {
    const supabase = this.getClient()
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .maybeSingle()

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Error checking favorite status:', error)
      return false
    }
  }

  static async toggleFavorite(userId: string, entityType: 'property' | 'financial_plan' | 'bank' | 'scenario', entityId: string) {
    const isFav = await this.isFavorite(userId, entityType, entityId)
    
    if (isFav) {
      await this.removeFromFavorites(userId, entityType, entityId)
      return false
    } else {
      await this.addToFavorites(userId, entityType, entityId)
      return true
    }
  }
}