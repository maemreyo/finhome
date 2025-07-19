// src/hooks/useOnboarding.ts
// Hook for managing user onboarding and tutorial progress

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DashboardService } from '@/lib/services/dashboardService'
import { 
  OnboardingFlow, 
  OnboardingStep, 
  UserOnboardingProgress,
  ONBOARDING_FLOWS 
} from '@/types/onboarding'

interface UseOnboardingReturn {
  currentFlow: OnboardingFlow | null
  currentStep: OnboardingStep | null
  progress: UserOnboardingProgress | null
  isOnboardingActive: boolean
  isOnboardingCompleted: boolean
  currentStepIndex: number
  totalSteps: number
  progressPercentage: number
  startOnboarding: (flowId: string) => void
  nextStep: () => void
  previousStep: () => void
  skipStep: () => void
  completeStep: (stepId: string) => void
  skipOnboarding: () => void
  restartOnboarding: () => void
  loading: boolean
  error: string | null
}

// Get user onboarding progress from database
const getUserProgress = async (userId: string, flowId: string): Promise<UserOnboardingProgress | null> => {
  try {
    const preferences = await DashboardService.getUserPreferences(userId)
    
    if (preferences && (preferences as any).onboarding_progress) {
      const allProgress = JSON.parse((preferences as any).onboarding_progress)
      const flowProgress = allProgress[flowId]
      
      if (flowProgress) {
        return {
          ...flowProgress,
          startedAt: new Date(flowProgress.startedAt),
          lastActiveAt: new Date(flowProgress.lastActiveAt),
          completedAt: flowProgress.completedAt ? new Date(flowProgress.completedAt) : undefined
        }
      }
    }
  } catch (error) {
    console.error('Error loading onboarding progress from database:', error)
  }
  
  return null
}

const saveUserProgress = async (progress: UserOnboardingProgress): Promise<void> => {
  try {
    const preferences = await DashboardService.getUserPreferences(progress.userId)
    const currentProgress = (preferences as any)?.onboarding_progress ? JSON.parse((preferences as any).onboarding_progress) : {}
    
    const updatedProgress = {
      ...currentProgress,
      [progress.flowId]: progress
    }
    
    await DashboardService.updateUserPreferences(progress.userId, {
      onboarding_progress: JSON.stringify(updatedProgress)
    } as any)
  } catch (error) {
    console.error('Error saving onboarding progress to database:', error)
  }
}

export function useOnboarding(flowId?: string): UseOnboardingReturn {
  const { user } = useAuth()
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow | null>(null)
  const [progress, setProgress] = useState<UserOnboardingProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize onboarding flow
  useEffect(() => {
    if (!user || !flowId) return

    setLoading(true)
    try {
      const flow = ONBOARDING_FLOWS.find(f => f.id === flowId)
      if (!flow) {
        throw new Error(`Onboarding flow ${flowId} not found`)
      }

      setCurrentFlow(flow)
      
      // Load or create user progress
      getUserProgress(user.id, flowId).then(userProgress => {
        if (!userProgress) {
          userProgress = {
            userId: user.id,
            flowId,
            currentStepId: flow.steps[0].id,
            completedSteps: [],
            startedAt: new Date(),
            lastActiveAt: new Date(),
            skipped: false,
            flowType: flow.type
          }
          saveUserProgress(userProgress).catch(console.error)
        }
        
        setProgress(userProgress)
      })
      setError(null)
    } catch (err) {
      console.error('Error initializing onboarding:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize onboarding')
    } finally {
      setLoading(false)
    }
  }, [user, flowId])

  // Get current step
  const currentStep = currentFlow && progress 
    ? currentFlow.steps.find(step => step.id === progress.currentStepId) || null
    : null

  // Calculate progress metrics
  const currentStepIndex = currentFlow && currentStep 
    ? currentFlow.steps.findIndex(step => step.id === currentStep.id)
    : 0

  const totalSteps = currentFlow?.steps.length || 0
  
  const progressPercentage = totalSteps > 0 
    ? Math.round((progress?.completedSteps.length || 0) / totalSteps * 100)
    : 0

  const isOnboardingActive = !!currentFlow && !!progress && !progress.completedAt && !progress.skipped
  
  const isOnboardingCompleted = !!progress?.completedAt || 
    (!!progress && progress.completedSteps.length === totalSteps)

  // Start onboarding flow
  const startOnboarding = useCallback((newFlowId: string) => {
    if (!user) return

    const flow = ONBOARDING_FLOWS.find(f => f.id === newFlowId)
    if (!flow) {
      setError(`Onboarding flow ${newFlowId} not found`)
      return
    }

    setCurrentFlow(flow)
    
    const newProgress: UserOnboardingProgress = {
      userId: user.id,
      flowId: newFlowId,
      currentStepId: flow.steps[0].id,
      completedSteps: [],
      startedAt: new Date(),
      lastActiveAt: new Date(),
      skipped: false,
      flowType: flow.type
    }
    
    setProgress(newProgress)
    saveUserProgress(newProgress).catch(console.error)
  }, [user])

  // Move to next step
  const nextStep = useCallback(() => {
    if (!currentFlow || !progress || !currentStep) return

    const currentIndex = currentFlow.steps.findIndex(step => step.id === currentStep.id)
    const nextIndex = currentIndex + 1

    if (nextIndex < currentFlow.steps.length) {
      const nextStepId = currentFlow.steps[nextIndex].id
      const updatedProgress = {
        ...progress,
        currentStepId: nextStepId,
        lastActiveAt: new Date()
      }
      
      setProgress(updatedProgress)
      saveUserProgress(updatedProgress).catch(console.error)
    } else {
      // Complete onboarding
      const updatedProgress = {
        ...progress,
        completedAt: new Date(),
        lastActiveAt: new Date()
      }
      
      setProgress(updatedProgress)
      saveUserProgress(updatedProgress).catch(console.error)
    }
  }, [currentFlow, progress, currentStep])

  // Move to previous step
  const previousStep = useCallback(() => {
    if (!currentFlow || !progress || !currentStep) return

    const currentIndex = currentFlow.steps.findIndex(step => step.id === currentStep.id)
    const previousIndex = currentIndex - 1

    if (previousIndex >= 0) {
      const previousStepId = currentFlow.steps[previousIndex].id
      const updatedProgress = {
        ...progress,
        currentStepId: previousStepId,
        lastActiveAt: new Date()
      }
      
      setProgress(updatedProgress)
      saveUserProgress(updatedProgress).catch(console.error)
    }
  }, [currentFlow, progress, currentStep])

  // Skip current step
  const skipStep = useCallback(() => {
    if (!currentStep || !currentStep.isOptional) return
    nextStep()
  }, [currentStep, nextStep])

  // Complete specific step
  const completeStep = useCallback((stepId: string) => {
    if (!progress) return

    const updatedProgress = {
      ...progress,
      completedSteps: [...progress.completedSteps.filter(id => id !== stepId), stepId],
      lastActiveAt: new Date()
    }
    
    setProgress(updatedProgress)
    saveUserProgress(updatedProgress).catch(console.error)
  }, [progress])

  // Skip entire onboarding
  const skipOnboarding = useCallback(() => {
    if (!progress) return

    const updatedProgress = {
      ...progress,
      skipped: true,
      lastActiveAt: new Date()
    }
    
    setProgress(updatedProgress)
    saveUserProgress(updatedProgress).catch(console.error)
  }, [progress])

  // Restart onboarding
  const restartOnboarding = useCallback(() => {
    if (!user || !currentFlow) return

    const newProgress: UserOnboardingProgress = {
      userId: user.id,
      flowId: currentFlow.id,
      currentStepId: currentFlow.steps[0].id,
      completedSteps: [],
      startedAt: new Date(),
      lastActiveAt: new Date(),
      skipped: false,
      flowType: currentFlow.type
    }
    
    setProgress(newProgress)
    saveUserProgress(newProgress).catch(console.error)
  }, [user, currentFlow])

  return {
    currentFlow,
    currentStep,
    progress,
    isOnboardingActive,
    isOnboardingCompleted,
    currentStepIndex,
    totalSteps,
    progressPercentage,
    startOnboarding,
    nextStep,
    previousStep,
    skipStep,
    completeStep,
    skipOnboarding,
    restartOnboarding,
    loading,
    error
  }
}

// Hook specifically for checking if user needs onboarding
export function useOnboardingCheck() {
  const { user } = useAuth()
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [recommendedFlow, setRecommendedFlow] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Check if user has completed basic onboarding
    getUserProgress(user.id, 'first_time_user').then(basicProgress => {
      const hasCompletedBasic = basicProgress?.completedAt || basicProgress?.skipped

      if (!hasCompletedBasic) {
        setNeedsOnboarding(true)
        setRecommendedFlow('first_time_user')
      } else {
        setNeedsOnboarding(false)
        setRecommendedFlow(null)
      }
    })
  }, [user])

  return {
    needsOnboarding,
    recommendedFlow
  }
}