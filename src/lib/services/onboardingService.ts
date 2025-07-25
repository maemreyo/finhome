// src/lib/services/onboardingService.ts
// Service for managing onboarding data and analytics

import { supabase } from '@/lib/supabase/client'
import { UserProfile } from '@/src/types/supabase'

export interface OnboardingAnalytics {
  tourId: string
  userId?: string
  event: 'tour_started' | 'tour_completed' | 'tour_skipped' | 'step_completed' | 'step_skipped'
  stepId?: string
  stepIndex?: number
  timestamp: string
  metadata?: Record<string, any>
}

export interface OnboardingProgress {
  userId: string
  tourId: string
  currentStepIndex: number
  completedSteps: string[]
  skippedSteps: string[]
  startedAt: string
  lastActiveAt: string
  completedAt?: string
  skippedAt?: string
  totalSteps: number
  progressPercentage: number
}

export class OnboardingService {
  /**
   * Check if user needs onboarding
   */
  static async checkIfUserNeedsOnboarding(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed, created_at')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[OnboardingService] Error checking onboarding status:', error)
        return true // Default to showing onboarding if we can't determine
      }

      // Show onboarding if not completed or user is new (created within last 7 days)
      if (!data.onboarding_completed) return true
      
      const createdAt = new Date(data.created_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      return createdAt > weekAgo
    } catch (error) {
      console.error('[OnboardingService] Error checking onboarding status:', error)
      return true
    }
  }

  /**
   * Get recommended tour based on user state and current page
   */
  static async getRecommendedTour(userId: string, pathname: string): Promise<string | null> {
    try {
      // Get user's onboarding progress
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('onboarding_progress')
        .eq('user_id', userId)
        .single()

      const progress = (preferences?.onboarding_progress as Record<string, any>) || {}

      // Determine tour based on current page and completion status
      if (pathname.includes('/dashboard')) {
        if (!progress.FIRST_TIME_USER_TOUR) {
          return 'FIRST_TIME_USER_TOUR'
        } else if (!progress.DASHBOARD_FEATURES_TOUR) {
          return 'DASHBOARD_FEATURES_TOUR'
        }
      } else if (pathname.includes('/plans')) {
        if (!progress.FINANCIAL_PLANNING_TOUR) {
          return 'FINANCIAL_PLANNING_TOUR'
        }
      }

      return null
    } catch (error) {
      console.error('[OnboardingService] Error getting recommended tour:', error)
      return 'FIRST_TIME_USER_TOUR' // Default fallback
    }
  }

  /**
   * Record tour completion
   */
  static async recordTourCompletion(userId: string, tourId: string): Promise<void> {
    try {
      await this.markOnboardingCompleted(userId, tourId)
      // TODO: Implement trackEvent method
      console.log(`[OnboardingService] Tour completed: ${tourId} for user ${userId}`)
    } catch (error) {
      console.error('[OnboardingService] Error recording tour completion:', error)
    }
  }

  /**
   * Record tour skip
   */
  static async recordTourSkip(userId: string, tourId: string): Promise<void> {
    try {
      // TODO: Implement trackEvent method  
      console.log(`[OnboardingService] Tour skipped: ${tourId} for user ${userId}`)
    } catch (error) {
      console.error('[OnboardingService] Error recording tour skip:', error)
    }
  }
  /**
   * Mark user's onboarding as completed in the database
   */
  static async markOnboardingCompleted(userId: string, tourId: string): Promise<void> {
    try {
      // Update user profile to mark onboarding as completed
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) {
        throw new Error(`Failed to update user profile: ${profileError.message}`)
      }

      // Track the completion event
      await this.trackTourEvent('tour_completed', {
        tourId,
        userId,
        timestamp: new Date().toISOString()
      })

      console.log(`[OnboardingService] Marked onboarding completed for user ${userId}, tour ${tourId}`)
    } catch (error) {
      console.error('[OnboardingService] Error marking onboarding completed:', error)
      throw error
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[OnboardingService] Error checking onboarding status:', error)
        return false
      }

      return data?.onboarding_completed || false
    } catch (error) {
      console.error('[OnboardingService] Error checking onboarding status:', error)
      return false
    }
  }

  /**
   * Save onboarding progress to user preferences
   */
  static async saveOnboardingProgress(progress: OnboardingProgress): Promise<void> {
    try {
      // Get current user preferences
      const { data: preferences, error: fetchError } = await supabase
        .from('user_preferences')
        .select('dashboard_widgets, onboarding_progress')
        .eq('user_id', progress.userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.warn(`[OnboardingService] Failed to fetch user preferences, using localStorage fallback: ${fetchError.message}`)
        // Fallback to localStorage for now
        const storageKey = `onboarding_progress_${progress.userId}`
        const existingProgress = JSON.parse(localStorage.getItem(storageKey) || '{}')
        existingProgress[progress.tourId] = progress
        localStorage.setItem(storageKey, JSON.stringify(existingProgress))
        return
      }

      // Try new onboarding_progress column first
      const updateData: any = {}
      
      if (preferences && 'onboarding_progress' in preferences) {
        // Use the dedicated onboarding_progress column
        const currentProgress = (preferences.onboarding_progress as Record<string, any>) || {}
        updateData.onboarding_progress = {
          ...currentProgress,
          [progress.tourId]: {
            currentStepIndex: progress.currentStepIndex,
            completedSteps: progress.completedSteps,
            skippedSteps: progress.skippedSteps,
            startedAt: progress.startedAt,
            lastActiveAt: progress.lastActiveAt,
            completedAt: progress.completedAt,
            skippedAt: progress.skippedAt,
            totalSteps: progress.totalSteps,
            progressPercentage: progress.progressPercentage
          }
        }
      } else {
        // Fallback to dashboard_widgets column
        const currentWidgets = ((preferences as any)?.dashboard_widgets as Record<string, any>) || {}
        updateData.dashboard_widgets = {
          ...currentWidgets,
          onboarding_progress: {
            [progress.tourId]: {
              currentStepIndex: progress.currentStepIndex,
              completedSteps: progress.completedSteps,
              skippedSteps: progress.skippedSteps,
              startedAt: progress.startedAt,
              lastActiveAt: progress.lastActiveAt,
              completedAt: progress.completedAt,
              skippedAt: progress.skippedAt,
              totalSteps: progress.totalSteps,
              progressPercentage: progress.progressPercentage
            }
          }
        }
      }

      // Update or insert user preferences
      const { error: upsertError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: progress.userId,
          ...updateData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (upsertError) {
        console.warn(`[OnboardingService] Database update failed, using localStorage fallback: ${upsertError.message}`)
        // Fallback to localStorage
        const storageKey = `onboarding_progress_${progress.userId}`
        const existingProgress = JSON.parse(localStorage.getItem(storageKey) || '{}')
        existingProgress[progress.tourId] = progress
        localStorage.setItem(storageKey, JSON.stringify(existingProgress))
        return
      }

      console.log(`[OnboardingService] Saved progress for user ${progress.userId}, tour ${progress.tourId}`)
    } catch (error) {
      console.error('[OnboardingService] Error saving onboarding progress:', error)
      // Fallback to localStorage
      try {
        const storageKey = `onboarding_progress_${progress.userId}`
        const existingProgress = JSON.parse(localStorage.getItem(storageKey) || '{}')
        existingProgress[progress.tourId] = progress
        localStorage.setItem(storageKey, JSON.stringify(existingProgress))
        console.log(`[OnboardingService] Saved progress to localStorage for user ${progress.userId}`)
      } catch (localError) {
        console.error('[OnboardingService] Failed to save to localStorage:', localError)
      }
    }
  }

  /**
   * Load onboarding progress from user preferences
   */
  static async loadOnboardingProgress(userId: string, tourId: string): Promise<OnboardingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('dashboard_widgets')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found
          return null
        }
        throw new Error(`Failed to load onboarding progress: ${error.message}`)
      }

      const widgets = data?.dashboard_widgets as any
      const onboardingProgress = widgets?.onboarding_progress?.[tourId]

      if (!onboardingProgress) {
        return null
      }

      return {
        userId,
        tourId,
        ...onboardingProgress
      }
    } catch (error) {
      console.error('[OnboardingService] Error loading onboarding progress:', error)
      return null
    }
  }

  /**
   * Track tour events for analytics
   */
  static async trackTourEvent(event: OnboardingAnalytics['event'], data: Omit<OnboardingAnalytics, 'event'>): Promise<void> {
    try {
      const eventData: OnboardingAnalytics = {
        event,
        ...data
      }

      // Try to save to analytics_events table
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: data.userId || null,
          event_type: `onboarding_${event}`,
          event_data: eventData as any,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.warn(`[OnboardingService] Analytics table not available, using localStorage: ${error.message}`)
        // Fallback to localStorage for analytics
        const storageKey = `analytics_events_${data.userId || 'anonymous'}`
        const existingEvents = JSON.parse(localStorage.getItem(storageKey) || '[]')
        existingEvents.push({
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_type: `onboarding_${event}`,
          event_data: eventData,
          created_at: new Date().toISOString()
        })
        // Keep only last 100 events in localStorage
        if (existingEvents.length > 100) {
          existingEvents.splice(0, existingEvents.length - 100)
        }
        localStorage.setItem(storageKey, JSON.stringify(existingEvents))
        console.log(`[OnboardingService] Tracked event to localStorage: ${event} for tour ${data.tourId}`)
      } else {
        console.log(`[OnboardingService] Tracked event: ${event} for tour ${data.tourId}`)
      }
    } catch (error) {
      console.warn('[OnboardingService] Error tracking tour event, continuing without analytics:', error)
      // Don't throw error for analytics failures, just log locally
      try {
        const storageKey = `analytics_events_${data.userId || 'anonymous'}`
        const existingEvents = JSON.parse(localStorage.getItem(storageKey) || '[]')
        existingEvents.push({
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_type: `onboarding_${event}`,
          event_data: { event, ...data },
          created_at: new Date().toISOString()
        })
        localStorage.setItem(storageKey, JSON.stringify(existingEvents))
      } catch (localError) {
        console.error('[OnboardingService] Failed to save analytics to localStorage:', localError)
      }
    }
  }

  /**
   * Get onboarding analytics for admin dashboard
   */
  static async getOnboardingAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalUsers: number
    completedOnboarding: number
    skippedOnboarding: number
    averageCompletionTime: number
    popularTours: Array<{ tourId: string; startCount: number; completionRate: number }>
    stepDropoffs: Array<{ tourId: string; stepId: string; dropoffRate: number }>
  }> {
    try {
      const fromDate = dateFrom?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const toDate = dateTo?.toISOString() || new Date().toISOString()

      // Get total users who started onboarding
      const { count: totalUsers } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'onboarding_tour_started')
        .gte('created_at', fromDate)
        .lte('created_at', toDate)

      // Get completed onboarding count
      const { count: completedOnboarding } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'onboarding_tour_completed')
        .gte('created_at', fromDate)
        .lte('created_at', toDate)

      // Get skipped onboarding count
      const { count: skippedOnboarding } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'onboarding_tour_skipped')
        .gte('created_at', fromDate)
        .lte('created_at', toDate)

      return {
        totalUsers: totalUsers || 0,
        completedOnboarding: completedOnboarding || 0,
        skippedOnboarding: skippedOnboarding || 0,
        averageCompletionTime: 0, // Would need more complex query
        popularTours: [], // Would need aggregation query
        stepDropoffs: [] // Would need complex analysis
      }
    } catch (error) {
      console.error('[OnboardingService] Error getting onboarding analytics:', error)
      throw error
    }
  }

  /**
   * Reset user's onboarding progress
   */
  static async resetOnboardingProgress(userId: string, tourId?: string): Promise<void> {
    try {
      if (tourId) {
        // Reset specific tour progress
        const currentProgress = await this.loadOnboardingProgress(userId, tourId)
        if (currentProgress) {
          const resetProgress: OnboardingProgress = {
            ...currentProgress,
            currentStepIndex: 0,
            completedSteps: [],
            skippedSteps: [],
            startedAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            completedAt: undefined,
            skippedAt: undefined,
            progressPercentage: 0
          }
          await this.saveOnboardingProgress(resetProgress)
        }
      } else {
        // Reset all onboarding progress
        const { error } = await supabase
          .from('user_preferences')
          .update({
            dashboard_widgets: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (error) {
          throw new Error(`Failed to reset onboarding progress: ${error.message}`)
        }

        // Also reset the onboarding_completed flag
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            onboarding_completed: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (profileError) {
          throw new Error(`Failed to reset onboarding status: ${profileError.message}`)
        }
      }

      console.log(`[OnboardingService] Reset onboarding progress for user ${userId}${tourId ? `, tour ${tourId}` : ''}`)
    } catch (error) {
      console.error('[OnboardingService] Error resetting onboarding progress:', error)
      throw error
    }
  }

}