// src/components/scenarios/AdvancedScenarioCharts.tsx
// Advanced scenario comparison charts with interactive visualizations

'use client'

import React, { useMemo } from 'react'
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
      'Affordability',
      'ROI Potential', 
      'Risk Level',
      'Monthly Payment',
      'Time to Payoff'
    ]
    
    return metrics.map(metric => {
      const dataPoint: any = { metric }
      
      scenarios.forEach(scenario => {
        let value = 0
        switch (metric) {
          case 'Affordability':
            value = scenario.calculatedMetrics?.affordabilityScore || 0
            break
          case 'ROI Potential':
            value = 65 // Mock value
            break
          case 'Risk Level':
            value = 100 - (scenario.riskLevel === 'low' ? 20 : scenario.riskLevel === 'medium' ? 50 : 80)
            break
          case 'Monthly Payment':
            const maxPayment = Math.max(...chartData.map(s => s.monthlyPayment))
            value = 100 - ((scenario.calculatedMetrics?.monthlyPayment || 0) / maxPayment * 100)
            break
          case 'Time to Payoff':
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
          <CardTitle>Tổng quan so sánh kịch bản</CardTitle>
          <CardDescription>
            So sánh các chỉ số tài chính chính giữa các kịch bản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Payment Comparison */}
            <div>
              <h4 className="text-sm font-medium mb-3">Thanh toán hàng tháng</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scenarioType" />
                  <YAxis tickFormatter={(value) => formatCurrency(value, { compact: true })} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Thanh toán']}
                    labelFormatter={(label) => `Kịch bản: ${label}`}
                  />
                  <Bar dataKey="monthlyPayment" fill={CHART_THEMES.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Total Cost Comparison */}
            <div>
              <h4 className="text-sm font-medium mb-3">Tổng chi phí</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scenarioType" />
                  <YAxis tickFormatter={(value) => formatCurrency(value, { compact: true })} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Tổng chi phí']}
                    labelFormatter={(label) => `Kịch bản: ${label}`}
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
          <CardTitle>Biến động số dư vay theo thời gian</CardTitle>
          <CardDescription>
            Theo dõi số dư còn lại của khoản vay qua các năm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={timeSeriesData.filter((_, i) => i % 12 === 0)}> {/* Show yearly data */}
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => `Năm ${Math.floor(value / 12)}`}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value, { compact: true })} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Số dư']}
                labelFormatter={(label) => `Tháng ${label}`}
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
          <CardTitle>Phân tích rủi ro - Lợi nhuận</CardTitle>
          <CardDescription>
            Vị trí của các kịch bản trên ma trận rủi ro và lợi nhuận
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={riskReturnData}>
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Mức độ rủi ro"
                domain={[0, 10]}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="ROI (%)"
                domain={[0, 15]}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'Mức độ rủi ro' ? `${value}/10` : `${value}%`,
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
          <CardTitle>Phân tích đa chiều</CardTitle>
          <CardDescription>
            So sánh toàn diện các khía cạnh của từng kịch bản
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
          <CardTitle>Ma trận chỉ số tài chính</CardTitle>
          <CardDescription>
            Bảng nhiệt hiển thị hiệu suất của các kịch bản theo từng chỉ số
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b">Kịch bản</th>
                  <th className="text-right p-3 border-b">Thanh toán/tháng</th>
                  <th className="text-right p-3 border-b">Tổng chi phí</th>
                  <th className="text-right p-3 border-b">Điểm khả năng chi trả</th>
                  <th className="text-right p-3 border-b">Tỷ lệ DTI</th>
                  <th className="text-center p-3 border-b">Mức rủi ro</th>
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
                        {scenario.riskScore <= 3 ? 'Thấp' : 
                         scenario.riskScore <= 6 ? 'Trung bình' : 'Cao'}
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