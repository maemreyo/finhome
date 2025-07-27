// src/components/expenses/KakeiboBudgetForm.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Heart,
  ShoppingBag,
  Utensils,
  GraduationCap,
  Calculator,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Target
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { DynamicIcon } from '@/lib/utils/icon-utils'
import { startOfMonth, endOfMonth } from 'date-fns'

const kakeiboBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  budget_period: z.enum(['weekly', 'monthly', 'yearly']),
  total_budget: z.number().positive('Total budget must be positive'),
  alert_threshold_percentage: z.number().min(50).max(100),
  survival_budget: z.number().min(0),
  optional_budget: z.number().min(0), 
  culture_budget: z.number().min(0),
  extra_budget: z.number().min(0),
  category_mapping: z.record(z.string(), z.enum(['survival', 'optional', 'culture', 'extra'])),
  description: z.string().optional(),
})

type FormData = z.infer<typeof kakeiboBudgetSchema>

// Kakeibo groups with Vietnamese translations
const KAKEIBO_GROUPS = {
  survival: {
    name_en: 'Survival (Needs)',
    name_vi: 'Sinh tồn (Nhu cầu thiết yếu)',
    description_en: 'Essential expenses like food, housing, utilities, transportation',
    description_vi: 'Chi phí thiết yếu như thức ăn, nhà ở, tiện ích, đi lại',
    icon: Heart,
    color: '#EF4444',
    suggested_percentage: 50
  },
  optional: {
    name_en: 'Optional (Wants)', 
    name_vi: 'Tùy chọn (Mong muốn)',
    description_en: 'Entertainment, dining out, hobbies, non-essential shopping',
    description_vi: 'Giải trí, ăn uống, sở thích, mua sắm không thiết yếu',
    icon: ShoppingBag,
    color: '#3B82F6',
    suggested_percentage: 30
  },
  culture: {
    name_en: 'Culture (Self-improvement)',
    name_vi: 'Văn hóa (Tự hoàn thiện)',
    description_en: 'Education, books, courses, skill development, personal growth',
    description_vi: 'Giáo dục, sách, khóa học, phát triển kỹ năng, phát triển bản thân',
    icon: GraduationCap,
    color: '#10B981',
    suggested_percentage: 10
  },
  extra: {
    name_en: 'Extra (Unexpected)',
    name_vi: 'Phụ trội (Không lường trước)',
    description_en: 'Emergency expenses, unexpected costs, miscellaneous',
    description_vi: 'Chi phí khẩn cấp, chi phí không lường trước, linh tinh',
    icon: AlertCircle,
    color: '#F59E0B',
    suggested_percentage: 10
  }
} as const

interface Category {
  id: string
  name_vi: string
  name_en: string
  icon: string
  color: string
}

interface KakeiboBudgetFormProps {
  categories: Category[]
  onSubmit: (budgetData: any) => Promise<void>
  onCancel: () => void
}

export function KakeiboBudgetForm({ categories, onSubmit, onCancel }: KakeiboBudgetFormProps) {
  const t = useTranslations('BudgetManager')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'setup' | 'mapping' | 'reflection'>('setup')

  const form = useForm<FormData>({
    resolver: zodResolver(kakeiboBudgetSchema),
    defaultValues: {
      name: 'Ngân sách Kakeibo',
      budget_period: 'monthly',
      alert_threshold_percentage: 80,
      survival_budget: 0,
      optional_budget: 0,
      culture_budget: 0,
      extra_budget: 0,
      category_mapping: {}
    }
  })

  const watchedValues = form.watch()
  const totalAllocated = (watchedValues.survival_budget || 0) + 
                        (watchedValues.optional_budget || 0) + 
                        (watchedValues.culture_budget || 0) + 
                        (watchedValues.extra_budget || 0)
  
  const totalBudget = watchedValues.total_budget || 0
  const remainingBudget = totalBudget - totalAllocated

  // Auto-calculate suggested amounts when total budget changes
  const handleTotalBudgetChange = (value: number) => {
    form.setValue('total_budget', value)
    
    // Auto-fill with suggested percentages
    const survival = Math.round(value * 0.5)
    const optional = Math.round(value * 0.3) 
    const culture = Math.round(value * 0.1)
    const extra = Math.round(value * 0.1)
    
    form.setValue('survival_budget', survival)
    form.setValue('optional_budget', optional)
    form.setValue('culture_budget', culture)
    form.setValue('extra_budget', extra)
  }

  const handleCategoryMapping = (categoryId: string, group: keyof typeof KAKEIBO_GROUPS) => {
    const currentMapping = form.getValues('category_mapping') || {}
    form.setValue('category_mapping', {
      ...currentMapping,
      [categoryId]: group
    })
  }

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    try {
      const currentDate = new Date()
      const startDate = startOfMonth(currentDate)
      const endDate = endOfMonth(currentDate)

      // Create category budgets based on mapping
      const categoryBudgets: Record<string, number> = {}
      Object.entries(data.category_mapping).forEach(([categoryId, group]) => {
        const groupBudget = data[`${group}_budget`] || 0
        const categoriesInGroup = Object.entries(data.category_mapping).filter(([_, g]) => g === group)
        const budgetPerCategory = groupBudget / categoriesInGroup.length
        categoryBudgets[categoryId] = budgetPerCategory
      })

      const budgetData = {
        name: data.name,
        description: data.description,
        budget_period: data.budget_period,
        budget_method: 'kakeibo',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_budget: data.total_budget,
        alert_threshold_percentage: data.alert_threshold_percentage,
        category_budgets: categoryBudgets,
        budget_allocation: {
          survival: data.survival_budget,
          optional: data.optional_budget,
          culture: data.culture_budget,
          extra: data.extra_budget
        },
        category_mapping: data.category_mapping
      }

      await onSubmit(budgetData)
      
    } catch (error) {
      console.error('Error creating Kakeibo budget:', error)
      toast.error('Failed to create Kakeibo budget')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'setup') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <h3 className="text-xl font-bold">Phương pháp Kakeibo</h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Kakeibo là phương pháp quản lý tiền của Nhật Bản tập trung vào việc ghi chép chi tiêu có ý thức. 
            Bạn sẽ phân chia ngân sách thành 4 nhóm chính để theo dõi và tự vấn về thói quen chi tiêu.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(() => setStep('mapping'))} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tên ngân sách</Label>
              <Input
                placeholder="Ngân sách Kakeibo của tôi"
                {...form.register('name')}
              />
            </div>
            <div className="space-y-2">
              <Label>Chu kỳ</Label>
              <Select
                value={form.watch('budget_period')}
                onValueChange={(value: any) => form.setValue('budget_period', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Hàng tuần</SelectItem>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                  <SelectItem value="yearly">Hàng năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mô tả (tùy chọn)</Label>
            <Input
              placeholder="Ngân sách theo phương pháp Kakeibo nhằm tăng cường ý thức chi tiêu"
              {...form.register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label>Tổng ngân sách</Label>
            <Input
              type="number"
              step="10000"
              min="0"
              placeholder="0"
              {...form.register('total_budget', { 
                valueAsNumber: true,
                onChange: (e) => handleTotalBudgetChange(Number(e.target.value))
              })}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              <h4 className="font-medium">Phân bổ theo 4 nhóm Kakeibo</h4>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(KAKEIBO_GROUPS).map(([key, group]) => {
                const IconComponent = group.icon
                const budgetKey = `${key}_budget` as keyof FormData
                const currentValue = watchedValues[budgetKey] as number || 0
                const percentage = totalBudget > 0 ? (currentValue / totalBudget * 100) : 0

                return (
                  <Card key={key} className="relative">
                    <CardHeader className="pb-3">
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
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{group.name_vi}</h5>
                          <p className="text-xs text-muted-foreground">
                            Đề xuất: {group.suggested_percentage}%
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {group.description_vi}
                      </p>
                      <Input
                        type="number"
                        min="0"
                        step="10000"
                        placeholder="0"
                        {...form.register(budgetKey, { valueAsNumber: true })}
                      />
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-2"
                        style={{ 
                          backgroundColor: group.color + '20',
                        }}
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="font-medium">Tổng phân bổ:</span>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(totalAllocated)} / {formatCurrency(totalBudget)}
                </div>
                <div className={cn(
                  "text-sm",
                  remainingBudget === 0 ? "text-green-600" : 
                  remainingBudget > 0 ? "text-blue-600" : "text-red-600"
                )}>
                  {remainingBudget === 0 ? "Cân bằng hoàn hảo" :
                   remainingBudget > 0 ? `Còn lại: ${formatCurrency(remainingBudget)}` :
                   `Vượt quá: ${formatCurrency(Math.abs(remainingBudget))}`}
                </div>
              </div>
            </div>

            {remainingBudget !== 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {remainingBudget > 0 
                    ? "Bạn có thể phân bổ thêm ngân sách cho các nhóm."
                    : "Tổng phân bổ vượt quá ngân sách. Vui lòng điều chỉnh lại."
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={remainingBudget !== 0 || totalBudget <= 0}
            >
              Tiếp theo: Ánh xạ danh mục
            </Button>
          </div>
        </form>
      </div>
    )
  }

  if (step === 'mapping') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">Ánh xạ danh mục chi tiêu</h3>
          <p className="text-sm text-muted-foreground">
            Chỉ định từng danh mục chi tiêu vào các nhóm Kakeibo tương ứng
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => {
            const currentGroup = watchedValues.category_mapping?.[category.id]
            
            return (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <DynamicIcon 
                        name={category.icon || 'circle'} 
                        className="w-4 h-4" 
                        style={{ color: category.color }} 
                      />
                    </div>
                    <span className="font-medium">{category.name_vi}</span>
                  </div>
                  
                  <Select
                    value={currentGroup || ''}
                    onValueChange={(value) => handleCategoryMapping(category.id, value as keyof typeof KAKEIBO_GROUPS)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhóm Kakeibo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(KAKEIBO_GROUPS).map(([key, group]) => {
                        const IconComponent = group.icon
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <IconComponent 
                                className="h-4 w-4" 
                                style={{ color: group.color }} 
                              />
                              <span>{group.name_vi}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  
                  {currentGroup && (
                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: KAKEIBO_GROUPS[currentGroup].color + '10' }}>
                      <p className="text-xs text-muted-foreground">
                        {KAKEIBO_GROUPS[currentGroup].description_vi}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => setStep('setup')}>
            Quay lại
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button 
              onClick={() => setStep('reflection')}
              disabled={Object.keys(watchedValues.category_mapping || {}).length < categories.length}
            >
              Tiếp theo: Tự vấn
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Reflection step
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Target className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-bold">Tự vấn Kakeibo</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Trước khi hoàn thành, hãy suy ngẫm về mục tiêu tài chính của bạn
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4 câu hỏi cơ bản của Kakeibo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h5 className="font-medium">1. Bạn có bao nhiều tiền?</h5>
              <p className="text-sm text-muted-foreground">
                Tổng ngân sách: <span className="font-semibold">{formatCurrency(totalBudget)}</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium">2. Bạn muốn tiết kiệm bao nhiều?</h5>
              <p className="text-sm text-muted-foreground">
                Phần còn lại sau chi tiêu có thể dành để tiết kiệm và đầu tư.
              </p>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium">3. Bạn đã chi bao nhiều?</h5>
              <p className="text-sm text-muted-foreground">
                Bạn sẽ theo dõi điều này hàng ngày thông qua việc ghi chép chi tiêu.
              </p>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium">4. Làm thế nào để cải thiện?</h5>
              <p className="text-sm text-muted-foreground">
                Cuối mỗi tháng, hãy xem xét lại và điều chỉnh cho tháng tiếp theo.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tóm tắt ngân sách Kakeibo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(KAKEIBO_GROUPS).map(([key, group]) => {
                const IconComponent = group.icon
                const budgetKey = `${key}_budget` as keyof FormData
                const amount = watchedValues[budgetKey] as number || 0
                const percentage = totalBudget > 0 ? (amount / totalBudget * 100) : 0

                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <IconComponent 
                        className="h-4 w-4" 
                        style={{ color: group.color }} 
                      />
                      <span className="text-sm font-medium">{group.name_vi}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(amount)}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={() => setStep('mapping')}>
          Quay lại
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button 
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo ngân sách Kakeibo'}
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}