// src/app/dashboard/page.tsx
// Main dashboard page integrating all financial overview components

'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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

// Import legacy components for fallback
import { TimelineVisualization } from '@/components/timeline/TimelineVisualization'
import { FinancialPlan } from '@/components/financial-plans/PlansList'
import { convertScenarioToTimeline } from '@/lib/timeline/timelineUtils'
import { ScenarioEngine, type ScenarioDefinition } from '@/lib/financial/scenarios'
import { type LoanParameters } from '@/lib/financial/calculations'

// Note: metadata cannot be exported from client components

// Sample data for dashboard
const samplePlans: FinancialPlan[] = [
  {
    id: '1',
    planName: 'My First Home Purchase',
    planDescription: 'Buying a 2-bedroom apartment in District 7',
    planType: 'home_purchase',
    purchasePrice: 3000000000,
    downPayment: 600000000,
    monthlyIncome: 50000000,
    monthlyExpenses: 25000000,
    currentSavings: 800000000,
    planStatus: 'active',
    isPublic: false,
    isFavorite: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    monthlyPayment: 17400000,
    totalInterest: 1200000000,
    affordabilityScore: 7,
    riskLevel: 'medium'
  },
  {
    id: '2',
    planName: 'Investment Property - Vinhomes',
    planDescription: 'Investment apartment for rental income',
    planType: 'investment',
    purchasePrice: 2500000000,
    downPayment: 500000000,
    monthlyIncome: 50000000,
    monthlyExpenses: 25000000,
    currentSavings: 800000000,
    expectedRentalIncome: 18000000,
    planStatus: 'draft',
    isPublic: true,
    isFavorite: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    monthlyPayment: 14500000,
    totalInterest: 980000000,
    affordabilityScore: 8,
    riskLevel: 'low',
    roi: 9.2
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

const upcomingEvents = [
  {
    id: '1',
    title: 'Promotional rate ends',
    date: new Date('2024-03-15'),
    type: 'payment_change',
    planId: '1',
    description: 'Monthly payment will increase to 25.8M VND'
  },
  {
    id: '2',
    title: 'Property handover',
    date: new Date('2024-04-01'),
    type: 'milestone',
    planId: '1',
    description: 'Receive keys for District 7 apartment'
  },
  {
    id: '3',
    title: 'First rental payment',
    date: new Date('2024-04-15'),
    type: 'income',
    planId: '2',
    description: 'Expected rental income: 18M VND'
  }
]

const StatCard: React.FC<{
  title: string
  value: string | number
  change?: number
  changeType?: 'up' | 'down'
  icon: React.ComponentType<any>
  color?: string
  onClick?: () => void
}> = ({ title, value, change, changeType, icon: Icon, color = 'text-blue-600', onClick }) => (
  <Card 
    className={cn(
      "hover:shadow-md transition-all duration-200",
      onClick && "cursor-pointer"
    )}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className={cn("text-2xl font-bold", color)}>
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center text-sm mt-1",
              changeType === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {changeType === 'up' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>
        <Icon className={cn("w-8 h-8", color)} />
      </div>
    </CardContent>
  </Card>
)

const PlanSummaryCard: React.FC<{
  plan: FinancialPlan
  onView: () => void
  onEdit: () => void
}> = ({ plan, onView, onEdit }) => {
  const getPlanTypeIcon = () => {
    const icons = {
      home_purchase: Home,
      investment: Building,
      upgrade: TrendingUp,
      refinance: DollarSign
    }
    return icons[plan.planType] || Home
  }

  const IconComponent = getPlanTypeIcon()

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {plan.planName}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {plan.planType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                {plan.isFavorite && (
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Purchase Price</span>
            <span className="font-medium">{formatCurrency(plan.purchasePrice)}</span>
          </div>
          {plan.monthlyPayment && (
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly Payment</span>
              <span className="font-medium text-blue-600">
                {formatCurrency(plan.monthlyPayment)}
              </span>
            </div>
          )}
          {plan.affordabilityScore && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Affordability</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={plan.affordabilityScore * 10} 
                  className="w-16 h-2" 
                />
                <span className="text-xs font-medium">
                  {plan.affordabilityScore}/10
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const UpcomingEventCard: React.FC<{
  event: typeof upcomingEvents[0]
  planName?: string
}> = ({ event, planName }) => {
  const getEventIcon = () => {
    const icons = {
      payment_change: Calculator,
      milestone: Target,
      income: DollarSign
    }
    return icons[event.type as keyof typeof icons] || Calendar
  }

  const getEventColor = () => {
    const colors = {
      payment_change: 'text-amber-600 bg-amber-100',
      milestone: 'text-blue-600 bg-blue-100',
      income: 'text-green-600 bg-green-100'
    }
    return colors[event.type as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const IconComponent = getEventIcon()
  const daysUntil = Math.ceil((event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className={cn("p-2 rounded-lg", getEventColor())}>
        <IconComponent className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {event.title}
            </h4>
            {planName && (
              <p className="text-xs text-gray-500 mt-1">{planName}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {event.description}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {event.date.toLocaleDateString('vi-VN')}
            </p>
            <p className="text-xs text-gray-500">
              {daysUntil > 0 ? `${daysUntil} days` : 'Today'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const MarketInsights: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Market Insights
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Price/m²</p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(marketData.averagePrice)}
          </p>
          <div className="flex items-center justify-center text-green-600 text-xs mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{marketData.priceChange}%
          </div>
        </div>
        
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</p>
          <p className="text-lg font-bold text-green-600">
            {marketData.interestRates.promotional}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Promotional rate
          </p>
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Market Sentiment: {marketData.marketSentiment}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Property prices continue to rise steadily. Good time for investment with low promotional rates available.
        </p>
      </div>
    </CardContent>
  </Card>
)

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedView, setSelectedView] = useState<'overview' | 'legacy'>('overview')

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // Calculate portfolio summary (legacy support)
  const portfolioSummary = useMemo(() => {
    const totalValue = samplePlans.reduce((sum, plan) => sum + plan.purchasePrice, 0)
    const totalDownPayment = samplePlans.reduce((sum, plan) => sum + plan.downPayment, 0)
    const totalMonthlyPayment = samplePlans.reduce((sum, plan) => sum + (plan.monthlyPayment || 0), 0)
    const totalExpectedROI = samplePlans
      .filter(plan => plan.roi)
      .reduce((sum, plan) => sum + plan.roi!, 0) / samplePlans.filter(plan => plan.roi).length

    return {
      totalValue,
      totalDownPayment,
      totalMonthlyPayment,
      totalExpectedROI: isNaN(totalExpectedROI) ? 0 : totalExpectedROI,
      activePlans: samplePlans.filter(plan => plan.planStatus === 'active').length,
      draftPlans: samplePlans.filter(plan => plan.planStatus === 'draft').length
    }
  }, [])

  // Generate timeline scenarios for overview (legacy support)
  const timelineScenarios = useMemo(() => {
    if (samplePlans.length === 0) return []

    const activePlan = samplePlans.find(plan => plan.planStatus === 'active') || samplePlans[0]
    
    const baselineScenario: ScenarioDefinition = {
      id: 'dashboard-overview',
      name: 'Portfolio Overview',
      type: 'baseline',
      description: 'Combined view of your financial plans',
      parameters: {},
      assumptions: {
        economicGrowth: 5,
        inflationRate: 4,
        propertyMarketTrend: 'stable',
        personalCareerGrowth: 5,
        emergencyFundMonths: 6
      }
    }

    const loanParams: LoanParameters = {
      principal: activePlan.purchasePrice - activePlan.downPayment,
      annualRate: 10.5,
      termMonths: 240,
      promotionalRate: 7.5,
      promotionalPeriodMonths: 24
    }

    const personalFinances = {
      monthlyIncome: activePlan.monthlyIncome,
      monthlyExpenses: activePlan.monthlyExpenses
    }

    const scenarioEngine = new ScenarioEngine(
      baselineScenario,
      loanParams,
      personalFinances
    )

    const scenarioResult = scenarioEngine.generateScenario(baselineScenario)
    return [convertScenarioToTimeline(scenarioResult)]
  }, [])

  const handleCreatePlan = () => {
    window.location.href = '/plans?mode=create'
  }

  const handleViewPlan = (planId: string) => {
    window.location.href = `/plans?id=${planId}`
  }

  const handleEditPlan = (planId: string) => {
    window.location.href = `/plans?id=${planId}&mode=edit`
  }

  const handleViewAllPlans = () => {
    window.location.href = '/plans'
  }

  // Quick actions data
  const quickActions = [
    {
      id: '1',
      title: 'Tìm Bất Động Sản',
      description: 'Khám phá cơ hội đầu tư mới',
      icon: <Search className="w-5 h-5" />,
      href: '/properties'
    },
    {
      id: '2',
      title: 'Tạo Kế Hoạch Mới',
      description: 'Lập kế hoạch tài chính chi tiết',
      icon: <Calculator className="w-5 h-5" />,
      href: '/plans/new'
    },
    {
      id: '3',
      title: 'So Sánh Lãi Suất',
      description: 'Tìm gói vay ưu đãi nhất',
      icon: <TrendingUp className="w-5 h-5" />,
      href: '/banks'
    },
    {
      id: '4',
      title: 'Xem Mục Tiêu',
      description: 'Theo dõi tiến độ mục tiêu',
      icon: <Target className="w-5 h-5" />,
      href: '/goals'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tổng Quan Tài Chính
              </h1>
              <p className="text-gray-600 mt-1">
                Theo dõi tiến độ và quản lý đầu tư bất động sản của bạn
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                <RefreshCw className="w-3 h-3 mr-1" />
                Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setSelectedView(selectedView === 'overview' ? 'legacy' : 'overview')}>
                <Eye className="w-4 h-4 mr-1" />
                {selectedView === 'overview' ? 'Xem Cũ' : 'Xem Mới'}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Cài Đặt
              </Button>
              <Button size="sm" onClick={handleCreatePlan}>
                <Plus className="w-4 h-4 mr-1" />
                Tạo Kế Hoạch
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {selectedView === 'overview' ? (
          /* New Dashboard Layout */
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
                      Hành Động Nhanh
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
                                <div className="font-medium">{action.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {action.description}
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
                      Danh Mục BDS
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Phân Tích
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Lịch Trình
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="portfolio" className="space-y-4">
                    <PropertyPortfolio />
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Phân Tích Đầu Tư</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              Biểu đồ phân tích đầu tư sẽ hiển thị ở đây
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="calendar" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Lịch Trình Tài Chính</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              Lịch trình thanh toán và mục tiêu sẽ hiển thị ở đây
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
                <MarketInsights />
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Thống Kê Nhanh
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tổng kế hoạch:</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">BDS quan tâm:</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Ngân hàng so sánh:</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Thành tích:</span>
                        <span className="font-medium">7</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        Xem Chi Tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Legacy Dashboard Layout */
          <>
            {/* Portfolio Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Portfolio Value"
                value={portfolioSummary.totalValue}
                icon={Home}
                color="text-blue-600"
                onClick={handleViewAllPlans}
              />
              
              <StatCard
                title="Monthly Payments"
                value={portfolioSummary.totalMonthlyPayment}
                icon={Calculator}
                color="text-green-600"
              />
              
              <StatCard
                title="Active Plans"
                value={`${portfolioSummary.activePlans}/${samplePlans.length}`}
                icon={Target}
                color="text-purple-600"
                onClick={handleViewAllPlans}
              />
              
              {portfolioSummary.totalExpectedROI > 0 && (
                <StatCard
                  title="Avg Expected ROI"
                  value={`${portfolioSummary.totalExpectedROI.toFixed(1)}%`}
                  change={portfolioSummary.totalExpectedROI}
                  changeType="up"
                  icon={TrendingUp}
                  color="text-amber-600"
                />
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Timeline and Plans */}
              <div className="lg:col-span-2 space-y-8">
                {/* Portfolio Timeline */}
                {timelineScenarios.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Portfolio Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TimelineVisualization
                        scenarios={timelineScenarios}
                        currentScenarioId={timelineScenarios[0]?.id || ''}
                        onScenarioChange={() => {}}
                        interactionMode="view"
                        showGhostTimeline={false}
                        enableWhatIfMode={false}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Active Plans */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Your Financial Plans
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={handleViewAllPlans}>
                        View All
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {samplePlans.length > 0 ? (
                      <div className="space-y-4">
                        {samplePlans.slice(0, 3).map((plan) => (
                          <PlanSummaryCard
                            key={plan.id}
                            plan={plan}
                            onView={() => handleViewPlan(plan.id)}
                            onEdit={() => handleEditPlan(plan.id)}
                          />
                        ))}
                        
                        {samplePlans.length > 3 && (
                          <div className="text-center pt-4 border-t">
                            <Button variant="outline" onClick={handleViewAllPlans}>
                              View {samplePlans.length - 3} More Plans
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No Plans Yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Create your first financial plan to get started
                        </p>
                        <Button onClick={handleCreatePlan}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Plan
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Market Insights */}
                <MarketInsights />

                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingEvents.map((event) => {
                          const planName = samplePlans.find(p => p.id === event.planId)?.planName
                          return (
                            <UpcomingEventCard
                              key={event.id}
                              event={event}
                              planName={planName}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No upcoming events
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleCreatePlan} className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Plan
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleViewAllPlans}
                      className="w-full justify-start"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View All Plans
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/timeline'}
                      className="w-full justify-start"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Timeline Analysis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}