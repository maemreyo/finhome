// src/components/subscription/SubscriptionBadge.tsx
// Badge components for displaying subscription status and features

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Crown, Star, Zap, Gem, Shield, Timer } from 'lucide-react'
import { UserSubscriptionTier } from '@/lib/supabase/types'
import { FeatureKey } from '@/types/subscription'
import { useSubscriptionContext } from './SubscriptionProvider'
import { useTranslations } from 'next-intl'

interface SubscriptionBadgeProps {
  tier?: UserSubscriptionTier
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'default' | 'lg'
}

/**
 * Badge displaying user's subscription tier
 */
export function SubscriptionBadge({ 
  tier, 
  className = '', 
  showIcon = true, 
  size = 'default' 
}: SubscriptionBadgeProps) {
  const { tier: currentTier } = useSubscriptionContext()
  const t = useTranslations('SubscriptionCommon')
  
  const displayTier = tier || currentTier

  const tierConfig = {
    free: {
      label: t('free_tier'),
      icon: Shield,
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-700 border-gray-200'
    },
    premium: {
      label: t('premium_tier'),
      icon: Star,
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    professional: {
      label: t('professional_tier'),
      icon: Crown,
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-700 border-purple-200'
    }
  }

  const config = tierConfig[displayTier]
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />}
      {config.label}
    </Badge>
  )
}

interface TrialBadgeProps {
  daysRemaining?: number
  className?: string
}

/**
 * Badge for trial period status
 */
export function TrialBadge({ daysRemaining, className = '' }: TrialBadgeProps) {
  const { isInTrial, trialDaysRemaining } = useSubscriptionContext()
  const t = useTranslations('SubscriptionCommon')
  
  const days = daysRemaining ?? trialDaysRemaining

  if (!isInTrial || days <= 0) return null

  const urgency = days <= 3 ? 'high' : days <= 7 ? 'medium' : 'low'
  
  const urgencyConfig = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  }

  return (
    <Badge className={`${urgencyConfig[urgency]} ${className}`}>
      <Timer className="h-3 w-3 mr-1" />
      {t('trial_days_remaining', { days })}
    </Badge>
  )
}

interface FeatureBadgeProps {
  featureKey: FeatureKey
  className?: string
  showTooltip?: boolean
}

/**
 * Badge indicating a premium feature
 */
export function FeatureBadge({ featureKey, className = '', showTooltip = false }: FeatureBadgeProps) {
  const { canAccessFeature } = useSubscriptionContext()
  const t = useTranslations('SubscriptionCommon')
  
  const hasAccess = canAccessFeature(featureKey)

  if (hasAccess) return null

  const featureConfig: Record<FeatureKey, { icon: any; label: string; tier: string }> = {
    unlimited_plans: { icon: Zap, label: t('premium_feature'), tier: 'premium' },
    advanced_calculations: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    scenario_comparison: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    real_time_data: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    historical_data: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    collaboration: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    advanced_analytics: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    monte_carlo_analysis: { icon: Crown, label: t('professional_feature'), tier: 'professional' },
    sensitivity_analysis: { icon: Crown, label: t('professional_feature'), tier: 'professional' },
    export_reports: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    smart_scenarios: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    advanced_export: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    bulk_scenario_operations: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    scenario_templates: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    interactive_sliders: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    risk_assessment: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    market_insights: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    priority_support: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    expert_content: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    webinars: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    api_access: { icon: Crown, label: t('professional_feature'), tier: 'professional' },
    custom_branding: { icon: Crown, label: t('professional_feature'), tier: 'professional' },
    ad_free_experience: { icon: Star, label: t('premium_feature'), tier: 'premium' },
    exclusive_badges: { icon: Gem, label: t('premium_feature'), tier: 'premium' },
    experience_boost: { icon: Zap, label: t('premium_feature'), tier: 'premium' }
  }

  const config = featureConfig[featureKey]
  if (!config) return null

  const Icon = config.icon
  const isProfessional = config.tier === 'professional'

  return (
    <Badge 
      variant="outline" 
      className={`
        ${isProfessional 
          ? 'border-purple-200 text-purple-700 bg-purple-50' 
          : 'border-blue-200 text-blue-700 bg-blue-50'
        } 
        ${className}
      `}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

interface NewFeatureBadgeProps {
  className?: string
  pulse?: boolean
}

/**
 * Badge for highlighting new features
 */
export function NewFeatureBadge({ className = '', pulse = true }: NewFeatureBadgeProps) {
  const t = useTranslations('SubscriptionCommon')
  
  return (
    <Badge 
      className={`
        bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0
        ${pulse ? 'animate-pulse' : ''} 
        ${className}
      `}
    >
      <Zap className="h-3 w-3 mr-1" />
      {t('new_feature')}
    </Badge>
  )
}

interface LimitBadgeProps {
  current: number
  limit: number
  className?: string
  showPercentage?: boolean
}

/**
 * Badge showing usage limits
 */
export function LimitBadge({ 
  current, 
  limit, 
  className = '', 
  showPercentage = false 
}: LimitBadgeProps) {
  const t = useTranslations('SubscriptionCommon')
  
  const percentage = (current / limit) * 100
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  const variant = isAtLimit ? 'destructive' : isNearLimit ? 'default' : 'secondary'
  const bgColor = isAtLimit 
    ? 'bg-red-100 text-red-700 border-red-200' 
    : isNearLimit 
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <Badge className={`${bgColor} ${className}`}>
      {showPercentage 
        ? `${Math.round(percentage)}%`
        : `${current}/${limit}`
      }
    </Badge>
  )
}

interface UpgradeBadgeProps {
  targetTier: UserSubscriptionTier
  className?: string
  animated?: boolean
}

/**
 * Animated badge prompting for upgrades
 */
export function UpgradeBadge({ 
  targetTier, 
  className = '', 
  animated = true 
}: UpgradeBadgeProps) {
  const t = useTranslations('SubscriptionCommon')
  
  const tierConfig = {
    premium: {
      label: t('upgrade_to_premium'),
      icon: Star,
      className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
    },
    professional: {
      label: t('upgrade_to_professional'),
      icon: Crown,
      className: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
    },
    free: {
      label: '',
      icon: Shield,
      className: ''
    }
  }

  const config = tierConfig[targetTier]
  if (targetTier === 'free') return null

  const Icon = config.icon

  return (
    <Badge 
      className={`
        ${config.className} 
        ${animated ? 'animate-pulse hover:animate-none' : ''} 
        cursor-pointer transition-all duration-200 hover:scale-105
        ${className}
      `}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}