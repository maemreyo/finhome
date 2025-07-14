// src/types/onboarding.ts
// Type definitions for onboarding and tutorial system

export interface OnboardingStep {
  id: string
  title: string
  description: string
  component?: string
  isCompleted: boolean
  isOptional: boolean
  duration?: number // in minutes
  prerequisites?: string[]
  helpContent?: HelpContent
}

export interface OnboardingFlow {
  id: string
  name: string
  description: string
  type: 'first_time' | 'feature_introduction' | 'advanced_tutorial'
  steps: OnboardingStep[]
  totalSteps: number
  estimatedDuration: number // in minutes
  targetUserType: 'first_time_buyer' | 'investor' | 'upgrader' | 'all'
}

export interface UserOnboardingProgress {
  userId: string
  flowId: string
  currentStepId: string
  completedSteps: string[]
  startedAt: Date
  lastActiveAt: Date
  completedAt?: Date
  skipped: boolean
  flowType: OnboardingFlow['type']
}

export interface HelpContent {
  id: string
  title: string
  description: string
  content: string
  contentType: 'markdown' | 'html' | 'video' | 'interactive'
  category: 'getting_started' | 'financial_concepts' | 'advanced_features' | 'troubleshooting'
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: number // in minutes
  relatedTopics?: string[]
  lastUpdated: Date
}

export interface ContextualHelp {
  elementId: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  title: string
  content: string
  trigger: 'hover' | 'click' | 'focus' | 'auto'
  showCondition?: {
    userType?: string[]
    subscriptionTier?: string[]
    completedSteps?: string[]
    featureFlag?: string
  }
  priority: 'low' | 'medium' | 'high'
  dismissible: boolean
}

export interface TutorialStep {
  id: string
  target: string // CSS selector
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  showSkip: boolean
  showProgress: boolean
  action?: {
    type: 'click' | 'input' | 'wait' | 'navigate'
    element?: string
    value?: string
    timeout?: number
  }
  validation?: {
    type: 'element_exists' | 'value_entered' | 'page_changed'
    selector?: string
    expectedValue?: string
  }
}

export interface InteractiveTutorial {
  id: string
  name: string
  description: string
  category: 'basic_usage' | 'financial_planning' | 'advanced_features'
  steps: TutorialStep[]
  startCondition?: {
    page?: string
    userType?: string[]
    completedOnboarding?: boolean
  }
  completionReward?: {
    points: number
    achievement?: string
    unlockFeature?: string
  }
}

export interface UserHelpPreferences {
  userId: string
  showContextualHelp: boolean
  autoStartTutorials: boolean
  helpLevel: 'minimal' | 'guided' | 'comprehensive'
  preferredLanguage: 'vi' | 'en'
  dismissedHelp: string[]
  completedTutorials: string[]
  lastHelpInteraction: Date
}

export interface OnboardingConfig {
  flows: OnboardingFlow[]
  helpContent: HelpContent[]
  contextualHelp: ContextualHelp[]
  tutorials: InteractiveTutorial[]
  defaultPreferences: Omit<UserHelpPreferences, 'userId' | 'lastHelpInteraction'>
}

// Predefined onboarding flows based on user types
export const ONBOARDING_FLOWS: OnboardingFlow[] = [
  {
    id: 'first_time_user',
    name: 'Người Dùng Mới',
    description: 'Hướng dẫn cơ bản cho người dùng lần đầu',
    type: 'first_time',
    totalSteps: 5,
    estimatedDuration: 10,
    targetUserType: 'all',
    steps: [
      {
        id: 'welcome',
        title: 'Chào Mừng Đến Với FinHome',
        description: 'Giới thiệu về ứng dụng và lợi ích',
        isCompleted: false,
        isOptional: false,
        duration: 2
      },
      {
        id: 'profile_setup',
        title: 'Thiết Lập Hồ Sơ',
        description: 'Nhập thông tin cá nhân và mục tiêu tài chính',
        isCompleted: false,
        isOptional: false,
        duration: 3
      },
      {
        id: 'first_plan',
        title: 'Tạo Kế Hoạch Đầu Tiên',
        description: 'Hướng dẫn tạo kế hoạch tài chính đầu tiên',
        isCompleted: false,
        isOptional: false,
        duration: 5,
        prerequisites: ['profile_setup']
      },
      {
        id: 'explore_features',
        title: 'Khám Phá Tính Năng',
        description: 'Tìm hiểu các tính năng chính của ứng dụng',
        isCompleted: false,
        isOptional: true,
        duration: 3
      },
      {
        id: 'completion',
        title: 'Hoàn Thành',
        description: 'Chúc mừng bạn đã hoàn thành onboarding',
        isCompleted: false,
        isOptional: false,
        duration: 1
      }
    ]
  },
  {
    id: 'financial_planning_intro',
    name: 'Giới Thiệu Lập Kế Hoạch Tài Chính',
    description: 'Hướng dẫn chi tiết về lập kế hoạch tài chính',
    type: 'feature_introduction',
    totalSteps: 4,
    estimatedDuration: 15,
    targetUserType: 'first_time_buyer',
    steps: [
      {
        id: 'financial_basics',
        title: 'Kiến Thức Tài Chính Cơ Bản',
        description: 'Tìm hiểu các khái niệm tài chính quan trọng',
        isCompleted: false,
        isOptional: false,
        duration: 5
      },
      {
        id: 'plan_creation',
        title: 'Tạo Kế Hoạch',
        description: 'Hướng dẫn từng bước tạo kế hoạch tài chính',
        isCompleted: false,
        isOptional: false,
        duration: 7
      },
      {
        id: 'scenario_analysis',
        title: 'Phân Tích Kịch Bản',
        description: 'Học cách so sánh và phân tích các kịch bản khác nhau',
        isCompleted: false,
        isOptional: true,
        duration: 5
      },
      {
        id: 'action_planning',
        title: 'Lập Kế Hoạch Hành Động',
        description: 'Từ kế hoạch đến thực thi',
        isCompleted: false,
        isOptional: false,
        duration: 3
      }
    ]
  }
]

// Help content categories with Vietnamese terminology
export const HELP_CATEGORIES = {
  getting_started: {
    name: 'Bắt Đầu',
    description: 'Hướng dẫn cơ bản cho người mới',
    icon: '🚀'
  },
  financial_concepts: {
    name: 'Khái Niệm Tài Chính',
    description: 'Giải thích các thuật ngữ và khái niệm tài chính',
    icon: '💡'
  },
  advanced_features: {
    name: 'Tính Năng Nâng Cao',
    description: 'Hướng dẫn sử dụng các tính năng phức tạp',
    icon: '⚡'
  },
  troubleshooting: {
    name: 'Xử Lý Sự Cố',
    description: 'Giải quyết các vấn đề thường gặp',
    icon: '🔧'
  }
} as const