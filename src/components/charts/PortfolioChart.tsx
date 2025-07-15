// src/components/charts/PortfolioChart.tsx
// Interactive portfolio performance and ROI visualization charts

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent,
  BarChart3,
  PieChart,
  Info,
  Calendar
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PortfolioProperty {
  id: string
  name: string
  type: 'apartment' | 'house' | 'villa' | 'townhouse'
  location: string
  purchasePrice: number
  currentValue: number
  purchaseDate: Date
  monthlyRental?: number
  expenses: number
}

interface PortfolioPerformance {
  date: Date
  totalValue: number
  totalInvestment: number
  monthlyIncome: number
  monthlyExpenses: number
}

interface PortfolioChartProps {
  properties: PortfolioProperty[]
  performance: PortfolioPerformance[]
  className?: string
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  properties,
  performance,
  className
}) => {
  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const totalInvestment = properties.reduce((sum, prop) => sum + prop.purchasePrice, 0)
    const totalCurrentValue = properties.reduce((sum, prop) => sum + prop.currentValue, 0)
    const totalMonthlyIncome = properties.reduce((sum, prop) => sum + (prop.monthlyRental || 0), 0)
    const totalMonthlyExpenses = properties.reduce((sum, prop) => sum + prop.expenses, 0)
    const netMonthlyIncome = totalMonthlyIncome - totalMonthlyExpenses
    
    const totalGain = totalCurrentValue - totalInvestment
    const totalROI = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0
    
    const annualIncome = netMonthlyIncome * 12
    const yieldPercentage = totalCurrentValue > 0 ? (annualIncome / totalCurrentValue) * 100 : 0

    return {
      totalInvestment,
      totalCurrentValue,
      totalGain,
      totalROI,
      totalMonthlyIncome,
      totalMonthlyExpenses,
      netMonthlyIncome,
      annualIncome,
      yieldPercentage,
      propertyCount: properties.length
    }
  }, [properties])

  // Prepare data for charts
  const chartData = useMemo(() => {
    // Portfolio allocation by property type
    const typeAllocation = properties.reduce((acc, prop) => {
      acc[prop.type] = (acc[prop.type] || 0) + prop.currentValue
      return acc
    }, {} as Record<string, number>)

    // Location allocation
    const locationAllocation = properties.reduce((acc, prop) => {
      acc[prop.location] = (acc[prop.location] || 0) + prop.currentValue
      return acc
    }, {} as Record<string, number>)

    // Performance over time (last 12 months)
    const performanceData = performance.slice(-12)

    return {
      typeAllocation,
      locationAllocation,
      performanceData
    }
  }, [properties, performance])

  const typeColors = {
    apartment: 'bg-blue-500',
    house: 'bg-green-500',
    villa: 'bg-purple-500',
    townhouse: 'bg-orange-500'
  }

  const typeLabels = {
    apartment: 'Căn hộ',
    house: 'Nhà riêng',
    villa: 'Biệt thự',
    townhouse: 'Nhà phố'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Tổng giá trị</p>
                  <p className="text-xl font-bold text-blue-900">
                    {formatCurrency(portfolioMetrics.totalCurrentValue)}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={cn(
            "border-2",
            portfolioMetrics.totalROI >= 0 
              ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
              : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    portfolioMetrics.totalROI >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    ROI tổng thể
                  </p>
                  <p className={cn(
                    "text-xl font-bold",
                    portfolioMetrics.totalROI >= 0 ? "text-green-900" : "text-red-900"
                  )}>
                    {portfolioMetrics.totalROI >= 0 ? '+' : ''}{portfolioMetrics.totalROI.toFixed(1)}%
                  </p>
                </div>
                {portfolioMetrics.totalROI >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Thu nhập/tháng</p>
                  <p className="text-xl font-bold text-purple-900">
                    {formatCurrency(portfolioMetrics.netMonthlyIncome)}
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Tỷ suất sinh lời</p>
                  <p className="text-xl font-bold text-orange-900">
                    {portfolioMetrics.yieldPercentage.toFixed(1)}%
                  </p>
                </div>
                <Percent className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="allocation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="allocation">Phân bổ danh mục</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất theo thời gian</TabsTrigger>
          <TabsTrigger value="cashflow">Dòng tiền</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Property Type Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Phân bổ theo loại BĐS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(chartData.typeAllocation).map(([type, value]) => {
                    const percentage = (value / portfolioMetrics.totalCurrentValue) * 100
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", typeColors[type as keyof typeof typeColors])} />
                            <span className="text-sm font-medium">
                              {typeLabels[type as keyof typeof typeLabels]}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{formatCurrency(value, { compact: true })}</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full", typeColors[type as keyof typeof typeColors])}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Location Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Phân bổ theo địa điểm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(chartData.locationAllocation)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([location, value]) => {
                      const percentage = (value / portfolioMetrics.totalCurrentValue) * 100
                      
                      return (
                        <div key={location} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{location}</span>
                            <div className="text-right">
                              <div className="text-sm font-semibold">{formatCurrency(value, { compact: true })}</div>
                              <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Hiệu Suất Danh Mục 12 Tháng Qua
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Theo dõi sự tăng trưởng giá trị danh mục theo thời gian</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 relative">
                {chartData.performanceData.length > 0 && (
                  <>
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 w-20">
                      {[100, 75, 50, 25, 0].map(percent => {
                        const maxValue = Math.max(...chartData.performanceData.map(d => d.totalValue))
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

                      {/* Performance line */}
                      <svg className="absolute inset-0 w-full h-full">
                        <defs>
                          <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                        
                        {chartData.performanceData.length > 1 && (
                          <>
                            {/* Area under curve */}
                            <path
                              d={`M 0 256 ${chartData.performanceData.map((point, index) => {
                                const maxValue = Math.max(...chartData.performanceData.map(d => d.totalValue))
                                const y = 256 - (point.totalValue / maxValue) * 256
                                const x = (index / (chartData.performanceData.length - 1)) * 100
                                return `L ${x}% ${y}`
                              }).join(' ')} L 100% 256 Z`}
                              fill="url(#performanceGradient)"
                            />
                            
                            {/* Performance line */}
                            <path
                              d={`M 0 ${256 - (chartData.performanceData[0].totalValue / Math.max(...chartData.performanceData.map(d => d.totalValue))) * 256} ${chartData.performanceData.map((point, index) => {
                                const maxValue = Math.max(...chartData.performanceData.map(d => d.totalValue))
                                const y = 256 - (point.totalValue / maxValue) * 256
                                const x = (index / (chartData.performanceData.length - 1)) * 100
                                return `L ${x}% ${y}`
                              }).join(' ')}`}
                              stroke="#10B981"
                              strokeWidth="3"
                              fill="none"
                              className="drop-shadow-sm"
                            />

                            {/* Data points */}
                            {chartData.performanceData.map((point, index) => {
                              const maxValue = Math.max(...chartData.performanceData.map(d => d.totalValue))
                              const y = 256 - (point.totalValue / maxValue) * 256
                              const x = (index / (chartData.performanceData.length - 1)) * 100
                              
                              return (
                                <TooltipProvider key={index}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <circle
                                        cx={`${x}%`}
                                        cy={y}
                                        r="4"
                                        fill="#10B981"
                                        className="cursor-pointer hover:r-6 transition-all"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-sm">
                                        <p className="font-semibold">
                                          {point.date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                                        </p>
                                        <p>Giá trị: {formatCurrency(point.totalValue)}</p>
                                        <p>Đầu tư: {formatCurrency(point.totalInvestment)}</p>
                                        <p>Thu nhập: {formatCurrency(point.monthlyIncome)}/tháng</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )
                            })}
                          </>
                        )}
                      </svg>

                      {/* X-axis labels */}
                      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                        {chartData.performanceData.length > 0 && (
                          <>
                            <span>
                              {chartData.performanceData[0].date.toLocaleDateString('vi-VN', { month: 'short' })}
                            </span>
                            <span>
                              {chartData.performanceData[Math.floor(chartData.performanceData.length / 2)].date.toLocaleDateString('vi-VN', { month: 'short' })}
                            </span>
                            <span>
                              {chartData.performanceData[chartData.performanceData.length - 1].date.toLocaleDateString('vi-VN', { month: 'short' })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thu nhập hàng tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(portfolioMetrics.totalMonthlyIncome)}
                </div>
                <p className="text-sm text-gray-600 mb-4">Tổng thu từ cho thuê</p>
                
                <div className="space-y-3">
                  {properties
                    .filter(prop => prop.monthlyRental && prop.monthlyRental > 0)
                    .sort((a, b) => (b.monthlyRental || 0) - (a.monthlyRental || 0))
                    .map(prop => (
                      <div key={prop.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{prop.name}</p>
                          <p className="text-sm text-gray-500">{prop.location}</p>
                        </div>
                        <Badge variant="outline">
                          {formatCurrency(prop.monthlyRental || 0, { compact: true })}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chi phí hàng tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {formatCurrency(portfolioMetrics.totalMonthlyExpenses)}
                </div>
                <p className="text-sm text-gray-600 mb-4">Tổng chi phí vận hành</p>
                
                <div className="space-y-3">
                  {properties
                    .filter(prop => prop.expenses > 0)
                    .sort((a, b) => b.expenses - a.expenses)
                    .map(prop => (
                      <div key={prop.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{prop.name}</p>
                          <p className="text-sm text-gray-500">{prop.location}</p>
                        </div>
                        <Badge variant="outline" className="text-red-600">
                          {formatCurrency(prop.expenses, { compact: true })}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Net Cash Flow Summary */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Dòng Tiền Ròng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(portfolioMetrics.totalMonthlyIncome)}
                    </div>
                    <div className="text-sm text-gray-600">Thu nhập/tháng</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      -{formatCurrency(portfolioMetrics.totalMonthlyExpenses)}
                    </div>
                    <div className="text-sm text-gray-600">Chi phí/tháng</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={cn(
                      "text-2xl font-bold",
                      portfolioMetrics.netMonthlyIncome >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {portfolioMetrics.netMonthlyIncome >= 0 ? '+' : ''}{formatCurrency(portfolioMetrics.netMonthlyIncome)}
                    </div>
                    <div className="text-sm text-gray-600">Dòng tiền ròng/tháng</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Dự báo năm:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Thu nhập hàng năm:</span>
                      <span className="font-semibold ml-2">{formatCurrency(portfolioMetrics.annualIncome)}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Tỷ suất sinh lời:</span>
                      <span className="font-semibold ml-2">{portfolioMetrics.yieldPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PortfolioChart