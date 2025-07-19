// src/components/dashboard/FinancialOverview.tsx
// Comprehensive financial overview widget for the main dashboard with i18n support

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
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { DashboardService } from '@/lib/services/dashboardService'

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
  const t = useTranslations('Dashboard.FinancialOverview')

  // Load real data from database
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true)
      
      try {
        if (userId) {
          // Load real metrics from database
          const dashboardData = await DashboardService.getDashboardMetrics(userId)
          
          const realMetrics: FinancialMetrics = {
            totalPlans: dashboardData.total_plans,
            totalInvestment: dashboardData.total_portfolio_value,
            expectedROI: dashboardData.portfolio_roi,
            monthlyPayments: dashboardData.monthly_rental_income,
            savingsProgress: dashboardData.total_portfolio_value * 0.7, // Estimate current savings
            savingsTarget: dashboardData.total_portfolio_value || 1200000000, // Default target
            nextMilestone: {
              title: t('nextMilestone.title'),
              target: 600000000, // 600M VND
              current: dashboardData.total_portfolio_value * 0.6, // Estimate milestone progress
              dueDate: '2024-12-31'
            }
          }
          
          setMetrics(realMetrics)
        } else {
          // Fallback to demo data for unauthenticated users
          const demoMetrics: FinancialMetrics = {
            totalPlans: 3,
            totalInvestment: 2400000000, // 2.4B VND
            expectedROI: 8.5,
            monthlyPayments: 18500000, // 18.5M VND
            savingsProgress: 850000000, // 850M VND
            savingsTarget: 1200000000, // 1.2B VND
            nextMilestone: {
              title: t('nextMilestone.title'),
              target: 600000000, // 600M VND
              current: 450000000, // 450M VND
              dueDate: '2024-12-31'
            }
          }
          
          setMetrics(demoMetrics)
        }
      } catch (error) {
        console.error('Error loading dashboard metrics:', error)
        
        // Fallback to demo data on error
        const fallbackMetrics: FinancialMetrics = {
          totalPlans: 0,
          totalInvestment: 0,
          expectedROI: 0,
          monthlyPayments: 0,
          savingsProgress: 0,
          savingsTarget: 1200000000, // Default target
          nextMilestone: {
            title: t('nextMilestone.title'),
            target: 600000000,
            current: 0,
            dueDate: '2024-12-31'
          }
        }
        
        setMetrics(fallbackMetrics)
      } finally {
        setIsLoading(false)
      }
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
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t('quickStats.plans')}</p>
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
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">{t('quickStats.expectedROI')}</p>
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
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{t('quickStats.investment')}</p>
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
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">{t('quickStats.monthlyPayment')}</p>
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
                {t('savingsProgress.title')}
              </CardTitle>
              <Badge variant="outline">
                {savingsPercentage.toFixed(1)}% {t('nextMilestone.completed')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('savingsProgress.title')}</span>
                <span className="font-medium">
                  {formatCurrency(metrics.savingsProgress)} / {formatCurrency(metrics.savingsTarget)}
                </span>
              </div>
              <Progress value={savingsPercentage} className="h-2" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('savingsProgress.saved')}</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(metrics.savingsProgress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('savingsProgress.remaining')}</span>
                  <span className="font-medium">
                    {formatCurrency(metrics.savingsTarget - metrics.savingsProgress)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('savingsProgress.target')}</span>
                  <span className="font-medium">
                    {formatCurrency(metrics.savingsTarget)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('savingsProgress.estimatedCompletion')}</span>
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
              {t('nextMilestone.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {metrics.nextMilestone.title}
              </h3>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>{t('savingsProgress.title')}</span>
                <span className="font-medium">
                  {formatCurrency(metrics.nextMilestone.current)} / {formatCurrency(metrics.nextMilestone.target)}
                </span>
              </div>
              <Progress value={milestonePercentage} className="h-2 mb-3" />
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">{t('nextMilestone.deadline')} </span>
                  <span className="font-medium">
                    {new Date(metrics.nextMilestone.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                  {milestonePercentage.toFixed(1)}% {t('nextMilestone.completed')}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Plus className="w-4 h-4 mr-1" />
                {t('quickActions.increaseSavings')}
              </Button>
              <Button variant="outline" size="sm">
                <Calculator className="w-4 h-4 mr-1" />
                {t('quickActions.recalculate')}
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
            <CardTitle>{t('quickActions.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" size="sm" onClick={() => window.location.href = '/properties'}>
                <Home className="w-4 h-4 mr-2" />
                {t('quickActions.findProperty')}
              </Button>
              <Button variant="outline" className="justify-start" size="sm" onClick={() => window.location.href = '/plans/new'}>
                <Calculator className="w-4 h-4 mr-2" />
                {t('quickActions.createPlan')}
              </Button>
              <Button variant="outline" className="justify-start" size="sm" onClick={() => window.location.href = '/banks'}>
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('quickActions.compareRates')}
              </Button>
              <Button variant="outline" className="justify-start" size="sm" onClick={() => window.location.href = '/investments'}>
                <Target className="w-4 h-4 mr-2" />
                {t('quickActions.viewPortfolio')}
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