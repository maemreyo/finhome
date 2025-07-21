// src/components/billing/EnhancedSubscriptionCard.tsx
// Enhanced subscription card with comprehensive information

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider'
import { useTranslations, useLocale } from 'next-intl'
import { format, differenceInDays } from 'date-fns'
import { 
  CreditCard, 
  Calendar, 
  Crown, 
  Star, 
  Shield, 
  Timer, 
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatSubscriptionPrice } from '@/lib/utils/currency'

export function EnhancedSubscriptionCard() {
  const { 
    subscription,
    currentPlan,
    tier,
    isLoading,
    isInTrial,
    trialDaysRemaining,
    refreshSubscription
  } = useSubscriptionContext()
  
  const t = useTranslations('BillingPage')
  const tCommon = useTranslations('SubscriptionCommon')
  const locale = useLocale()
  const params = useParams()

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
            <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const tierConfig = {
    free: {
      label: tCommon('free_tier'),
      icon: Shield,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    premium: {
      label: tCommon('premium_tier'),
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    professional: {
      label: tCommon('professional_tier'),
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  }

  const config = tierConfig[tier]
  const Icon = config.icon
  const isFreeTier = tier === 'free'
  const isTrialUrgent = isInTrial && trialDaysRemaining <= 3

  // Calculate trial progress
  const trialProgress = isInTrial && currentPlan?.trial?.days 
    ? ((currentPlan.trial.days - trialDaysRemaining) / currentPlan.trial.days) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Main Subscription Card */}
      <Card className={`${config.borderColor} ${config.bgColor}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon className={`h-6 w-6 ${config.color}`} />
              <div>
                <div className="flex items-center space-x-2">
                  <span>{config.label}</span>
                  {!isFreeTier && subscription?.status && (
                    <Badge 
                      variant={subscription.status === 'active' ? 'default' : 'secondary'}
                    >
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </Badge>
                  )}
                </div>
                {currentPlan && (
                  <p className="text-sm text-muted-foreground font-normal">
                    {currentPlan.description}
                  </p>
                )}
              </div>
            </div>
            
            {currentPlan?.price && (
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatSubscriptionPrice(currentPlan.price, 'monthly', locale)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {tCommon('price_monthly', { price: '' }).replace('{price}/', '/')}
                </div>
              </div>
            )}
          </CardTitle>
          
          {!isFreeTier && (
            <CardDescription>
              {t('manageSubscriptionDescription')}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Trial Information */}
          {isInTrial && (
            <div className={`p-4 rounded-lg border ${
              isTrialUrgent 
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4" />
                  <span className="font-medium">
                    {isTrialUrgent ? t('trialEndingSoon') : t('trialActive')}
                  </span>
                </div>
                <span className="text-sm">
                  {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} left
                </span>
              </div>
              
              {currentPlan?.trial?.days && (
                <div className="space-y-1">
                  <Progress value={trialProgress} className="h-2" />
                  <p className="text-xs">
                    {Math.round(trialProgress)}% of trial period used
                  </p>
                </div>
              )}
              
              {isTrialUrgent && (
                <p className="text-sm mt-2">
                  {t('trialEndingSoonMessage')}
                </p>
              )}
            </div>
          )}

          {/* Subscription Details */}
          {subscription && subscription.status !== 'inactive' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscription.currentPeriodStart && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Current Period</p>
                    <p className="text-muted-foreground">
                      {format(subscription.currentPeriodStart, 'MMM dd, yyyy')} - {' '}
                      {subscription.currentPeriodEnd && format(subscription.currentPeriodEnd, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {subscription.currentPeriodEnd && (
                <div className="flex items-center space-x-2 text-sm">
                  {subscription.cancelAtPeriodEnd ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on
                    </p>
                    <p className="text-muted-foreground">
                      {format(subscription.currentPeriodEnd, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Notice */}
          {subscription?.cancelAtPeriodEnd && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">Subscription will be canceled</p>
                  <p>
                    Your subscription will end on{' '}
                    {subscription.currentPeriodEnd && format(subscription.currentPeriodEnd, 'MMM dd, yyyy')}.
                    You&apos;ll continue to have access until then.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {isFreeTier ? (
              <Link href={`/${locale}/subscription`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Crown className="h-4 w-4 mr-2" />
                  {t('upgradeNow')}
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  onClick={handleManageSubscription} 
                  className="flex-1 flex items-center justify-center"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('manage_subscription')}
                </Button>
                
                <Link href={`/${locale}/subscription`}>
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t('changePlan')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Quick Stats for Non-Free Users */}
          {!isFreeTier && currentPlan?.features && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">{t('includedFeatures')}</p>
              <div className="grid grid-cols-2 gap-2">
                {currentPlan.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">{feature.name}</span>
                  </div>
                ))}
              </div>
              {currentPlan.features.length > 4 && (
                <Link href={`/${locale}/subscription`} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2">
                  <span>View all features</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedSubscriptionCard