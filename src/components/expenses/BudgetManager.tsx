// src/components/expenses/BudgetManager.tsx
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
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  PieChart,
  DollarSign,
  AlertCircle,
  PiggyBank
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { vi } from 'date-fns/locale'
import { FiftyThirtyTwentyBudgetForm } from './FiftyThirtyTwentyBudgetForm'

const createBudgetSchema = (t: any) => z.object({
  name: z.string().min(1, t('budgetNameRequired')),
  description: z.string().optional(),
  budget_period: z.enum(['weekly', 'monthly', 'yearly']),
  total_budget: z.number().positive(t('budgetAmountRequired')),
  alert_threshold_percentage: z.number().min(50).max(100).optional(),
  category_budgets: z.record(z.string(), z.number().min(0)).optional(),
})

type FormData = z.infer<ReturnType<typeof createBudgetSchema>>

interface Category {
  id: string
  name_vi: string
  name_en: string
  icon: string
  color: string
}

interface Budget {
  id: string
  name: string
  description?: string
  budget_period: 'weekly' | 'monthly' | 'yearly'
  budget_method?: string
  total_budget: number
  current_spent: number
  remaining_amount: number
  progress_percentage: number
  alert_threshold_percentage?: number
  start_date: string
  end_date: string
  is_active: boolean
  category_allocations?: Array<{
    id: string
    allocated_amount: number
    spent_amount: number
    remaining_amount: number
    category: Category
  }>
  spending_by_category?: Record<string, number>
  budget_allocation?: Record<string, number>
  category_mapping?: Record<string, string>
}

interface BudgetManagerProps {
  categories: Category[]
  initialBudgets?: Budget[]
  onBudgetCreate?: (budget: Budget) => void
  onBudgetUpdate?: (budget: Budget) => void
  onBudgetDelete?: (budgetId: string) => void
}

export function BudgetManager({
  categories,
  initialBudgets = [],
  onBudgetCreate,
  onBudgetUpdate,
  onBudgetDelete
}: BudgetManagerProps) {
  const t = useTranslations('BudgetManager')
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<Date>(new Date())
  const [budgetMethod, setBudgetMethod] = useState<'manual' | '50_30_20' | '6_jars'>('manual')

  const form = useForm<FormData>({
    resolver: zodResolver(createBudgetSchema(t)),
    defaultValues: {
      budget_period: 'monthly',
      alert_threshold_percentage: 80,
      category_budgets: {}
    }
  })

  // Get current period budgets
  const getCurrentPeriodBudgets = () => {
    return budgets.filter(budget => {
      const budgetStart = new Date(budget.start_date)
      const budgetEnd = new Date(budget.end_date)
      const currentStart = startOfMonth(selectedPeriod)
      const currentEnd = endOfMonth(selectedPeriod)
      
      return budget.is_active && 
             budgetStart <= currentEnd && 
             budgetEnd >= currentStart
    })
  }

  const currentBudgets = getCurrentPeriodBudgets()
  const totalBudget = currentBudgets.reduce((sum, budget) => sum + budget.total_budget, 0)
  const totalSpent = currentBudgets.reduce((sum, budget) => sum + budget.current_spent, 0)
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const refreshBudgets = async () => {
    try {
      const response = await fetch('/api/expenses/budgets?active=true')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data.budgets)
      }
    } catch (error) {
      console.error('Error refreshing budgets:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const currentDate = new Date()
      let startDate: Date, endDate: Date

      // Calculate period dates
      if (data.budget_period === 'monthly') {
        startDate = startOfMonth(currentDate)
        endDate = endOfMonth(currentDate)
      } else if (data.budget_period === 'weekly') {
        startDate = new Date(currentDate)
        startDate.setDate(currentDate.getDate() - currentDate.getDay())
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
      } else { // yearly
        startDate = new Date(currentDate.getFullYear(), 0, 1)
        endDate = new Date(currentDate.getFullYear(), 11, 31)
      }

      const budgetData = {
        ...data,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      }

      const url = editingBudget ? `/api/expenses/budgets/${editingBudget.id}` : '/api/expenses/budgets'
      const method = editingBudget ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save budget')
      }

      const result = await response.json()
      const savedBudget = result.budget

      if (editingBudget) {
        setBudgets(prev => prev.map(b => b.id === editingBudget.id ? savedBudget : b))
        onBudgetUpdate?.(savedBudget)
        toast.success(t('budgetUpdated'))
      } else {
        setBudgets(prev => [...prev, savedBudget])
        onBudgetCreate?.(savedBudget)
        toast.success(t('budgetCreated'))
      }

      form.reset()
      setIsCreateDialogOpen(false)
      setEditingBudget(null)

    } catch (error) {
      console.error('Error saving budget:', error)
      toast.error(error instanceof Error ? error.message : t('errorSaving'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    form.reset({
      name: budget.name,
      description: budget.description,
      budget_period: budget.budget_period,
      total_budget: budget.total_budget,
      alert_threshold_percentage: budget.alert_threshold_percentage || 80,
      category_budgets: budget.category_allocations?.reduce((acc, allocation) => {
        acc[allocation.category.id] = allocation.allocated_amount
        return acc
      }, {} as Record<string, number>) || {}
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (budgetId: string) => {
    if (!confirm(t('confirmDelete'))) return

    try {
      const response = await fetch(`/api/expenses/budgets/${budgetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete budget')
      }

      setBudgets(prev => prev.filter(b => b.id !== budgetId))
      onBudgetDelete?.(budgetId)
      toast.success(t('budgetDeleted'))

    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error(t('errorDeleting'))
    }
  }

  const getBudgetStatus = (budget: Budget) => {
    if (budget.progress_percentage > 100) return 'over'
    if (budget.progress_percentage > (budget.alert_threshold_percentage || 80)) return 'warning'
    return 'good'
  }

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'text-red-600 dark:text-red-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-green-600 dark:text-green-400'
    }
  }

  const getBudgetStatusIcon = (status: string) => {
    switch (status) {
      case 'over': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingBudget(null)
              form.reset({
                budget_period: 'monthly',
                alert_threshold_percentage: 80,
                category_budgets: {}
              })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('createBudget')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? t('editBudget') : t('createNewBudget')}
              </DialogTitle>
            </DialogHeader>

            {/* Budget Method Selection */}
            {!editingBudget && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Choose Budget Method</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a budgeting methodology that fits your financial goals.
                  </p>
                </div>
                
                <div className="grid gap-3 md:grid-cols-3">
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      budgetMethod === 'manual' && "ring-2 ring-primary"
                    )}
                    onClick={() => setBudgetMethod('manual')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium">Manual Budget</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Create a custom budget by manually allocating amounts to categories.
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      budgetMethod === '50_30_20' && "ring-2 ring-primary"
                    )}
                    onClick={() => setBudgetMethod('50_30_20')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-green-500" />
                        <h3 className="font-medium">50/30/20 Rule</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Simple rule: 50% needs, 30% wants, 20% savings & debt.
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      budgetMethod === '6_jars' && "ring-2 ring-primary opacity-50 cursor-not-allowed"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <PiggyBank className="h-5 w-5 text-purple-500" />
                        <h3 className="font-medium">6 Jars Method</h3>
                        <Badge variant="secondary" className="text-xs">Soon</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        T. Harv Eker&apos;s wealth building system with 6 allocation jars.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Render appropriate form based on method */}
            {budgetMethod === '50_30_20' && !editingBudget ? (
              <FiftyThirtyTwentyBudgetForm
                categories={categories}
                onSubmit={async (budgetData) => {
                  try {
                    const response = await fetch('/api/expenses/budgets', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(budgetData),
                    })

                    if (!response.ok) {
                      const errorData = await response.json()
                      throw new Error(errorData.error || 'Failed to create budget')
                    }

                    const result = await response.json()
                    const savedBudget = result.budget

                    setBudgets(prev => [...prev, savedBudget])
                    onBudgetCreate?.(savedBudget)
                    toast.success('50/30/20 Budget created successfully!')

                    setIsCreateDialogOpen(false)
                    setBudgetMethod('manual')
                  } catch (error) {
                    console.error('Error creating budget:', error)
                    toast.error(error instanceof Error ? error.message : 'Failed to create budget')
                  }
                }}
                onCancel={() => {
                  setIsCreateDialogOpen(false)
                  setBudgetMethod('manual')
                }}
              />
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('budgetName')}</Label>
                  <Input
                    placeholder={t('budgetNamePlaceholder')}
                    {...form.register('name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('period')}</Label>
                  <Select
                    value={form.watch('budget_period')}
                    onValueChange={(value: any) => form.setValue('budget_period', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">{t('weekly')}</SelectItem>
                      <SelectItem value="monthly">{t('monthly')}</SelectItem>
                      <SelectItem value="yearly">{t('yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('description')}</Label>
                <Input
                  placeholder={t('descriptionPlaceholder')}
                  {...form.register('description')}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('totalBudget')}</Label>
                  <Input
                    type="number"
                    step="10000"
                    min="0"
                    placeholder="0"
                    {...form.register('total_budget', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('alertThreshold')}</Label>
                  <Input
                    type="number"
                    min="50"
                    max="100"
                    placeholder="80"
                    {...form.register('alert_threshold_percentage', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>{t('categoryAllocation')}</Label>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="flex-1 text-sm">{category.name_vi}</span>
                      <Input
                        type="number"
                        min="0"
                        step="10000"
                        placeholder="0"
                        className="w-32"
                        {...form.register(`category_budgets.${category.id}`, { valueAsNumber: true })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('saving') : editingBudget ? t('update') : t('createBudgetAction')}
                </Button>
              </div>
            </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Period Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedPeriod(subMonths(selectedPeriod, 1))}
        >
          {t('previousMonth')}
        </Button>
        <div className="flex items-center gap-2 min-w-[200px] justify-center">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">
            {format(selectedPeriod, 'MMMM yyyy', { locale: vi })}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedPeriod(addMonths(selectedPeriod, 1))}
          disabled={selectedPeriod >= new Date()}
        >
          {t('nextMonth')}
        </Button>
      </div>

      {/* Overall Progress */}
      {currentBudgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t('budgetOverview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('totalSpending')}</span>
                <span className="font-semibold">
                  {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                </span>
              </div>
              
              <Progress 
                value={Math.min(overallProgress, 100)} 
                className="h-3"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{overallProgress.toFixed(1)}% {t('used')}</span>
                <span className={cn(
                  totalBudget - totalSpent < 0 ? "text-red-600" : "text-green-600"
                )}>
                  {totalBudget - totalSpent >= 0 ? t('remaining') : t('exceeded')}: {formatCurrency(Math.abs(totalBudget - totalSpent))}
                </span>
              </div>

              {overallProgress > 100 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t('exceedsBudget')} {formatCurrency(totalSpent - totalBudget)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget List */}
      {currentBudgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noBudgets')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('noBudgetsDescription')}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('createFirstBudget')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentBudgets.map((budget) => {
            const status = getBudgetStatus(budget)
            
            return (
              <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{budget.name}</CardTitle>
                      {budget.description && (
                        <p className="text-sm text-muted-foreground">
                          {budget.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {getBudgetStatusIcon(status)}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(budget)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('spending')}</span>
                      <span className={cn("font-medium", getBudgetStatusColor(status))}>
                        {formatCurrency(budget.current_spent)} / {formatCurrency(budget.total_budget)}
                      </span>
                    </div>
                    
                    <Progress 
                      value={Math.min(budget.progress_percentage, 100)}
                      className="h-2"
                    />
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {budget.progress_percentage.toFixed(1)}% {t('used')}
                      </span>
                      <span className={cn(
                        budget.remaining_amount < 0 ? "text-red-600" : "text-green-600"
                      )}>
                        {budget.remaining_amount >= 0 ? t('remaining') : t('exceeded')}: {formatCurrency(Math.abs(budget.remaining_amount))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <Badge variant="outline" className="text-xs">
                      {budget.budget_period === 'weekly' ? t('week') : 
                       budget.budget_period === 'monthly' ? t('month') : t('year')}
                    </Badge>
                    <span>
                      {format(new Date(budget.start_date), 'dd/MM')} - {format(new Date(budget.end_date), 'dd/MM')}
                    </span>
                  </div>

                  {/* Category breakdown preview */}
                  {budget.category_allocations && budget.category_allocations.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <p className="text-xs font-medium">{t('byCategory')}:</p>
                      {budget.category_allocations.slice(0, 3).map((allocation) => (
                        <div key={allocation.id} className="flex items-center gap-2 text-xs">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: allocation.category.color }}
                          />
                          <span className="flex-1 truncate">{allocation.category.name_vi}</span>
                          <span className={cn(
                            allocation.spent_amount > allocation.allocated_amount 
                              ? "text-red-600" : "text-muted-foreground"
                          )}>
                            {formatCurrency(allocation.spent_amount)}/{formatCurrency(allocation.allocated_amount)}
                          </span>
                        </div>
                      ))}
                      {budget.category_allocations.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{budget.category_allocations.length - 3} {t('moreCategories')}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}