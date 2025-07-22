// src/components/subscription/UsageLimitsCard.tsx
// Real usage limits display with database integration

'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, TrendingUp, Users, FileText, BarChart } from 'lucide-react'
import { useSubscriptionContext } from './SubscriptionProvider'
import { SubscriptionService } from '@/lib/services/subscriptionService'
import { FeatureKey } from '@/types/subscription'
import { useUser } from '@/components/providers/SupabaseProvider'

interface UsageLimit {
  featureKey: FeatureKey
  label: string
  icon: React.ComponentType<{ className?: string }>
  current: number
  limit: number | null
  warningThreshold: number
}

export function UsageLimitsCard() {
  const t = useTranslations('SubscriptionCommon')
  const user = useUser()
  const { currentPlan, tier } = useSubscriptionContext()
  const [usageLimits, setUsageLimits] = useState<UsageLimit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!user?.id || !currentPlan) return

      setIsLoading(true)

      try {
        // Define the features we want to track
        const featuresToTrack: { key: FeatureKey; label: string; icon: any }[] = [
          { key: 'unlimited_plans', label: 'Kế hoạch tài chính', icon: FileText },
          { key: 'scenario_comparison', label: 'Kịch bản so sánh', icon: BarChart },
          { key: 'export_reports', label: 'Xuất báo cáo', icon: TrendingUp },
          { key: 'collaboration', label: 'Chia sẻ kế hoạch', icon: Users }
        ]

        const limits: UsageLimit[] = []

        for (const feature of featuresToTrack) {
          // Get current usage from database
          const usage = await SubscriptionService.getFeatureUsage(user.id, feature.key)
          
          // Get limit from current plan
          let limit: number | null = null
          if (tier === 'free') {
            const freeLimits: Record<FeatureKey, number> = {
              unlimited_plans: 2,
              scenario_comparison: 1,
              export_reports: 3,
              smart_scenarios: 0,
              advanced_export: 0,
              bulk_scenario_operations: 0,
              scenario_templates: 0,
              interactive_sliders: 0,
              risk_assessment: 0,
              market_insights: 0,
              collaboration: 0,
              advanced_calculations: 10,
              real_time_data: 0,
              historical_data: 0,
              advanced_analytics: 0,
              monte_carlo_analysis: 0,
              sensitivity_analysis: 0,
              priority_support: 0,
              expert_content: 0,
              webinars: 0,
              api_access: 0,
              custom_branding: 0,
              ad_free_experience: 0,
              exclusive_badges: 0,
              experience_boost: 0
            }
            limit = freeLimits[feature.key] || 0
          }
          // Premium and Professional tiers have unlimited access for most features

          limits.push({
            featureKey: feature.key,
            label: feature.label,
            icon: feature.icon,
            current: usage?.count || 0,
            limit,
            warningThreshold: 0.8 // 80% of limit
          })
        }

        setUsageLimits(limits)
      } catch (error) {
        console.error('[UsageLimitsCard] Error fetching usage data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsageData()
  }, [user?.id, currentPlan, tier])

  const getUsageColor = (current: number, limit: number | null) => {
    if (limit === null) return 'text-green-600' // Unlimited
    const percentage = (current / limit) * 100
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-amber-600'
    return 'text-green-600'
  }

  const getProgressColor = (current: number, limit: number | null) => {
    if (limit === null) return 'bg-green-500'
    const percentage = (current / limit) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-amber-500'
    return 'bg-green-500'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Giới hạn sử dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded h-4 w-full mb-2"></div>
                <div className="bg-gray-200 rounded h-2 w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart className="h-5 w-5" />
          <span>Giới hạn sử dụng</span>
          <Badge variant="outline">{currentPlan?.nameVi}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {usageLimits.map((item) => {
          const Icon = item.icon
          const isUnlimited = item.limit === null
          const percentage = isUnlimited ? 0 : (item.current / item.limit!) * 100
          const isAtLimit = !isUnlimited && percentage >= 100
          const isNearLimit = !isUnlimited && percentage >= (item.warningThreshold * 100)

          return (
            <div key={item.featureKey} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isUnlimited ? (
                    <Badge variant="secondary" className="text-xs">
                      Không giới hạn
                    </Badge>
                  ) : (
                    <span className={`text-sm font-semibold ${getUsageColor(item.current, item.limit)}`}>
                      {item.current}/{item.limit}
                    </span>
                  )}
                  {isAtLimit && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              
              {!isUnlimited && (
                <div className="space-y-1">
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                  {isNearLimit && (
                    <p className="text-xs text-amber-600">
                      {isAtLimit 
                        ? 'Đã đạt giới hạn. Nâng cấp để tiếp tục sử dụng.'
                        : `Sắp đạt giới hạn (${Math.round(percentage)}%)`
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {tier === 'free' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Nâng cấp để sử dụng không giới hạn
            </h4>
            <p className="text-blue-700 text-sm mb-3">
              Gói Premium cung cấp quyền truy cập không giới hạn cho tất cả các tính năng.
            </p>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/subscription'}
            >
              Xem gói nâng cấp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}