// src/components/scenarios/components/ScenarioGrid.tsx

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, 
  Calculator, 
  Edit,
  Trash2,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { getRiskLevelColor, getTypeColor } from '../utils/ScenarioCalculations'
import { useAuth } from '@/hooks/useAuth'
import { getPlanByTier } from '@/config/subscriptionPlans'
import ScenarioLimitCard from './ScenarioLimitCard'
import type { TimelineScenario } from '@/types/scenario'

interface ScenarioGridProps {
  scenarios: TimelineScenario[]
  selectedScenarioIds: string[]
  onScenarioSelect: (scenarioId: string) => void
  onEditScenario: (scenario: TimelineScenario) => void
  onDeleteScenario: (scenarioId: string) => void
  onCreateScenario: () => void
}

const ScenarioGrid: React.FC<ScenarioGridProps> = ({
  scenarios,
  selectedScenarioIds,
  onScenarioSelect,
  onEditScenario,
  onDeleteScenario,
  onCreateScenario
}) => {
  const t = useTranslations('ScenarioGrid')
  const { user } = useAuth()
  
  // Get user subscription limits
  const userPlan = user?.user_metadata?.subscription_tier ? getPlanByTier(user.user_metadata.subscription_tier) : getPlanByTier('free')
  const maxScenarios = userPlan?.limits.maxScenarios || 1
  const isAtScenarioLimit = scenarios.length >= maxScenarios && userPlan?.limits.maxScenarios !== null

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noScenariosTitle')}</h3>
        <p className="text-gray-500 mb-4">
          {t('noScenariosDescription')}
        </p>
        <Button
          onClick={onCreateScenario}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('createFirstScenario')}
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
      {scenarios.map((scenario, index) => (
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'group relative p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg bg-white',
            selectedScenarioIds.includes(scenario.id)
              ? 'border-blue-500 shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          )}
          onClick={() => onScenarioSelect(scenario.id)}
        >
          {/* Selection indicator */}
          <div className="absolute top-3 left-3">
            <Checkbox
              checked={selectedScenarioIds.includes(scenario.id)}
              onChange={() => onScenarioSelect(scenario.id)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEditScenario(scenario)
              }}
              className="h-7 w-7 p-0 hover:bg-gray-100"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteScenario(scenario.id)
              }}
              className="h-7 w-7 p-0 hover:bg-red-100 text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          {/* Content */}
          <div className="pt-4 space-y-3">
            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-1">
                {scenario.plan_name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {scenario.description || t('noDescription')}
              </p>
            </div>

            {/* Type and Risk badges */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn('text-xs font-medium', getTypeColor(scenario.scenarioType))}>
                {scenario.scenarioType}
              </Badge>
              <Badge variant="outline" className={cn('text-xs font-medium', getRiskLevelColor(scenario.riskLevel))}>
                {scenario.riskLevel} {t('riskSuffix')}
              </Badge>
            </div>

            {/* Key metrics */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">{t('monthly')}</span>
                </div>
                <span className="font-semibold text-sm text-gray-900">
                  {formatCurrency(scenario.calculatedMetrics?.monthlyPayment || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">{t('totalCost')}</span>
                </div>
                <span className="font-semibold text-sm text-gray-900">
                  {formatCurrency(scenario.calculatedMetrics?.totalCost || 0)}
                </span>
              </div>
              
              {/* Affordability indicator */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">{t('affordability')}</span>
                  <span className="font-medium">
                    {scenario.calculatedMetrics?.affordabilityScore || 5}/10
                  </span>
                </div>
                <Progress 
                  value={(scenario.calculatedMetrics?.affordabilityScore || 5) * 10} 
                  className="h-1.5"
                />
              </div>
            </div>

            {/* Selected badge */}
            {selectedScenarioIds.includes(scenario.id) && (
              <div className="absolute top-3 right-12">
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                  {t('selected')}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Add New Scenario Card or Limit Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: scenarios.length * 0.1 + 0.2 }}
      >
        {isAtScenarioLimit ? (
          <ScenarioLimitCard
            currentCount={scenarios.length}
            maxAllowed={maxScenarios}
            featureType="scenarios"
            className="min-h-[180px] sm:min-h-[200px] w-full"
          />
        ) : (
          <div
            className="group relative p-4 sm:p-5 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50 min-h-[180px] sm:min-h-[200px]"
            onClick={onCreateScenario}
          >
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-blue-600 transition-colors mb-2 sm:mb-3" />
              <h3 className="font-medium text-sm sm:text-base text-gray-700 group-hover:text-blue-700 transition-colors mb-1">
                {t('createNewScenario')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {t('addCustomScenario')}
              </p>
              {maxScenarios !== null && (
                <div className="mt-2 text-xs text-gray-400">
                  {t('scenariosUsed', { current: scenarios.length, max: maxScenarios })}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ScenarioGrid