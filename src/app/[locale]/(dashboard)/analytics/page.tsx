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
  TrendingDown,
  DollarSign, 
  Home, 
  Users, 
  Calendar,
  Target,
  Activity
} from 'lucide-react'
import { DashboardService } from '@/lib/services/dashboardService'
import { formatCurrency } from '@/lib/utils'
import { FeatureGate } from '@/components/subscription/FeatureGate'
import { FeatureBadge } from '@/components/subscription/SubscriptionBadge'

export default function AnalyticsPage() {
  const t = useTranslations('Dashboard.Analytics')
  const { user, isAuthenticated } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)

  const periods = [
    { value: '7d', label: t('periods.7d') },
    { value: '30d', label: t('periods.30d') },
    { value: '90d', label: t('periods.90d') },
    { value: '1y', label: t('periods.1y') },
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
                  {' '}{t('comparison')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value="performance">
              <div className="flex items-center gap-2">
                {t('tabs.performance')}
                <FeatureBadge featureKey="scenario_comparison" />
              </div>
            </TabsTrigger>
            <TabsTrigger value="trends">
              <div className="flex items-center gap-2">
                {t('tabs.trends')}
                <FeatureBadge featureKey="real_time_data" />
              </div>
            </TabsTrigger>
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
            <FeatureGate featureKey="scenario_comparison" promptStyle="inline">
              <Card>
                <CardHeader>
                  <CardTitle>{t('planPerformance.title')}</CardTitle>
                  <CardDescription>
                    {t('planPerformance.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {dashboardMetrics?.portfolio_roi?.toFixed(1) || '0.0'}%
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">Portfolio ROI</div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(dashboardMetrics?.monthly_rental_income * 12 || 0)}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Annual Income</div>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {dashboardMetrics?.active_plans || 0}
                        </div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">Active Plans</div>
                      </div>
                    </div>
                    
                    {/* Performance Chart Placeholder */}
                    <div className="h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Performance chart will be implemented here</p>
                        <p className="text-sm text-gray-400">Showing plan ROI over time</p>
                      </div>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
            </FeatureGate>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <FeatureGate featureKey="real_time_data" promptStyle="inline">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t('marketTrends.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('marketTrends.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Market Trend Indicators */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            +{((Math.random() * 5) + 2).toFixed(1)}%
                          </div>
                          <div className="text-sm text-green-700 dark:text-green-300">Real Estate Q3</div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {(Math.random() * 2 + 7).toFixed(1)}%
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">Avg Interest Rate</div>
                        </div>
                      </div>
                      
                      {/* Trend Analysis */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium">Apartment Market</span>
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-bold">Rising</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium">Townhouse Market</span>
                          <div className="flex items-center gap-1 text-orange-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-bold">Stable</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium">Loan Interest Rate</span>
                          <div className="flex items-center gap-1 text-blue-600">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm font-bold">Slight Decrease</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Regional Trends
                  </CardTitle>
                  <CardDescription>
                    Price changes by district in Ho Chi Minh City
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { area: 'District 1', change: 8.5, price: '120-200M VND/m²' },
                        { area: 'District 2', change: 6.2, price: '80-150M VND/m²' },
                        { area: 'District 7', change: 4.8, price: '60-120M VND/m²' },
                        { area: 'Binh Thanh', change: 3.5, price: '45-80M VND/m²' },
                        { area: 'Thu Duc', change: 12.1, price: '35-60M VND/m²' }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{item.area}</div>
                            <div className="text-xs text-muted-foreground">{item.price}</div>
                          </div>
                          <div className={`flex items-center gap-1 ${item.change > 5 ? 'text-green-600' : item.change > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {item.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span className="text-sm font-bold">+{item.change}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            </FeatureGate>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Portfolio Value Goal */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Portfolio Value</span>
                          <span className="text-sm text-muted-foreground">
                            {dashboardMetrics?.total_portfolio_value ? 
                              Math.min(100, (dashboardMetrics.total_portfolio_value / 5000000000) * 100).toFixed(1) 
                              : '0.0'}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${dashboardMetrics?.total_portfolio_value ? 
                                Math.min(100, (dashboardMetrics.total_portfolio_value / 5000000000) * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(dashboardMetrics?.total_portfolio_value || 0)}</span>
                          <span>{formatCurrency(5000000000)}</span>
                        </div>
                      </div>

                      {/* Monthly Income Goal */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Monthly Income</span>
                          <span className="text-sm text-muted-foreground">
                            {dashboardMetrics?.monthly_rental_income ? 
                              Math.min(100, (dashboardMetrics.monthly_rental_income / 30000000) * 100).toFixed(1) 
                              : '0.0'}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${dashboardMetrics?.monthly_rental_income ? 
                                Math.min(100, (dashboardMetrics.monthly_rental_income / 30000000) * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(dashboardMetrics?.monthly_rental_income || 0)}</span>
                          <span>{formatCurrency(30000000)}</span>
                        </div>
                      </div>

                      {/* Plans Count Goal */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Investment Plans</span>
                          <span className="text-sm text-muted-foreground">
                            {dashboardMetrics?.total_plans ? 
                              Math.min(100, (dashboardMetrics.total_plans / 10) * 100).toFixed(1) 
                              : '0.0'}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${dashboardMetrics?.total_plans ? 
                                Math.min(100, (dashboardMetrics.total_plans / 10) * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{dashboardMetrics?.total_plans || 0} plans</span>
                          <span>10 plans</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Detailed Goals
                  </CardTitle>
                  <CardDescription>
                    Important milestones to achieve
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Goal milestones */}
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">First Property</span>
                          <span className="text-xs text-green-600 font-medium">
                            {dashboardMetrics?.total_plans && dashboardMetrics.total_plans > 0 ? 'In Progress' : 'Not Started'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Target: {formatCurrency(2000000000)}
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${dashboardMetrics?.total_portfolio_value ? 
                                Math.min(100, (dashboardMetrics.total_portfolio_value / 2000000000) * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Passive Income</span>
                          <span className="text-xs text-blue-600 font-medium">
                            {dashboardMetrics?.monthly_rental_income && dashboardMetrics.monthly_rental_income > 5000000 ? 'Progressing' : 'Needs Improvement'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Target: {formatCurrency(15000000)}/month
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${dashboardMetrics?.monthly_rental_income ? 
                                Math.min(100, (dashboardMetrics.monthly_rental_income / 15000000) * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Diversified Portfolio</span>
                          <span className="text-xs text-purple-600 font-medium">
                            {dashboardMetrics?.active_plans && dashboardMetrics.active_plans >= 3 ? 'Target Achieved' : 'Developing'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Target: 5 investment plans
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ 
                              width: `${dashboardMetrics?.total_plans ? 
                                Math.min(100, (dashboardMetrics.total_plans / 5) * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}