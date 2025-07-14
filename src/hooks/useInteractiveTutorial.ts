// src/hooks/useInteractiveTutorial.ts
// Hook for managing interactive tutorial system with guided walkthroughs

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  InteractiveTutorial, 
  TutorialStep, 
  UserHelpPreferences 
} from '@/types/onboarding'

interface UserTutorialProgress {
  userId: string
  tutorialId: string
  currentStepIndex: number
  completedSteps: number[]
  startedAt: Date
  lastActiveAt: Date
  completedAt?: Date
  skipped: boolean
  pausedAt?: Date
}

interface UseTutorialReturn {
  // Tutorial state
  activeTutorial: InteractiveTutorial | null
  currentStep: TutorialStep | null
  currentStepIndex: number
  isActive: boolean
  isPaused: boolean
  progress: UserTutorialProgress | null
  
  // Tutorial controls
  startTutorial: (tutorialId: string) => void
  nextStep: () => void
  previousStep: () => void
  skipStep: () => void
  pauseTutorial: () => void
  resumeTutorial: () => void
  completeTutorial: () => void
  exitTutorial: () => void
  
  // Step validation
  validateCurrentStep: () => boolean
  canProceed: boolean
  
  // Preferences
  tutorialPreferences: UserHelpPreferences | null
  updatePreferences: (updates: Partial<UserHelpPreferences>) => void
  
  // Utilities
  getTutorialById: (id: string) => InteractiveTutorial | undefined
  getCompletedTutorials: () => string[]
  shouldShowTutorial: (tutorialId: string) => boolean
}

// Generate unique session ID for tutorial tracking
const generateTutorialSessionId = () => {
  return `tutorial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get user tutorial progress from localStorage
const getUserTutorialProgress = (userId: string, tutorialId: string): UserTutorialProgress | null => {
  const stored = localStorage.getItem(`tutorial_progress_${userId}_${tutorialId}`)
  
  if (stored) {
    const parsed = JSON.parse(stored)
    return {
      ...parsed,
      startedAt: new Date(parsed.startedAt),
      lastActiveAt: new Date(parsed.lastActiveAt),
      completedAt: parsed.completedAt ? new Date(parsed.completedAt) : undefined,
      pausedAt: parsed.pausedAt ? new Date(parsed.pausedAt) : undefined
    }
  }
  
  return null
}

// Save tutorial progress to localStorage
const saveTutorialProgress = (progress: UserTutorialProgress) => {
  localStorage.setItem(
    `tutorial_progress_${progress.userId}_${progress.tutorialId}`, 
    JSON.stringify(progress)
  )
}

// Get user tutorial preferences
const getUserTutorialPreferences = (userId: string): UserHelpPreferences => {
  const stored = localStorage.getItem(`tutorial_preferences_${userId}`)
  
  if (stored) {
    const parsed = JSON.parse(stored)
    return {
      ...parsed,
      lastHelpInteraction: new Date(parsed.lastHelpInteraction)
    }
  }

  // Default preferences for new users
  return {
    userId,
    showContextualHelp: true,
    autoStartTutorials: true,
    helpLevel: 'guided',
    preferredLanguage: 'vi',
    dismissedHelp: [],
    completedTutorials: [],
    lastHelpInteraction: new Date()
  }
}

// Save tutorial preferences
const saveTutorialPreferences = (preferences: UserHelpPreferences) => {
  localStorage.setItem(`tutorial_preferences_${preferences.userId}`, JSON.stringify(preferences))
}

// Predefined tutorials for key features
const INTERACTIVE_TUTORIALS: InteractiveTutorial[] = [
  {
    id: 'financial_planning_walkthrough',
    name: 'Hướng Dẫn Lập Kế Hoạch Tài Chính',
    description: 'Tìm hiểu cách tạo kế hoạch tài chính từ A đến Z',
    category: 'financial_planning',
    steps: [
      {
        id: 'step_1',
        target: '[data-tutorial="create-plan-button"]',
        title: 'Tạo Kế Hoạch Mới',
        content: 'Bắt đầu bằng cách nhấn nút "Tạo Kế Hoạch" để mở form tạo kế hoạch tài chính.',
        position: 'bottom',
        showSkip: true,
        showProgress: true,
        action: {
          type: 'click',
          element: '[data-tutorial="create-plan-button"]'
        },
        validation: {
          type: 'element_exists',
          selector: '[data-tutorial="plan-form"]'
        }
      },
      {
        id: 'step_2',
        target: '[data-tutorial="property-price"]',
        title: 'Nhập Giá Trị Bất Động Sản',
        content: 'Nhập tổng giá trị bất động sản bạn muốn mua. Đây là số tiền bao gồm cả các chi phí phát sinh.',
        position: 'right',
        showSkip: true,
        showProgress: true,
        action: {
          type: 'input',
          element: '[data-tutorial="property-price"] input',
          value: '2000000000'
        },
        validation: {
          type: 'value_entered',
          selector: '[data-tutorial="property-price"] input'
        }
      },
      {
        id: 'step_3',
        target: '[data-tutorial="down-payment"]',
        title: 'Nhập Vốn Tự Có',
        content: 'Nhập số tiền bạn có thể trả trước (thường 20-30% giá trị nhà). Vốn tự có càng nhiều, lãi suất càng tốt.',
        position: 'right',
        showSkip: true,
        showProgress: true,
        action: {
          type: 'input',
          element: '[data-tutorial="down-payment"] input',
          value: '600000000'
        }
      },
      {
        id: 'step_4',
        target: '[data-tutorial="interest-rate"]',
        title: 'Chọn Lãi Suất',
        content: 'Nhập lãi suất vay dự kiến từ ngân hàng. Hãy so sánh nhiều ngân hàng để có lãi suất tốt nhất.',
        position: 'right',
        showSkip: true,
        showProgress: true,
        action: {
          type: 'input',
          element: '[data-tutorial="interest-rate"] input',
          value: '8.5'
        }
      },
      {
        id: 'step_5',
        target: '[data-tutorial="loan-term"]',
        title: 'Thời Gian Vay',
        content: 'Chọn thời gian vay phù hợp. Thời gian dài = trả ít hàng tháng nhưng tổng lãi cao hơn.',
        position: 'right',
        showSkip: true,
        showProgress: true,
        action: {
          type: 'input',
          element: '[data-tutorial="loan-term"] input',
          value: '20'
        }
      },
      {
        id: 'step_6',
        target: '[data-tutorial="submit-plan"]',
        title: 'Hoàn Thành Kế Hoạch',
        content: 'Nhấn "Tạo Kế Hoạch" để hoàn thành. Bạn sẽ thấy kết quả tính toán chi tiết và có thể tạo thêm kịch bản khác.',
        position: 'top',
        showSkip: false,
        showProgress: true,
        action: {
          type: 'click',
          element: '[data-tutorial="submit-plan"]'
        }
      }
    ],
    startCondition: {
      page: '/dashboard',
      completedOnboarding: true
    },
    completionReward: {
      points: 100,
      achievement: 'tutorial_master',
      unlockFeature: 'advanced_scenarios'
    }
  },
  {
    id: 'scenario_comparison_tutorial',
    name: 'So Sánh Kịch Bản Vay',
    description: 'Học cách so sánh nhiều phương án vay khác nhau',
    category: 'advanced_features',
    steps: [
      {
        id: 'step_1',
        target: '[data-tutorial="scenario-tab"]',
        title: 'Mở Tab So Sánh',
        content: 'Nhấn vào tab "So Sánh Kịch Bản" để bắt đầu so sánh các phương án vay khác nhau.',
        position: 'bottom',
        showSkip: true,
        showProgress: true,
        action: {
          type: 'click',
          element: '[data-tutorial="scenario-tab"]'
        }
      },
      {
        id: 'step_2',
        target: '[data-tutorial="add-scenario"]',
        title: 'Thêm Kịch Bản Mới',
        content: 'Nhấn "Thêm Kịch Bản" để tạo phương án vay thứ hai với các thông số khác.',
        position: 'right',
        showSkip: true,
        showProgress: true,
        action: {
          type: 'click',
          element: '[data-tutorial="add-scenario"]'
        }
      },
      {
        id: 'step_3',
        target: '[data-tutorial="scenario-settings"]',
        title: 'Điều Chỉnh Thông Số',
        content: 'Thay đổi lãi suất, thời gian vay hoặc vốn tự có để tạo kịch bản khác biệt.',
        position: 'left',
        showSkip: true,
        showProgress: true
      },
      {
        id: 'step_4',
        target: '[data-tutorial="comparison-chart"]',
        title: 'Xem Biểu Đồ So Sánh',
        content: 'Biểu đồ này giúp bạn thấy rõ sự khác biệt giữa các kịch bản về tổng chi phí và khoản trả hàng tháng.',
        position: 'top',
        showSkip: true,
        showProgress: true
      }
    ],
    startCondition: {
      completedOnboarding: true,
      userType: ['investor', 'upgrader']
    },
    completionReward: {
      points: 75,
      achievement: 'scenario_expert'
    }
  }
]

export function useInteractiveTutorial(): UseTutorialReturn {
  const { user } = useAuth()
  const [activeTutorial, setActiveTutorial] = useState<InteractiveTutorial | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState<UserTutorialProgress | null>(null)
  const [tutorialPreferences, setTutorialPreferences] = useState<UserHelpPreferences | null>(null)
  const [canProceed, setCanProceed] = useState(false)
  
  const stepTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize tutorial preferences
  useEffect(() => {
    if (user) {
      const preferences = getUserTutorialPreferences(user.id)
      setTutorialPreferences(preferences)
    }
  }, [user])

  // Get current step
  const currentStep = activeTutorial && activeTutorial.steps[currentStepIndex] || null

  // Start tutorial
  const startTutorial = useCallback((tutorialId: string) => {
    if (!user) return

    const tutorial = INTERACTIVE_TUTORIALS.find(t => t.id === tutorialId)
    if (!tutorial) return

    // Check if tutorial should be shown
    if (!shouldShowTutorial(tutorialId)) return

    // Load existing progress or create new
    let tutorialProgress = getUserTutorialProgress(user.id, tutorialId)
    
    if (!tutorialProgress) {
      tutorialProgress = {
        userId: user.id,
        tutorialId,
        currentStepIndex: 0,
        completedSteps: [],
        startedAt: new Date(),
        lastActiveAt: new Date(),
        skipped: false
      }
    }

    setActiveTutorial(tutorial)
    setCurrentStepIndex(tutorialProgress.currentStepIndex)
    setProgress(tutorialProgress)
    setIsActive(true)
    setIsPaused(false)
    
    saveTutorialProgress(tutorialProgress)
  }, [user])

  // Move to next step
  const nextStep = useCallback(() => {
    if (!activeTutorial || !progress || !user) return

    const nextIndex = currentStepIndex + 1
    
    if (nextIndex >= activeTutorial.steps.length) {
      completeTutorial()
      return
    }

    const updatedProgress = {
      ...progress,
      currentStepIndex: nextIndex,
      completedSteps: [...progress.completedSteps, currentStepIndex],
      lastActiveAt: new Date()
    }

    setCurrentStepIndex(nextIndex)
    setProgress(updatedProgress)
    setCanProceed(false)
    
    saveTutorialProgress(updatedProgress)
  }, [activeTutorial, progress, currentStepIndex, user])

  // Move to previous step
  const previousStep = useCallback(() => {
    if (!activeTutorial || !progress || currentStepIndex === 0) return

    const prevIndex = currentStepIndex - 1
    const updatedProgress = {
      ...progress,
      currentStepIndex: prevIndex,
      lastActiveAt: new Date()
    }

    setCurrentStepIndex(prevIndex)
    setProgress(updatedProgress)
    
    saveTutorialProgress(updatedProgress)
  }, [activeTutorial, progress, currentStepIndex])

  // Skip current step
  const skipStep = useCallback(() => {
    if (!currentStep?.showSkip) return
    nextStep()
  }, [currentStep, nextStep])

  // Pause tutorial
  const pauseTutorial = useCallback(() => {
    if (!progress) return

    const updatedProgress = {
      ...progress,
      pausedAt: new Date(),
      lastActiveAt: new Date()
    }

    setIsPaused(true)
    setProgress(updatedProgress)
    
    saveTutorialProgress(updatedProgress)
  }, [progress])

  // Resume tutorial
  const resumeTutorial = useCallback(() => {
    if (!progress) return

    const updatedProgress = {
      ...progress,
      pausedAt: undefined,
      lastActiveAt: new Date()
    }

    setIsPaused(false)
    setProgress(updatedProgress)
    
    saveTutorialProgress(updatedProgress)
  }, [progress])

  // Complete tutorial
  const completeTutorial = useCallback(() => {
    if (!activeTutorial || !progress || !user || !tutorialPreferences) return

    const updatedProgress = {
      ...progress,
      completedAt: new Date(),
      completedSteps: activeTutorial.steps.map((_, index) => index),
      lastActiveAt: new Date()
    }

    const updatedPreferences = {
      ...tutorialPreferences,
      completedTutorials: [...tutorialPreferences.completedTutorials, activeTutorial.id],
      lastHelpInteraction: new Date()
    }

    // Award completion rewards
    if (activeTutorial.completionReward) {
      // In a real app, this would trigger achievement unlocking
      console.log('Tutorial completed! Rewards:', activeTutorial.completionReward)
    }

    setProgress(updatedProgress)
    setTutorialPreferences(updatedPreferences)
    setIsActive(false)
    setActiveTutorial(null)
    setCurrentStepIndex(0)
    
    saveTutorialProgress(updatedProgress)
    saveTutorialPreferences(updatedPreferences)
  }, [activeTutorial, progress, user, tutorialPreferences])

  // Exit tutorial
  const exitTutorial = useCallback(() => {
    if (!progress) return

    const updatedProgress = {
      ...progress,
      skipped: true,
      lastActiveAt: new Date()
    }

    setIsActive(false)
    setActiveTutorial(null)
    setCurrentStepIndex(0)
    setProgress(null)
    
    saveTutorialProgress(updatedProgress)
  }, [progress])

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    if (!currentStep?.validation) return true

    const { type, selector, expectedValue } = currentStep.validation

    switch (type) {
      case 'element_exists':
        return selector ? document.querySelector(selector) !== null : true
        
      case 'value_entered':
        if (!selector) return true
        const element = document.querySelector(selector) as HTMLInputElement
        return element && element.value.trim() !== ''
        
      case 'page_changed':
        return window.location.pathname !== selector
        
      default:
        return true
    }
  }, [currentStep])

  // Check step validation periodically
  useEffect(() => {
    if (!isActive || !currentStep) return

    const checkValidation = () => {
      setCanProceed(validateCurrentStep())
    }

    checkValidation()
    const interval = setInterval(checkValidation, 500)
    
    return () => clearInterval(interval)
  }, [isActive, currentStep, validateCurrentStep])

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<UserHelpPreferences>) => {
    if (!tutorialPreferences) return

    const updatedPreferences = {
      ...tutorialPreferences,
      ...updates,
      lastHelpInteraction: new Date()
    }

    setTutorialPreferences(updatedPreferences)
    saveTutorialPreferences(updatedPreferences)
  }, [tutorialPreferences])

  // Get tutorial by ID
  const getTutorialById = useCallback((id: string): InteractiveTutorial | undefined => {
    return INTERACTIVE_TUTORIALS.find(t => t.id === id)
  }, [])

  // Get completed tutorials
  const getCompletedTutorials = useCallback((): string[] => {
    return tutorialPreferences?.completedTutorials || []
  }, [tutorialPreferences])

  // Check if tutorial should be shown
  const shouldShowTutorial = useCallback((tutorialId: string): boolean => {
    if (!tutorialPreferences || !user) return false

    // Check if already completed
    if (tutorialPreferences.completedTutorials.includes(tutorialId)) return false

    // Check if auto-start is enabled
    if (!tutorialPreferences.autoStartTutorials) return false

    const tutorial = getTutorialById(tutorialId)
    if (!tutorial?.startCondition) return true

    // Check start conditions
    const { page, userType, completedOnboarding } = tutorial.startCondition

    if (page && window.location.pathname !== page) return false
    if (completedOnboarding !== undefined) {
      // In real app, check user's onboarding status
    }
    if (userType && !userType.includes('all')) {
      // In real app, check user's type
    }

    return true
  }, [tutorialPreferences, user, getTutorialById])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stepTimeoutRef.current) {
        clearTimeout(stepTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Tutorial state
    activeTutorial,
    currentStep,
    currentStepIndex,
    isActive,
    isPaused,
    progress,
    
    // Tutorial controls
    startTutorial,
    nextStep,
    previousStep,
    skipStep,
    pauseTutorial,
    resumeTutorial,
    completeTutorial,
    exitTutorial,
    
    // Step validation
    validateCurrentStep,
    canProceed,
    
    // Preferences
    tutorialPreferences,
    updatePreferences,
    
    // Utilities
    getTutorialById,
    getCompletedTutorials,
    shouldShowTutorial
  }
}