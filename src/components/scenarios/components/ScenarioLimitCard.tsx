// src/components/scenarios/components/ScenarioLimitCard.tsx

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Crown,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/config/subscriptionPlans'

interface ScenarioLimitCardProps {
  currentCount: number
  maxAllowed: number
  featureType: 'scenarios' | 'plans' | 'smart_scenarios'
  className?: string
}

const ScenarioLimitCard: React.FC<ScenarioLimitCardProps> = ({
  currentCount,
  maxAllowed,
  featureType,
  className
}) => {
  const t = useTranslations('ScenarioLimitCard')
  const { user } = useAuth()

  const isAtLimit = currentCount >= maxAllowed
  const usagePercentage = (currentCount / maxAllowed) * 100
  const isNearLimit = usagePercentage >= 80

  const featureConfigs = {
    scenarios: {
      title: t('scenarios.title'),
      description: t('scenarios.description'),
      premiumBenefit: t('scenarios.premiumBenefit'),
      upgradeReasons: [
        t('scenarios.upgradeReasons.0'),
        t('scenarios.upgradeReasons.1'),
        t('scenarios.upgradeReasons.2'),
        t('scenarios.upgradeReasons.3')
      ]
    },
    plans: {
      title: t('plans.title'),
      description: t('plans.description'),
      premiumBenefit: t('plans.premiumBenefit'),
      upgradeReasons: [
        t('plans.upgradeReasons.0'),
        t('plans.upgradeReasons.1'),
        t('plans.upgradeReasons.2'),
        t('plans.upgradeReasons.3')
      ]
    },
    smart_scenarios: {
      title: t('smartScenarios.title'),
      description: t('smartScenarios.description'),
      premiumBenefit: t('smartScenarios.premiumBenefit'),
      upgradeReasons: [
        t('smartScenarios.upgradeReasons.0'),
        t('smartScenarios.upgradeReasons.1'),
        t('smartScenarios.upgradeReasons.2'),
        t('smartScenarios.upgradeReasons.3')
      ]
    }
  }

  const config = featureConfigs[featureType]
  const currentTier = user?.user_metadata?.subscription_tier || 'free'
  const suggestedTier = featureType === 'smart_scenarios' ? 'professional' : 'premium'
  const suggestedPrice = suggestedTier === 'professional' ? 599000 : 299000

  const handleUpgrade = () => {
    window.open(`/billing?upgrade=${suggestedTier}`, '_blank')
  }

  return (
    <Card className={cn(
      'border-2 bg-gradient-to-br relative overflow-hidden',
      isAtLimit 
        ? 'border-red-200 from-red-50 to-orange-50' 
        : 'border-amber-200 from-amber-50 to-yellow-50',
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isAtLimit ? (
              <Lock className="w-5 h-5 text-red-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            )}
            <span className={isAtLimit ? 'text-red-800' : 'text-amber-800'}>
              {config.title}
            </span>
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              'font-medium',
              suggestedTier === 'professional'
                ? 'text-amber-600 border-amber-300 bg-amber-100'
                : 'text-blue-600 border-blue-300 bg-blue-100'
            )}
          >
            <Crown className="w-3 h-3 mr-1" />
            {suggestedTier === 'professional' ? t('proFeature') : t('premiumFeature')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{t('usage')}</span>
            <span className={cn(
              'font-medium',
              isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-600'
            )}>
              {currentCount}/{maxAllowed}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className={cn(
              "h-2",
              isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'
            )}
          />
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600">
          {config.description}
        </p>

        {/* Premium benefit highlight */}
        <div className={cn(
          'p-3 rounded-lg border border-dashed',
          suggestedTier === 'professional' 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-blue-50 border-blue-200'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={cn(
              'w-4 h-4',
              suggestedTier === 'professional' ? 'text-amber-600' : 'text-blue-600'
            )} />
            <span className={cn(
              'font-medium text-sm',
              suggestedTier === 'professional' ? 'text-amber-800' : 'text-blue-800'
            )}>
              {config.premiumBenefit}
            </span>
          </div>
          <ul className="text-xs text-gray-600 space-y-1">
            {config.upgradeReasons.map((reason, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Call to Action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="text-sm">
            <div className="font-medium">{formatPrice(suggestedPrice)}{t('monthPrice')}</div>
            <div className="text-xs text-gray-500">{t('freeTrial')}</div>
          </div>
          <Button 
            onClick={handleUpgrade}
            className={cn(
              'font-medium text-sm',
              suggestedTier === 'professional'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {t('upgradeNow')}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScenarioLimitCard