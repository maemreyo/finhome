// src/components/expenses/FiftyThirtyTwentyVisualization.tsx
// Visualization component for 50/30/20 budget progress and breakdown
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  Heart, 
  PiggyBank, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

interface BudgetGroup {
  key: string
  name: string
  allocated: number
  spent: number
  percentage: number
  color: string
  icon: React.ReactNode
  categories: Array<{
    name: string
    spent: number
    allocated: number
  }>
}

interface FiftyThirtyTwentyVisualizationProps {
  budget: {
    id: string
    name: string
    total_budget: number
    budget_allocation?: Record<string, number>
    category_mapping?: Record<string, string>
    spending_by_category?: Record<string, number>
    current_spent: number
    remaining_amount: number
  }
  categories: Array<{
    id: string
    name_vi: string
    name_en: string
    color: string
  }>
  className?: string
}

export function FiftyThirtyTwentyVisualization({
  budget,
  categories,
  className
}: FiftyThirtyTwentyVisualizationProps) {
  
  const getBudgetGroups = (): BudgetGroup[] => {
    const allocation = budget.budget_allocation || {
      needs: budget.total_budget * 0.5,
      wants: budget.total_budget * 0.3,
      savings: budget.total_budget * 0.2
    }
    
    const categoryMapping = budget.category_mapping || {}
    const spendingByCategory = budget.spending_by_category || {}
    
    // Group spending by budget groups
    const groupedSpending: Record<string, number> = {
      needs: 0,
      wants: 0,
      savings: 0
    }
    
    const groupedCategories: Record<string, Array<{name: string; spent: number; allocated: number}>> = {
      needs: [],
      wants: [],
      savings: []
    }
    
    // Calculate spending per group
    categories.forEach(category => {
      const group = categoryMapping[category.id] || 'needs'
      const spent = spendingByCategory[category.name_vi] || 0
      
      groupedSpending[group] += spent
      
      if (spent > 0) {
        groupedCategories[group].push({
          name: category.name_vi,
          spent,
          allocated: 0 // We don't have per-category allocation for 50/30/20
        })
      }
    })
    
    return [
      {
        key: 'needs',
        name: 'Needs',
        allocated: allocation.needs,
        spent: groupedSpending.needs,
        percentage: 50,
        color: '#ef4444',
        icon: <Target className="h-4 w-4" />,
        categories: groupedCategories.needs
      },
      {
        key: 'wants',
        name: 'Wants',
        allocated: allocation.wants,
        spent: groupedSpending.wants,
        percentage: 30,
        color: '#f59e0b',
        icon: <Heart className="h-4 w-4" />,
        categories: groupedCategories.wants
      },
      {
        key: 'savings',
        name: 'Savings & Debt',
        allocated: allocation.savings,
        spent: groupedSpending.savings,
        percentage: 20,
        color: '#10b981',
        icon: <PiggyBank className="h-4 w-4" />,
        categories: groupedCategories.savings
      }
    ]
  }
  
  const budgetGroups = getBudgetGroups()
  const overallProgress = budget.total_budget > 0 ? (budget.current_spent / budget.total_budget) * 100 : 0
  
  const getProgressStatus = (spent: number, allocated: number) => {
    if (allocated === 0) return 'no-budget'
    const percentage = (spent / allocated) * 100
    
    if (percentage > 100) return 'over-budget'
    if (percentage > 80) return 'warning'
    if (percentage > 50) return 'on-track'
    return 'under-budget'
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over-budget':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />
      case 'on-track':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'under-budget':
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Budget Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>50/30/20 Budget Overview</span>
            <Badge 
              variant={overallProgress > 100 ? "destructive" : overallProgress > 80 ? "secondary" : "default"}
              className="text-sm"
            >
              {overallProgress.toFixed(1)}% used
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Total Spent</span>
              <span className="font-medium">
                {formatCurrency(budget.current_spent)} of {formatCurrency(budget.total_budget)}
              </span>
            </div>
            <Progress 
              value={Math.min(overallProgress, 100)} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Remaining: {formatCurrency(budget.remaining_amount)}</span>
              <span>{(100 - overallProgress).toFixed(1)}% left</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Group Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {budgetGroups.map(group => {
          const progress = group.allocated > 0 ? (group.spent / group.allocated) * 100 : 0
          const status = getProgressStatus(group.spent, group.allocated)
          
          return (
            <Card key={group.key} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-1.5 rounded-full"
                      style={{ backgroundColor: `${group.color}20`, color: group.color }}
                    >
                      {group.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">{group.percentage}%</p>
                    </div>
                  </div>
                  {getStatusIcon(status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Budget vs Spent */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent</span>
                    <span className="font-medium">{formatCurrency(group.spent)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Budget</span>
                    <span>{formatCurrency(group.allocated)}</span>
                  </div>
                  
                  <Progress 
                    value={Math.min(progress, 100)}
                    className="h-2"
                    style={{
                      backgroundColor: `${group.color}20`,
                      ['--progress-background' as any]: progress > 100 ? '#ef4444' : group.color
                    }}
                  />
                  
                  <div className="flex justify-between text-xs">
                    <span className={cn(
                      progress > 100 ? "text-red-500" : 
                      progress > 80 ? "text-yellow-500" : "text-muted-foreground"
                    )}>
                      {progress.toFixed(1)}% used
                    </span>
                    <span className={cn(
                      group.allocated - group.spent < 0 ? "text-red-500" : "text-green-600"
                    )}>
                      {formatCurrency(group.allocated - group.spent)} left
                    </span>
                  </div>
                </div>
                
                {/* Category Breakdown */}
                {group.categories.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-xs font-medium text-muted-foreground">Top Categories:</h4>
                    <div className="space-y-1">
                      {group.categories
                        .sort((a, b) => b.spent - a.spent)
                        .slice(0, 3)
                        .map((category, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="truncate flex-1">{category.name}</span>
                          <span className="font-medium ml-2">{formatCurrency(category.spent)}</span>
                        </div>
                      ))}
                      {group.categories.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{group.categories.length - 3} more categories
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Budget Method Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1 text-sm">
              <h4 className="font-medium mb-1">About the 50/30/20 Rule</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                This budgeting method allocates your income into three categories: 50% for needs (essentials), 
                30% for wants (lifestyle), and 20% for savings and debt repayment. It's a simple framework 
                that helps maintain financial balance while building wealth.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}