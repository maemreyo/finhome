// src/components/expenses/GoalAdviceSection.tsx
// Component for displaying personalized financial advice for savings goals

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
// Using details/summary for collapsible functionality since @/components/ui/collapsible might not exist
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'
import { 
  Lightbulb, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Target,
  Calendar,
  DollarSign,
  Home,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Clock,
  ArrowRight
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { GoalAdvice, SpendingRecommendation } from '@/lib/services/goalAdviceService'

interface GoalAdviceSectionProps {
  goalId: string
  goalName: string
  goalType: string
  onAdviceUpdate?: () => void
}

export function GoalAdviceSection({ 
  goalId, 
  goalName, 
  goalType,
  onAdviceUpdate 
}: GoalAdviceSectionProps) {
  const [advice, setAdvice] = useState<GoalAdvice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set())
  const [acceptedRecommendations, setAcceptedRecommendations] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadAdvice()
  }, [goalId])

  const loadAdvice = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/expenses/goals/${goalId}/advice`)
      if (!response.ok) {
        throw new Error('Failed to load advice')
      }

      const data = await response.json()
      setAdvice(data.advice)
    } catch (error) {
      console.error('Error loading advice:', error)
      setError(error instanceof Error ? error.message : 'Failed to load advice')
    } finally {
      setLoading(false)
    }
  }

  const handleRecommendationResponse = async (
    recommendation: SpendingRecommendation, 
    action: 'accept' | 'reject',
    feedback?: string
  ) => {
    try {
      await fetch(`/api/expenses/goals/${goalId}/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'accept' ? 'accept_recommendation' : 'reject_recommendation',
          category_id: recommendation.categoryId,
          recommendation_id: `${recommendation.categoryId}_${recommendation.recommendedReduction}`,
          feedback,
          new_budget_limit: action === 'accept' ? 
            recommendation.currentSpending - recommendation.recommendedReduction : undefined,
          original_spending: recommendation.currentSpending,
          target_reduction: recommendation.recommendedReduction
        })
      })

      if (action === 'accept') {
        setAcceptedRecommendations(prev => new Set([...prev, recommendation.categoryId]))
        toast.success('Gợi ý đã được áp dụng! Chúng tôi sẽ theo dõi tiến độ của bạn.', {
          description: `Giảm ${formatCurrency(recommendation.recommendedReduction)} từ danh mục "${recommendation.categoryName}"`
        })
      } else {
        toast.info('Cảm ơn phản hồi của bạn!')
      }

      onAdviceUpdate?.()
    } catch (error) {
      console.error('Error handling recommendation response:', error)
      toast.error('Có lỗi xảy ra khi xử lý phản hồi')
    }
  }

  const toggleRecommendationExpansion = (categoryId: string) => {
    setExpandedRecommendations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 border-green-500 bg-green-50'
      case 'medium': return 'text-yellow-600 border-yellow-500 bg-yellow-50'
      case 'hard': return 'text-red-600 border-red-500 bg-red-50'
      default: return 'text-gray-600 border-gray-500 bg-gray-50'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-blue-600 bg-blue-100'
      case 'medium': return 'text-purple-600 bg-purple-100'
      case 'low': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Không thể tải gợi ý tài chính: {error}
          <Button variant="outline" size="sm" onClick={loadAdvice} className="ml-2">
            Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!advice) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Goal Summary */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Phân tích mục tiêu: {goalName}</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>Cần tiết kiệm hàng tháng</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(advice.requiredMonthlySavings)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingDown className="h-4 w-4" />
                <span>Đang tiết kiệm hàng tháng</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(advice.currentMonthlySavings)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Chênh lệch</span>
              </div>
              <p className={`text-2xl font-bold ${advice.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {advice.gap > 0 ? '+' : ''}{formatCurrency(advice.gap)}
              </p>
            </div>
          </div>

          {/* Timeline Analysis */}
          {advice.timeline && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Phân tích thời gian</span>
              </div>
              
              <div className="flex items-center gap-2">
                {advice.timeline.canAchieveOnTime ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
                <span className={`text-sm ${
                  advice.timeline.canAchieveOnTime ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {advice.timeline.canAchieveOnTime 
                    ? 'Có thể đạt mục tiêu đúng thời hạn' 
                    : 'Cần điều chỉnh để đạt mục tiêu đúng hạn'
                  }
                </span>
              </div>

              {advice.timeline.recommendedAdjustments && (
                <div className="mt-2 text-sm text-gray-600">
                  {advice.timeline.recommendedAdjustments.map((adjustment, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>{adjustment}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Recommendations */}
      {advice.spendingRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <CardTitle>Gợi ý điều chỉnh chi tiêu</CardTitle>
                <Badge variant="secondary">{advice.spendingRecommendations.length} gợi ý</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {advice.gap > 0 && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  Để đạt mục tiêu, bạn cần tiết kiệm thêm <strong>{formatCurrency(advice.gap)}</strong> mỗi tháng. 
                  Dưới đây là các gợi ý cụ thể dựa trên thói quen chi tiêu của bạn.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {advice.spendingRecommendations.map((recommendation) => {
                const isExpanded = expandedRecommendations.has(recommendation.categoryId)
                const isAccepted = acceptedRecommendations.has(recommendation.categoryId)

                return (
                  <Card key={recommendation.categoryId} className={`border ${isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div 
                      className="w-full cursor-pointer"
                      onClick={() => toggleRecommendationExpansion(recommendation.categoryId)}
                    >
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{recommendation.categoryName}</h4>
                                <Badge className={getDifficultyColor(recommendation.difficulty)}>
                                  {recommendation.difficulty === 'easy' ? 'Dễ' :
                                   recommendation.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                                </Badge>
                                <Badge variant="secondary" className={getImpactColor(recommendation.impact)}>
                                  Tác động {recommendation.impact === 'high' ? 'cao' :
                                             recommendation.impact === 'medium' ? 'trung bình' : 'thấp'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Giảm {formatCurrency(recommendation.recommendedReduction)} từ {formatCurrency(recommendation.currentSpending)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(recommendation.potentialSavings)}
                            </p>
                            <p className="text-xs text-gray-500">tiết kiệm/tháng</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t">
                        <div className="space-y-4 mt-4">
                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Chi tiêu hiện tại</span>
                              <span>{formatCurrency(recommendation.currentSpending)}</span>
                            </div>
                            <div className="relative">
                              <Progress value={100} className="h-3" />
                              <Progress 
                                value={(recommendation.currentSpending - recommendation.recommendedReduction) / recommendation.currentSpending * 100} 
                                className="h-3 absolute top-0 left-0" 
                              />
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Mục tiêu: {formatCurrency(recommendation.currentSpending - recommendation.recommendedReduction)}</span>
                              <span>Tiết kiệm: {Math.round(recommendation.recommendedReduction / recommendation.currentSpending * 100)}%</span>
                            </div>
                          </div>

                          {/* Specific Actions */}
                          <div>
                            <h5 className="font-medium mb-2">Các hành động cụ thể:</h5>
                            <ul className="space-y-1">
                              {recommendation.specificActions.map((action, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Action Buttons */}
                          {!isAccepted && (
                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                size="sm"
                                onClick={() => handleRecommendationResponse(recommendation, 'accept')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <ThumbsUp className="h-3 w-3 mr-2" />
                                Áp dụng gợi ý
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRecommendationResponse(recommendation, 'reject')}
                              >
                                <ThumbsDown className="h-3 w-3 mr-2" />
                                Không phù hợp
                              </Button>
                            </div>
                          )}

                          {isAccepted && (
                            <div className="flex items-center gap-2 pt-2 border-t text-green-700">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Gợi ý đã được áp dụng</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* House Purchase Specific Advice */}
      {advice.housePurchaseSpecific && goalType === 'buy_house' && (
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-purple-600" />
              <CardTitle>Lời khuyên mua nhà</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ vốn đầu tư</span>
                <span>{advice.housePurchaseSpecific.downPaymentProgress.toFixed(1)}%</span>
              </div>
              <Progress value={advice.housePurchaseSpecific.downPaymentProgress} className="h-3" />
            </div>

            {/* Stage-specific tips */}
            <div>
              <h5 className="font-medium mb-2">Gợi ý cho giai đoạn hiện tại:</h5>
              <ul className="space-y-1">
                {advice.housePurchaseSpecific.stageSpecificTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next steps */}
            <div>
              <h5 className="font-medium mb-2">Bước tiếp theo:</h5>
              <ul className="space-y-1">
                {advice.housePurchaseSpecific.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Emergency Fund */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Quỹ khẩn cấp:</strong> {formatCurrency(advice.housePurchaseSpecific.recommendedEmergencyFund)}
                  <br />
                  <span className="text-xs text-gray-600">
                    3-6 tháng chi phí sinh hoạt
                  </span>
                </AlertDescription>
              </Alert>

              {/* Debt-to-Income Ratio */}
              {advice.housePurchaseSpecific.debtToIncomeRatio && (
                <Alert className={advice.housePurchaseSpecific.debtToIncomeRatio > 40 ? 'border-yellow-500' : ''}>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tỷ lệ nợ/thu nhập:</strong> {advice.housePurchaseSpecific.debtToIncomeRatio.toFixed(1)}%
                    <br />
                    <span className="text-xs text-gray-600">
                      {advice.housePurchaseSpecific.debtToIncomeRatio > 40 
                        ? 'Nên giảm xuống dưới 40% trước khi mua nhà'
                        : 'Tỷ lệ tốt cho việc vay mua nhà'
                      }
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Credit Score Recommendations */}
            {advice.housePurchaseSpecific.creditScoreRecommendations && (
              <div>
                <h5 className="font-medium mb-2">Gợi ý cải thiện điểm tín dụng:</h5>
                <ul className="space-y-1">
                  {advice.housePurchaseSpecific.creditScoreRecommendations.slice(0, 4).map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No recommendations message */}
      {advice.gap <= 0 && advice.spendingRecommendations.length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Xuất sắc!</strong> Bạn đang tiết kiệm đủ để đạt mục tiêu đúng thời hạn. 
            Tiếp tục duy trì thói quen tài chính tốt này!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}