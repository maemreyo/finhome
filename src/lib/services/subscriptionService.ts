// src/lib/services/subscriptionService.ts
// Service for managing subscriptions, billing, and feature access

import { supabase } from '@/lib/supabase/client'
import { UserSubscriptionTier, UserProfile, Subscription, BillingHistory } from '@/lib/supabase/types'
import { 
  UserSubscription, 
  BillingDetails, 
  FeatureAccess, 
  FeatureKey, 
  FeatureUsage,
  SubscriptionEvent,
  SubscriptionEventData
} from '@/types/subscription'

export class SubscriptionService {
  /**
   * Get user's current subscription details
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found - user is on free plan
          return null
        }
        throw new Error(`Failed to get subscription: ${error.message}`)
      }

      return {
        id: data.id,
        userId: data.user_id,
        planId: data.plan_name || 'free',
        tier: await this.getUserTier(userId),
        status: data.status,
        currentPeriodStart: data.current_period_start ? new Date(data.current_period_start) : null,
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        trialStart: data.trial_start ? new Date(data.trial_start) : null,
        trialEnd: data.trial_end ? new Date(data.trial_end) : null,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        stripePriceId: data.stripe_price_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('[SubscriptionService] Error getting user subscription:', error)
      return null
    }
  }

  /**
   * Get user's subscription tier from user_profiles
   */
  static async getUserTier(userId: string): Promise<UserSubscriptionTier> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[SubscriptionService] Error getting user tier:', error)
        return 'free'
      }

      return data.subscription_tier || 'free'
    } catch (error) {
      console.error('[SubscriptionService] Error getting user tier:', error)
      return 'free'
    }
  }

  /**
   * Update user's subscription tier
   */
  static async updateUserTier(userId: string, tier: UserSubscriptionTier): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_tier: tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw new Error(`Failed to update user tier: ${error.message}`)
      }

      console.log(`[SubscriptionService] Updated user ${userId} tier to ${tier}`)
    } catch (error) {
      console.error('[SubscriptionService] Error updating user tier:', error)
      throw error
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  static async checkFeatureAccess(
    userId: string, 
    featureKey: FeatureKey,
    context?: any
  ): Promise<FeatureAccess> {
    try {
      const tier = await this.getUserTier(userId)
      const usage = await this.getFeatureUsage(userId, featureKey)
      
      return this.evaluateFeatureAccess(tier, featureKey, usage, context)
    } catch (error) {
      console.error('[SubscriptionService] Error checking feature access:', error)
      return { hasAccess: false, reason: 'feature_disabled' }
    }
  }

  /**
   * Evaluate feature access based on tier, usage, and limits
   */
  private static evaluateFeatureAccess(
    tier: UserSubscriptionTier,
    featureKey: FeatureKey,
    usage: FeatureUsage | null,
    context?: any
  ): FeatureAccess {
    // Define feature access rules
    const accessRules: Record<FeatureKey, { requiredTier: UserSubscriptionTier; limit?: number }> = {
      unlimited_plans: { requiredTier: 'premium' },
      advanced_calculations: { requiredTier: 'premium' },
      scenario_comparison: { requiredTier: 'premium' },
      real_time_data: { requiredTier: 'premium' },
      historical_data: { requiredTier: 'premium' },
      collaboration: { requiredTier: 'premium' },
      advanced_analytics: { requiredTier: 'premium' },
      monte_carlo_analysis: { requiredTier: 'professional' },
      sensitivity_analysis: { requiredTier: 'professional' },
      export_reports: { requiredTier: 'premium' },
      priority_support: { requiredTier: 'premium' },
      expert_content: { requiredTier: 'premium' },
      webinars: { requiredTier: 'premium' },
      api_access: { requiredTier: 'professional' },
      custom_branding: { requiredTier: 'professional' },
      ad_free_experience: { requiredTier: 'premium' },
      exclusive_badges: { requiredTier: 'premium' },
      experience_boost: { requiredTier: 'premium' }
    }

    const rule = accessRules[featureKey]
    if (!rule) {
      return { hasAccess: true } // Feature not restricted
    }

    // Check tier requirement
    const tierOrder: UserSubscriptionTier[] = ['free', 'premium', 'professional']
    const userTierIndex = tierOrder.indexOf(tier)
    const requiredTierIndex = tierOrder.indexOf(rule.requiredTier)

    if (userTierIndex < requiredTierIndex) {
      return {
        hasAccess: false,
        reason: 'subscription_required',
        upgradeRequired: rule.requiredTier
      }
    }

    // Check usage limits for free tier
    if (tier === 'free') {
      const freeLimits: Record<string, number> = {
        unlimited_plans: 2, // Max 2 active plans for free users
        scenario_comparison: 1, // Max 1 scenario per plan
        export_reports: 3 // Max 3 exports per month
      }

      const limit = freeLimits[featureKey]
      if (limit && usage && usage.count >= limit) {
        return {
          hasAccess: false,
          reason: 'limit_exceeded',
          upgradeRequired: rule.requiredTier,
          currentUsage: usage.count,
          limit,
          resetDate: usage.periodEnd
        }
      }
    }

    return { hasAccess: true }
  }

  /**
   * Get feature usage for a user from database
   */
  static async getFeatureUsage(userId: string, featureKey: FeatureKey): Promise<FeatureUsage | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_feature_usage', {
          p_user_id: userId,
          p_feature_key: featureKey,
          p_period_type: 'monthly'
        })
        .single()

      if (error) {
        console.error('[SubscriptionService] Error getting feature usage:', error)
        return null
      }

      if (!data || data.usage_count === 0) {
        return null
      }

      return {
        userId,
        featureKey,
        count: data.usage_count,
        period: 'monthly',
        periodStart: new Date(data.period_start),
        periodEnd: new Date(data.period_end),
        lastUsed: new Date(data.last_used)
      }
    } catch (error) {
      console.error('[SubscriptionService] Error getting feature usage:', error)
      return null
    }
  }

  /**
   * Track feature usage in database
   */
  static async trackFeatureUsage(userId: string, featureKey: FeatureKey): Promise<void> {
    try {
      const { data, error } = await supabase
        .rpc('increment_feature_usage', {
          p_user_id: userId,
          p_feature_key: featureKey,
          p_period_type: 'monthly'
        })
        .single()

      if (error) {
        console.error('[SubscriptionService] Error tracking feature usage:', error)
        return
      }

      console.log(`[SubscriptionService] Tracked usage for ${featureKey}: ${data.current_count}`)
      
      // Track analytics event
      await this.trackSubscriptionEvent({
        eventType: 'feature_used' as any,
        userId,
        metadata: {
          featureKey,
          usageCount: data.current_count,
          periodStart: data.period_start,
          periodEnd: data.period_end
        },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('[SubscriptionService] Error tracking feature usage:', error)
    }
  }

  /**
   * Get user's billing history
   */
  static async getBillingHistory(userId: string, limit = 10): Promise<BillingDetails[]> {
    try {
      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Failed to get billing history: ${error.message}`)
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        stripeInvoiceId: item.stripe_invoice_id,
        stripePaymentIntentId: item.stripe_payment_intent_id,
        amountPaid: item.amount_paid,
        currency: item.currency,
        status: item.status,
        invoiceUrl: item.invoice_url,
        invoicePdf: item.invoice_pdf,
        billingReason: item.billing_reason,
        createdAt: new Date(item.created_at)
      }))
    } catch (error) {
      console.error('[SubscriptionService] Error getting billing history:', error)
      return []
    }
  }

  /**
   * Create or update subscription
   */
  static async upsertSubscription(subscriptionData: Partial<UserSubscription>): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: subscriptionData.userId,
          stripe_customer_id: subscriptionData.stripeCustomerId,
          stripe_subscription_id: subscriptionData.stripeSubscriptionId,
          stripe_price_id: subscriptionData.stripePriceId,
          status: subscriptionData.status,
          plan_name: subscriptionData.planId,
          current_period_start: subscriptionData.currentPeriodStart?.toISOString(),
          current_period_end: subscriptionData.currentPeriodEnd?.toISOString(),
          cancel_at_period_end: subscriptionData.cancelAtPeriodEnd || false,
          trial_start: subscriptionData.trialStart?.toISOString(),
          trial_end: subscriptionData.trialEnd?.toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw new Error(`Failed to upsert subscription: ${error.message}`)
      }

      console.log(`[SubscriptionService] Upserted subscription for user ${subscriptionData.userId}`)
    } catch (error) {
      console.error('[SubscriptionService] Error upserting subscription:', error)
      throw error
    }
  }

  /**
   * Record billing event
   */
  static async recordBillingEvent(billingData: Omit<BillingDetails, 'id' | 'createdAt'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('billing_history')
        .insert({
          user_id: billingData.userId,
          stripe_invoice_id: billingData.stripeInvoiceId,
          stripe_payment_intent_id: billingData.stripePaymentIntentId,
          amount_paid: billingData.amountPaid,
          currency: billingData.currency,
          status: billingData.status,
          invoice_url: billingData.invoiceUrl,
          invoice_pdf: billingData.invoicePdf,
          billing_reason: billingData.billingReason
        })

      if (error) {
        throw new Error(`Failed to record billing event: ${error.message}`)
      }

      console.log(`[SubscriptionService] Recorded billing event for user ${billingData.userId}`)
    } catch (error) {
      console.error('[SubscriptionService] Error recording billing event:', error)
      throw error
    }
  }

  /**
   * Track subscription event for analytics
   */
  static async trackSubscriptionEvent(eventData: SubscriptionEventData): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: eventData.userId,
          event_type: `subscription_${eventData.eventType}`,
          event_data: eventData,
          created_at: eventData.timestamp.toISOString()
        })

      if (error) {
        console.warn(`[SubscriptionService] Analytics tracking failed: ${error.message}`)
        // Don't throw error for analytics failures
      } else {
        console.log(`[SubscriptionService] Tracked event: ${eventData.eventType}`)
      }
    } catch (error) {
      console.warn('[SubscriptionService] Error tracking subscription event:', error)
      // Don't throw error for analytics failures
    }
  }

  /**
   * Get subscription analytics for admin dashboard
   */
  static async getSubscriptionAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalSubscribers: number
    activeSubscribers: number
    trialUsers: number
    revenue: number
    churnRate: number
    conversionRate: number
  }> {
    try {
      const fromDate = dateFrom?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const toDate = dateTo?.toISOString() || new Date().toISOString()

      // Get subscription counts
      const { count: totalSubscribers } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fromDate)
        .lte('created_at', toDate)

      const { count: activeSubscribers } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: trialUsers } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'trialing')

      // Get revenue from billing history
      const { data: billingData } = await supabase
        .from('billing_history')
        .select('amount_paid')
        .eq('status', 'paid')
        .gte('created_at', fromDate)
        .lte('created_at', toDate)

      const revenue = billingData?.reduce((total, item) => total + item.amount_paid, 0) || 0

      return {
        totalSubscribers: totalSubscribers || 0,
        activeSubscribers: activeSubscribers || 0,
        trialUsers: trialUsers || 0,
        revenue,
        churnRate: 0, // Would need more complex calculation
        conversionRate: 0 // Would need more complex calculation
      }
    } catch (error) {
      console.error('[SubscriptionService] Error getting subscription analytics:', error)
      return {
        totalSubscribers: 0,
        activeSubscribers: 0,
        trialUsers: 0,
        revenue: 0,
        churnRate: 0,
        conversionRate: 0
      }
    }
  }

  /**
   * Check if user is in trial
   */
  static async isUserInTrial(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId)
      if (!subscription) return false

      const now = new Date()
      return subscription.status === 'trialing' && 
             subscription.trialEnd && 
             subscription.trialEnd > now
    } catch (error) {
      console.error('[SubscriptionService] Error checking trial status:', error)
      return false
    }
  }

  /**
   * Get trial days remaining
   */
  static async getTrialDaysRemaining(userId: string): Promise<number> {
    try {
      const subscription = await this.getUserSubscription(userId)
      if (!subscription || !subscription.trialEnd) return 0

      const now = new Date()
      const daysRemaining = Math.ceil((subscription.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(0, daysRemaining)
    } catch (error) {
      console.error('[SubscriptionService] Error getting trial days remaining:', error)
      return 0
    }
  }
}