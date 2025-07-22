// src/components/expenses/StorytellingReport.tsx
// Component for displaying storytelling expense reports with insights and narratives
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BookOpen,
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Trophy,
  Lightbulb,
  Heart,
  PieChart,
  Car,
  Home,
  Utensils,
  Gamepad2,
  ShoppingBag,
  Repeat,
  RefreshCw,
  Clock,
  Calendar,
  Sparkles,
  Target,
  Info
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { StorytellingReport as StorytellingReportType, SpendingInsight } from '@/lib/services/expenseAnalysisService'

interface StorytellingReportProps {
  userId?: string
  initialPeriod?: '7d' | '30d' | '3m' | '6m' | '1y'
  className?: string
}

const ICON_MAP = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert-triangle': AlertTriangle,
  'trophy': Trophy,
  'lightbulb': Lightbulb,
  'heart': Heart,
  'pie-chart': PieChart,
  'car': Car,
  'home': Home,
  'utensils': Utensils,
  'gamepad': Gamepad2,
  'shopping-bag': ShoppingBag,
  'repeat': Repeat
}

export function StorytellingReport({ 
  userId, 
  initialPeriod = '30d', 
  className 
}: StorytellingReportProps) {
  const t = useTranslations('StorytellingReport')
  const [report, setReport] = useState<StorytellingReportType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod)
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all')

  useEffect(() => {
    fetchReport()
  }, [selectedPeriod])

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/expenses/reports/storytelling?period=${selectedPeriod}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch report')
      }
      
      const data = await response.json()
      setReport(data.report)
    } catch (error) {
      console.error('Error fetching storytelling report:', error)
      setError('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredInsights = useMemo(() => {
    if (!report) return []
    
    if (selectedInsightType === 'all') {
      return report.insights
    }
    
    return report.insights.filter(insight => insight.type === selectedInsightType)
  }, [report, selectedInsightType])

  const getInsightIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP]
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <PieChart className="h-5 w-5" />
  }

  const getSeverityBadgeVariant = (severity: SpendingInsight['severity']) => {
    switch (severity) {
      case 'positive': return 'default'
      case 'warning': return 'secondary' 
      case 'negative': return 'destructive'
      default: return 'outline'
    }
  }

  const getSeverityColor = (severity: SpendingInsight['severity']) => {
    switch (severity) {
      case 'positive': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getInsightTypeLabel = (type: string) => {
    const labels = {
      'trend': 'Xu hướng',
      'comparison': 'So sánh',
      'anomaly': 'Bất thường',
      'milestone': 'Cột mốc',
      'habit': 'Thói quen',
      'recommendation': 'Gợi ý'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Báo cáo chi tiêu thông minh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Đang phân tích dữ liệu chi tiêu của bạn...</span>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchReport} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2" />
            <p>Không có dữ liệu để tạo báo cáo</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Báo cáo chi tiêu thông minh
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Insights
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {report.period.label} • {report.insights.length} insights được tạo
              </p>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 ngày</SelectItem>
                  <SelectItem value="30d">30 ngày</SelectItem>
                  <SelectItem value="3m">3 tháng</SelectItem>
                  <SelectItem value="6m">6 tháng</SelectItem>
                  <SelectItem value="1y">1 năm</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={fetchReport}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tóm tắt {report.period.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(report.summary.total_expenses)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tổng thu nhập</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(report.summary.total_income)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Số dư</p>
              <p className={cn(
                "text-2xl font-bold",
                report.summary.net_amount >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {report.summary.net_amount >= 0 ? '+' : ''}{formatCurrency(report.summary.net_amount)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Danh mục chi nhiều nhất</p>
              <p className="text-lg font-semibold">{report.summary.top_category}</p>
            </div>
          </div>
          
          {report.summary.total_income > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Tỷ lệ tiết kiệm</span>
                <span>{((report.summary.net_amount / report.summary.total_income) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.max(0, (report.summary.net_amount / report.summary.total_income) * 100)}
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Lọc insights:</span>
            <Select value={selectedInsightType} onValueChange={setSelectedInsightType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ({report.insights.length})</SelectItem>
                <SelectItem value="trend">Xu hướng ({report.insights.filter(i => i.type === 'trend').length})</SelectItem>
                <SelectItem value="comparison">So sánh ({report.insights.filter(i => i.type === 'comparison').length})</SelectItem>
                <SelectItem value="anomaly">Bất thường ({report.insights.filter(i => i.type === 'anomaly').length})</SelectItem>
                <SelectItem value="milestone">Cột mốc ({report.insights.filter(i => i.type === 'milestone').length})</SelectItem>
                <SelectItem value="habit">Thói quen ({report.insights.filter(i => i.type === 'habit').length})</SelectItem>
                <SelectItem value="recommendation">Gợi ý ({report.insights.filter(i => i.type === 'recommendation').length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2" />
                <p>Không có insights nào cho bộ lọc đã chọn</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredInsights.map((insight, index) => (
            <Card key={insight.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div 
                    className="flex-shrink-0 p-3 rounded-full"
                    style={{ 
                      backgroundColor: `${insight.color}20`,
                      color: insight.color 
                    }}
                  >
                    {getInsightIcon(insight.icon)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{insight.title}</h3>
                      <Badge variant={getSeverityBadgeVariant(insight.severity)}>
                        {getInsightTypeLabel(insight.type)}
                      </Badge>
                    </div>
                    
                    {/* Narrative */}
                    <p className="text-gray-700 leading-relaxed">
                      {insight.narrative}
                    </p>
                    
                    {/* Data Details */}
                    {insight.details && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">
                          📊 {insight.details}
                        </p>
                      </div>
                    )}
                    
                    {/* Change indicator */}
                    {insight.data.change_percentage !== undefined && (
                      <div className="flex items-center gap-2">
                        {insight.data.change_percentage > 0 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <span className={cn(
                          "text-sm font-medium",
                          insight.data.change_percentage > 0 ? "text-red-600" : "text-green-600"
                        )}>
                          {Math.abs(insight.data.change_percentage).toFixed(1)}% 
                          {insight.data.change_percentage > 0 ? ' tăng' : ' giảm'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Report Footer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Tạo lúc {format(new Date(report.generated_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>{report.summary.transaction_count} giao dịch được phân tích</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}