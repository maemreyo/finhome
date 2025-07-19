// src/components/scenarios/AdvancedScenarioCharts.tsx
// Advanced scenario comparison charts with interactive visualizations

'use client'

import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { FinancialScenario } from '@/types/scenario'

interface AdvancedScenarioChartsProps {
  scenarios: FinancialScenario[]
  selectedMetrics?: string[]
  className?: string
}

const SCENARIO_COLORS = {
  baseline: '#3B82F6',
  optimistic: '#10B981', 
  pessimistic: '#EF4444',
  alternative: '#F59E0B',
  stress_test: '#8B5CF6'
}

const CHART_THEMES = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6'
}

export default function AdvancedScenarioCharts({
  scenarios,
  selectedMetrics = ['monthlyPayment', 'totalCost', 'roi', 'riskScore'],
  className
}: AdvancedScenarioChartsProps) {
  const t = useTranslations('AdvancedScenarioCharts')
  
  // Prepare data for various chart types
  const chartData = useMemo(() => {
    return scenarios.map(scenario => ({
      name: scenario.plan_name || 'Unknown',
      scenarioType: scenario.scenarioType,
      monthlyPayment: scenario.calculatedMetrics?.monthlyPayment || 0,
      totalCost: scenario.calculatedMetrics?.totalCost || 0,
      totalInterest: scenario.calculatedMetrics?.totalInterest || 0,
      dtiRatio: scenario.calculatedMetrics?.dtiRatio || 0,
      affordabilityScore: scenario.calculatedMetrics?.affordabilityScore || 0,
      roi: 6.5, // Mock ROI
      riskScore: scenario.riskLevel === 'low' ? 2 : scenario.riskLevel === 'medium' ? 5 : 8,
      timeToPayoff: scenario.calculatedMetrics?.payoffTimeMonths || 240,
      color: SCENARIO_COLORS[scenario.scenarioType] || CHART_THEMES.primary
    }))
  }, [scenarios])

  // Time series data for payment schedule comparison
  const timeSeriesData = useMemo(() => {
    const months = Array.from({ length: 240 }, (_, i) => i + 1) // 20 years
    
    return months.map(month => {
      const dataPoint: any = { month }
      
      scenarios.forEach(scenario => {
        const monthlyPayment = scenario.calculatedMetrics?.monthlyPayment || 0
        const totalPaid = monthlyPayment * month
        const balance = Math.max(0, (scenario.purchase_price || 0) - totalPaid)
        
        dataPoint[`${scenario.scenarioType}_balance`] = balance
        dataPoint[`${scenario.scenarioType}_paid`] = totalPaid
      })
      
      return dataPoint
    })
  }, [scenarios])

  // Risk vs Return scatter plot data
  const riskReturnData = useMemo(() => {
    return chartData.map(scenario => ({
      ...scenario,
      x: scenario.riskScore,
      y: scenario.roi,
      z: scenario.totalCost / 1000000 // Size represents total cost in millions
    }))
  }, [chartData])

  // Radar chart data for multi-dimensional comparison
  const radarData = useMemo(() => {
    const metrics = [
      t('multidimensionalAnalysis.metrics.affordability'),
      t('multidimensionalAnalysis.metrics.roiPotential'), 
      t('multidimensionalAnalysis.metrics.riskLevel'),
      t('multidimensionalAnalysis.metrics.monthlyPayment'),
      t('multidimensionalAnalysis.metrics.timeToPayoff')
    ]
    
    return metrics.map(metric => {
      const dataPoint: any = { metric }
      
      scenarios.forEach(scenario => {
        let value = 0
        switch (metric) {
          case t('multidimensionalAnalysis.metrics.affordability'):
            value = scenario.calculatedMetrics?.affordabilityScore || 0
            break
          case t('multidimensionalAnalysis.metrics.roiPotential'):
            value = 65 // Mock value
            break
          case t('multidimensionalAnalysis.metrics.riskLevel'):
            value = 100 - (scenario.riskLevel === 'low' ? 20 : scenario.riskLevel === 'medium' ? 50 : 80)
            break
          case t('multidimensionalAnalysis.metrics.monthlyPayment'):
            const maxPayment = Math.max(...chartData.map(s => s.monthlyPayment))
            value = 100 - ((scenario.calculatedMetrics?.monthlyPayment || 0) / maxPayment * 100)
            break
          case t('multidimensionalAnalysis.metrics.timeToPayoff'):
            value = 100 - ((scenario.calculatedMetrics?.payoffTimeMonths || 240) / 240 * 100)
            break
        }
        dataPoint[scenario.scenarioType] = Math.max(0, Math.min(100, value))
      })
      
      return dataPoint
    })
  }, [scenarios, chartData])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Scenario Overview Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('scenarioOverview.title')}</CardTitle>
          <CardDescription>
            {t('scenarioOverview.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Payment Comparison */}
            <div>
              <h4 className="text-sm font-medium mb-3">{t('monthlyPaymentChart.title')}</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scenarioType" />
                  <YAxis tickFormatter={(value) => formatCurrency(value, { compact: true })} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), t('monthlyPaymentChart.tooltipLabel')]}
                    labelFormatter={(label) => t('monthlyPaymentChart.scenarioLabel', { type: label })}
                  />
                  <Bar dataKey="monthlyPayment" fill={CHART_THEMES.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Total Cost Comparison */}
            <div>
              <h4 className="text-sm font-medium mb-3">{t('totalCostChart.title')}</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scenarioType" />
                  <YAxis tickFormatter={(value) => formatCurrency(value, { compact: true })} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), t('totalCostChart.tooltipLabel')]}
                    labelFormatter={(label) => t('totalCostChart.scenarioLabel', { type: label })}
                  />
                  <Bar dataKey="totalCost" fill={CHART_THEMES.success} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Balance Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>{t('loanBalanceOverTime.title')}</CardTitle>
          <CardDescription>
            {t('loanBalanceOverTime.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={timeSeriesData.filter((_, i) => i % 12 === 0)}> {/* Show yearly data */}
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => t('loanBalanceOverTime.xAxisLabel', { year: Math.floor(value / 12) })}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value, { compact: true })} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), t('loanBalanceOverTime.yAxisLabel')]}
                labelFormatter={(label) => t('loanBalanceOverTime.tooltipLabel', { month: label })}
              />
              {scenarios.map((scenario, index) => (
                <Area
                  key={scenario.id}
                  type="monotone"
                  dataKey={`${scenario.scenarioType}_balance`}
                  stackId="1"
                  stroke={SCENARIO_COLORS[scenario.scenarioType]}
                  fill={SCENARIO_COLORS[scenario.scenarioType]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk vs Return Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle>{t('riskReturnAnalysis.title')}</CardTitle>
          <CardDescription>
            {t('riskReturnAnalysis.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={riskReturnData}>
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={t('riskReturnAnalysis.xAxisLabel')}
                domain={[0, 10]}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={t('riskReturnAnalysis.yAxisLabel')}
                domain={[0, 15]}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === t('riskReturnAnalysis.xAxisLabel') ? t('riskReturnAnalysis.tooltipRisk', { value: String(value) }) : t('riskReturnAnalysis.tooltipReturn', { value: String(value) }),
                  name
                ]}
                labelFormatter={() => ''}
              />
              {scenarios.map((scenario) => (
                <Scatter
                  key={scenario.id}
                  name={scenario.scenarioType}
                  data={riskReturnData.filter(d => d.scenarioType === scenario.scenarioType)}
                  fill={SCENARIO_COLORS[scenario.scenarioType]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Multi-dimensional Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('multidimensionalAnalysis.title')}</CardTitle>
          <CardDescription>
            {t('multidimensionalAnalysis.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis domain={[0, 100]} tick={false} />
              <Tooltip />
              {scenarios.map((scenario) => (
                <Radar
                  key={scenario.id}
                  name={scenario.scenarioType}
                  dataKey={scenario.scenarioType}
                  stroke={SCENARIO_COLORS[scenario.scenarioType]}
                  fill={SCENARIO_COLORS[scenario.scenarioType]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {scenarios.map((scenario) => (
              <Badge
                key={scenario.id}
                variant="outline"
                style={{ 
                  borderColor: SCENARIO_COLORS[scenario.scenarioType],
                  color: SCENARIO_COLORS[scenario.scenarioType]
                }}
              >
                {scenario.scenarioType}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financialMetricsMatrix.title')}</CardTitle>
          <CardDescription>
            {t('financialMetricsMatrix.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b">{t('financialMetricsMatrix.headers.scenario')}</th>
                  <th className="text-right p-3 border-b">{t('financialMetricsMatrix.headers.monthlyPayment')}</th>
                  <th className="text-right p-3 border-b">{t('financialMetricsMatrix.headers.totalCost')}</th>
                  <th className="text-right p-3 border-b">{t('financialMetricsMatrix.headers.affordabilityScore')}</th>
                  <th className="text-right p-3 border-b">{t('financialMetricsMatrix.headers.dtiRatio')}</th>
                  <th className="text-center p-3 border-b">{t('financialMetricsMatrix.headers.riskLevel')}</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((scenario, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border-b">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: scenario.color }}
                        />
                        <span className="font-medium capitalize">
                          {scenario.scenarioType}
                        </span>
                      </div>
                    </td>
                    <td className="text-right p-3 border-b">
                      {formatCurrency(scenario.monthlyPayment)}
                    </td>
                    <td className="text-right p-3 border-b">
                      {formatCurrency(scenario.totalCost)}
                    </td>
                    <td className="text-right p-3 border-b">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${scenario.affordabilityScore}%` }}
                          />
                        </div>
                        <span className="text-sm">{scenario.affordabilityScore}</span>
                      </div>
                    </td>
                    <td className="text-right p-3 border-b">
                      {formatPercentage(scenario.dtiRatio)}
                    </td>
                    <td className="text-center p-3 border-b">
                      <Badge 
                        variant={
                          scenario.riskScore <= 3 ? 'default' : 
                          scenario.riskScore <= 6 ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {scenario.riskScore <= 3 ? t('financialMetricsMatrix.riskLevels.low') : 
                         scenario.riskScore <= 6 ? t('financialMetricsMatrix.riskLevels.medium') : t('financialMetricsMatrix.riskLevels.high')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}