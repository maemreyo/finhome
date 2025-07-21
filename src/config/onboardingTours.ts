// src/config/onboardingTours.ts
// React Joyride tour configurations for onboarding flows

import { Step } from 'react-joyride'

export interface TourStep extends Step {
  stepId: string
  flowId: string
  isOptional?: boolean
  prerequisites?: string[]
  spotlightPadding?: number
  hideFooter?: boolean
  showProgress?: boolean
  locale?: {
    [key: string]: {
      title: string
      content: string
    }
  }
}

export interface OnboardingTour {
  id: string
  name: string
  description: string
  steps: TourStep[]
  continuous: boolean
  showSkipButton: boolean
  showProgress: boolean
  spotlightPadding: number
  disableOverlayClose: boolean
  hideCloseButton: boolean
  styles: {
    options: {
      arrowColor: string
      backgroundColor: string
      primaryColor: string
      textColor: string
      width: number
      zIndex: number
    }
  }
}

// First-time user onboarding tour
export const FIRST_TIME_USER_TOUR: OnboardingTour = {
  id: 'first_time_user',
  name: 'First Time User Tour',
  description: 'Comprehensive tour for new users',
  continuous: true,
  showSkipButton: true,
  showProgress: true,
  spotlightPadding: 20,
  disableOverlayClose: true,
  hideCloseButton: false,
  styles: {
    options: {
      arrowColor: '#ffffff',
      backgroundColor: '#ffffff',
      primaryColor: '#3b82f6',
      textColor: '#1f2937',
      width: 400,
      zIndex: 10000
    }
  },
  steps: [
    {
      stepId: 'welcome',
      flowId: 'first_time_user',
      target: 'body',
      content: 'onboarding.welcome.content', // Translation key
      title: 'onboarding.welcome.title',
      placement: 'center',
      disableBeacon: true,
      hideFooter: false,
      showProgress: true
    },
    {
      stepId: 'navigation',
      flowId: 'first_time_user',
      target: '[data-testid="dashboard-navigation"]',
      content: 'onboarding.navigation.content',
      title: 'onboarding.navigation.title',
      placement: 'right-start',
      spotlightPadding: 10
    },
    {
      stepId: 'quick_stats',
      flowId: 'first_time_user',
      target: '[data-testid="quick-stats"]',
      content: 'onboarding.quickStats.content',
      title: 'onboarding.quickStats.title',
      placement: 'bottom'
    },
    {
      stepId: 'create_plan',
      flowId: 'first_time_user',
      target: '[data-testid="create-plan-button"]',
      content: 'onboarding.createPlan.content',
      title: 'onboarding.createPlan.title',
      placement: 'bottom-start'
    },
    {
      stepId: 'dashboard_tabs',
      flowId: 'first_time_user',
      target: '[data-testid="dashboard-tabs"]',
      content: 'onboarding.dashboardTabs.content',
      title: 'onboarding.dashboardTabs.title',
      placement: 'top'
    },
    {
      stepId: 'user_menu',
      flowId: 'first_time_user',
      target: '[data-testid="user-menu"]',
      content: 'onboarding.userMenu.content',
      title: 'onboarding.userMenu.title',
      placement: 'bottom-end'
    },
    {
      stepId: 'completion',
      flowId: 'first_time_user',
      target: 'body',
      content: 'onboarding.completion.content',
      title: 'onboarding.completion.title',
      placement: 'center',
      hideFooter: false
    }
  ]
}

// Financial planning introduction tour
export const FINANCIAL_PLANNING_TOUR: OnboardingTour = {
  id: 'financial_planning_intro',
  name: 'Financial Planning Introduction',
  description: 'Detailed tour for financial planning features',
  continuous: true,
  showSkipButton: true,
  showProgress: true,
  spotlightPadding: 20,
  disableOverlayClose: true,
  hideCloseButton: false,
  styles: {
    options: {
      arrowColor: '#ffffff',
      backgroundColor: '#ffffff',
      primaryColor: '#10b981',
      textColor: '#1f2937',
      width: 450,
      zIndex: 10000
    }
  },
  steps: [
    {
      stepId: 'plans_overview',
      flowId: 'financial_planning_intro',
      target: '[data-testid="plans-list"]',
      content: 'onboarding.financialPlanning.plansOverview.content',
      title: 'onboarding.financialPlanning.plansOverview.title',
      placement: 'top'
    },
    {
      stepId: 'plan_creation',
      flowId: 'financial_planning_intro',
      target: '[data-testid="new-plan-form"]',
      content: 'onboarding.financialPlanning.planCreation.content',
      title: 'onboarding.financialPlanning.planCreation.title',
      placement: 'right'
    },
    {
      stepId: 'scenarios',
      flowId: 'financial_planning_intro',
      target: '[data-testid="scenarios-section"]',
      content: 'onboarding.financialPlanning.scenarios.content',
      title: 'onboarding.financialPlanning.scenarios.title',
      placement: 'left',
      isOptional: true
    },
    {
      stepId: 'analytics',
      flowId: 'financial_planning_intro',
      target: '[data-testid="analytics-charts"]',
      content: 'onboarding.financialPlanning.analytics.content',
      title: 'onboarding.financialPlanning.analytics.title',
      placement: 'bottom'
    },
    {
      stepId: 'laboratory',
      flowId: 'financial_planning_intro',
      target: '[data-testid="laboratory-link"]',
      content: 'onboarding.financialPlanning.laboratory.content',
      title: 'onboarding.financialPlanning.laboratory.title',
      placement: 'right',
      prerequisites: ['plan_creation']
    }
  ]
}

// Dashboard features tour
export const DASHBOARD_FEATURES_TOUR: OnboardingTour = {
  id: 'dashboard_features',
  name: 'Dashboard Features Tour',
  description: 'Explore dashboard features and tools',
  continuous: true,
  showSkipButton: true,
  showProgress: true,
  spotlightPadding: 15,
  disableOverlayClose: false,
  hideCloseButton: false,
  styles: {
    options: {
      arrowColor: '#ffffff',
      backgroundColor: '#ffffff',
      primaryColor: '#8b5cf6',
      textColor: '#1f2937',
      width: 380,
      zIndex: 10000
    }
  },
  steps: [
    {
      stepId: 'portfolio_overview',
      flowId: 'dashboard_features',
      target: '[data-testid="portfolio-overview"]',
      content: 'onboarding.dashboardFeatures.portfolioOverview.content',
      title: 'onboarding.dashboardFeatures.portfolioOverview.title',
      placement: 'bottom'
    },
    {
      stepId: 'recent_activity',
      flowId: 'dashboard_features',
      target: '[data-testid="recent-activity"]',
      content: 'onboarding.dashboardFeatures.recentActivity.content',
      title: 'onboarding.dashboardFeatures.recentActivity.title',
      placement: 'left'
    },
    {
      stepId: 'market_insights',
      flowId: 'dashboard_features',
      target: '[data-testid="market-insights"]',
      content: 'onboarding.dashboardFeatures.marketInsights.content',
      title: 'onboarding.dashboardFeatures.marketInsights.title',
      placement: 'top'
    },
    {
      stepId: 'achievements',
      flowId: 'dashboard_features',
      target: '[data-testid="achievements-link"]',
      content: 'onboarding.dashboardFeatures.achievements.content',
      title: 'onboarding.dashboardFeatures.achievements.title',
      placement: 'right'
    },
    {
      stepId: 'settings',
      flowId: 'dashboard_features',
      target: '[data-testid="settings-link"]',
      content: 'onboarding.dashboardFeatures.settings.content',
      title: 'onboarding.dashboardFeatures.settings.title',
      placement: 'right'
    }
  ]
}

// All available tours
export const ONBOARDING_TOURS: Record<string, OnboardingTour> = {
  first_time_user: FIRST_TIME_USER_TOUR,
  financial_planning_intro: FINANCIAL_PLANNING_TOUR,
  dashboard_features: DASHBOARD_FEATURES_TOUR
}

// Helper function to get tour by ID
export function getTourById(tourId: string): OnboardingTour | null {
  return ONBOARDING_TOURS[tourId] || null
}

// Helper function to get steps for a specific flow
export function getStepsForFlow(flowId: string): TourStep[] {
  const tour = getTourById(flowId)
  return tour ? tour.steps : []
}

// Helper function to validate if user can start a tour
export function canStartTour(tourId: string, completedSteps: string[] = []): boolean {
  const tour = getTourById(tourId)
  if (!tour) return false

  // Check if all required prerequisites are met
  for (const step of tour.steps) {
    if (step.prerequisites) {
      const hasPrerequisites = step.prerequisites.every(prereq => 
        completedSteps.includes(prereq)
      )
      if (!hasPrerequisites) return false
    }
  }

  return true
}

// Default tour options with enhanced styling
export const DEFAULT_TOUR_OPTIONS = {
  continuous: true,
  showSkipButton: true,
  showProgress: true,
  spotlightPadding: 20,
  disableOverlayClose: true,
  hideCloseButton: false,
  scrollToFirstStep: true,
  spotlightClicks: false,
  styles: {
    options: {
      arrowColor: '#ffffff',
      backgroundColor: '#ffffff',
      primaryColor: '#3b82f6',
      textColor: '#1f2937',
      width: 450,
      zIndex: 10000
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    spotlight: {
      borderRadius: 12,
      border: '3px solid #3b82f6',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 40px rgba(59, 130, 246, 0.5)',
    },
    tooltip: {
      borderRadius: 16,
      fontSize: 16,
      padding: 24,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    },
    tooltipContainer: {
      textAlign: 'left' as const,
    },
    tooltipTitle: {
      fontSize: 20,
      fontWeight: 700,
      marginBottom: 12,
      color: '#1f2937',
      lineHeight: 1.4,
    },
    tooltipContent: {
      fontSize: 16,
      lineHeight: 1.6,
      color: '#4b5563',
      marginBottom: 20,
    },
    tooltipFooter: {
      marginTop: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    buttonNext: {
      backgroundColor: '#3b82f6',
      borderRadius: 12,
      fontSize: 16,
      fontWeight: 600,
      padding: '12px 24px',
      border: 'none',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
      '&:hover': {
        backgroundColor: '#2563eb',
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 16px rgba(59, 130, 246, 0.5)',
      }
    },
    buttonBack: {
      color: '#6b7280',
      fontSize: 16,
      fontWeight: 500,
      marginRight: 'auto',
      backgroundColor: 'transparent',
      border: '2px solid #e5e7eb',
      borderRadius: 12,
      padding: '10px 20px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: '#d1d5db',
        color: '#4b5563',
      }
    },
    buttonSkip: {
      color: '#9ca3af',
      fontSize: 14,
      fontWeight: 500,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
      '&:hover': {
        color: '#6b7280',
      }
    },
    buttonClose: {
      color: '#9ca3af',
      fontSize: 18,
      fontWeight: 600,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      position: 'absolute' as const,
      right: 16,
      top: 16,
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#f3f4f6',
        color: '#4b5563',
      }
    }
  }
}