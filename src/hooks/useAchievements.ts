// src/hooks/useAchievements.ts
// Hook for managing user achievements and progress

import { useState, useEffect, useCallback } from 'react'
import { AchievementEngine, UserProgress } from '@/lib/gamification/achievements'
import { type FinancialPlanWithMetrics } from '@/lib/api/plans'
import { useAuth } from '@/hooks/useAuth'
import { DashboardService } from '@/lib/services/dashboardService'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UseAchievementsReturn {
  userProgress: UserProgress | null
  achievementEngine: AchievementEngine | null
  loading: boolean
  error: string | null
  checkAchievements: (plans: FinancialPlanWithMetrics[]) => void
  updateProgress: (updates: Partial<UserProgress['progressData']>) => void
  markAchievementSeen: (achievementId: string) => void
}

// Fetch user progress from database
const fetchUserProgress = async (userId: string): Promise<UserProgress> => {
  try {
    // Get user experience and achievements from database
    const [userExperience, userAchievements, availableAchievements] = await Promise.all([
      DashboardService.getUserExperience(userId),
      DashboardService.getUserAchievements(userId),
      DashboardService.getAvailableAchievements()
    ])

    // Convert user achievements to completed achievement IDs
    const completedAchievements = userAchievements.map(ua => ua.achievement_id)

    // Calculate total points from unlocked achievements
    const totalPoints = userAchievements.reduce((sum, ua) => {
      const achievement = ua.achievements
      return sum + (achievement?.experience_points || 0)
    }, 0)

    // Get user's financial plans to calculate metrics
    const userPlans = await DashboardService.getFinancialPlans(userId)
    
    // Calculate totalSavingsOptimized from completed plans
    const totalSavingsOptimized = userPlans
      .filter(plan => plan.status === 'completed')
      .reduce((sum, plan) => {
        // Calculate savings from optimization (difference between original and optimized monthly payment)
        const originalPayment = (plan as any).calculatedMetrics?.monthlyPayment || 0
        const optimizedSavings = originalPayment * 0.1 // Assume 10% optimization savings
        return sum + optimizedSavings * 12 // Annual savings
      }, 0)

    // Calculate highest ROI from investment plans
    const highestROI = Math.max(
      0,
      ...userPlans
        .filter(plan => plan.plan_type === 'investment' && plan.expected_roi)
        .map(plan => plan.expected_roi || 0)
    )

    // Calculate completed plans count
    const plansCompleted = userPlans.filter(plan => plan.status === 'completed').length

    return {
      userId,
      totalPoints,
      level: userExperience.current_level || 1,
      completedAchievements,
      progressData: {
        plansCreated: userExperience.plans_created || 0,
        totalSavingsOptimized,
        highestROI,
        plansCompleted,
        exportsGenerated: (userExperience as any).exports_generated || 0, // Add to user_experience table if needed
        streakDays: userExperience.current_login_streak || 0,
        lastActivityDate: userExperience.last_activity_date ? new Date(userExperience.last_activity_date) : new Date()
      }
    }
  } catch (error) {
    console.error('Error fetching user progress:', error)
    throw error
  }
}

// Save user progress to database
const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    // Update user experience in database
    const { error } = await supabase
      .from('user_experience')
      .upsert({
        user_id: progress.userId,
        total_experience: progress.totalPoints,
        current_level: progress.level,
        experience_in_level: progress.totalPoints % 100, // Simple calculation
        experience_to_next_level: 100 - (progress.totalPoints % 100),
        plans_created: progress.progressData.plansCreated,
        calculations_performed: 0, // Would need tracking
        properties_viewed: 0, // Would need tracking
        achievements_unlocked: progress.completedAchievements.length,
        days_active: progress.progressData.streakDays,
        current_login_streak: progress.progressData.streakDays,
        longest_login_streak: progress.progressData.streakDays,
        last_activity_date: progress.progressData.lastActivityDate.toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error saving user experience:', error)
      throw error
    }
  } catch (error) {
    console.error('Error saving user progress:', error)
    throw error
  }
}

export function useAchievements(): UseAchievementsReturn {
  const { user } = useAuth()
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [achievementEngine, setAchievementEngine] = useState<AchievementEngine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize user progress
  useEffect(() => {
    if (user) {
      fetchUserProgress(user.id)
        .then(progress => {
          setUserProgress(progress)
          setAchievementEngine(new AchievementEngine(progress))
          setError(null)
        })
        .catch(err => {
          console.error('Error fetching user progress:', err)
          setError('Failed to load user progress')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [user])

  // Check for new achievements
  const checkAchievements = useCallback(async (plans: FinancialPlanWithMetrics[]) => {
    if (!achievementEngine || !userProgress || !user) return

    const newAchievements = achievementEngine.checkAchievements(plans)
    
    if (newAchievements.length > 0) {
      try {
        // Save new achievements to database
        for (const achievement of newAchievements) {
          const { error } = await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString(),
              progress_data: {} // Store achievement progress data
            })

          if (error) {
            console.error('Error saving achievement:', error)
          } else {
            // Show achievement unlock notification
            toast.success(`🎉 Achievement Unlocked: ${achievement.title}`, {
              description: achievement.description
            })
          }
        }

        // Update local state with new achievements
        setUserProgress(prev => ({
          ...prev!,
          completedAchievements: [...prev!.completedAchievements, ...newAchievements.map(a => a.id)],
          totalPoints: prev!.totalPoints + newAchievements.reduce((sum, a) => sum + a.points, 0)
        }))

        // Update user experience in database
        const updatedProgress = {
          ...userProgress,
          completedAchievements: [...userProgress.completedAchievements, ...newAchievements.map(a => a.id)],
          totalPoints: userProgress.totalPoints + newAchievements.reduce((sum, a) => sum + a.points, 0)
        }

        await saveUserProgress(updatedProgress)
      } catch (error) {
        console.error('Error processing new achievements:', error)
      }
    }
  }, [achievementEngine, userProgress, user])

  // Update progress data
  const updateProgress = useCallback(async (updates: Partial<UserProgress['progressData']>) => {
    if (!userProgress) return

    const updatedProgress = {
      ...userProgress,
      progressData: {
        ...userProgress.progressData,
        ...updates,
        lastActivityDate: new Date()
      }
    }

    setUserProgress(updatedProgress)
    
    // Update achievement engine with new progress
    setAchievementEngine(new AchievementEngine(updatedProgress))

    try {
      // Save to database
      await saveUserProgress(updatedProgress)
    } catch (error) {
      console.error('Error saving user progress:', error)
    }
  }, [userProgress])

  // Mark achievement as seen (for notification purposes)
  const markAchievementSeen = useCallback(async (achievementId: string) => {
    try {
      // Create a notification entry to mark achievement as seen
      if (user) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('type', 'achievement')
          .like('metadata', `%${achievementId}%`)

        if (error) {
          console.error('Error marking achievement as seen:', error)
        }
      }
    } catch (error) {
      console.error('Error marking achievement as seen:', error)
    }
  }, [user])

  return {
    userProgress,
    achievementEngine,
    loading,
    error,
    checkAchievements,
    updateProgress,
    markAchievementSeen
  }
}

// Hook specifically for tracking plan-related achievements
export function usePlanAchievements() {
  const { checkAchievements, updateProgress } = useAchievements()

  const onPlanCreated = useCallback(async (plan: FinancialPlanWithMetrics) => {
    // Update progress with new plan count
    await updateProgress({
      plansCreated: (await DashboardService.getFinancialPlans(plan.user_id)).length
    })
    
    // Check for achievements after plan creation
    const allPlans = await DashboardService.getFinancialPlans(plan.user_id)
    checkAchievements(allPlans as FinancialPlanWithMetrics[])
  }, [checkAchievements, updateProgress])

  const onPlanCompleted = useCallback(async (plan: FinancialPlanWithMetrics) => {
    // Update progress with completed plan count
    const allPlans = await DashboardService.getFinancialPlans(plan.user_id)
    const completedPlans = allPlans.filter(p => p.status === 'completed').length
    
    await updateProgress({
      plansCompleted: completedPlans
    })
    
    // Check for achievements after plan completion
    checkAchievements(allPlans as FinancialPlanWithMetrics[])
  }, [checkAchievements, updateProgress])

  const onExportGenerated = useCallback(async (userId: string) => {
    try {
      // Update export count in user experience
      const userExperience = await DashboardService.getUserExperience(userId)
      const newExportCount = ((userExperience as any).exports_generated || 0) + 1
      
      await updateProgress({
        exportsGenerated: newExportCount
      })
      
      // Update in database - add exports_generated field if it doesn't exist
      await supabase
        .from('user_experience')
        .update({ 
          exports_generated: newExportCount,
          last_activity_date: new Date().toISOString()
        })
        .eq('user_id', userId)
        
      console.log('Export generated - progress updated')
    } catch (error) {
      console.error('Error updating export progress:', error)
    }
  }, [updateProgress])

  const onROIAchieved = useCallback(async (roi: number, userId: string) => {
    // Update the highest ROI achieved
    const allPlans = await DashboardService.getFinancialPlans(userId)
    const highestROI = Math.max(roi, ...allPlans.map(p => p.expected_roi || 0))
    
    await updateProgress({
      highestROI
    })
    
    // Check for achievements after ROI milestone
    checkAchievements(allPlans as FinancialPlanWithMetrics[])
  }, [checkAchievements, updateProgress])

  return {
    onPlanCreated,
    onPlanCompleted,
    onExportGenerated,
    onROIAchieved,
    checkAchievements
  }
}