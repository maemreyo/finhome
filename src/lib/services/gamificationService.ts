// src/lib/services/gamificationService.ts
// Enhanced service for handling diverse gamification challenges

import { createClient } from '@/lib/supabase/client'

export interface ChallengeRequirement {
  type: 'no_spend_streak' | 'weekend_no_spend' | 'budget_adherence' | 'category_budget_adherence' |
        'saving_streak' | 'daily_savings_target' | 'transaction_completeness' | 'receipt_completeness' |
        'goal_contribution_streak' | 'goal_contribution_frequency' | 'daily_improvement' |
        'challenge_completion' | 'habit_tracking' | 'seasonal_budget' | 'fresh_start'
  
  // No-spend challenges
  streak_days?: number
  allowed_categories?: string[]
  allowed_category_ids?: string[]
  max_daily_food?: number
  weekend_days?: string[]
  
  // Budget adherence
  adherence_percentage?: number
  check_categories?: 'all' | string[]
  period?: 'daily' | 'weekly' | 'monthly'
  allow_overage?: number
  category?: string
  period_days?: number
  
  // Saving challenges
  min_daily_savings?: number
  measure?: 'net_positive' | 'actual_savings'
  daily_target?: number
  measurement?: string
  
  // Tracking challenges
  require_notes?: boolean
  require_receipts?: boolean
  min_transactions?: number
  min_amount?: number
  completion_rate?: number
  
  // Goal challenges
  goal_type?: string
  min_daily_amount?: number
  target_contributions?: number
  
  // Improvement challenges  
  metric?: string
  comparison?: string
  improvement?: 'increase' | 'decrease'
  
  // Habit challenges
  habit?: string
  required_time_range?: string
  
  // Complex challenges
  target_challenges?: number
  require_different_categories?: boolean
  season?: string
  budget_multiplier?: number
  require_budget_setup?: boolean
  track_all_expenses?: boolean
  min_categories?: number
}

export interface ChallengeProgressData {
  current_streak?: number
  last_success_date?: string
  last_reset_date?: string
  reset_reason?: string
  daily_progress?: Record<string, any>
  weekly_progress?: Record<string, any>
  monthly_progress?: Record<string, any>
  streak_history?: Array<{ date: string; success: boolean; value?: number }>
  total_contribution?: number
  habit_completions?: string[]
  category_budgets?: Record<string, { spent: number; limit: number }>
  
  // For complex tracking
  completed_challenges?: string[]
  setup_completed?: boolean
  tracking_days?: string[]
}

export interface Challenge {
  id: string
  name_en: string
  name_vi: string
  description_en: string
  description_vi: string
  challenge_type: 'daily' | 'weekly' | 'monthly' | 'special'
  category: 'budgeting' | 'saving' | 'tracking' | 'house_goal'
  requirement_description: ChallengeRequirement
  target_value?: number
  duration_days: number
  experience_points: number
  completion_badge?: string
  is_active: boolean
  start_date?: string
  end_date?: string
}

export interface UserChallenge {
  id: string
  user_id: string
  challenge_id: string
  challenge: Challenge
  started_at: string
  completed_at?: string
  current_progress: number
  target_progress: number
  is_completed: boolean
  is_abandoned: boolean
  progress_data: ChallengeProgressData
}

export class GamificationService {
  private supabase = createClient()

  /**
   * Get all available challenges for a user
   */
  async getAvailableChallenges(): Promise<Challenge[]> {
    const { data, error } = await this.supabase
      .from('expense_challenges')
      .select('*')
      .eq('is_active', true)
      .order('experience_points', { ascending: false })

    if (error) {
      console.error('Error fetching challenges:', error)
      throw new Error('Failed to fetch challenges')
    }

    return data || []
  }

  /**
   * Get user's active challenges
   */
  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    const { data, error } = await this.supabase
      .from('user_expense_challenges')
      .select(`
        *,
        challenge:expense_challenges(*)
      `)
      .eq('user_id', userId)
      .eq('is_abandoned', false)
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching user challenges:', error)
      throw new Error('Failed to fetch user challenges')
    }

    return data || []
  }

  /**
   * Start a new challenge for a user
   */
  async startChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    // First get the challenge details
    const { data: challenge, error: challengeError } = await this.supabase
      .from('expense_challenges')
      .select('*')
      .eq('id', challengeId)
      .single()

    if (challengeError || !challenge) {
      throw new Error('Challenge not found')
    }

    // Check if user already has this challenge active
    const { data: existingChallenge } = await this.supabase
      .from('user_expense_challenges')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('is_completed', false)
      .eq('is_abandoned', false)
      .single()

    if (existingChallenge) {
      throw new Error('Challenge already active')
    }

    // Initialize progress data based on challenge type
    const initialProgressData = this.initializeProgressData(challenge.requirement_description)

    // Create user challenge record
    const { data: userChallenge, error } = await this.supabase
      .from('user_expense_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        target_progress: challenge.target_value || challenge.duration_days,
        progress_data: initialProgressData,
        started_at: new Date().toISOString()
      })
      .select(`
        *,
        challenge:expense_challenges(*)
      `)
      .single()

    if (error) {
      console.error('Error starting challenge:', error)
      throw new Error('Failed to start challenge')
    }

    return userChallenge
  }

  /**
   * Update challenge progress based on user actions
   */
  async updateChallengeProgress(
    userId: string,
    challengeId: string,
    progressUpdate: Partial<ChallengeProgressData>
  ): Promise<void> {
    const { data: userChallenge, error: fetchError } = await this.supabase
      .from('user_expense_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('is_completed', false)
      .eq('is_abandoned', false)
      .single()

    if (fetchError || !userChallenge) {
      throw new Error('User challenge not found')
    }

    // Merge progress data
    const updatedProgressData = {
      ...userChallenge.progress_data,
      ...progressUpdate
    }

    // Calculate new current progress
    const newCurrentProgress = this.calculateCurrentProgress(
      userChallenge.challenge,
      updatedProgressData
    )

    // Check if challenge is completed
    const isCompleted = newCurrentProgress >= userChallenge.target_progress

    const updateData: any = {
      current_progress: newCurrentProgress,
      progress_data: updatedProgressData,
      updated_at: new Date().toISOString()
    }

    if (isCompleted && !userChallenge.completed_at) {
      updateData.completed_at = new Date().toISOString()
      updateData.is_completed = true
    }

    const { error } = await this.supabase
      .from('user_expense_challenges')
      .update(updateData)
      .eq('id', userChallenge.id)

    if (error) {
      console.error('Error updating challenge progress:', error)
      throw new Error('Failed to update challenge progress')
    }

    // If challenge was just completed, award XP
    if (isCompleted && !userChallenge.completed_at) {
      await this.awardExperiencePoints(userId, userChallenge.challenge.experience_points)
    }
  }

  /**
   * Check and update progress for no-spend challenges
   */
  async checkNoSpendProgress(userId: string, transactionAmount: number, categoryId?: string): Promise<void> {
    const activeChallenges = await this.getUserChallenges(userId)
    
    for (const userChallenge of activeChallenges) {
      const requirement = userChallenge.challenge.requirement_description
      
      if (requirement.type === 'no_spend_streak' || requirement.type === 'weekend_no_spend') {
        // Check if this expense breaks the no-spend rule
        const isExpenseAllowed = await this.isExpenseAllowedForChallenge(
          requirement,
          categoryId,
          transactionAmount
        )
        
        if (!isExpenseAllowed) {
          // Reset streak
          await this.updateChallengeProgress(userId, userChallenge.challenge_id, {
            current_streak: 0,
            last_reset_date: new Date().toISOString(),
            reset_reason: 'non_essential_expense'
          })
        }
      }
    }
  }

  /**
   * Check and update progress for budget adherence challenges
   */
  async checkBudgetAdherence(userId: string): Promise<void> {
    const activeChallenges = await this.getUserChallenges(userId)
    
    for (const userChallenge of activeChallenges) {
      const requirement = userChallenge.challenge.requirement_description
      
      if (requirement.type === 'budget_adherence' || requirement.type === 'category_budget_adherence') {
        const adherenceData = await this.calculateBudgetAdherence(userId, requirement)
        
        await this.updateChallengeProgress(userId, userChallenge.challenge_id, {
          category_budgets: adherenceData.categoryBudgets,
          daily_progress: {
            ...userChallenge.progress_data.daily_progress,
            [new Date().toISOString().split('T')[0]]: adherenceData.overallAdherence
          }
        })
      }
    }
  }

  /**
   * Check and update progress for saving streak challenges
   */
  async checkSavingStreak(userId: string): Promise<void> {
    const activeChallenges = await this.getUserChallenges(userId)
    
    for (const userChallenge of activeChallenges) {
      const requirement = userChallenge.challenge.requirement_description
      
      if (requirement.type === 'saving_streak' || requirement.type === 'daily_savings_target') {
        const todaysSavings = await this.calculateTodaysSavings(userId, requirement)
        const progressData = userChallenge.progress_data
        
        const currentStreak = progressData.current_streak || 0
        const minSavings = requirement.min_daily_savings || requirement.daily_target || 0
        
        if (todaysSavings >= minSavings) {
          await this.updateChallengeProgress(userId, userChallenge.challenge_id, {
            current_streak: currentStreak + 1,
            last_success_date: new Date().toISOString(),
            streak_history: [
              ...(progressData.streak_history || []),
              {
                date: new Date().toISOString().split('T')[0],
                success: true,
                value: todaysSavings
              }
            ]
          })
        } else {
          await this.updateChallengeProgress(userId, userChallenge.challenge_id, {
            current_streak: 0,
            last_reset_date: new Date().toISOString(),
            streak_history: [
              ...(progressData.streak_history || []),
              {
                date: new Date().toISOString().split('T')[0],
                success: false,
                value: todaysSavings
              }
            ]
          })
        }
      }
    }
  }

  /**
   * Get suggested challenges for a user based on their behavior
   */
  async getSuggestedChallenges(userId: string): Promise<Challenge[]> {
    // Analyze user's spending patterns to suggest relevant challenges
    const userStats = await this.getUserSpendingStats(userId)
    const allChallenges = await this.getAvailableChallenges()
    const userChallenges = await this.getUserChallenges(userId)
    
    const activeChallengeIds = userChallenges
      .filter(uc => !uc.is_completed && !uc.is_abandoned)
      .map(uc => uc.challenge_id)
    
    // Filter out already active challenges
    const availableChallenges = allChallenges.filter(c => !activeChallengeIds.includes(c.id))
    
    // Score challenges based on user behavior
    const scoredChallenges = availableChallenges.map(challenge => ({
      challenge,
      score: this.scoreChallengeRelevance(challenge, userStats)
    }))
    
    // Return top 5 most relevant challenges
    return scoredChallenges
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(sc => sc.challenge)
  }

  // Private helper methods

  private initializeProgressData(requirement: ChallengeRequirement): ChallengeProgressData {
    const baseData: ChallengeProgressData = {
      current_streak: 0,
      daily_progress: {},
      streak_history: []
    }

    switch (requirement.type) {
      case 'no_spend_streak':
      case 'weekend_no_spend':
      case 'saving_streak':
        return {
          ...baseData,
          current_streak: 0
        }
      
      case 'budget_adherence':
      case 'category_budget_adherence':
        return {
          ...baseData,
          category_budgets: {}
        }
      
      case 'habit_tracking':
        return {
          ...baseData,
          habit_completions: []
        }
      
      case 'goal_contribution_streak':
      case 'goal_contribution_frequency':
        return {
          ...baseData,
          total_contribution: 0
        }
      
      default:
        return baseData
    }
  }

  private calculateCurrentProgress(
    challenge: Challenge,
    progressData: ChallengeProgressData
  ): number {
    const requirement = challenge.requirement_description

    switch (requirement.type) {
      case 'no_spend_streak':
      case 'saving_streak':
      case 'weekend_no_spend':
        return progressData.current_streak || 0
      
      case 'habit_tracking':
        return progressData.habit_completions?.length || 0
      
      case 'goal_contribution_frequency':
        return Object.keys(progressData.daily_progress || {}).length
      
      case 'challenge_completion':
        return progressData.completed_challenges?.length || 0
      
      default:
        return progressData.current_streak || 0
    }
  }

  private async isExpenseAllowedForChallenge(
    requirement: ChallengeRequirement,
    categoryId?: string,
    amount?: number
  ): Promise<boolean> {
    if (!categoryId) return false
    
    // Get category details
    const { data: category } = await this.supabase
      .from('expense_categories')
      .select('name_vi')
      .eq('id', categoryId)
      .single()
    
    if (!category) return false
    
    // Check if category is in allowed list
    if (requirement.allowed_categories) {
      const isAllowed = requirement.allowed_categories.includes(category.name_vi)
      
      // Check special limits for allowed categories
      if (isAllowed && requirement.max_daily_food && category.name_vi === 'Food & Dining') {
        // This would need additional logic to check daily totals
        return amount ? amount <= requirement.max_daily_food : true
      }
      
      return isAllowed
    }
    
    return false
  }

  private async calculateBudgetAdherence(
    userId: string,
    requirement: ChallengeRequirement
  ): Promise<{ overallAdherence: number; categoryBudgets: Record<string, any> }> {
    // This would implement budget adherence calculation logic
    // For now, return placeholder data
    return {
      overallAdherence: 95,
      categoryBudgets: {}
    }
  }

  private async calculateTodaysSavings(
    userId: string,
    requirement: ChallengeRequirement
  ): Promise<number> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: todaysTransactions } = await this.supabase
      .from('expense_transactions')
      .select('transaction_type, amount')
      .eq('user_id', userId)
      .eq('transaction_date', today)
    
    if (!todaysTransactions) return 0
    
    const todaysIncome = todaysTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const todaysExpenses = todaysTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return todaysIncome - todaysExpenses
  }

  private async getUserSpendingStats(userId: string): Promise<any> {
    // Calculate user spending patterns for challenge suggestions
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
    
    const { data: recentTransactions } = await this.supabase
      .from('expense_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', thirtyDaysAgo)
    
    // Analyze patterns and return stats
    return {
      avgDailyExpenses: 0,
      topCategories: [],
      expenseDays: [],
      savingsDays: []
    }
  }

  private scoreChallengeRelevance(challenge: Challenge, userStats: any): number {
    // Score challenges based on user behavior
    let score = 50 // Base score
    
    // Add scoring logic based on challenge type and user stats
    switch (challenge.requirement_description.type) {
      case 'no_spend_streak':
        // Higher score if user has many expense days
        score += userStats.expenseDays?.length > 20 ? 30 : 0
        break
      
      case 'saving_streak':
        // Higher score if user already has some saving days
        score += userStats.savingsDays?.length > 5 ? 20 : 10
        break
      
      case 'budget_adherence':
        // Higher score if user has high expenses
        score += userStats.avgDailyExpenses > 100000 ? 25 : 0
        break
    }
    
    return score
  }

  private async awardExperiencePoints(userId: string, points: number): Promise<void> {
    // Award XP to user - this would integrate with existing XP system
    console.log(`Awarding ${points} XP to user ${userId}`)
    
    // This is a placeholder for the actual XP awarding logic
    // It would typically update user_profiles or a separate XP table
  }
}