// src/hooks/useOnboarding.ts
// Hook for managing user onboarding and tutorial progress

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
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

// Mock user progress data - would be stored in database
const getMockUserProgress = (userId: string, flowId: string): UserOnboardingProgress | null => {
  // Check if user has existing progress
  const existingProgress = localStorage.getItem(`onboarding_${userId}_${flowId}`)
  
  if (existingProgress) {
    return JSON.parse(existingProgress)
  }
  
  return null
}

const saveMockUserProgress = (progress: UserOnboardingProgress): void => {
  localStorage.setItem(
    `onboarding_${progress.userId}_${progress.flowId}`,
    JSON.stringify(progress)
  )
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
      let userProgress = getMockUserProgress(user.id, flowId)
      
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
        saveMockUserProgress(userProgress)
      }
      
      setProgress(userProgress)
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
    saveMockUserProgress(newProgress)
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
      saveMockUserProgress(updatedProgress)
    } else {
      // Complete onboarding
      const updatedProgress = {
        ...progress,
        completedAt: new Date(),
        lastActiveAt: new Date()
      }
      
      setProgress(updatedProgress)
      saveMockUserProgress(updatedProgress)
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
      saveMockUserProgress(updatedProgress)
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
    saveMockUserProgress(updatedProgress)
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
    saveMockUserProgress(updatedProgress)
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
    saveMockUserProgress(newProgress)
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
    const basicProgress = getMockUserProgress(user.id, 'first_time_user')
    const hasCompletedBasic = basicProgress?.completedAt || basicProgress?.skipped

    if (!hasCompletedBasic) {
      setNeedsOnboarding(true)
      setRecommendedFlow('first_time_user')
    } else {
      setNeedsOnboarding(false)
      setRecommendedFlow(null)
    }
  }, [user])

  return {
    needsOnboarding,
    recommendedFlow
  }
}