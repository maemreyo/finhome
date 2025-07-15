// src/components/charts/AmortizationChart.tsx
// Interactive chart for loan amortization schedule visualization

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, DollarSign, Info } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PaymentData {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
  cumulativeInterest: number
  cumulativePrincipal: number
}

interface AmortizationChartProps {
  amortizationData: PaymentData[]
  totalLoan: number
  interestRate: number
  className?: string
}

export const AmortizationChart: React.FC<AmortizationChartProps> = ({
  amortizationData,
  totalLoan,
  interestRate,
  className
}) => {
  // Prepare data for visualization - sample every 12 months for better readability
  const chartData = useMemo(() => {
    return amortizationData.filter((_, index) => index % 12 === 0 || index === amortizationData.length - 1)
  }, [amortizationData])

  // Calculate key metrics
  const totalInterest = amortizationData[amortizationData.length - 1]?.cumulativeInterest || 0
  const totalPayment = totalLoan + totalInterest
  const interestPercentage = (totalInterest / totalPayment) * 100

  // Get max values for scaling
  const maxBalance = Math.max(...chartData.map(d => d.balance))

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Tổng số tiền vay</p>
                  <p className="text-xl font-bold text-blue-900">
                    {formatCurrency(totalLoan)}
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
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Tổng lãi suất</p>
                  <p className="text-xl font-bold text-orange-900">
                    {formatCurrency(totalInterest)}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Thời gian vay</p>
                  <p className="text-xl font-bold text-green-900">
                    {Math.round(amortizationData.length / 12)} năm
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Balance Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Biểu Đồ Dư Nợ Theo Thời Gian
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dư nợ giảm dần theo thời gian khi bạn trả các khoản thanh toán hàng tháng</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 w-20">
              <span>{formatCurrency(maxBalance, { compact: true })}</span>
              <span>{formatCurrency(maxBalance * 0.75, { compact: true })}</span>
              <span>{formatCurrency(maxBalance * 0.5, { compact: true })}</span>
              <span>{formatCurrency(maxBalance * 0.25, { compact: true })}</span>
              <span>0</span>
            </div>

            {/* Chart area */}
            <div className="ml-24 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 25, 50, 75, 100].map(percent => (
                  <div key={percent} className="border-t border-gray-200" />
                ))}
              </div>

              {/* Balance line */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                
                {/* Area under curve */}
                <path
                  d={`M 0 ${256 - (chartData[0].balance / maxBalance) * 256} ${chartData.map((point, index) => 
                    `L ${(index / (chartData.length - 1)) * 100}% ${256 - (point.balance / maxBalance) * 256}`
                  ).join(' ')} L 100% 256 L 0 256 Z`}
                  fill="url(#balanceGradient)"
                />
                
                {/* Balance line */}
                <path
                  d={`M 0 ${256 - (chartData[0].balance / maxBalance) * 256} ${chartData.map((point, index) => 
                    `L ${(index / (chartData.length - 1)) * 100}% ${256 - (point.balance / maxBalance) * 256}`
                  ).join(' ')}`}
                  stroke="#3B82F6"
                  strokeWidth="3"
                  fill="none"
                  className="drop-shadow-sm"
                />

                {/* Data points */}
                {chartData.map((point, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <circle
                          cx={`${(index / (chartData.length - 1)) * 100}%`}
                          cy={256 - (point.balance / maxBalance) * 256}
                          r="4"
                          fill="#3B82F6"
                          className="cursor-pointer hover:r-6 transition-all"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-semibold">Năm {Math.round(point.month / 12)}</p>
                          <p>Dư nợ: {formatCurrency(point.balance)}</p>
                          <p>Đã trả gốc: {formatCurrency(point.cumulativePrincipal)}</p>
                          <p>Đã trả lãi: {formatCurrency(point.cumulativeInterest)}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </svg>

              {/* X-axis labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                <span>Năm 0</span>
                <span>Năm {Math.round(amortizationData.length / 24)}</span>
                <span>Năm {Math.round(amortizationData.length / 12)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Principal vs Interest Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Phân Tích Gốc vs Lãi Theo Năm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall breakdown */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Tổng cơ cấu thanh toán</h4>
              <div className="flex h-8 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                  style={{ width: `${((totalLoan / totalPayment) * 100)}%` }}
                >
                  Gốc
                </div>
                <div 
                  className="bg-orange-500 flex items-center justify-center text-white text-sm font-semibold"
                  style={{ width: `${interestPercentage}%` }}
                >
                  Lãi
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Gốc: {formatCurrency(totalLoan)} ({(100 - interestPercentage).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Lãi: {formatCurrency(totalInterest)} ({interestPercentage.toFixed(1)}%)</span>
                </div>
              </div>
            </div>

            {/* Yearly breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[5, 10, 15, 20].map(year => {
                const monthIndex = Math.min(year * 12 - 1, amortizationData.length - 1)
                if (monthIndex < 0) return null
                
                const yearData = amortizationData[monthIndex]
                const principalPaid = yearData.cumulativePrincipal
                const interestPaid = yearData.cumulativeInterest
                
                return (
                  <motion.div
                    key={year}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: year * 0.1 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="text-center mb-3">
                      <Badge variant="outline">Năm {year}</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đã trả gốc:</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(principalPaid, { compact: true })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đã trả lãi:</span>
                        <span className="font-medium text-orange-600">
                          {formatCurrency(interestPaid, { compact: true })}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Còn lại:</span>
                        <span className="font-bold">
                          {formatCurrency(yearData.balance, { compact: true })}
                        </span>
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: `${((totalLoan - yearData.balance) / totalLoan) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {(((totalLoan - yearData.balance) / totalLoan) * 100).toFixed(1)}% hoàn thành
                    </p>
                  </motion.div>
                )
              }).filter(Boolean)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AmortizationChart