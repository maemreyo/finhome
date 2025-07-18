// Dashboard analytics page with locale support

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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

export default function AnalyticsPage() {
  const t = useTranslations('Dashboard.Analytics')
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  const periods = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '3 months' },
    { value: '1y', label: '1 year' },
  ]

  const metrics = [
    {
      title: t('metrics.totalPlans'),
      value: '12',
      change: '+2.5%',
      trend: 'up',
      icon: Home,
      color: 'text-blue-600'
    },
    {
      title: t('metrics.totalInvestment'),
      value: '2.4 tỷ VND',
      change: '+12.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: t('metrics.expectedProfit'),
      value: '480 triệu VND',
      change: '+8.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-600'
    },
    {
      title: t('metrics.activeScenarios'),
      value: '8',
      change: '+1.2%',
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
                    Phân Bố Kế Hoạch
                  </CardTitle>
                  <CardDescription>
                    Phân tích theo loại bất động sản và khu vực
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Biểu đồ phân bố kế hoạch sẽ hiển thị tại đây
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Xu Hướng Đầu Tư
                  </CardTitle>
                  <CardDescription>
                    Theo dõi xu hướng đầu tư theo thời gian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Biểu đồ xu hướng đầu tư sẽ hiển thị tại đây
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hiệu Suất Kế Hoạch</CardTitle>
                <CardDescription>
                  Đánh giá hiệu suất các kế hoạch tài chính
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  Bảng hiệu suất kế hoạch sẽ hiển thị tại đây
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Xu Hướng Thị Trường</CardTitle>
                <CardDescription>
                  Phân tích xu hướng thị trường bất động sản
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  Biểu đồ xu hướng thị trường sẽ hiển thị tại đây
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Mục Tiêu Tài Chính
                </CardTitle>
                <CardDescription>
                  Theo dõi tiến độ đạt mục tiêu tài chính
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mục tiêu tiết kiệm năm 2024</span>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mục tiêu đầu tư bất động sản</span>
                    <span className="text-sm text-muted-foreground">40%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mục tiêu lợi nhuận tối thiểu</span>
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