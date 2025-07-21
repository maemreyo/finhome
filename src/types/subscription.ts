// src/types/subscription.ts
// Types for subscription and monetization system

import { UserSubscriptionTier } from '@/lib/supabase/types'

export interface SubscriptionPlan {
  id: string
  name: string
  nameVi: string
  description: string
  descriptionVi: string
  tier: UserSubscriptionTier
  price: {
    monthly: number
    yearly: number
    currency: string
  }
  stripeIds: {
    monthly: string
    yearly: string
  }
  features: SubscriptionFeature[]
  limits: SubscriptionLimits
  popular?: boolean
  trial?: {
    enabled: boolean
    days: number
  }
}

export interface SubscriptionFeature {
  id: string
  name: string
  nameVi: string
  description: string
  descriptionVi: string
  included: boolean
  highlighted?: boolean
  category: 'core' | 'advanced' | 'premium' | 'analytics' | 'support'
}

export interface SubscriptionLimits {
  // Financial planning limits
  maxActivePlans: number | null // null = unlimited
  maxDraftPlans: number | null
  maxScenarios: number | null
  maxCalculationsPerMonth: number | null
  
  // Property and market data
  maxPropertySearches: number | null
  maxPropertyViews: number | null
  accessToRealTimeData: boolean
  accessToHistoricalData: boolean
  
  // Collaboration and sharing
  maxSharedPlans: number | null
  collaborationEnabled: boolean
  
  // Analytics and reporting
  advancedAnalytics: boolean
  customReports: boolean
  exportCapabilities: string[] // ['pdf', 'excel', 'csv']
  
  // Support and content
  prioritySupport: boolean
  accessToWebinars: boolean
  accessToExpertContent: boolean
  
  // Gamification enhancements
  experienceBoost: number // multiplier (1.0 = normal, 1.5 = 50% boost)
  exclusiveBadges: boolean
  
  // Other features
  adFree: boolean
  customBranding: boolean
  apiAccess: boolean
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  tier: UserSubscriptionTier
  status: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  trialStart: Date | null
  trialEnd: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BillingDetails {
  id: string
  userId: string
  stripeInvoiceId: string | null
  stripePaymentIntentId: string | null
  amountPaid: number
  currency: string
  status: string
  invoiceUrl: string | null
  invoicePdf: string | null
  billingReason: string | null
  createdAt: Date
}

export interface FeatureAccess {
  hasAccess: boolean
  reason?: 'subscription_required' | 'limit_exceeded' | 'feature_disabled'
  upgradeRequired?: UserSubscriptionTier
  currentUsage?: number
  limit?: number
  resetDate?: Date
}

// Feature gates and access control
export type FeatureKey = 
  | 'unlimited_plans'
  | 'advanced_calculations'
  | 'scenario_comparison'
  | 'real_time_data'
  | 'historical_data'
  | 'collaboration'
  | 'advanced_analytics'
  | 'monte_carlo_analysis'
  | 'sensitivity_analysis'
  | 'export_reports'
  | 'priority_support'
  | 'expert_content'
  | 'webinars'
  | 'api_access'
  | 'custom_branding'
  | 'ad_free_experience'
  | 'exclusive_badges'
  | 'experience_boost'

export interface FeatureGate {
  key: FeatureKey
  name: string
  nameVi: string
  description: string
  descriptionVi: string
  requiredTier: UserSubscriptionTier
  category: SubscriptionFeature['category']
  checkAccess: (user: any, usage?: any) => Promise<FeatureAccess>
}

// Usage tracking for limits
export interface FeatureUsage {
  userId: string
  featureKey: FeatureKey
  count: number
  period: 'daily' | 'monthly' | 'yearly'
  periodStart: Date
  periodEnd: Date
  lastUsed: Date
}

// Upgrade prompts and CTAs
export interface UpgradePrompt {
  id: string
  featureKey: FeatureKey
  title: string
  titleVi: string
  message: string
  messageVi: string
  ctaText: string
  ctaTextVi: string
  urgency: 'low' | 'medium' | 'high'
  context: 'modal' | 'banner' | 'inline' | 'tooltip'
  targetTier: UserSubscriptionTier
  dismissible: boolean
}

// Subscription analytics
export interface SubscriptionAnalytics {
  period: 'daily' | 'weekly' | 'monthly'
  newSubscriptions: number
  upgrades: number
  downgrades: number
  churn: number
  revenue: number
  conversionRate: number
  trialConversionRate: number
  averageRevenuePerUser: number
}

// Promo codes and discounts
export interface PromoCode {
  id: string
  code: string
  name: string
  nameVi: string
  discountType: 'percentage' | 'fixed_amount'
  discountValue: number
  currency?: string
  maxUses: number | null
  usedCount: number
  validFrom: Date
  validTo: Date
  applicablePlans: string[] // plan IDs
  isActive: boolean
  stripePromoCodeId: string | null
}

// Subscription events
export type SubscriptionEvent = 
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'subscription_reactivated'
  | 'trial_started'
  | 'trial_ended'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'invoice_created'
  | 'upgrade_completed'
  | 'downgrade_completed'

export interface SubscriptionEventData {
  eventType: SubscriptionEvent
  userId: string
  subscriptionId?: string
  fromTier?: UserSubscriptionTier
  toTier?: UserSubscriptionTier
  amount?: number
  currency?: string
  reason?: string
  metadata?: Record<string, any>
  timestamp: Date
}