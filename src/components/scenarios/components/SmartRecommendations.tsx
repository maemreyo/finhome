// src/components/scenarios/components/SmartRecommendations.tsx

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calculator, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import type { TimelineScenario } from '@/types/scenario'

interface SmartRecommendationsProps {
  scenarios: TimelineScenario[]
  selectedScenarioIds: string[]
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  scenarios,
  selectedScenarioIds
}) => {
  const t = useTranslations('SmartRecommendations')

  const selectedScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id))
  const sortedScenarios = selectedScenarios.sort((a, b) => 
    (a.calculatedMetrics?.totalCost || 0) - (b.calculatedMetrics?.totalCost || 0)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedScenarioIds.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {t('selectScenariosForRecommendations')}
            </p>
          ) : (
            <div className="space-y-3">
              {sortedScenarios.map((scenario, index) => {
                const lowestCost = sortedScenarios[0].calculatedMetrics?.totalCost || 0
                const currentCost = scenario.calculatedMetrics?.totalCost || 0
                const costDifference = currentCost - lowestCost

                return (
                  <div
                    key={scenario.id}
                    className={cn(
                      'p-3 rounded-lg border',
                      index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{scenario.plan_name}</span>
                      {index === 0 && (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('recommended')}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {index === 0 ? (
                        t('lowestCostRecommendation')
                      ) : (
                        `${formatCurrency(costDifference)} ${t('moreExpensive')}`
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SmartRecommendations