// src/components/dashboard/FinancialOverview.tsx
// Comprehensive financial overview widget for the main dashboard

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Target, 
  Calculator,
  PiggyBank,
  Calendar,
  ArrowRight,
  Plus
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface FinancialMetrics {
  totalPlans: number
  totalInvestment: number
  expectedROI: number
  monthlyPayments: number
  savingsProgress: number
  savingsTarget: number
  nextMilestone: {
    title: string
    target: number
    current: number
    dueDate: string
  }
}

interface FinancialOverviewProps {
  userId?: string
  className?: string
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  userId,
  className
}) => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - in real app, this would fetch from API
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockMetrics: FinancialMetrics = {
        totalPlans: 3,
        totalInvestment: 2400000000, // 2.4B VND
        expectedROI: 8.5,
        monthlyPayments: 18500000, // 18.5M VND
        savingsProgress: 850000000, // 850M VND
        savingsTarget: 1200000000, // 1.2B VND
        nextMilestone: {
          title: 'Vốn tự có cho căn nhà đầu tiên',
          target: 600000000, // 600M VND
          current: 450000000, // 450M VND
          dueDate: '2024-12-31'
        }
      }
      
      setMetrics(mockMetrics)
      setIsLoading(false)
    }

    loadMetrics()
  }, [userId])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) return null

  const savingsPercentage = (metrics.savingsProgress / metrics.savingsTarget) * 100
  const milestonePercentage = (metrics.nextMilestone.current / metrics.nextMilestone.target) * 100

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Kế Hoạch</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{metrics.totalPlans}</p>
                </div>
                <div className="p-2 bg-blue-200 dark:bg-blue-800/50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">ROI Dự Kiến</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{metrics.expectedROI}%</p>
                </div>
                <div className="p-2 bg-green-200 dark:bg-green-800/50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Đầu Tư</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {formatCurrency(metrics.totalInvestment)}
                  </p>
                </div>
                <div className="p-2 bg-purple-200 dark:bg-purple-800/50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-700 dark:text-purple-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Trả/Tháng</p>
                  <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                    {formatCurrency(metrics.monthlyPayments)}
                  </p>
                </div>
                <div className="p-2 bg-orange-200 dark:bg-orange-800/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-700 dark:text-orange-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Savings Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-green-600" />
                Tiến Độ Tiết Kiệm
              </CardTitle>
              <Badge variant="outline">
                {savingsPercentage.toFixed(1)}% hoàn thành
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ hiện tại</span>
                <span className="font-medium">
                  {formatCurrency(metrics.savingsProgress)} / {formatCurrency(metrics.savingsTarget)}
                </span>
              </div>
              <Progress value={savingsPercentage} className="h-2" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đã tiết kiệm:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(metrics.savingsProgress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Còn lại:</span>
                  <span className="font-medium">
                    {formatCurrency(metrics.savingsTarget - metrics.savingsProgress)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mục tiêu:</span>
                  <span className="font-medium">
                    {formatCurrency(metrics.savingsTarget)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ước tính hoàn thành:</span>
                  <span className="font-medium text-blue-600">
                    {new Date(2024, 11, 31).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Milestone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Mục Tiêu Tiếp Theo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {metrics.nextMilestone.title}
              </h3>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Tiến độ</span>
                <span className="font-medium">
                  {formatCurrency(metrics.nextMilestone.current)} / {formatCurrency(metrics.nextMilestone.target)}
                </span>
              </div>
              <Progress value={milestonePercentage} className="h-2 mb-3" />
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Hạn: </span>
                  <span className="font-medium">
                    {new Date(metrics.nextMilestone.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                  {milestonePercentage.toFixed(1)}% hoàn thành
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Plus className="w-4 h-4 mr-1" />
                Tăng Tiết Kiệm
              </Button>
              <Button variant="outline" size="sm">
                <Calculator className="w-4 h-4 mr-1" />
                Tính Lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Hành Động Nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" size="sm" onClick={() => window.location.href = '/properties'}>
                <Home className="w-4 h-4 mr-2" />
                Tìm Bất Động Sản
              </Button>
              <Button variant="outline" className="justify-start" size="sm" onClick={() => window.location.href = '/plans/new'}>
                <Calculator className="w-4 h-4 mr-2" />
                Tạo Kế Hoạch Mới
              </Button>
              <Button variant="outline" className="justify-start" size="sm" onClick={() => window.location.href = '/banks'}>
                <TrendingUp className="w-4 h-4 mr-2" />
                So Sánh Lãi Suất
              </Button>
              <Button variant="outline" className="justify-start" size="sm" onClick={() => window.location.href = '/investments'}>
                <Target className="w-4 h-4 mr-2" />
                Xem Danh Mục
                <ArrowRight className="w-3 h-3 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default FinancialOverview