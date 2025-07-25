// src/hooks/useSubscription.ts
// React hooks for subscription and feature access management

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/components/providers/SupabaseProvider'
import { SubscriptionService } from '@/lib/services/subscriptionService'
import { 
  UserSubscription, 
  FeatureAccess, 
  FeatureKey, 
  SubscriptionPlan 
} from '@/types/subscription'
import { getPlanByTier, SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans'
import { UserSubscriptionTier } from '@/src/types/supabase'

interface UseSubscriptionReturn {
  subscription: UserSubscription | null
  currentPlan: SubscriptionPlan | null
  tier: UserSubscriptionTier
  isLoading: boolean
  isInTrial: boolean
  trialDaysRemaining: number
  refreshSubscription: () => Promise<void>
}

/**
 * Hook for managing user subscription state
 */
export function useSubscription(): UseSubscriptionReturn {
  const user = useUser()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [tier, setTier] = useState<UserSubscriptionTier>('free')
  const [isLoading, setIsLoading] = useState(true)
  const [isInTrial, setIsInTrial] = useState(false)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0)

  const refreshSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null)
      setTier('free')
      setIsLoading(false)
      setIsInTrial(false)
      setTrialDaysRemaining(0)
      return
    }

    try {
      setIsLoading(true)
      
      const [subscriptionData, userTier, inTrial, daysRemaining] = await Promise.all([
        SubscriptionService.getUserSubscription(user.id),
        SubscriptionService.getUserTier(user.id),
        SubscriptionService.isUserInTrial(user.id),
        SubscriptionService.getTrialDaysRemaining(user.id)
      ])

      setSubscription(subscriptionData)
      setTier(userTier)
      setIsInTrial(inTrial)
      setTrialDaysRemaining(daysRemaining)
    } catch (error) {
      console.error('[useSubscription] Error refreshing subscription:', error)
      setSubscription(null)
      setTier('free')
      setIsInTrial(false)
      setTrialDaysRemaining(0)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    refreshSubscription()
  }, [refreshSubscription])

  const currentPlan = getPlanByTier(tier)

  return {
    subscription,
    currentPlan,
    tier,
    isLoading,
    isInTrial,
    trialDaysRemaining,
    refreshSubscription
  }
}

interface UseFeatureAccessReturn {
  hasAccess: boolean
  access: FeatureAccess | null
  isLoading: boolean
  checkAccess: () => Promise<void>
  trackUsage: () => Promise<void>
}

/**
 * Hook for checking feature access and tracking usage
 */
export function useFeatureAccess(featureKey: FeatureKey): UseFeatureAccessReturn {
  const user = useUser()
  const [access, setAccess] = useState<FeatureAccess | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAccess = useCallback(async () => {
    if (!user?.id) {
      setAccess({ hasAccess: false, reason: 'subscription_required' })
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const accessResult = await SubscriptionService.checkFeatureAccess(user.id, featureKey)
      setAccess(accessResult)
    } catch (error) {
      console.error(`[useFeatureAccess] Error checking access for ${featureKey}:`, error)
      setAccess({ hasAccess: false, reason: 'feature_disabled' })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, featureKey])

  const trackUsage = useCallback(async () => {
    if (!user?.id || !access?.hasAccess) return

    try {
      await SubscriptionService.trackFeatureUsage(user.id, featureKey)
    } catch (error) {
      console.error(`[useFeatureAccess] Error tracking usage for ${featureKey}:`, error)
    }
  }, [user?.id, featureKey, access?.hasAccess])

  useEffect(() => {
    checkAccess()
  }, [checkAccess])

  return {
    hasAccess: access?.hasAccess || false,
    access,
    isLoading,
    checkAccess,
    trackUsage
  }
}

interface UseBillingReturn {
  billingHistory: any[]
  isLoading: boolean
  refreshBilling: () => Promise<void>
}

/**
 * Hook for managing billing information
 */
export function useBilling(): UseBillingReturn {
  const user = useUser()
  const [billingHistory, setBillingHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshBilling = useCallback(async () => {
    if (!user?.id) {
      setBillingHistory([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const history = await SubscriptionService.getBillingHistory(user.id)
      setBillingHistory(history)
    } catch (error) {
      console.error('[useBilling] Error fetching billing history:', error)
      setBillingHistory([])
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    refreshBilling()
  }, [refreshBilling])

  return {
    billingHistory,
    isLoading,
    refreshBilling
  }
}

/**
 * Hook for subscription analytics (admin only)
 */
export function useSubscriptionAnalytics(dateFrom?: Date, dateTo?: Date) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshAnalytics = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await SubscriptionService.getSubscriptionAnalytics(dateFrom, dateTo)
      setAnalytics(data)
    } catch (error) {
      console.error('[useSubscriptionAnalytics] Error fetching analytics:', error)
      setAnalytics(null)
    } finally {
      setIsLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    refreshAnalytics()
  }, [refreshAnalytics])

  return {
    analytics,
    isLoading,
    refreshAnalytics
  }
}

/**
 * Helper hook to get all available plans
 */
export function useSubscriptionPlans() {
  return {
    plans: SUBSCRIPTION_PLANS,
    getFreePlan: () => SUBSCRIPTION_PLANS.find(p => p.tier === 'free'),
    getPremiumPlan: () => SUBSCRIPTION_PLANS.find(p => p.tier === 'premium'),
    getProfessionalPlan: () => SUBSCRIPTION_PLANS.find(p => p.tier === 'professional')
  }
}