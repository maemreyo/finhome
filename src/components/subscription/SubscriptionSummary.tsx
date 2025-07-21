// src/components/subscription/SubscriptionSummary.tsx
// Compact subscription summary for header display

'use client'

import React from 'react'
import { useSubscriptionContext } from './SubscriptionProvider'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Star, Shield, Timer, Zap } from 'lucide-react'
import { UserSubscriptionTier } from '@/lib/supabase/types'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatSubscriptionPrice } from '@/lib/utils/currency'

interface SubscriptionSummaryProps {
  compact?: boolean
  className?: string
}

export function SubscriptionSummary({ compact = true, className = '' }: SubscriptionSummaryProps) {
  const { 
    tier, 
    isInTrial, 
    trialDaysRemaining,
    currentPlan,
    isLoading 
  } = useSubscriptionContext()
  
  const t = useTranslations('SubscriptionCommon')
  const params = useParams()
  const locale = params?.locale as string || 'en'

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 animate-pulse ${className}`}>
        <div className="h-6 w-16 bg-muted rounded"></div>
      </div>
    )
  }

  const tierConfig = {
    free: {
      label: t('free_tier'),
      icon: Shield,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200'
    },
    premium: {
      label: t('premium_tier'), 
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    professional: {
      label: t('professional_tier'),
      icon: Crown,
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    }
  }

  const config = tierConfig[tier]
  const Icon = config.icon
  const showUpgrade = tier === 'free'
  const isTrialUrgent = isInTrial && trialDaysRemaining <= 3

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Main tier badge */}
        <Badge 
          className={`${config.bgColor} ${config.color} ${config.borderColor} border`}
        >
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>

        {/* Trial badge with urgency */}
        {isInTrial && (
          <Badge 
            className={`${
              isTrialUrgent 
                ? 'bg-red-100 text-red-700 border-red-200' 
                : 'bg-amber-100 text-amber-700 border-amber-200'
            } border`}
          >
            <Timer className="h-3 w-3 mr-1" />
            {t('trial_days_remaining', { days: trialDaysRemaining })}
          </Badge>
        )}

        {/* Upgrade button for free users */}
        {showUpgrade && !isInTrial && (
          <Link href={`/${locale}/subscription`}>
            <Button 
              size="sm" 
              variant="outline"
              className="h-6 text-xs px-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
            >
              <Zap className="h-3 w-3 mr-1" />
              {t('upgrade')}
            </Button>
          </Link>
        )}
      </div>
    )
  }

  // Non-compact version for dropdown or expanded view
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className="font-medium text-sm">{config.label}</span>
        </div>
        {currentPlan?.price && (
          <span className="text-xs text-muted-foreground">
            {formatSubscriptionPrice(currentPlan.price, 'monthly', locale)}
          </span>
        )}
      </div>

      {isInTrial && (
        <div className={`p-2 rounded text-xs ${
          isTrialUrgent 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          <div className="flex items-center space-x-1">
            <Timer className="h-3 w-3" />
            <span>
              {isTrialUrgent 
                ? t('trial_ending_soon', { days: trialDaysRemaining })
                : t('trial_days_remaining', { days: trialDaysRemaining })
              }
            </span>
          </div>
        </div>
      )}

      {showUpgrade && (
        <Link href={`/${locale}/subscription`}>
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Crown className="h-3 w-3 mr-1" />
            {t('upgrade_now')}
          </Button>
        </Link>
      )}
    </div>
  )
}

export default SubscriptionSummary