// src/app/[locale]/dashboard/page.tsx
// Main dashboard page with locale support - UPDATED: 2024-01-18 - Integrated with real database

'use client'

import React, { useState, useMemo, use, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Home,
  Building,
  Calculator,
  Target,
  Calendar,
  ArrowRight,
  DollarSign,
  BarChart3,
  PieChart,
  Bell,
  Star,
  Eye,
  Edit,
  Settings,
  RefreshCw,
  Search
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

// Import our dashboard components
import { FinancialOverview } from '@/components/dashboard/FinancialOverview'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { PropertyPortfolio } from '@/components/dashboard/PropertyPortfolio'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import AchievementSystem from '@/components/achievements/AchievementSystem'

// Import database service
import { DashboardService } from '@/lib/services/dashboardService'

// Import onboarding components
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'
import { useOnboardingCheck } from '@/hooks/useOnboarding'

// Import legacy components for fallback
import { TimelineVisualization } from '@/components/timeline/TimelineVisualization'
import { type FinancialPlanWithMetrics } from '@/lib/api/plans'
import { convertScenarioToTimeline } from '@/lib/timeline/timelineUtils'
import { ScenarioEngine, type ScenarioDefinition } from '@/lib/financial/scenarios'
import { type LoanParameters } from '@/lib/financial/calculations'

type PageProps = {
  params: Promise<{ locale: string }>
}

// State interface for dashboard data
interface DashboardData {
  metrics: {
    total_plans: number
    active_plans: number
    total_portfolio_value: number
    monthly_rental_income: number
    portfolio_roi: number
    experience_points: number
    current_level: number
    unread_notifications: number
  }
  marketInsights: any[]
  notifications: any[]
  achievements: any[]
  userExperience: any
}

// Mock fallback data (for demo or when user is not authenticated)
const fallbackData: DashboardData = {
  metrics: {
    total_plans: 0,
    active_plans: 0,
    total_portfolio_value: 0,
    monthly_rental_income: 0,
    portfolio_roi: 0,
    experience_points: 0,
    current_level: 1,
    unread_notifications: 0
  },
  marketInsights: [],
  notifications: [],
  achievements: [],
  userExperience: null
}

export default function DashboardPage({ params }: PageProps) {
  const { locale } = use(params)
  const t = useTranslations('Dashboard')
  const { user, isAuthenticated } = useAuth()
  const { needsOnboarding, recommendedFlow } = useOnboardingCheck()
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedView, setSelectedView] = useState<'overview' | 'legacy'>('overview')
  const [dashboardData, setDashboardData] = useState<DashboardData>(fallbackData)

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        
        if (!isAuthenticated || !user) {
          // Use fallback data for unauthenticated users
          setDashboardData(fallbackData)
          return
        }

        // Load data in parallel
        const [metrics, marketInsights, notifications, achievements, userExperience] = await Promise.all([
          DashboardService.getDashboardMetrics(user.id),
          DashboardService.getMarketInsights(3),
          DashboardService.getNotifications(user.id, 5),
          DashboardService.getUserAchievements(user.id),
          DashboardService.getUserExperience(user.id)
        ])

        setDashboardData({
          metrics,
          marketInsights,
          notifications,
          achievements,
          userExperience
        })
        
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Use fallback data on error
        setDashboardData(fallbackData)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [isAuthenticated, user])

  // Calculate portfolio summary from real data
  const portfolioSummary = useMemo(() => {
    const metrics = dashboardData.metrics
    return {
      totalValue: metrics.total_portfolio_value || 0,
      totalDownPayment: 0, // Calculate from plans if needed
      totalMonthlyPayment: metrics.monthly_rental_income || 0,
      totalExpectedROI: metrics.portfolio_roi || 0,
      activePlans: metrics.active_plans || 0,
      draftPlans: (metrics.total_plans || 0) - (metrics.active_plans || 0)
    }
  }, [dashboardData.metrics])

  const handleCreatePlan = () => {
    window.location.href = `/${locale}/dashboard/plans/new`
  }

  const handleViewPlan = (planId: string) => {
    window.location.href = `/${locale}/dashboard/plans/${planId}`
  }

  // Quick actions data
  const quickActions = [
    {
      id: 'findProperty',
      icon: <Search className="w-5 h-5" />,
      href: `/${locale}/properties`
    },
    {
      id: 'newPlan',
      icon: <Calculator className="w-5 h-5" />,
      href: `/${locale}/dashboard/plans/new`
    },
    {
      id: 'compareRates',
      icon: <TrendingUp className="w-5 h-5" />,
      href: `/${locale}/banks`
    },
    {
      id: 'portfolio',
      icon: <Target className="w-5 h-5" />,
      href: `/${locale}/investments`
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
        
        <div className="flex items-center gap-3" data-testid="user-menu">
          <Badge variant="outline" className="text-sm">
            <RefreshCw className="w-3 h-3 mr-1" />
            {t('lastUpdated', { time: lastUpdated.toLocaleTimeString(locale) })}
          </Badge>
          <NotificationCenter />
          <Button variant="outline" size="sm" data-testid="settings-link">
            <Settings className="w-4 h-4 mr-1" />
            {t('settings')}
          </Button>
          <Button size="sm" onClick={handleCreatePlan} data-testid="create-plan-button">
            <Plus className="w-4 h-4 mr-1" />
            {t('createPlan')}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* New Dashboard Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Financial Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              data-testid="quick-stats"
            >
              <FinancialOverview />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    {t('quickActions.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          className="h-auto p-4 justify-start text-left w-full"
                          onClick={() => window.location.href = action.href}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                              {action.icon}
                            </div>
                            <div>
                              <div className="font-medium">{t(`quickActions.items.${action.id}.title`)}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {t(`quickActions.items.${action.id}.description`)}
                              </div>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs for Additional Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Tabs defaultValue="portfolio" className="space-y-4" data-testid="dashboard-tabs">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="portfolio" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    {t('tabs.portfolio')}
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    {t('tabs.analytics')}
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('tabs.schedule')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="portfolio" className="space-y-4" data-testid="portfolio-overview">
                  <PropertyPortfolio />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('investmentAnalysis.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {t('investmentAnalysis.placeholder')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="calendar" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Upcoming Events */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          {t('financialSchedule.title')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Payment reminders */}
                          <div className="p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-r-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm text-red-900 dark:text-red-100">
                                  Monthly loan payment - August
                                </h4>
                                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                  Vietcombank - {formatCurrency(12500000)}
                                </p>
                              </div>
                              <Badge variant="destructive" className="text-xs">
                                3 days left
                              </Badge>
                            </div>
                          </div>

                          <div className="p-3 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-r-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm text-orange-900 dark:text-orange-100">
                                  Portfolio review
                                </h4>
                                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                                  Evaluate performance and adjust strategy
                                </p>
                              </div>
                              <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                                15/08/2024
                              </Badge>
                            </div>
                          </div>

                          <div className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm text-green-900 dark:text-green-100">
                                  Complete Q3 plan
                                </h4>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                  Prepare investment plan for Q4/2024
                                </p>
                              </div>
                              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                30/09/2024
                              </Badge>
                            </div>
                          </div>

                          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                                  Loan restructuring
                                </h4>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                  Renegotiate interest rate with bank
                                </p>
                              </div>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                                01/10/2024
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Monthly Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-600" />
                          Monthly Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Financial Goals This Month */}
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Financial goals for August</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Savings</span>
                                <span className="font-medium">{formatCurrency(25000000)}</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                              </div>
                            </div>
                          </div>

                          {/* Income vs Expenses */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(45000000)}
                              </div>
                              <div className="text-xs text-green-700 dark:text-green-300">Income</div>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                              <div className="text-lg font-bold text-red-600">
                                {formatCurrency(32000000)}
                              </div>
                              <div className="text-xs text-red-700 dark:text-red-300">Expenses</div>
                            </div>
                          </div>

                          {/* Key Dates */}
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
                              Important dates
                            </h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>August salary</span>
                                <span className="font-medium">01/08/2024</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bank payment</span>
                                <span className="font-medium">15/08/2024</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Regular investment</span>
                                <span className="font-medium">25/08/2024</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                              <Plus className="w-3 h-3 mr-1" />
                              Add event
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              View full calendar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              data-testid="recent-activity"
            >
              <RecentActivity limit={4} />
            </motion.div>

            {/* Market Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              data-testid="market-insights"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {t('marketInsights.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData.marketInsights.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.marketInsights.slice(0, 3).map((insight, index) => (
                        <div key={insight.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                              <h4 className="font-medium text-sm">{insight.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {insight.content}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {insight.insight_type}
                                </Badge>
                                {insight.location && (
                                  <span className="text-xs text-muted-foreground">
                                    {insight.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{t('marketInsights.noData')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <AchievementSystem compact={true} />
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    {t('quickStats.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('quickStats.totalPlans')}:</span>
                      <span className="font-medium">{dashboardData.metrics.total_plans || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('quickStats.activePlans')}:</span>
                      <span className="font-medium">{dashboardData.metrics.active_plans || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('quickStats.experience')}:</span>
                      <span className="font-medium">{dashboardData.metrics.experience_points || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('quickStats.achievements')}:</span>
                      <span className="font-medium">{dashboardData.achievements.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('quickStats.notifications')}:</span>
                      <span className="font-medium">{dashboardData.metrics.unread_notifications || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Onboarding Tour */}
      {/* {needsOnboarding && recommendedFlow && isAuthenticated && (
        <OnboardingTour
          tourId={recommendedFlow}
          autoStart={true}
          onComplete={() => console.log('Onboarding completed')}
          onSkip={() => console.log('Onboarding skipped')}
          onError={(error) => console.error('Onboarding error:', error)}
        />
      )} */}
    </div>
  )
}