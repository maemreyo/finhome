// src/app/[locale]/dashboard/page.tsx
// Main dashboard page with locale support

'use client'

import React, { useState, useMemo, use } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
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

// Import legacy components for fallback
import { TimelineVisualization } from '@/components/timeline/TimelineVisualization'
import { type FinancialPlanWithMetrics } from '@/lib/api/plans'
import { convertScenarioToTimeline } from '@/lib/timeline/timelineUtils'
import { ScenarioEngine, type ScenarioDefinition } from '@/lib/financial/scenarios'
import { type LoanParameters } from '@/lib/financial/calculations'

type PageProps = {
  params: Promise<{ locale: string }>
}

// Sample data for dashboard
const samplePlans: FinancialPlanWithMetrics[] = [
  {
    id: '1',
    user_id: 'sample-user',
    plan_name: 'My First Home Purchase',
    description: 'Buying a 2-bedroom apartment in District 7',
    plan_type: 'home_purchase',
    status: 'active',
    property_id: null,
    custom_property_data: null,
    target_age: null,
    current_monthly_income: null,
    monthly_income: 50000000,
    current_monthly_expenses: null,
    monthly_expenses: 25000000,
    current_savings: 800000000,
    dependents: 0,
    purchase_price: 3000000000,
    down_payment: 600000000,
    additional_costs: 0,
    other_debts: 0,
    target_property_type: null,
    target_location: null,
    target_budget: null,
    target_timeframe_months: null,
    investment_purpose: null,
    desired_features: {},
    down_payment_target: null,
    risk_tolerance: 'moderate',
    investment_horizon_months: null,
    expected_roi: null,
    preferred_banks: null,
    expected_rental_income: null,
    expected_appreciation_rate: null,
    emergency_fund_target: null,
    education_fund_target: null,
    retirement_fund_target: null,
    other_goals: {},
    feasibility_score: null,
    recommended_adjustments: {},
    is_public: false,
    view_count: 0,
    cached_calculations: {
      monthlyPayment: 17400000,
      totalInterest: 1200000000,
      debtToIncomeRatio: 34.8,
      affordabilityScore: 7
    },
    calculations_last_updated: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    completed_at: null,
    calculatedMetrics: {
      monthlyPayment: 17400000,
      totalInterest: 1200000000,
      debtToIncomeRatio: 34.8,
      affordabilityScore: 7
    }
  }
]

const marketData = {
  averagePrice: 45000000, // VND per m²
  priceChange: 8.5, // % increase
  interestRates: {
    promotional: 7.5,
    regular: 10.5,
    trend: 'stable'
  },
  marketSentiment: 'positive'
}

export default function DashboardPage({ params }: PageProps) {
  const { locale } = use(params)
  const t = useTranslations('Dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedView, setSelectedView] = useState<'overview' | 'legacy'>('overview')

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // Calculate portfolio summary
  const portfolioSummary = useMemo(() => {
    const totalValue = samplePlans.reduce((sum, plan) => sum + (plan.purchase_price || 0), 0)
    const totalDownPayment = samplePlans.reduce((sum, plan) => sum + (plan.down_payment || 0), 0)
    const totalMonthlyPayment = samplePlans.reduce((sum, plan) => sum + (plan.calculatedMetrics?.monthlyPayment || 0), 0)
    const totalExpectedROI = samplePlans
      .filter(plan => plan.calculatedMetrics?.roi)
      .reduce((sum, plan) => sum + plan.calculatedMetrics!.roi!, 0) / samplePlans.filter(plan => plan.calculatedMetrics?.roi).length

    return {
      totalValue,
      totalDownPayment,
      totalMonthlyPayment,
      totalExpectedROI: isNaN(totalExpectedROI) ? 0 : totalExpectedROI,
      activePlans: samplePlans.filter(plan => plan.status === 'active').length,
      draftPlans: samplePlans.filter(plan => plan.status === 'draft').length
    }
  }, [])

  const handleCreatePlan = () => {
    window.location.href = `/${locale}/dashboard/plans/new`
  }

  const handleViewPlan = (planId: string) => {
    window.location.href = `/${locale}/dashboard/plans/${planId}`
  }

  // Quick actions data
  const quickActions = [
    {
      id: '1',
      title: 'Tìm Bất Động Sản',
      description: 'Khám phá cơ hội đầu tư mới',
      icon: <Search className="w-5 h-5" />,
      href: `/${locale}/properties`
    },
    {
      id: '2',
      title: 'Tạo Kế Hoạch Mới',
      description: 'Lập kế hoạch tài chính chi tiết',
      icon: <Calculator className="w-5 h-5" />,
      href: `/${locale}/dashboard/plans/new`
    },
    {
      id: '3',
      title: 'So Sánh Lãi Suất',
      description: 'Tìm gói vay ưu đãi nhất',
      icon: <TrendingUp className="w-5 h-5" />,
      href: `/${locale}/banks`
    },
    {
      id: '4',
      title: 'Danh Mục Đầu Tư',
      description: 'Theo dõi hiệu suất đầu tư',
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
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <RefreshCw className="w-3 h-3 mr-1" />
            {t('lastUpdated', { time: lastUpdated.toLocaleTimeString(locale) })}
          </Badge>
          <NotificationCenter />
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-1" />
            {t('settings')}
          </Button>
          <Button size="sm" onClick={handleCreatePlan}>
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
                            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
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
              <Tabs defaultValue="portfolio" className="space-y-4">
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

                <TabsContent value="portfolio" className="space-y-4">
                  <PropertyPortfolio />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('investmentAnalysis.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
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
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('financialSchedule.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {t('financialSchedule.placeholder')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
            >
              <RecentActivity limit={4} />
            </motion.div>

            {/* Market Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {t('marketInsights.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('marketInsights.avgPrice')}</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(marketData.averagePrice)}
                      </p>
                      <div className="flex items-center justify-center text-green-600 text-xs mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{marketData.priceChange}%
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('marketInsights.interestRate')}</p>
                      <p className="text-lg font-bold text-green-600">
                        {marketData.interestRates.promotional}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('marketInsights.promotionalRate')}
                      </p>
                    </div>
                  </div>
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
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('quickStats.interestedProperties')}:</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('quickStats.comparedBanks')}:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('quickStats.achievements')}:</span>
                      <span className="font-medium">7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}