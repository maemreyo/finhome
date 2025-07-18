// Dashboard analytics page with locale support - UPDATED: 2024-01-18 - Integrated with real database

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Home, 
  Users, 
  Calendar,
  Target,
  Activity
} from 'lucide-react'
import { DashboardService } from '@/lib/services/dashboardService'
import { formatCurrency } from '@/lib/utils'

export default function AnalyticsPage() {
  const t = useTranslations('Dashboard.Analytics')
  const { user, isAuthenticated } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)

  const periods = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '3 months' },
    { value: '1y', label: '1 year' },
  ]

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true)
        if (isAuthenticated && user) {
          const [metrics, dashboardData] = await Promise.all([
            DashboardService.getAnalyticsMetrics(user.id),
            DashboardService.getDashboardMetrics(user.id)
          ])
          
          setAnalyticsData(metrics)
          setDashboardMetrics(dashboardData)
        }
      } catch (error) {
        console.error('Error loading analytics data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalyticsData()
  }, [isAuthenticated, user])

  // Get metric values from database or use defaults
  const getMetricValue = (metricName: string, type: 'currency' | 'number' = 'number') => {
    const metric = analyticsData.find(m => m.metric_name === metricName)
    if (!metric) return type === 'currency' ? '0 VND' : '0'
    
    if (type === 'currency') {
      return formatCurrency(metric.metric_value)
    }
    return metric.metric_value.toString()
  }

  const metrics = [
    {
      title: t('metrics.totalPlans'),
      value: dashboardMetrics?.total_plans?.toString() || '0',
      change: '+2.5%', // Could be calculated from historical data
      trend: 'up',
      icon: Home,
      color: 'text-blue-600'
    },
    {
      title: t('metrics.totalInvestment'),
      value: formatCurrency(dashboardMetrics?.total_portfolio_value || 0),
      change: '+12.3%', // Could be calculated from historical data
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: t('metrics.expectedProfit'),
      value: formatCurrency(dashboardMetrics?.monthly_rental_income * 12 || 0),
      change: `+${dashboardMetrics?.portfolio_roi || 0}%`,
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-600'
    },
    {
      title: t('metrics.activeScenarios'),
      value: dashboardMetrics?.active_plans?.toString() || '0',
      change: '+1.2%', // Could be calculated from historical data
      trend: 'up',
      icon: Activity,
      color: 'text-orange-600'
    }
  ]

  return (
    <DashboardShell 
      title={t('title')} 
      description={t('description')}
    >
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {metric.change}
                  </span>
                  {' '}so với kỳ trước
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value="performance">{t('tabs.performance')}</TabsTrigger>
            <TabsTrigger value="trends">{t('tabs.trends')}</TabsTrigger>
            <TabsTrigger value="goals">{t('tabs.goals')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t('planDistribution.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('planDistribution.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : analyticsData.length > 0 ? (
                    <div className="space-y-4">
                      {analyticsData.filter(m => m.metric_type === 'count').map((metric, index) => (
                        <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium capitalize">{metric.metric_name.replace('_', ' ')}</span>
                          <span className="text-lg font-bold">{metric.metric_value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      {t('planDistribution.placeholder')}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t('investmentTrends.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('investmentTrends.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : analyticsData.length > 0 ? (
                    <div className="space-y-4">
                      {analyticsData.filter(m => m.metric_type === 'percentage').map((metric, index) => (
                        <div key={metric.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{metric.metric_name.replace('_', ' ')}</span>
                            <span className="font-medium">{metric.metric_value}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(metric.metric_value, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      {t('investmentTrends.placeholder')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('planPerformance.title')}</CardTitle>
                <CardDescription>
                  {t('planPerformance.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  {t('planPerformance.placeholder')}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('marketTrends.title')}</CardTitle>
                <CardDescription>
                  {t('marketTrends.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  {t('marketTrends.placeholder')}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t('financialGoals.title')}
                </CardTitle>
                <CardDescription>
                  {t('financialGoals.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('financialGoals.savingsGoal')}</span>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('financialGoals.investmentGoal')}</span>
                    <span className="text-sm text-muted-foreground">40%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('financialGoals.profitGoal')}</span>
                    <span className="text-sm text-muted-foreground">90%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}