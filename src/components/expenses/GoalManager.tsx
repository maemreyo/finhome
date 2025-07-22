// src/components/expenses/GoalManager.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Home,
  Car,
  GraduationCap,
  Plane,
  PiggyBank,
  Star,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowRight,
  Gift,
  Lightbulb,
  AlertTriangle
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { format, addMonths, differenceInMonths, differenceInDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { GoalAdviceSection } from './GoalAdviceSection'

const createGoalSchema = (t: any) => z.object({
  name: z.string().min(1, t('goalNameRequired')),
  description: z.string().optional(),
  goal_type: z.enum(['general_savings', 'emergency_fund', 'vacation', 'education', 'buy_house', 'buy_car', 'other']),
  target_amount: z.number().positive(t('targetAmountRequired')),
  monthly_target: z.number().positive().optional(),
  target_date: z.string().optional(),
  deadline: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  house_purchase_data: z.object({
    property_type: z.string().optional(),
    preferred_location: z.string().optional(),
    budget_range: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    timeline_months: z.number().optional(),
    down_payment_percentage: z.number().min(10).max(100).optional(),
  }).optional(),
})

type FormData = z.infer<typeof createGoalSchema>

interface Goal {
  id: string
  name: string
  description?: string
  goal_type: string
  target_amount: number
  current_amount: number
  progress_percentage: number
  monthly_target?: number
  target_date?: string
  deadline?: string
  icon?: string
  color?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  house_purchase_data?: {
    property_type?: string
    preferred_location?: string
    budget_range?: { min?: number; max?: number }
    timeline_months?: number
    down_payment_percentage?: number
    funnel_stage?: string
  }
  contributions?: Array<{
    id: string
    amount: number
    contribution_date: string
    description?: string
  }>
  months_remaining?: number
  required_monthly_savings?: number
  is_on_track?: boolean
  created_at: string
}

interface Wallet {
  id: string
  name: string
  balance: number
  icon: string
  color: string
}

interface GoalManagerProps {
  goals: Goal[]
  wallets: Wallet[]
  onGoalCreate?: (goal: Goal) => void
  onGoalUpdate?: (goal: Goal) => void
  onGoalDelete?: (goalId: string) => void
  onContribution?: (goalId: string, amount: number) => void
}

const GOAL_TYPES = [
  { key: 'general_savings', label: 'Tiết kiệm chung', icon: PiggyBank, color: '#10B981' },
  { key: 'emergency_fund', label: 'Quỹ khẩn cấp', icon: AlertTriangle, color: '#F59E0B' },
  { key: 'buy_house', label: 'Mua nhà', icon: Home, color: '#3B82F6' },
  { key: 'buy_car', label: 'Mua xe', icon: Car, color: '#8B5CF6' },
  { key: 'vacation', label: 'Du lịch', icon: Plane, color: '#06B6D4' },
  { key: 'education', label: 'Giáo dục', icon: GraduationCap, color: '#F97316' },
  { key: 'other', label: 'Khác', icon: Star, color: '#6B7280' },
]

const HOUSE_PURCHASE_STAGES = {
  'initial': { label: 'Mới bắt đầu', color: '#6B7280', description: 'Vừa tạo mục tiêu mua nhà' },
  'researching': { label: 'Nghiên cứu', color: '#F59E0B', description: 'Đang tìm hiểu về thị trường' },
  'ready_to_view': { label: 'Sẵn sàng xem nhà', color: '#3B82F6', description: 'Đã có kế hoạch tài chính rõ ràng' },
  'qualified_lead': { label: 'Khách hàng tiềm năng', color: '#10B981', description: 'Sẵn sàng thực hiện giao dịch' },
}

export function GoalManager({
  goals,
  wallets,
  onGoalCreate,
  onGoalUpdate,
  onGoalDelete,
  onContribution
}: GoalManagerProps) {
  const t = useTranslations('GoalManager')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [contributionAmount, setContributionAmount] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [showAdvice, setShowAdvice] = useState<Set<string>>(new Set())

  const form = useForm<FormData>({
    // resolver: zodResolver(createGoalSchema),
    defaultValues: {
      goal_type: 'general_savings',
      house_purchase_data: {
        down_payment_percentage: 20
      }
    }
  })

  const watchGoalType = form.watch('goal_type')

  const getGoalTypeInfo = (type: string) => {
    return GOAL_TYPES.find(t => t.key === type) || GOAL_TYPES[0]
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const url = editingGoal ? `/api/expenses/goals/${editingGoal.id}` : '/api/expenses/goals'
      const method = editingGoal ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save goal')
      }

      const result = await response.json()
      const savedGoal = result.goal

      if (editingGoal) {
        onGoalUpdate?.(savedGoal)
        toast.success(t('goalUpdated'))
      } else {
        onGoalCreate?.(savedGoal)
        toast.success(t('goalCreated'))
      }

      form.reset()
      setIsCreateDialogOpen(false)
      setEditingGoal(null)

    } catch (error) {
      console.error('Error saving goal:', error)
      toast.error(error instanceof Error ? error.message : t('errorSaving'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContribution = async () => {
    if (!selectedGoal || !contributionAmount || !selectedWallet) {
      toast.error(t('fillAllFields'))
      return
    }

    try {
      const response = await fetch(`/api/expenses/goals/${selectedGoal.id}/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(contributionAmount),
          wallet_id: selectedWallet,
          description: t('contributionDescription', { goalName: selectedGoal.name })
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add contribution')
      }

      onContribution?.(selectedGoal.id, parseFloat(contributionAmount))
      toast.success(t('contributionAdded'))
      
      setSelectedGoal(null)
      setContributionAmount('')
      setSelectedWallet('')

    } catch (error) {
      console.error('Error adding contribution:', error)
      toast.error(t('errorAddingContribution'))
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    form.reset({
      name: goal.name,
      description: goal.description,
      goal_type: goal.goal_type as any,
      target_amount: goal.target_amount,
      monthly_target: goal.monthly_target,
      target_date: goal.target_date,
      deadline: goal.deadline,
      house_purchase_data: goal.house_purchase_data
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm(t('confirmDelete'))) return

    try {
      const response = await fetch(`/api/expenses/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete goal')
      }

      onGoalDelete?.(goalId)
      toast.success(t('goalDeleted'))

    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error(t('errorDeleting'))
    }
  }

  const getGoalStatusColor = (goal: Goal) => {
    if (goal.status === 'completed') return 'text-green-600 dark:text-green-400'
    if (goal.is_on_track === false) return 'text-red-600 dark:text-red-400'
    if (goal.progress_percentage > 75) return 'text-blue-600 dark:text-blue-400'
    return 'text-muted-foreground'
  }

  const getTimeUntilDeadline = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date())
    if (days < 0) return t('overdue')
    if (days === 0) return t('today')
    if (days === 1) return t('tomorrow')
    if (days < 30) return t('daysLeft', { count: days })
    
    const months = differenceInMonths(new Date(deadline), new Date())
    return t('monthsLeft', { count: months })
  }

  const toggleAdvice = (goalId: string) => {
    setShowAdvice(prev => {
      const newSet = new Set(prev)
      if (newSet.has(goalId)) {
        newSet.delete(goalId)
      } else {
        newSet.add(goalId)
      }
      return newSet
    })
  }

  // Filter goals by type
  const houseGoals = goals.filter(g => g.goal_type === 'buy_house')
  const otherGoals = goals.filter(g => g.goal_type !== 'buy_house')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingGoal(null)
              form.reset({
                goal_type: 'general_savings',
                house_purchase_data: { down_payment_percentage: 20 }
              })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('createGoal')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? t('editGoal') : t('createNewGoal')}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('goalName')}</Label>
                  <Input
                    placeholder={t('goalNamePlaceholder')}
                    {...form.register('name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('goalType')}</Label>
                  <Select
                    value={watchGoalType}
                    onValueChange={(value: any) => form.setValue('goal_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_TYPES.map((type) => {
                        const Icon = type.icon
                        return (
                          <SelectItem key={type.key} value={type.key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" style={{ color: type.color }} />
                              {t(type.key)}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('description')}</Label>
                <Textarea
                  placeholder={t('descriptionPlaceholder')}
                  {...form.register('description')}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('targetAmount')}</Label>
                  <Input
                    type="number"
                    step="1000000"
                    min="0"
                    placeholder="0"
                    {...form.register('target_amount', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('monthlyTarget')}</Label>
                  <Input
                    type="number"
                    step="100000"
                    min="0"
                    placeholder="0"
                    {...form.register('monthly_target', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('targetDate')}</Label>
                  <Input
                    type="date"
                    {...form.register('target_date')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('deadline')}</Label>
                  <Input
                    type="date"
                    {...form.register('deadline')}
                  />
                </div>
              </div>

              {/* House Purchase Specific Fields */}
              {watchGoalType === 'buy_house' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">{t('housePurchaseInfo')}</h4>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('propertyType')}</Label>
                        <Select
                          value={form.watch('house_purchase_data.property_type') || ''}
                          onValueChange={(value) => form.setValue('house_purchase_data.property_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">{t('apartment')}</SelectItem>
                            <SelectItem value="house">{t('house')}</SelectItem>
                            <SelectItem value="villa">{t('villa')}</SelectItem>
                            <SelectItem value="townhouse">{t('townhouse')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('preferredLocation')}</Label>
                        <Input
                          placeholder={t('preferredLocationPlaceholder')}
                          {...form.register('house_purchase_data.preferred_location')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('downPaymentPercentage')}</Label>
                      <Input
                        type="number"
                        min="10"
                        max="100"
                        placeholder="20"
                        {...form.register('house_purchase_data.down_payment_percentage', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('minBudget')}</Label>
                        <Input
                          type="number"
                          step="1000000"
                          min="0"
                          placeholder="1000000000"
                          {...form.register('house_purchase_data.budget_range.min', { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('maxBudget')}</Label>
                        <Input
                          type="number"
                          step="1000000"
                          min="0"
                          placeholder="3000000000"
                          {...form.register('house_purchase_data.budget_range.max', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('saving') : editingGoal ? t('update') : t('createGoalAction')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* House Purchase Goals Section */}
      {houseGoals.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-500" />
            <h3 className="text-2xl font-semibold">{t('houseGoalsTitle')}</h3>
            <Badge variant="secondary">{houseGoals.length}</Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {houseGoals.map((goal) => {
              const typeInfo = getGoalTypeInfo(goal.goal_type)
              const Icon = typeInfo.icon
              const stage = goal.house_purchase_data?.funnel_stage || 'initial'
              const stageInfo = HOUSE_PURCHASE_STAGES[stage as keyof typeof HOUSE_PURCHASE_STAGES]

              return (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow border-l-4" 
                      style={{ borderLeftColor: typeInfo.color }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" style={{ color: typeInfo.color }} />
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          {goal.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        
                        {/* House Purchase Stage */}
                        <Badge variant="outline" style={{ borderColor: stageInfo.color, color: stageInfo.color }}>
                          {t(stage)}
                        </Badge>
                        
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(goal)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(goal.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('progress')}</span>
                        <span className={cn("font-medium", getGoalStatusColor(goal))}>
                          {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                        </span>
                      </div>
                      
                      <Progress value={Math.min(goal.progress_percentage, 100)} className="h-3" />
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {goal.progress_percentage.toFixed(1)}% {t('completed')}
                        </span>
                        <span className={cn(
                          goal.is_on_track ? "text-green-600" : "text-red-600"
                        )}>
                          {goal.is_on_track ? t('onTrack') : t('behindSchedule')}
                        </span>
                      </div>
                    </div>

                    {/* House Purchase Details */}
                    {goal.house_purchase_data && (
                      <div className="space-y-2 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {goal.house_purchase_data.property_type && (
                            <div>
                              <span className="text-muted-foreground">{t('type')}: </span>
                              <span className="font-medium">
                                {t(goal.house_purchase_data.property_type)}
                              </span>
                            </div>
                          )}
                          {goal.house_purchase_data.preferred_location && (
                            <div>
                              <span className="text-muted-foreground">{t('area')}: </span>
                              <span className="font-medium">{goal.house_purchase_data.preferred_location}</span>
                            </div>
                          )}
                          {goal.house_purchase_data.down_payment_percentage && (
                            <div>
                              <span className="text-muted-foreground">{t('downPayment')}: </span>
                              <span className="font-medium">{goal.house_purchase_data.down_payment_percentage}%</span>
                            </div>
                          )}
                          {goal.house_purchase_data.budget_range && (
                            <div>
                              <span className="text-muted-foreground">{t('budget')}: </span>
                              <span className="font-medium">
                                {goal.house_purchase_data.budget_range.min ? 
                                  `${formatCurrency(goal.house_purchase_data.budget_range.min, { compact: true })} - ${formatCurrency(goal.house_purchase_data.budget_range.max || 0, { compact: true })}` :
                                  t('undefined')
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {(goal.target_date || goal.deadline) && (
                      <div className="flex items-center justify-between text-xs">
                        {goal.target_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{t('target')}: {format(new Date(goal.target_date), 'dd/MM/yyyy', { locale: vi })}</span>
                          </div>
                        )}
                        {goal.deadline && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{t('deadline')}: {getTimeUntilDeadline(goal.deadline)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Monthly target info */}
                    {goal.required_monthly_savings && (
                      <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {t('requiredMonthlySavings', { amount: formatCurrency(goal.required_monthly_savings) })}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Enhanced Financial Advice Section */}
                    <div className="border-t pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mb-3"
                        onClick={() => toggleAdvice(goal.id)}
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        {showAdvice.has(goal.id) ? 'Ẩn gợi ý tài chính' : 'Xem gợi ý tài chính'}
                        <ArrowRight className={`h-4 w-4 ml-2 transition-transform ${showAdvice.has(goal.id) ? 'rotate-90' : ''}`} />
                      </Button>
                      
                      {showAdvice.has(goal.id) && (
                        <div className="mt-4">
                          <GoalAdviceSection
                            goalId={goal.id}
                            goalName={goal.name}
                            goalType={goal.goal_type}
                            onAdviceUpdate={() => {
                              // Refresh goals data if needed
                              onGoalUpdate?.(goal)
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* House Purchase CTA */}
                    {goal.progress_percentage > 25 && stage !== 'initial' && (
                      <div className="border-t pt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            // This would redirect to the main FinHome real estate app
                            window.open('/properties?goal_id=' + goal.id, '_blank')
                          }}
                        >
                          <Home className="h-4 w-4 mr-2" />
                          {t('viewSuitableProperties')}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}

                    {/* Quick contribute button */}
                    <div className="border-t pt-3">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedGoal(goal)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('contribute')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Other Goals Section */}
      {otherGoals.length > 0 && (
        <div className="space-y-6">
          {houseGoals.length > 0 && <Separator />}
          
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-green-500" />
            <h3 className="text-2xl font-semibold">{t('otherGoalsTitle')}</h3>
            <Badge variant="secondary">{otherGoals.length}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherGoals.map((goal) => {
              const typeInfo = getGoalTypeInfo(goal.goal_type)
              const Icon = typeInfo.icon

              return (
                <Card key={goal.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: typeInfo.color }} />
                          <CardTitle className="text-base">{goal.name}</CardTitle>
                        </div>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(goal)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(goal.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t('progress')}</span>
                        <span className="font-medium">
                          {formatCurrency(goal.current_amount, { compact: true })} / {formatCurrency(goal.target_amount, { compact: true })}
                        </span>
                      </div>
                      
                      <Progress value={Math.min(goal.progress_percentage, 100)} className="h-2" />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{goal.progress_percentage.toFixed(1)}%</span>
                        <span>{goal.is_on_track ? t('onTrackShort') : t('behindScheduleShort')}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedGoal(goal)}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        {t('contribute')}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-xs"
                        onClick={() => toggleAdvice(goal.id)}
                      >
                        <Lightbulb className="h-3 w-3 mr-2" />
                        {showAdvice.has(goal.id) ? 'Ẩn gợi ý' : 'Gợi ý tài chính'}
                      </Button>
                    </div>

                    {showAdvice.has(goal.id) && (
                      <div className="border-t pt-3 mt-3">
                        <GoalAdviceSection
                          goalId={goal.id}
                          goalName={goal.name}
                          goalType={goal.goal_type}
                          onAdviceUpdate={() => {
                            // Refresh goals data if needed
                            onGoalUpdate?.(goal)
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* No goals state */}
      {goals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noGoals')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('noGoalsDescription')}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('createFirstGoal')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contribution Dialog */}
      <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('contributeToGoal')}</DialogTitle>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">{selectedGoal.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('current')}: {formatCurrency(selectedGoal.current_amount)} / {formatCurrency(selectedGoal.target_amount)}
                </p>
                <Progress value={Math.min(selectedGoal.progress_percentage, 100)} className="h-2 mt-2" />
              </div>

              <div className="space-y-2">
                <Label>{t('contributionAmount')}</Label>
                <Input
                  type="number"
                  step="10000"
                  min="0"
                  placeholder="0"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('fromWallet')}</Label>
                <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectWallet')} />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: wallet.color }}
                          />
                          <span>{wallet.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatCurrency(wallet.balance, { compact: true })})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedGoal(null)}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleContribution}>
                  {t('contribute')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}