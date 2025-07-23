// src/components/expenses/AIFinancialAdvisor.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Crown,
  Lock,
  RefreshCw,
  Star,
  BookOpen,
  DollarSign,
  Calendar,
  BarChart3,
  PiggyBank,
  Zap
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useSubscription, useFeatureAccess } from '@/hooks/useSubscription'
import { FeatureGate } from '@/components/subscription/FeatureGate'
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt'

interface FinancialInsight {
  id: string
  type: 'spending_pattern' | 'saving_opportunity' | 'budget_alert' | 'goal_advice' | 'risk_warning'
  title: string
  title_vi: string
  insight: string
  insight_vi: string
  actionable_steps: string[]
  actionable_steps_vi: string[]
  priority: 'low' | 'medium' | 'high'
  impact_score: number
  confidence: number
  category?: string
  amount_impact?: number
  related_categories?: string[]
}

interface AIAnalysisResult {
  user_profile_summary: string
  user_profile_summary_vi: string
  insights: FinancialInsight[]
  overall_financial_health_score: number
  recommendations: {
    immediate_actions: string[]
    immediate_actions_vi: string[]
    long_term_strategies: string[]
    long_term_strategies_vi: string[]
  }
  personalized_tips: {
    tip: string
    tip_vi: string
    category: string
  }[]
}

interface AIAdvisorData {
  insights: AIAnalysisResult
  cached: boolean
  generated_at: string
}

export function AIFinancialAdvisor() {
  const t = useTranslations('AIFinancialAdvisor')
  const { tier, currentPlan } = useSubscription()
  const { hasAccess, trackUsage } = useFeatureAccess('ai_insights')
  
  const [advisorData, setAdvisorData] = useState<AIAdvisorData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'current_month' | 'last_3_months' | 'last_6_months' | 'last_year'>('last_3_months')
  const [selectedInsightType, setSelectedInsightType] = useState<'comprehensive' | 'spending_analysis' | 'budget_optimization' | 'saving_opportunities' | 'goal_recommendations'>('comprehensive')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const isPremiumUser = hasAccess && ['premium', 'professional'].includes(tier)

  useEffect(() => {
    if (isPremiumUser) {
      loadAIInsights()
    }
  }, [isPremiumUser, selectedTimePeriod, selectedInsightType])

  const loadAIInsights = async () => {
    if (!isPremiumUser) {
      setShowUpgradePrompt(true)
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        insight_type: selectedInsightType,
        time_period: selectedTimePeriod
      })

      const response = await fetch(`/api/expenses/ai-insights?${params}`)
      
      if (response.status === 403) {
        setShowUpgradePrompt(true)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch AI insights')
      }

      const data = await response.json()
      setAdvisorData(data)
      await trackUsage()
      
      if (!data.cached) {
        toast.success('AI đã phân tích dữ liệu tài chính của bạn!')
      }
    } catch (error) {
      console.error('Error loading AI insights:', error)
      toast.error('Không thể tải insight AI. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending_pattern': return <BarChart3 className="h-4 w-4" />
      case 'saving_opportunity': return <PiggyBank className="h-4 w-4" />
      case 'budget_alert': return <AlertTriangle className="h-4 w-4" />
      case 'goal_advice': return <Target className="h-4 w-4" />
      case 'risk_warning': return <AlertTriangle className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!isPremiumUser) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-50" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Cố vấn AI Tài chính
                  <Crown className="h-4 w-4 text-yellow-500" />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Nhận insight và lời khuyên tài chính được cá nhân hóa bởi AI
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              Tính năng Premium
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="text-center py-8">
            <div className="mb-4 p-3 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 w-16 h-16 mx-auto flex items-center justify-center">
              <Lock className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Mở khóa Cố vấn AI</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Nhận phân tích tài chính chuyên sâu, phát hiện cơ hội tiết kiệm và lời khuyên được cá nhân hóa từ AI Gemini.
            </p>
            
            <div className="grid gap-3 mb-6 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Phân tích thói quen chi tiêu thông minh</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Phát hiện cơ hội tiết kiệm được cá nhân hóa</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Đề xuất tối ưu hóa ngân sách</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Lời khuyên đạt mục tiêu tài chính</span>
              </div>
            </div>

            <UpgradePrompt
              featureKey="ai_insights"
              title="Nâng cấp để sử dụng Cố vấn AI"
              message="Truy cập không giới hạn vào AI insights và nhiều tính năng premium khác"
              ctaText="Nâng cấp ngay"
              context="inline"
              targetTier="premium"
              urgency="medium"
              dismissible={false}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Cố vấn AI Tài chính
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Insight thông minh được cá nhân hóa từ Gemini AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {currentPlan?.nameVi}
              </Badge>
              <Button
                onClick={loadAIInsights}
                disabled={isLoading}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Đang phân tích...' : 'Làm mới AI'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Thời gian phân tích</label>
              <Select value={selectedTimePeriod} onValueChange={(value: any) => setSelectedTimePeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Tháng hiện tại</SelectItem>
                  <SelectItem value="last_3_months">3 tháng qua</SelectItem>
                  <SelectItem value="last_6_months">6 tháng qua</SelectItem>
                  <SelectItem value="last_year">12 tháng qua</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Loại phân tích</label>
              <Select value={selectedInsightType} onValueChange={(value: any) => setSelectedInsightType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Toàn diện</SelectItem>
                  <SelectItem value="spending_analysis">Phân tích chi tiêu</SelectItem>
                  <SelectItem value="budget_optimization">Tối ưu ngân sách</SelectItem>
                  <SelectItem value="saving_opportunities">Cơ hội tiết kiệm</SelectItem>
                  <SelectItem value="goal_recommendations">Lời khuyên mục tiêu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <Brain className="h-12 w-12 text-purple-600 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI đang phân tích dữ liệu...</h3>
                <p className="text-muted-foreground">
                  Gemini AI đang xử lý thông tin tài chính và tạo insight cá nhân hóa cho bạn
                </p>
                <div className="mt-4 w-64 mx-auto">
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {advisorData && !isLoading && (
        <>
          {/* Financial Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Điểm Sức khỏe Tài chính
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-3xl font-bold", getHealthScoreColor(advisorData.insights.overall_financial_health_score))}>
                      {advisorData.insights.overall_financial_health_score}
                    </span>
                    <span className="text-muted-foreground">/100</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.round(advisorData.insights.overall_financial_health_score / 20)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {advisorData.insights.user_profile_summary_vi}
                  </p>
                  <Progress 
                    value={advisorData.insights.overall_financial_health_score} 
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="insights" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="insights">Insight AI</TabsTrigger>
              <TabsTrigger value="recommendations">Đề xuất</TabsTrigger>
              <TabsTrigger value="tips">Mẹo cá nhân</TabsTrigger>
              <TabsTrigger value="actions">Hành động</TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-4">
              {advisorData.insights.insights.map((insight, index) => (
                <Card key={insight.id} className={cn("border-l-4", getPriorityColor(insight.priority))}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", getPriorityColor(insight.priority))}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{insight.title_vi}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {insight.type.replace('_', ' ')}
                            </Badge>
                            <Badge 
                              variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              Ưu tiên {insight.priority === 'high' ? 'cao' : insight.priority === 'medium' ? 'vừa' : 'thấp'}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Tác động:</span>
                              <div className="flex">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "w-1 h-1 rounded-full mr-0.5",
                                      i < insight.impact_score ? "bg-purple-600" : "bg-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {insight.amount_impact && (
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">
                            +{formatCurrency(insight.amount_impact)}
                          </div>
                          <div className="text-xs text-muted-foreground">Tiềm năng tiết kiệm</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{insight.insight_vi}</p>
                    
                    {insight.actionable_steps_vi.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Các bước thực hiện:</h4>
                        <ul className="space-y-1">
                          {insight.actionable_steps_vi.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-orange-600" />
                      Hành động ngay lập tức
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {advisorData.insights.recommendations.immediate_actions_vi.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-semibold mt-0.5">
                            {index + 1}
                          </div>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                      Chiến lược dài hạn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {advisorData.insights.recommendations.long_term_strategies_vi.map((strategy, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">
                            {index + 1}
                          </div>
                          <span>{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {advisorData.insights.personalized_tips.map((tip, index) => (
                  <Card key={index} className="border-l-4 border-l-purple-400">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Lightbulb className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <Badge variant="outline" className="text-xs mb-2">
                            {tip.category}
                          </Badge>
                          <p className="text-sm">{tip.tip_vi}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertDescription>
                  Dựa trên phân tích AI, đây là những hành động ưu tiên bạn nên thực hiện để cải thiện tình hình tài chính.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {[
                  ...advisorData.insights.recommendations.immediate_actions_vi.map((action, index) => ({
                    action,
                    priority: 'high' as const,
                    timeline: 'Tuần này',
                    type: 'immediate' as const
                  })),
                  ...advisorData.insights.recommendations.long_term_strategies_vi.slice(0, 3).map((strategy, index) => ({
                    action: strategy,
                    priority: 'medium' as const,
                    timeline: '1-3 tháng tới',
                    type: 'long_term' as const
                  }))
                ].map((item, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
                            item.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          )}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">{item.action}</p>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={item.priority === 'high' ? 'destructive' : 'default'}
                                className="text-xs h-5"
                              >
                                {item.priority === 'high' ? 'Cao' : 'Vừa'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{item.timeline}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Đánh dấu hoàn thành
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Phân tích được tạo lúc: {new Date(advisorData.generated_at).toLocaleString('vi-VN')}
                  </span>
                  {advisorData.cached && (
                    <Badge variant="outline" className="text-xs">
                      Đã lưu cache
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Được tạo bởi Gemini AI</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showUpgradePrompt && (
        <UpgradePrompt
          featureKey="ai_insights"
          title="Nâng cấp để truy cập Cố vấn AI"
          message="Nhận insight tài chính thông minh và lời khuyên được cá nhân hóa"
          ctaText="Xem gói Premium"
          context="modal"
          targetTier="premium"
          urgency="high"
          dismissible={true}
        />
      )}
    </div>
  )
}