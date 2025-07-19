// src/components/scenarios/ScenarioComparison.tsx
// Head-to-Head scenario comparison tool

'use client'

import React, { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  Zap, 
  Target,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FinancialScenario } from '@/types/scenario'

interface ScenarioMetrics {
  affordability: number // 0-100
  riskLevel: number // 0-100
  equityBuildingSpeed: number // 0-100
  flexibility: number // 0-100
  totalCost: number // 0-100 (inverted - lower is better)
}

interface ScenarioComparisonProps {
  scenarios: FinancialScenario[]
  onScenarioSelect?: (scenario: FinancialScenario) => void
  onCreateNewScenario?: () => void
  className?: string
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  onScenarioSelect,
  onCreateNewScenario,
  className
}) => {
  const t = useTranslations('ScenarioComparison')
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(
    scenarios.slice(0, 3).map(s => s.id)
  )
  const [viewMode, setViewMode] = useState<'table' | 'radar' | 'detailed'>('table')

  // Calculate metrics for each scenario
  const scenarioMetrics = useMemo(() => {
    const metrics: Record<string, ScenarioMetrics> = {}
    
    scenarios.forEach(scenario => {
      // Calculate affordability (higher is better)
      const monthlyPayment = scenario.calculatedMetrics?.monthlyPayment || 0
      const monthlyIncome = scenario.monthly_income || 0
      const debtToIncome = monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0
      const affordability = Math.max(0, 100 - (debtToIncome - 30) * 2) // 30% DTI is ideal
      
      // Calculate risk level (lower is better, but we'll invert for display)
      const riskFactors = [
        debtToIncome > 40 ? 30 : 0,
        (monthlyIncome - (scenario.monthly_expenses || 0) - monthlyPayment) < 0 ? 25 : 0,
        ((scenario.down_payment || 0) / (scenario.purchase_price || 1)) * 100 < 20 ? 20 : 0,
        Math.round((scenario.loanCalculations?.[0]?.loan_term_months || 240) / 12) > 25 ? 15 : 0,
        (scenario.loanCalculations?.[0]?.interest_rate || 8) > 10 ? 10 : 0
      ]
      const riskLevel = Math.max(0, 100 - riskFactors.reduce((a, b) => a + b, 0))
      
      // Calculate equity building speed (higher is better)
      const loanTermYears = Math.round((scenario.loanCalculations?.[0]?.loan_term_months || 240) / 12)
      const equityBuildingSpeed = Math.max(0, 100 - (loanTermYears - 15) * 3)
      
      // Calculate flexibility (higher down payment = more flexibility)
      const downPaymentPercent = ((scenario.down_payment || 0) / (scenario.purchase_price || 1)) * 100
      const flexibility = Math.min(100, downPaymentPercent * 2)
      
      // Calculate total cost (inverted - lower total cost is better)
      const totalInterest = scenario.calculatedMetrics?.totalInterest || 0
      const loanAmount = (scenario.purchase_price || 0) - (scenario.down_payment || 0)
      const costRatio = loanAmount > 0 ? totalInterest / loanAmount : 0
      const totalCost = Math.max(0, 100 - costRatio * 50)
      
      metrics[scenario.id] = {
        affordability,
        riskLevel,
        equityBuildingSpeed,
        flexibility,
        totalCost
      }
    })
    
    return metrics
  }, [scenarios])

  // Get scenarios for comparison
  const comparisonScenarios = scenarios.filter(s => selectedScenarios.includes(s.id))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const getRecommendationConfig = (recommendation: 'optimal' | 'safe' | 'aggressive' | 'risky') => {
    switch (recommendation) {
      case 'optimal':
        return {
          icon: Target,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: t('recommendations.optimal.label'),
          description: t('recommendations.optimal.description')
        }
      case 'safe':
        return {
          icon: Shield,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: t('recommendations.safe.label'),
          description: t('recommendations.safe.description')
        }
      case 'aggressive':
        return {
          icon: Zap,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: t('recommendations.aggressive.label'),
          description: t('recommendations.aggressive.description')
        }
      case 'risky':
        return {
          icon: AlertTriangle,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: t('recommendations.risky.label'),
          description: t('recommendations.risky.description')
        }
    }
  }

  const getRiskLevelColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
    }
  }
  
  const getRiskLevelText = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return t('riskLevels.low')
      case 'medium':
        return t('riskLevels.medium')
      case 'high':
        return t('riskLevels.high')
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('description')}
          </p>
        </div>
        
        <Button onClick={onCreateNewScenario} className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          {t('createNewScenario')}
        </Button>
      </div>

      {/* View Mode Selector */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList>
          <TabsTrigger value="table">{t('viewModes.table')}</TabsTrigger>
          <TabsTrigger value="radar">{t('viewModes.radar')}</TabsTrigger>
          <TabsTrigger value="detailed">{t('viewModes.detailed')}</TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('directComparison.title')}</CardTitle>
              <CardDescription>
                {t('directComparison.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {comparisonScenarios.map((scenario) => {
                  // Determine recommendation based on scenario properties
                  const recommendationType = scenario.scenarioType === 'baseline' ? 'optimal' :
                                           scenario.riskLevel === 'low' ? 'safe' :
                                           scenario.riskLevel === 'medium' ? 'aggressive' : 'risky'
                  const recommendation = getRecommendationConfig(recommendationType)
                  const RecommendationIcon = recommendation.icon
                  
                  return (
                    <motion.div
                      key={scenario.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      {/* Scenario Header */}
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{scenario.plan_name}</h3>
                        <p className="text-sm text-gray-600">
                          {Math.round(((scenario.down_payment || 0) / (scenario.purchase_price || 1)) * 100)}% - {Math.round((scenario.loanCalculations?.[0]?.loan_term_months || 240) / 12)} {t('years')}
                        </p>
                      </div>

                      {/* Monthly Payment */}
                      <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(scenario.calculatedMetrics?.monthlyPayment || 0)}
                        </div>
                        <p className="text-sm text-gray-600">{t('directComparison.monthlyPayment')}</p>
                      </div>

                      {/* Cash Flow */}
                      <div className="text-center">
                        <div className={cn(
                          "text-lg font-semibold",
                          ((scenario.monthly_income || 0) - (scenario.monthly_expenses || 0) - (scenario.calculatedMetrics?.monthlyPayment || 0)) >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {((scenario.monthly_income || 0) - (scenario.monthly_expenses || 0) - (scenario.calculatedMetrics?.monthlyPayment || 0)) >= 0 ? '+' : ''}
                          {formatCurrency((scenario.monthly_income || 0) - (scenario.monthly_expenses || 0) - (scenario.calculatedMetrics?.monthlyPayment || 0))}
                        </div>
                        <p className="text-sm text-gray-600">{t('directComparison.netCashFlow')}</p>
                      </div>

                      {/* Recommendation Badge */}
                      <div className="flex justify-center">
                        <Badge 
                          variant="outline"
                          className={cn("flex items-center gap-1", recommendation.color)}
                        >
                          <RecommendationIcon className="w-3 h-3" />
                          {recommendation.label}
                        </Badge>
                      </div>

                      {/* Key Metrics */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t('directComparison.totalInterest')}:</span>
                          <span className="font-medium">{formatCurrency(scenario.calculatedMetrics?.totalInterest || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('directComparison.riskLevel')}:</span>
                          <span className={cn("font-medium", getRiskLevelColor(scenario.riskLevel))}>
                            {getRiskLevelText(scenario.riskLevel)}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => onScenarioSelect?.(scenario)}
                        className="w-full"
                        variant={scenario.scenarioType === 'baseline' ? 'default' : 'outline'}
                      >
                        {scenario.scenarioType === 'baseline' ? t('directComparison.selectOptimal') : t('directComparison.selectScenario')}
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Radar Chart View */}
        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('radarChart.title')}</CardTitle>
              <CardDescription>
                {t('radarChart.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Metrics Legend */}
                <div className="space-y-4">
                  <h4 className="font-semibold">{t('radarChart.metricsTitle')}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <div>
                        <div className="font-medium">{t('radarChart.metrics.affordability.title')}</div>
                        <div className="text-sm text-gray-600">{t('radarChart.metrics.affordability.description')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <div>
                        <div className="font-medium">{t('radarChart.metrics.safety.title')}</div>
                        <div className="text-sm text-gray-600">{t('radarChart.metrics.safety.description')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <div>
                        <div className="font-medium">{t('radarChart.metrics.accumulation.title')}</div>
                        <div className="text-sm text-gray-600">{t('radarChart.metrics.accumulation.description')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <div>
                        <div className="font-medium">{t('radarChart.metrics.flexibility.title')}</div>
                        <div className="text-sm text-gray-600">{t('radarChart.metrics.flexibility.description')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <div>
                        <div className="font-medium">{t('radarChart.metrics.costEfficiency.title')}</div>
                        <div className="text-sm text-gray-600">{t('radarChart.metrics.costEfficiency.description')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Metrics Bars */}
                <div className="space-y-6">
                  {comparisonScenarios.map((scenario) => {
                    const metrics = scenarioMetrics[scenario.id]
                    
                    return (
                      <div key={scenario.id} className="space-y-3">
                        <h4 className="font-semibold">{scenario.plan_name}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm">{t('radarChart.metricsShort.affordability')}</div>
                            <Progress value={metrics.affordability} className="flex-1" />
                            <div className="w-12 text-sm text-right">{Math.round(metrics.affordability)}%</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm">{t('radarChart.metricsShort.safety')}</div>
                            <Progress value={metrics.riskLevel} className="flex-1" />
                            <div className="w-12 text-sm text-right">{Math.round(metrics.riskLevel)}%</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm">{t('radarChart.metricsShort.accumulation')}</div>
                            <Progress value={metrics.equityBuildingSpeed} className="flex-1" />
                            <div className="w-12 text-sm text-right">{Math.round(metrics.equityBuildingSpeed)}%</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm">{t('radarChart.metricsShort.flexibility')}</div>
                            <Progress value={metrics.flexibility} className="flex-1" />
                            <div className="w-12 text-sm text-right">{Math.round(metrics.flexibility)}%</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm">{t('radarChart.metricsShort.efficiency')}</div>
                            <Progress value={metrics.totalCost} className="flex-1" />
                            <div className="w-12 text-sm text-right">{Math.round(metrics.totalCost)}%</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed View */}
        <TabsContent value="detailed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {comparisonScenarios.map((scenario) => {
              const recommendationType = scenario.scenarioType === 'baseline' ? 'optimal' :
                                       scenario.riskLevel === 'low' ? 'safe' :
                                       scenario.riskLevel === 'medium' ? 'aggressive' : 'risky'
              const recommendation = getRecommendationConfig(recommendationType)
              const RecommendationIcon = recommendation.icon
              const metrics = scenarioMetrics[scenario.id]
              
              return (
                <Card key={scenario.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {scenario.plan_name}
                      <Badge 
                        variant="outline"
                        className={cn("flex items-center gap-1", recommendation.color)}
                      >
                        <RecommendationIcon className="w-3 h-3" />
                        {recommendation.label}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {recommendation.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Financial Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Giá nhà:</span>
                        <span className="text-sm">{formatCurrency(scenario.purchase_price || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Vốn tự có:</span>
                        <span className="text-sm">{formatCurrency(scenario.down_payment || 0)} ({Math.round(((scenario.down_payment || 0) / (scenario.purchase_price || 1)) * 100)}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Số tiền vay:</span>
                        <span className="text-sm">{formatCurrency((scenario.purchase_price || 0) - (scenario.down_payment || 0))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Lãi suất:</span>
                        <span className="text-sm">{scenario.loanCalculations?.[0]?.interest_rate || 0}%/năm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Thời gian vay:</span>
                        <span className="text-sm">{Math.round((scenario.loanCalculations?.[0]?.loan_term_months || 240) / 12)} năm</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Trả hàng tháng:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(scenario.calculatedMetrics?.monthlyPayment || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Dòng tiền ròng:</span>
                        <span className={cn(
                          "text-lg font-bold",
                          ((scenario.monthly_income || 0) - (scenario.monthly_expenses || 0) - (scenario.calculatedMetrics?.monthlyPayment || 0)) >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {((scenario.monthly_income || 0) - (scenario.monthly_expenses || 0) - (scenario.calculatedMetrics?.monthlyPayment || 0)) >= 0 ? '+' : ''}{formatCurrency((scenario.monthly_income || 0) - (scenario.monthly_expenses || 0) - (scenario.calculatedMetrics?.monthlyPayment || 0))}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Tổng lãi vay:</span>
                        <span className="text-sm">{formatCurrency(scenario.calculatedMetrics?.totalInterest || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Tổng thanh toán:</span>
                        <span className="text-sm">{formatCurrency(scenario.calculatedMetrics?.totalCost || 0)}</span>
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Đánh giá rủi ro:</span>
                        <span className={cn("text-sm font-medium", getRiskLevelColor(scenario.riskLevel))}>
                          {scenario.riskLevel === 'low' ? 'Thấp' : 
                           scenario.riskLevel === 'medium' ? 'Trung bình' : 'Cao'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {((scenario.calculatedMetrics?.monthlyPayment || 0) / (scenario.monthly_income || 1)) <= 0.4 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs">
                            DTI: {Math.round(((scenario.calculatedMetrics?.monthlyPayment || 0) / (scenario.monthly_income || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {((scenario.monthly_income || 0) - (scenario.monthly_expenses || 0) - (scenario.calculatedMetrics?.monthlyPayment || 0)) >= 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs">
                            Dòng tiền {((scenario.monthly_income || 0) - (scenario.monthly_expenses || 0) - (scenario.calculatedMetrics?.monthlyPayment || 0)) >= 0 ? 'dương' : 'âm'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {((scenario.down_payment || 0) / (scenario.purchase_price || 1)) * 100 >= 20 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs">
                            Vốn tự có {((scenario.down_payment || 0) / (scenario.purchase_price || 1)) * 100 >= 20 ? 'đủ' : 'thấp'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => onScenarioSelect?.(scenario)}
                      className="w-full mt-4"
                      variant={scenario.scenarioType === 'baseline' ? 'default' : 'outline'}
                    >
                      {scenario.scenarioType === 'baseline' ? 'Chọn Tối Ưu' : 'Chọn Kịch Bản'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ScenarioComparison