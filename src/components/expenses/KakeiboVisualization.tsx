// src/components/expenses/KakeiboVisualization.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Heart,
  ShoppingBag,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BookOpen,
  PenTool,
  Target,
  Calendar,
  BarChart3,
  MessageSquare
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

// Kakeibo groups definition
const KAKEIBO_GROUPS = {
  survival: {
    name_en: 'Survival',
    name_vi: 'Sinh tồn',
    description_vi: 'Chi phí thiết yếu để duy trì cuộc sống',
    icon: Heart,
    color: '#EF4444'
  },
  optional: {
    name_en: 'Optional', 
    name_vi: 'Tùy chọn',
    description_vi: 'Chi phí cho những thứ mong muốn nhưng không thiết yếu',
    icon: ShoppingBag,
    color: '#3B82F6'
  },
  culture: {
    name_en: 'Culture',
    name_vi: 'Văn hóa',
    description_vi: 'Chi phí cho việc học hỏi và phát triển bản thân',
    icon: GraduationCap,
    color: '#10B981'
  },
  extra: {
    name_en: 'Extra',
    name_vi: 'Phụ trội',
    description_vi: 'Chi phí bất ngờ và khẩn cấp',
    icon: AlertCircle,
    color: '#F59E0B'
  }
} as const

interface Budget {
  id: string
  name: string
  total_budget: number
  current_spent: number
  remaining_amount: number
  progress_percentage: number
  budget_allocation?: Record<string, number>
  spending_by_category?: Record<string, number>
  category_mapping?: Record<string, string>
  start_date: string
  end_date: string
}

interface KakeiboVisualizationProps {
  budget: Budget
}

// Self-reflection questions for Kakeibo
const KAKEIBO_QUESTIONS = {
  weekly: [
    "Tuần này, tôi đã chi tiêu có ý thức không?",
    "Có khoản nào tôi chi tiêu mà không thực sự cần thiết?",
    "Tôi có cảm thấy hài lòng với những gì đã mua không?",
    "Tôi có thể cải thiện thói quen chi tiêu như thế nào tuần tới?"
  ],
  monthly: [
    "Tháng này, tôi đã đạt được mục tiêu ngân sách không?",
    "Nhóm chi tiêu nào vượt quá dự kiến và tại sao?",
    "Tôi đã học được gì về thói quen chi tiêu của mình?",
    "Tháng tới tôi sẽ điều chỉnh ngân sách như thế nào?",
    "Tôi có cảm thấy hạnh phúc với cách chi tiêu của mình không?"
  ]
}

export function KakeiboVisualization({ budget }: KakeiboVisualizationProps) {
  const [reflectionNotes, setReflectionNotes] = useState<Record<string, string>>({})
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>('weekly')

  // Calculate spending by Kakeibo groups
  const getKakeiboSpending = () => {
    const groupSpending: Record<string, { allocated: number; spent: number }> = {}
    
    Object.keys(KAKEIBO_GROUPS).forEach(group => {
      groupSpending[group] = {
        allocated: budget.budget_allocation?.[group] || 0,
        spent: 0
      }
    })

    // Map category spending to Kakeibo groups
    if (budget.spending_by_category && budget.category_mapping) {
      Object.entries(budget.spending_by_category).forEach(([categoryId, amount]) => {
        const group = budget.category_mapping?.[categoryId]
        if (group && groupSpending[group]) {
          groupSpending[group].spent += amount
        }
      })
    }

    return groupSpending
  }

  const kakeiboSpending = getKakeiboSpending()

  const handleReflectionSave = async (questionIndex: number, answer: string) => {
    const key = `${selectedPeriod}_${questionIndex}`
    setReflectionNotes(prev => ({
      ...prev,
      [key]: answer
    }))
    
    // Here you could save to backend if needed
    // await saveReflection(budget.id, key, answer)
  }

  const getTotalProgress = () => {
    const totalAllocated = Object.values(kakeiboSpending).reduce((sum, group) => sum + group.allocated, 0)
    const totalSpent = Object.values(kakeiboSpending).reduce((sum, group) => sum + group.spent, 0)
    return totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0
  }

  const getGroupStatus = (allocated: number, spent: number) => {
    if (spent > allocated) return { status: 'over', color: 'text-red-600' }
    if (spent > allocated * 0.8) return { status: 'warning', color: 'text-yellow-600' }
    return { status: 'good', color: 'text-green-600' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-500" />
          <h3 className="text-2xl font-bold">Chi tiết Kakeibo</h3>
        </div>
        <Badge variant="secondary" className="text-sm">
          {format(new Date(budget.start_date), 'dd/MM')} - {format(new Date(budget.end_date), 'dd/MM')}
        </Badge>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tổng quan ngân sách
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Tổng chi tiêu</span>
              <span className="font-semibold">
                {formatCurrency(budget.current_spent)} / {formatCurrency(budget.total_budget)}
              </span>
            </div>
            <Progress value={Math.min(getTotalProgress(), 100)} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{getTotalProgress().toFixed(1)}% đã sử dụng</span>
              <span className={cn(
                budget.remaining_amount < 0 ? "text-red-600" : "text-green-600"
              )}>
                {budget.remaining_amount >= 0 ? 'Còn lại' : 'Vượt quá'}: {formatCurrency(Math.abs(budget.remaining_amount))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kakeibo Groups Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(KAKEIBO_GROUPS).map(([key, group]) => {
          const IconComponent = group.icon
          const spending = kakeiboSpending[key]
          const percentage = spending.allocated > 0 ? (spending.spent / spending.allocated) * 100 : 0
          const status = getGroupStatus(spending.allocated, spending.spent)

          return (
            <Card key={key} className="relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: group.color }}
              />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: group.color + '20' }}
                    >
                      <IconComponent 
                        className="h-4 w-4" 
                        style={{ color: group.color }} 
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{group.name_vi}</h4>
                      <p className="text-xs text-muted-foreground">
                        {group.description_vi}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={status.status === 'over' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Chi tiêu</span>
                  <span className={cn("font-medium", status.color)}>
                    {formatCurrency(spending.spent)} / {formatCurrency(spending.allocated)}
                  </span>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                  style={{ backgroundColor: group.color + '20' }}
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {percentage > 100 ? 'Vượt quá' : 'Đã dùng'} {Math.abs(percentage).toFixed(1)}%
                  </span>
                  <span className={status.color}>
                    {spending.allocated - spending.spent >= 0 ? 'Còn lại' : 'Vượt'}: {formatCurrency(Math.abs(spending.allocated - spending.spent))}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Self-reflection Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Tự vấn Kakeibo
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('weekly')}
              >
                Hàng tuần
              </Button>
              <Button
                variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('monthly')}
              >
                Hàng tháng
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <PenTool className="h-4 w-4" />
              <AlertDescription>
                Dành thời gian suy ngẫm về thói quen chi tiêu của bạn. Điều này sẽ giúp bạn chi tiêu có ý thức hơn.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {KAKEIBO_QUESTIONS[selectedPeriod].map((question, index) => {
                const key = `${selectedPeriod}_${index}`
                const currentAnswer = reflectionNotes[key] || ''

                return (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {index + 1}. {question}
                    </Label>
                    <Textarea
                      placeholder="Viết suy nghĩ của bạn..."
                      value={currentAnswer}
                      onChange={(e) => setReflectionNotes(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      onBlur={() => handleReflectionSave(index, currentAnswer)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                )
              })}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>
                  Mục tiêu: Trở nên có ý thức hơn trong việc chi tiêu và tìm ra cách cải thiện thói quen tài chính.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kakeibo Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lời khuyên Kakeibo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h5 className="font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Sinh tồn (Survival)
              </h5>
              <p className="text-sm text-muted-foreground">
                Chỉ bao gồm những thứ thực sự cần thiết. Hãy tự hỏi: "Tôi có thể sống mà không có điều này không?"
              </p>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-blue-500" />
                Tùy chọn (Optional)
              </h5>
              <p className="text-sm text-muted-foreground">
                Những thứ làm cuộc sống thoải mái hơn. Cân nhắc kỹ trước khi mua.
              </p>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-green-500" />
                Văn hóa (Culture)
              </h5>
              <p className="text-sm text-muted-foreground">
                Đầu tư vào bản thân. Sách, khóa học, trải nghiệm học hỏi mới.
              </p>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Phụ trội (Extra)
              </h5>
              <p className="text-sm text-muted-foreground">
                Dành cho những chi phí bất ngờ. Tốt nhất nên không sử dụng hết.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}