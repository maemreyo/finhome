// src/components/expenses/FiftyThirtyTwentyBudgetForm.tsx
// Specialized form for creating 50/30/20 rule budgets
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Target, 
  Heart, 
  PiggyBank, 
  DollarSign, 
  Calculator,
  Info,
  CheckCircle,
  TrendingUp,
  Plus
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { 
  fiftyThirtyTwentyConfig, 
  calculateBudgetAllocation, 
  CategoryMapping,
  calculateCategoryBudgets 
} from '@/lib/utils/budgetCalculations'
import { CategoryMappingDialog } from './CategoryMappingDialog'
import { toast } from 'sonner'

const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  description: z.string().optional(),
  budget_period: z.enum(['monthly', 'yearly']),
  monthly_income: z.number().positive('Monthly income must be greater than 0'),
})

type FormData = z.infer<typeof budgetSchema>

interface Category {
  id: string
  name_vi: string
  name_en: string
  icon: string
  color: string
  category_key?: string
}

interface FiftyThirtyTwentyBudgetFormProps {
  categories: Category[]
  onSubmit: (budgetData: any) => Promise<void>
  onCancel?: () => void
  className?: string
}

export function FiftyThirtyTwentyBudgetForm({
  categories,
  onSubmit,
  onCancel,
  className
}: FiftyThirtyTwentyBudgetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCategoryMapping, setShowCategoryMapping] = useState(false)
  const [categoryMapping, setCategoryMapping] = useState<CategoryMapping>({})
  const [hasCategoryMapping, setHasCategoryMapping] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '50/30/20 Budget',
      budget_period: 'monthly',
      monthly_income: 0
    }
  })

  const { watch } = form
  const monthlyIncome = watch('monthly_income')
  const budgetPeriod = watch('budget_period')

  // Calculate budget allocation
  const totalBudget = budgetPeriod === 'yearly' ? monthlyIncome * 12 : monthlyIncome
  const allocation = calculateBudgetAllocation('50_30_20', totalBudget)

  const handleCategoryMappingComplete = (mapping: CategoryMapping) => {
    setCategoryMapping(mapping)
    setHasCategoryMapping(true)
    setShowCategoryMapping(false)
    toast.success('Category mapping completed!')
  }

  const handleFormSubmit = async (data: FormData) => {
    if (!hasCategoryMapping) {
      toast.error('Please complete category mapping first')
      return
    }

    setIsSubmitting(true)

    try {
      const totalBudget = data.budget_period === 'yearly' ? data.monthly_income * 12 : data.monthly_income
      const allocation = calculateBudgetAllocation('50_30_20', totalBudget)
      const categoryBudgets = calculateCategoryBudgets('50_30_20', totalBudget, categoryMapping, categories)

      const budgetData = {
        name: data.name,
        description: data.description,
        budget_method: '50_30_20',
        budget_period: data.budget_period,
        total_budget: totalBudget,
        start_date: new Date().toISOString().split('T')[0],
        end_date: data.budget_period === 'monthly' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget_allocation: allocation,
        category_mapping: categoryMapping,
        category_budgets: categoryBudgets,
        alert_threshold_percentage: 80
      }

      await onSubmit(budgetData)
    } catch (error) {
      console.error('Error creating budget:', error)
      toast.error('Failed to create budget')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBudgetBreakdown = () => {
    return [
      {
        key: 'needs',
        name: 'Needs',
        amount: allocation.needs,
        percentage: 50,
        color: '#ef4444',
        icon: <Target className="h-4 w-4" />,
        description: 'Essential expenses you cannot avoid'
      },
      {
        key: 'wants',
        name: 'Wants',
        amount: allocation.wants,
        percentage: 30,
        color: '#f59e0b',
        icon: <Heart className="h-4 w-4" />,
        description: 'Lifestyle choices and entertainment'
      },
      {
        key: 'savings',
        name: 'Savings & Debt',
        amount: allocation.savings,
        percentage: 20,
        color: '#10b981',
        icon: <PiggyBank className="h-4 w-4" />,
        description: 'Savings and extra debt payments'
      }
    ]
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-500" />
            Create 50/30/20 Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Method Description */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The 50/30/20 rule is a simple budgeting framework: allocate 50% of your income to needs, 
              30% to wants, and 20% to savings and debt repayment.
            </AlertDescription>
          </Alert>

          {/* Basic Budget Information */}
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="My 50/30/20 Budget"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_period">Budget Period</Label>
                <Select onValueChange={(value: 'monthly' | 'yearly') => form.setValue('budget_period', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_income">Monthly Income</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="monthly_income"
                  type="number"
                  step="10000"
                  min="0"
                  className="pl-10"
                  {...form.register('monthly_income', { valueAsNumber: true })}
                  placeholder="Enter your monthly income"
                />
              </div>
              {form.formState.errors.monthly_income && (
                <p className="text-sm text-red-500">{form.formState.errors.monthly_income.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                {...form.register('description')}
                placeholder="Describe your budget goals..."
              />
            </div>

            {/* Budget Breakdown Preview */}
            {monthlyIncome > 0 && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <h3 className="font-medium mb-4">Budget Breakdown</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    {getBudgetBreakdown().map(item => (
                      <Card key={item.key} className="relative overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="p-2 rounded-full"
                              style={{ backgroundColor: `${item.color}20`, color: item.color }}
                            >
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-xl font-bold" style={{ color: item.color }}>
                              {formatCurrency(item.amount)}
                            </div>
                            <Progress 
                              value={item.percentage} 
                              className="h-2"
                              style={{ 
                                backgroundColor: `${item.color}20`,
                                ['--progress-background' as any]: item.color
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Total Budget Summary */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Total {budgetPeriod === 'yearly' ? 'Annual' : 'Monthly'} Budget</h4>
                        <p className="text-sm text-muted-foreground">
                          Based on {formatCurrency(monthlyIncome)}/month income
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(totalBudget)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {budgetPeriod === 'yearly' ? '12 months' : '1 month'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Category Mapping Step */}
            <div className="space-y-4">
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Category Mapping</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Map your expense categories to the 50/30/20 groups to enable automatic budget tracking.
                </p>
                
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCategoryMapping(true)}
                    disabled={monthlyIncome <= 0}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    {hasCategoryMapping ? 'Edit Category Mapping' : 'Map Categories'}
                  </Button>
                  
                  {hasCategoryMapping && (
                    <Badge variant="secondary" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Categories mapped
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {hasCategoryMapping ? (
                  <span className="text-green-600">✓ Ready to create budget</span>
                ) : (
                  <span>Complete category mapping to proceed</span>
                )}
              </div>
              
              <div className="flex gap-2">
                {onCancel && (
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !hasCategoryMapping || monthlyIncome <= 0}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Budget
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Category Mapping Dialog */}
      <CategoryMappingDialog
        open={showCategoryMapping}
        onOpenChange={setShowCategoryMapping}
        categories={categories}
        budgetConfig={fiftyThirtyTwentyConfig}
        initialMapping={categoryMapping}
        onMappingComplete={handleCategoryMappingComplete}
      />
    </div>
  )
}