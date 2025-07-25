// src/components/subscription/SubscriptionProvider.tsx
// Context provider for subscription state management

'use client'

import React, { createContext, useContext, useCallback } from 'react'
import { useSubscription, useSubscriptionPlans } from '@/hooks/useSubscription'
import { SubscriptionService } from '@/lib/services/subscriptionService'
import { UserSubscription, SubscriptionPlan, FeatureKey, FeatureAccess } from '@/types/subscription'
import { UserSubscriptionTier } from '@/src/types/supabase'

interface SubscriptionContextType {
  // Subscription state
  subscription: UserSubscription | null
  currentPlan: SubscriptionPlan | null
  tier: UserSubscriptionTier
  isLoading: boolean
  isInTrial: boolean
  trialDaysRemaining: number
  
  // Available plans
  plans: SubscriptionPlan[]
  
  // Actions
  refreshSubscription: () => Promise<void>
  checkFeatureAccess: (featureKey: FeatureKey) => Promise<FeatureAccess>
  trackFeatureUsage: (featureKey: FeatureKey) => Promise<void>
  
  // Helper functions
  canAccessFeature: (featureKey: FeatureKey) => boolean
  isFreeTier: () => boolean
  isPremiumTier: () => boolean
  isProfessionalTier: () => boolean
  hasFeature: (featureId: string) => boolean
  isFeatureUnlimited: (feature: string) => boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

interface SubscriptionProviderProps {
  children: React.ReactNode
}

/**
 * Subscription context provider
 */
export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const subscription = useSubscription()
  const { plans } = useSubscriptionPlans()

  const checkFeatureAccess = useCallback(async (featureKey: FeatureKey): Promise<FeatureAccess> => {
    if (!subscription.subscription?.userId) {
      return { hasAccess: false, reason: 'subscription_required' }
    }
    
    try {
      return await SubscriptionService.checkFeatureAccess(subscription.subscription.userId, featureKey)
    } catch (error) {
      console.error('[SubscriptionProvider] Error checking feature access:', error)
      return { hasAccess: false, reason: 'feature_disabled' }
    }
  }, [subscription.subscription?.userId])

  const trackFeatureUsage = useCallback(async (featureKey: FeatureKey): Promise<void> => {
    if (!subscription.subscription?.userId) return
    
    try {
      await SubscriptionService.trackFeatureUsage(subscription.subscription.userId, featureKey)
    } catch (error) {
      console.error('[SubscriptionProvider] Error tracking feature usage:', error)
    }
  }, [subscription.subscription?.userId])

  // Helper functions
  const canAccessFeature = useCallback((featureKey: FeatureKey): boolean => {
    // This is a synchronous check based on tier only
    // For more accurate checks with usage limits, use checkFeatureAccess
    const tierOrder: UserSubscriptionTier[] = ['free', 'premium', 'professional']
    const userTierIndex = tierOrder.indexOf(subscription.tier)
    
    const featureRequirements: Record<FeatureKey, UserSubscriptionTier> = {
      unlimited_plans: 'premium',
      advanced_calculations: 'premium',
      scenario_comparison: 'premium',
      smart_scenarios: 'premium',
      real_time_data: 'premium',
      historical_data: 'premium',
      collaboration: 'premium',
      advanced_analytics: 'premium',
      monte_carlo_analysis: 'professional',
      sensitivity_analysis: 'professional',
      export_reports: 'premium',
      advanced_export: 'premium',
      bulk_scenario_operations: 'premium',
      scenario_templates: 'premium',
      interactive_sliders: 'premium',
      risk_assessment: 'premium',
      market_insights: 'premium',
      priority_support: 'premium',
      expert_content: 'premium',
      webinars: 'premium',
      api_access: 'professional',
      custom_branding: 'professional',
      ad_free_experience: 'premium',
      exclusive_badges: 'premium',
      experience_boost: 'premium'
    }

    const requiredTier = featureRequirements[featureKey]
    if (!requiredTier) return true // Feature not restricted
    
    const requiredTierIndex = tierOrder.indexOf(requiredTier)
    return userTierIndex >= requiredTierIndex
  }, [subscription.tier])

  const isFreeTier = useCallback(() => subscription.tier === 'free', [subscription.tier])
  const isPremiumTier = useCallback(() => subscription.tier === 'premium', [subscription.tier])
  const isProfessionalTier = useCallback(() => subscription.tier === 'professional', [subscription.tier])

  const hasFeature = useCallback((featureId: string): boolean => {
    if (!subscription.currentPlan) return false
    return subscription.currentPlan.features.some(feature => feature.id === featureId && feature.included)
  }, [subscription.currentPlan])

  const isFeatureUnlimited = useCallback((feature: string): boolean => {
    if (!subscription.currentPlan) return false
    
    const limits = subscription.currentPlan.limits
    const limitValue = (limits as any)[feature]
    return limitValue === null || limitValue === undefined
  }, [subscription.currentPlan])

  const contextValue: SubscriptionContextType = {
    // Subscription state
    subscription: subscription.subscription,
    currentPlan: subscription.currentPlan,
    tier: subscription.tier,
    isLoading: subscription.isLoading,
    isInTrial: subscription.isInTrial,
    trialDaysRemaining: subscription.trialDaysRemaining,
    
    // Available plans
    plans,
    
    // Actions
    refreshSubscription: subscription.refreshSubscription,
    checkFeatureAccess,
    trackFeatureUsage,
    
    // Helper functions
    canAccessFeature,
    isFreeTier,
    isPremiumTier,
    isProfessionalTier,
    hasFeature,
    isFeatureUnlimited
  }

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}

/**
 * Hook to use subscription context
 */
export function useSubscriptionContext(): SubscriptionContextType {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider')
  }
  return context
}

/**
 * Higher-order component to require subscription access
 */
export function withSubscriptionAccess<P extends object>(
  Component: React.ComponentType<P>,
  requiredTier: UserSubscriptionTier = 'premium'
) {
  return function SubscriptionGuardedComponent(props: P) {
    const { tier, isLoading } = useSubscriptionContext()
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }
    
    const tierOrder: UserSubscriptionTier[] = ['free', 'premium', 'professional']
    const userTierIndex = tierOrder.indexOf(tier)
    const requiredTierIndex = tierOrder.indexOf(requiredTier)
    
    if (userTierIndex < requiredTierIndex) {
      return (
        <div className="text-center p-8">
          <div className="max-w-md mx-auto">
            <div className="mb-4 text-gray-400">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Subscription Required
            </h3>
            <p className="text-gray-600 mb-4">
              This feature requires a {requiredTier} subscription or higher.
            </p>
            <button
              onClick={() => window.location.href = '/subscription/plans'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Plans
            </button>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}