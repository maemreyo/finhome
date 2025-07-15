// src/components/charts/ROIComparisonChart.tsx
// ROI comparison chart for different investment scenarios

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface InvestmentScenario {
  id: string
  name: string
  description: string
  initialInvestment: number
  timeframe: number // months
  expectedReturns: number[] // monthly returns
  risk: 'low' | 'medium' | 'high'
  category: 'property' | 'stocks' | 'bonds' | 'savings'
}

interface ROIComparisonProps {
  scenarios: InvestmentScenario[]
  highlightedScenario?: string
  className?: string
}

export const ROIComparisonChart: React.FC<ROIComparisonProps> = ({
  scenarios,
  highlightedScenario,
  className
}) => {
  // Calculate metrics for each scenario
  const scenarioMetrics = useMemo(() => {
    return scenarios.map(scenario => {
      const totalReturns = scenario.expectedReturns.reduce((sum, ret) => sum + ret, 0)
      const finalValue = scenario.initialInvestment + totalReturns
      const totalROI = ((finalValue - scenario.initialInvestment) / scenario.initialInvestment) * 100
      const annualizedROI = ((Math.pow(finalValue / scenario.initialInvestment, 12 / scenario.timeframe) - 1) * 100)
      const averageMonthlyReturn = totalReturns / scenario.timeframe
      
      // Calculate cumulative returns for chart
      let cumulativeValue = scenario.initialInvestment
      const cumulativeReturns = scenario.expectedReturns.map(monthlyReturn => {
        cumulativeValue += monthlyReturn
        return cumulativeValue
      })

      return {
        ...scenario,
        totalReturns,
        finalValue,
        totalROI,
        annualizedROI,
        averageMonthlyReturn,
        cumulativeReturns
      }
    })
  }, [scenarios])

  // Find best and worst performers
  const bestPerformer = scenarioMetrics.reduce((best, current) => 
    current.annualizedROI > best.annualizedROI ? current : best
  )
  
  const worstPerformer = scenarioMetrics.reduce((worst, current) => 
    current.annualizedROI < worst.annualizedROI ? current : worst
  )

  // Color schemes for different categories
  const categoryColors = {
    property: 'from-blue-500 to-blue-600',
    stocks: 'from-green-500 to-green-600',
    bonds: 'from-purple-500 to-purple-600',
    savings: 'from-gray-500 to-gray-600'
  }

  const riskColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  }

  const riskLabels = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao'
  }

  const categoryLabels = {
    property: 'Bất động sản',
    stocks: 'Cổ phiếu',
    bonds: 'Trái phiếu',
    savings: 'Tiết kiệm'
  }

  // Prepare chart data
  const maxTimeframe = Math.max(...scenarioMetrics.map(s => s.timeframe))
  const maxValue = Math.max(...scenarioMetrics.flatMap(s => s.cumulativeReturns))

  return (
    <div className={cn("space-y-6", className)}>
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Hiệu suất tốt nhất</p>
                  <p className="text-xl font-bold text-green-900">
                    {bestPerformer.annualizedROI.toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-700">{bestPerformer.name}</p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Hiệu suất thấp nhất</p>
                  <p className="text-xl font-bold text-red-900">
                    {worstPerformer.annualizedROI.toFixed(1)}%
                  </p>
                  <p className="text-sm text-red-700">{worstPerformer.name}</p>
                </div>
                <ArrowDownRight className="w-6 h-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Chênh lệch</p>
                  <p className="text-xl font-bold text-blue-900">
                    {(bestPerformer.annualizedROI - worstPerformer.annualizedROI).toFixed(1)}%
                  </p>
                  <p className="text-sm text-blue-700">ROI hàng năm</p>
                </div>
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ROI Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            So Sánh ROI Theo Thời Gian
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Biểu đồ thể hiện sự tăng trưởng giá trị đầu tư theo thời gian</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 w-20">
              {[100, 75, 50, 25, 0].map(percent => {
                const value = (maxValue * percent) / 100
                return (
                  <span key={percent}>
                    {formatCurrency(value, { compact: true })}
                  </span>
                )
              })}
            </div>

            {/* Chart area */}
            <div className="ml-24 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 25, 50, 75, 100].map(percent => (
                  <div key={percent} className="border-t border-gray-200" />
                ))}
              </div>

              {/* Performance lines for each scenario */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  {scenarioMetrics.map((scenario, index) => (
                    <linearGradient key={scenario.id} id={`gradient-${scenario.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={scenario.category === 'property' ? '#3B82F6' : scenario.category === 'stocks' ? '#10B981' : scenario.category === 'bonds' ? '#8B5CF6' : '#6B7280'} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={scenario.category === 'property' ? '#3B82F6' : scenario.category === 'stocks' ? '#10B981' : scenario.category === 'bonds' ? '#8B5CF6' : '#6B7280'} stopOpacity="0.05" />
                    </linearGradient>
                  ))}
                </defs>
                
                {scenarioMetrics.map((scenario, scenarioIndex) => {
                  const isHighlighted = highlightedScenario === scenario.id
                  const lineColor = scenario.category === 'property' ? '#3B82F6' : scenario.category === 'stocks' ? '#10B981' : scenario.category === 'bonds' ? '#8B5CF6' : '#6B7280'
                  
                  return (
                    <g key={scenario.id}>
                      {/* Area under curve */}
                      <path
                        d={`M 0 320 ${scenario.cumulativeReturns.map((value, index) => {
                          const x = (index / (scenario.timeframe - 1)) * 100
                          const y = 320 - (value / maxValue) * 320
                          return `L ${x}% ${y}`
                        }).join(' ')} L 100% 320 Z`}
                        fill={`url(#gradient-${scenario.id})`}
                        opacity={isHighlighted ? 0.3 : 0.1}
                      />
                      
                      {/* Performance line */}
                      <path
                        d={`M 0 ${320 - (scenario.initialInvestment / maxValue) * 320} ${scenario.cumulativeReturns.map((value, index) => {
                          const x = (index / (scenario.timeframe - 1)) * 100
                          const y = 320 - (value / maxValue) * 320
                          return `L ${x}% ${y}`
                        }).join(' ')}`}
                        stroke={lineColor}
                        strokeWidth={isHighlighted ? "4" : "2"}
                        fill="none"
                        opacity={isHighlighted ? 1 : 0.7}
                        className="drop-shadow-sm"
                      />

                      {/* Data points */}
                      {scenario.cumulativeReturns.map((value, index) => {
                        if (index % Math.max(1, Math.floor(scenario.timeframe / 10)) !== 0 && index !== scenario.timeframe - 1) return null
                        
                        const x = (index / (scenario.timeframe - 1)) * 100
                        const y = 320 - (value / maxValue) * 320
                        
                        return (
                          <TooltipProvider key={`${scenario.id}-${index}`}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <circle
                                  cx={`${x}%`}
                                  cy={y}
                                  r={isHighlighted ? "5" : "3"}
                                  fill={lineColor}
                                  className="cursor-pointer hover:r-6 transition-all"
                                  opacity={isHighlighted ? 1 : 0.8}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-semibold">{scenario.name}</p>
                                  <p>Tháng {index + 1}</p>
                                  <p>Giá trị: {formatCurrency(value)}</p>
                                  <p>ROI: {(((value - scenario.initialInvestment) / scenario.initialInvestment) * 100).toFixed(1)}%</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      })}
                    </g>
                  )
                })}
              </svg>

              {/* X-axis labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                <span>Tháng 0</span>
                <span>Tháng {Math.floor(maxTimeframe / 2)}</span>
                <span>Tháng {maxTimeframe}</span>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {scenarioMetrics.map(scenario => (
              <div 
                key={scenario.id} 
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-full border",
                  highlightedScenario === scenario.id ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                )}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: scenario.category === 'property' ? '#3B82F6' : scenario.category === 'stocks' ? '#10B981' : scenario.category === 'bonds' ? '#8B5CF6' : '#6B7280'
                  }}
                />
                <span className="text-sm font-medium">{scenario.name}</span>
                <Badge variant="outline" className="text-xs">
                  {scenario.annualizedROI.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Bảng So Sánh Chi Tiết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Kịch bản</th>
                  <th className="text-left p-3">Loại</th>
                  <th className="text-right p-3">Đầu tư ban đầu</th>
                  <th className="text-right p-3">Thời gian</th>
                  <th className="text-right p-3">Giá trị cuối</th>
                  <th className="text-right p-3">ROI tổng</th>
                  <th className="text-right p-3">ROI hàng năm</th>
                  <th className="text-center p-3">Rủi ro</th>
                </tr>
              </thead>
              <tbody>
                {scenarioMetrics
                  .sort((a, b) => b.annualizedROI - a.annualizedROI)
                  .map((scenario, index) => (
                    <motion.tr
                      key={scenario.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "border-b transition-colors",
                        highlightedScenario === scenario.id ? "bg-blue-50" : "hover:bg-gray-50"
                      )}
                    >
                      <td className="p-3">
                        <div>
                          <p className="font-semibold">{scenario.name}</p>
                          <p className="text-xs text-gray-500">{scenario.description}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant="outline"
                          className={cn("text-xs", `bg-gradient-to-r ${categoryColors[scenario.category]} text-white border-0`)}
                        >
                          {categoryLabels[scenario.category]}
                        </Badge>
                      </td>
                      <td className="text-right p-3 font-medium">
                        {formatCurrency(scenario.initialInvestment, { compact: true })}
                      </td>
                      <td className="text-right p-3">
                        {Math.round(scenario.timeframe / 12)} năm
                      </td>
                      <td className="text-right p-3 font-bold">
                        {formatCurrency(scenario.finalValue, { compact: true })}
                      </td>
                      <td className={cn(
                        "text-right p-3 font-bold",
                        scenario.totalROI >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {scenario.totalROI >= 0 ? '+' : ''}{scenario.totalROI.toFixed(1)}%
                      </td>
                      <td className={cn(
                        "text-right p-3 font-bold",
                        scenario.annualizedROI >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {scenario.annualizedROI >= 0 ? '+' : ''}{scenario.annualizedROI.toFixed(1)}%
                      </td>
                      <td className="text-center p-3">
                        <Badge 
                          variant="outline"
                          className={cn("text-xs", riskColors[scenario.risk])}
                        >
                          {riskLabels[scenario.risk]}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Investment Recommendations */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Khuyến Nghị Đầu Tư</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Hiệu suất cao:</h4>
              <div className="space-y-2">
                {scenarioMetrics
                  .filter(s => s.annualizedROI >= 10)
                  .sort((a, b) => b.annualizedROI - a.annualizedROI)
                  .slice(0, 3)
                  .map(scenario => (
                    <div key={scenario.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm font-medium">{scenario.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600">
                          {scenario.annualizedROI.toFixed(1)}%
                        </Badge>
                        <Badge variant="outline" className={riskColors[scenario.risk]}>
                          {riskLabels[scenario.risk]}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Rủi ro thấp:</h4>
              <div className="space-y-2">
                {scenarioMetrics
                  .filter(s => s.risk === 'low')
                  .sort((a, b) => b.annualizedROI - a.annualizedROI)
                  .map(scenario => (
                    <div key={scenario.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm font-medium">{scenario.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600">
                          {scenario.annualizedROI.toFixed(1)}%
                        </Badge>
                        <Badge variant="outline" className="text-green-600">
                          Rủi ro thấp
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ROIComparisonChart