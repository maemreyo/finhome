// src/components/scenarios/components/MonteCarloAnalysis.tsx

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Settings, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { generateMonteCarloResults, generateSensitivityAnalysis } from '../utils/ScenarioCalculations'
import type { TimelineScenario } from '@/types/scenario'

interface MonteCarloAnalysisProps {
  scenarios: TimelineScenario[]
}

const MonteCarloAnalysis: React.FC<MonteCarloAnalysisProps> = ({ scenarios }) => {
  const t = useTranslations('MonteCarloAnalysis')

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {t('title')}
            <Badge className="bg-purple-100 text-purple-700 text-xs">{t('premium')}</Badge>
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('selectScenarios')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get the first scenario for sensitivity analysis if available
  const firstScenario = scenarios[0]
  const sensitivityData = generateSensitivityAnalysis(
    firstScenario ? {
      purchasePrice: firstScenario.purchase_price || 0,
      downPayment: firstScenario.down_payment || 0,
      interestRate: 3.5, // Default interest rate since it's not in FinancialPlan
      termMonths: 360, // Default 30 years since it's not in FinancialPlan
      monthlyIncome: firstScenario.monthly_income || 0
    } : undefined
  )

  return (
    <>
      {/* Monte Carlo Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {t('title')}
            <Badge className="bg-purple-100 text-purple-700 text-xs">{t('premium')}</Badge>
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scenarios.slice(0, 2).map((scenario) => {
              const basePayment = scenario.calculatedMetrics?.monthlyPayment || 0
              const simResults = generateMonteCarloResults(basePayment, {
                purchasePrice: scenario.purchase_price || 0,
                interestRate: 3.5, // Default interest rate since it's not in FinancialPlan
                monthlyIncome: scenario.monthly_income || 0,
                loanTermMonths: 360 // Default 30 years since it's not in FinancialPlan
              })
              
              return (
                <div key={scenario.id} className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <h4 className="font-semibold mb-3 text-gray-900">{scenario.plan_name}</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-600">{t('meanPayment')}</span>
                        <div className="font-semibold">{formatCurrency(simResults.mean)}</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-600">{t('stdDeviation')}</span>
                        <div className="font-semibold">{formatCurrency(simResults.standardDeviation)}</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-600">{t('var95')}</span>
                        <div className="font-semibold text-red-600">{formatCurrency(simResults.valueAtRisk95)}</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-600">{t('volatility')}</span>
                        <div className="font-semibold text-amber-600">{(simResults.volatility * 100).toFixed(1)}%</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-600">{t('skewness')}</span>
                        <div className="font-semibold text-blue-600">{simResults.skewness.toFixed(3)}</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-600">{t('kurtosis')}</span>
                        <div className="font-semibold text-purple-600">{simResults.kurtosis.toFixed(3)}</div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded">
                      <h5 className="font-medium text-sm mb-2">{t('riskRange')}</h5>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-red-600 font-medium">
                          {formatCurrency(simResults.percentile5)}
                        </span>
                        <div className="flex-1 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 h-2 rounded-full"></div>
                        <span className="text-green-600 font-medium">
                          {formatCurrency(simResults.percentile95)}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {t('bestCase', { value: formatCurrency(simResults.bestCase) })} | 
                        {t('worstCase', { value: formatCurrency(simResults.worstCase) })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sensitivity Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-600" />
              {t('sensitivityAnalysis')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                {t('impactChange')}
              </div>
              
              <div className="space-y-3">
                {sensitivityData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{item.param}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${item.color}`}>
                        {item.impact}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {item.sensitivity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              {t('riskAssessment')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarios.slice(0, 3).map((scenario) => {
                const riskScore = scenario.calculatedMetrics?.dtiRatio || 0
                const riskLevel = riskScore > 40 ? t('highRisk') : riskScore > 30 ? t('mediumRisk') : t('lowRisk')
                const riskColor = riskScore > 40 ? 'text-red-600' : riskScore > 30 ? 'text-amber-600' : 'text-green-600'
                
                return (
                  <div key={scenario.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{scenario.plan_name}</h5>
                      <Badge className={cn('text-xs', 
                        riskLevel === t('highRisk') ? 'bg-red-100 text-red-700' :
                        riskLevel === t('mediumRisk') ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      )}>
                        {riskLevel}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('dtiRatio')}</span>
                        <span className={`font-medium ${riskColor}`}>
                          {riskScore.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('affordabilityScore')}</span>
                        <span className="font-medium">
                          {scenario.calculatedMetrics?.affordabilityScore || 5}/10
                        </span>
                      </div>
                      <Progress 
                        value={Math.max(0, Math.min(100, 100 - riskScore))} 
                        className="h-1.5 mt-2"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default MonteCarloAnalysis