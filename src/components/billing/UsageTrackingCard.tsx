// src/components/billing/UsageTrackingCard.tsx
// Component to show feature usage and limits

'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { SubscriptionService } from '@/lib/services/subscriptionService'
import { FeatureKey, FeatureUsage } from '@/types/subscription'
import { 
  BarChart3,
  TrendingUp, 
  AlertCircle, 
  Calendar,
  Zap,
  Crown
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface UsageData {
  featureKey: FeatureKey
  usage: FeatureUsage | null
  limit: number | null
  label: string
}

export function UsageTrackingCard() {
  const { tier, isFreeTier } = useSubscriptionContext()
  const { user } = useAuth()
  const t = useTranslations('BillingPage')
  const tFeatures = useTranslations('Features')
  const tCommon = useTranslations('SubscriptionCommon')
  const params = useParams()
  const locale = params?.locale as string || 'en'

  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Define features to track for free users
  const freeFeaturesToTrack: Array<{featureKey: FeatureKey, label: string, limit: number}> = [
    { featureKey: 'unlimited_plans', label: tFeatures('unlimited_plans_title'), limit: 2 },
    { featureKey: 'scenario_comparison', label: tFeatures('scenario_comparison_title'), limit: 1 },
    { featureKey: 'export_reports', label: tFeatures('export_reports_title'), limit: 3 }
  ]

  useEffect(() => {
    if (!user?.id || tier !== 'free') return

    const fetchUsageData = async () => {
      setIsLoading(true)
      try {
        const promises = freeFeaturesToTrack.map(async (feature) => {
          const usage = await SubscriptionService.getFeatureUsage(user.id, feature.featureKey)
          return {
            featureKey: feature.featureKey,
            usage,
            limit: feature.limit,
            label: feature.label
          }
        })

        const results = await Promise.all(promises)
        setUsageData(results)
      } catch (error) {
        console.error('Error fetching usage data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsageData()
  }, [user?.id, tier, tFeatures])

  if (!isFreeTier()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-purple-600" />
            <span>{t('unlimitedAccess')}</span>
          </CardTitle>
          <CardDescription>
            {t('unlimitedAccessDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div className="space-y-3">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg">{t('noLimitsTitle')}</h3>
              <p className="text-muted-foreground">{t('noLimitsDescription')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
            <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-2 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasNearLimitUsage = usageData.some(item => 
    item.limit && item.usage && (item.usage.count / item.limit) >= 0.8
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>{t('featureUsage')}</span>
          </div>
          {hasNearLimitUsage && (
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              {t('nearLimit')}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {t('featureUsageDescription')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {usageData.map((item) => {
          const current = item.usage?.count || 0
          const limit = item.limit || 1
          const percentage = (current / limit) * 100
          const isNearLimit = percentage >= 80
          const isAtLimit = percentage >= 100

          return (
            <div key={item.featureKey} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {current} of {limit} used this month
                  </p>
                </div>
                <Badge 
                  variant={isAtLimit ? 'destructive' : isNearLimit ? 'default' : 'secondary'}
                  className={isNearLimit && !isAtLimit ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                >
                  {Math.round(percentage)}%
                </Badge>
              </div>
              
              <Progress 
                value={Math.min(percentage, 100)} 
                className={`h-2 ${
                  isAtLimit 
                    ? '[&>div]:bg-red-500' 
                    : isNearLimit 
                    ? '[&>div]:bg-amber-500' 
                    : '[&>div]:bg-blue-500'
                }`}
              />
              
              {isAtLimit && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">{t('limitReached')}</p>
                    <p>{t('upgradeToUnlock')}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Next Reset Information */}
        <div className="pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {t('usageResetsNextMonth', { 
                date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                  .toLocaleDateString(locale, { month: 'long', day: 'numeric' })
              })}
            </span>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="pt-4 border-t">
          <div className="text-center space-y-3">
            <h4 className="font-medium">{t('needMoreAccess')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('upgradeForUnlimited')}
            </p>
            <Link href={`/${locale}/subscription`}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('viewPlans')}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UsageTrackingCard