// src/hooks/useAchievements.ts
// Hook for managing user achievements and progress

import { useState, useEffect, useCallback } from 'react'
import { AchievementEngine, UserProgress } from '@/lib/gamification/achievements'
import { FinancialPlan } from '@/components/financial-plans/PlansList'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface UseAchievementsReturn {
  userProgress: UserProgress | null
  achievementEngine: AchievementEngine | null
  loading: boolean
  error: string | null
  checkAchievements: (plans: FinancialPlan[]) => void
  updateProgress: (updates: Partial<UserProgress['progressData']>) => void
  markAchievementSeen: (achievementId: string) => void
}

// Mock function to get user progress - would be an API call in real app
const fetchUserProgress = async (userId: string): Promise<UserProgress> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    userId,
    totalPoints: 1250,
    level: 3,
    completedAchievements: ['first_plan', 'smart_investor', 'planning_expert'],
    progressData: {
      plansCreated: 6,
      totalSavingsOptimized: 75000000,
      highestROI: 12.5,
      plansCompleted: 2,
      exportsGenerated: 8,
      streakDays: 15,
      lastActivityDate: new Date()
    }
  }
}

// Mock function to save user progress - would be an API call in real app
const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  console.log('Saving user progress:', progress)
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
  const checkAchievements = useCallback((plans: FinancialPlan[]) => {
    if (!achievementEngine || !userProgress) return

    const newAchievements = achievementEngine.checkAchievements(plans)
    
    if (newAchievements.length > 0) {
      // Update state with new achievements
      setUserProgress(prev => ({
        ...prev!,
        completedAchievements: [...prev!.completedAchievements, ...newAchievements.map(a => a.id)],
        totalPoints: prev!.totalPoints + newAchievements.reduce((sum, a) => sum + a.points, 0)
      }))

      // Show achievement unlock notifications
      newAchievements.forEach(achievement => {
        console.log('🎉 Achievement Unlocked!', achievement.title, achievement.description)
        // In a real app, this would show a toast notification
      })

      // Save progress to backend
      saveUserProgress(userProgress)
        .catch(err => {
          console.error('Error saving user progress:', err)
        })
    }
  }, [achievementEngine, userProgress])

  // Update progress data
  const updateProgress = useCallback((updates: Partial<UserProgress['progressData']>) => {
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

    // Save to backend
    saveUserProgress(updatedProgress)
      .catch(err => {
        console.error('Error saving user progress:', err)
      })
  }, [userProgress])

  // Mark achievement as seen (for notification purposes)
  const markAchievementSeen = useCallback((achievementId: string) => {
    // This would typically update a "seen" flag in the database
    console.log('Achievement marked as seen:', achievementId)
  }, [])

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
  const { checkAchievements } = useAchievements()

  const onPlanCreated = useCallback((_plan: FinancialPlan) => {
    // This would increment the plan count in a real implementation
    console.log('Plan created - updating progress')
  }, [])

  const onPlanCompleted = useCallback((_plan: FinancialPlan) => {
    // This would increment the completed plan count in a real implementation
    console.log('Plan completed - updating progress')
  }, [])

  const onExportGenerated = useCallback(() => {
    // This would increment the export count in a real implementation
    console.log('Export generated - updating progress')
  }, [])

  const onROIAchieved = useCallback((roi: number) => {
    // This would update the highest ROI in a real implementation
    console.log('ROI achieved:', roi)
  }, [])

  return {
    onPlanCreated,
    onPlanCompleted,
    onExportGenerated,
    onROIAchieved,
    checkAchievements
  }
}