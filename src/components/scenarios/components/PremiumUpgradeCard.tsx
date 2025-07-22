// src/components/scenarios/components/PremiumUpgradeCard.tsx

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown,
  Sparkles,
  TrendingUp,
  BarChart3,
  FileText,
  Shield,
  ArrowRight,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/config/subscriptionPlans'

interface PremiumUpgradeCardProps {
  feature: string
  title?: string
  description?: string
  benefits?: string[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showBenefits?: boolean
  cta?: string
  upgradeType?: 'premium' | 'professional'
}

const PremiumUpgradeCard: React.FC<PremiumUpgradeCardProps> = ({
  feature,
  title,
  description,
  benefits = [],
  className,
  size = 'md',
  showBenefits = true,
  cta,
  upgradeType = 'premium'
}) => {
  const t = useTranslations('PremiumUpgradeCard')
  const { user } = useAuth()

  const featureConfigs = {
    smart_scenarios: {
      icon: Sparkles,
      title: t('smartScenarios.title'),
      description: t('smartScenarios.description'),
      benefits: [
        t('smartScenarios.benefits.0'),
        t('smartScenarios.benefits.1'),
        t('smartScenarios.benefits.2'),
        t('smartScenarios.benefits.3')
      ],
      upgradeType: 'premium' as const,
      price: 299000
    },
    advanced_export: {
      icon: FileText,
      title: t('advancedExport.title'),
      description: t('advancedExport.description'),
      benefits: [
        t('advancedExport.benefits.0'),
        t('advancedExport.benefits.1'),
        t('advancedExport.benefits.2'),
        t('advancedExport.benefits.3')
      ],
      upgradeType: 'premium' as const,
      price: 299000
    },
    advanced_analytics: {
      icon: BarChart3,
      title: t('advancedAnalytics.title'),
      description: t('advancedAnalytics.description'),
      benefits: [
        t('advancedAnalytics.benefits.0'),
        t('advancedAnalytics.benefits.1'),
        t('advancedAnalytics.benefits.2'),
        t('advancedAnalytics.benefits.3')
      ],
      upgradeType: 'premium' as const,
      price: 299000
    },
    monte_carlo_analysis: {
      icon: TrendingUp,
      title: t('monteCarloAnalysis.title'),
      description: t('monteCarloAnalysis.description'),
      benefits: [
        t('monteCarloAnalysis.benefits.0'),
        t('monteCarloAnalysis.benefits.1'),
        t('monteCarloAnalysis.benefits.2'),
        t('monteCarloAnalysis.benefits.3')
      ],
      upgradeType: 'professional' as const,
      price: 599000
    },
    scenario_comparison: {
      icon: BarChart3,
      title: t('scenarioComparison.title'),
      description: t('scenarioComparison.description'),
      benefits: [
        t('scenarioComparison.benefits.0'),
        t('scenarioComparison.benefits.1'),
        t('scenarioComparison.benefits.2'),
        t('scenarioComparison.benefits.3')
      ],
      upgradeType: 'premium' as const,
      price: 299000
    }
  }

  const config = featureConfigs[feature as keyof typeof featureConfigs] || {
    icon: Crown,
    title: title || t('premiumFeature'),
    description: description || t('upgradeToUnlock'),
    benefits: benefits,
    upgradeType: upgradeType,
    price: upgradeType === 'professional' ? 599000 : 299000
  }

  const IconComponent = config.icon
  const isProfessional = config.upgradeType === 'professional'

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8'
  }

  const handleUpgrade = () => {
    // Navigate to subscription page or open upgrade modal
    window.open(`/billing?upgrade=${config.upgradeType}`, '_blank')
  }

  return (
    <Card className={cn(
      'border-2 border-dashed relative overflow-hidden',
      isProfessional ? 'border-amber-200 bg-amber-50/30' : 'border-blue-200 bg-blue-50/30',
      sizeClasses[size],
      className
    )}>
      {/* Premium badge */}
      <div className="absolute top-4 right-4">
        <Badge 
          variant="outline" 
          className={cn(
            'font-medium',
            isProfessional 
              ? 'text-amber-600 border-amber-300 bg-amber-100' 
              : 'text-blue-600 border-blue-300 bg-blue-100'
          )}
        >
          <Crown className="w-3 h-3 mr-1" />
          {isProfessional ? t('professional') : t('premium')}
        </Badge>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            isProfessional ? 'bg-amber-100' : 'bg-blue-100'
          )}>
            <IconComponent className={cn(
              'w-5 h-5',
              isProfessional ? 'text-amber-600' : 'text-blue-600'
            )} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{config.title}</h3>
            <p className="text-sm text-gray-600 font-normal">{config.description}</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Benefits list */}
        {showBenefits && config.benefits.length > 0 && (
          <div className="space-y-2">
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <div className="text-lg font-semibold">
              {formatPrice(config.price)}{t('monthPrice')}
            </div>
            <div className="text-xs text-gray-500">
              {t('freeTrial')}
            </div>
          </div>

          <Button 
            onClick={handleUpgrade}
            className={cn(
              'font-medium',
              isProfessional 
                ? 'bg-amber-600 hover:bg-amber-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {cta || `${t('upgradeToPrefix')}${isProfessional ? t('upgradeToPro') : t('premium')}`}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 pt-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>{t('securityNote')}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default PremiumUpgradeCard