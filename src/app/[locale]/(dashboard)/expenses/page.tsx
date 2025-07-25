// src/app/[locale]/(dashboard)/expenses/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExpenseTrackingDashboard } from '@/components/expenses/ExpenseTrackingDashboard'

export default async function ExpensesPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Fetch essential data for transaction entry and basic widgets
  const [
    { data: wallets, error: walletsError },
    { data: expenseCategories, error: expenseCategoriesError },
    { data: incomeCategories, error: incomeCategoriesError },
    { data: recentTransactions, error: transactionsError },
    { data: currentBudgets, error: budgetsError },
    { data: activeGoals, error: goalsError }
  ] = await Promise.all([
    supabase
      .from('expense_wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('expense_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    
    supabase
      .from('income_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    
    supabase
      .from('expense_transactions')
      .select(`
        *,
        expense_category:expense_categories(*),
        income_category:income_categories(*),
        wallet:expense_wallets!expense_transactions_wallet_id_fkey(*),
        transfer_wallet:expense_wallets!expense_transactions_transfer_to_wallet_id_fkey(*)
      `)
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),
    
    supabase
      .from('expense_budgets')
      .select(`
        *,
        category_allocations:budget_categories(
          *,
          category:expense_categories(*)
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3), // Only show top 3 budgets
    
    supabase
      .from('expense_goals')
      .select(`
        *,
        contributions:goal_contributions(
          id,
          amount,
          contribution_date,
          description,
          wallet:expense_wallets(name, icon, color)
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3) // Only show top 3 goals
  ])

  // Log any errors for debugging
  if (walletsError) console.error('Wallets error:', walletsError)
  if (expenseCategoriesError) console.error('Expense categories error:', expenseCategoriesError)
  if (incomeCategoriesError) console.error('Income categories error:', incomeCategoriesError)
  if (transactionsError) console.error('Transactions error:', transactionsError)
  if (budgetsError) console.error('Budgets error:', budgetsError)
  if (goalsError) console.error('Goals error:', goalsError)

  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<ExpenseTrackingDashboardSkeleton />}>
        <ExpenseTrackingDashboard
          userId={user.id}
          initialData={{
            wallets: wallets || [],
            expenseCategories: expenseCategories || [],
            incomeCategories: incomeCategories || [],
            recentTransactions: recentTransactions?.map(transaction => ({
              ...transaction,
              description: transaction.description ?? undefined,
              expense_category: transaction.expense_category 
                ? { name_vi: transaction.expense_category.name_vi, color: transaction.expense_category.color }
                : undefined,
              income_category: transaction.income_category 
                ? { name_vi: transaction.income_category.name_vi, color: transaction.income_category.color }
                : undefined,
            })) || [],
            currentBudgets: currentBudgets?.map(budget => ({
              ...budget,
              description: budget.description ?? undefined,
              alert_threshold_percentage: budget.alert_threshold_percentage ?? undefined,
              total_spent: 0, // TODO: Calculate actual spending from transactions
              remaining_amount: budget.total_budget - 0, // TODO: Calculate based on actual spending
              progress_percentage: 0, // TODO: Calculate based on actual spending
            })) || [],
            activeGoals: activeGoals?.map(goal => ({
              ...goal,
              description: goal.description ?? undefined,
              monthly_target: goal.monthly_target ?? undefined,
              target_date: goal.target_date ?? undefined,
              deadline: goal.deadline ?? undefined,
              icon: goal.icon ?? undefined,
              color: goal.color ?? undefined,
              months_remaining: goal.months_remaining ?? undefined,
              required_monthly_savings: goal.required_monthly_savings ?? undefined,
              is_on_track: goal.is_on_track ?? undefined,
              completed_at: goal.completed_at ?? undefined,
              contributions: goal.contributions?.map(contrib => ({
                ...contrib,
                description: contrib.description ?? undefined,
              })) ?? undefined,
            })) || []
          }}
        />
      </Suspense>
    </div>
  )
}

function ExpenseTrackingDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Quick Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 border rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Quick Transaction Form Skeleton */}
          <div className="p-6 border rounded-lg animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>

          {/* Wallets Overview Skeleton */}
          <div className="p-6 border rounded-lg animate-pulse">
            <div className="h-6 bg-muted rounded w-1/4 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3 mt-1" />
                  </div>
                  <div className="h-5 bg-muted rounded w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Recent Transactions Skeleton */}
          <div className="p-6 border rounded-lg animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3 mt-1" />
                  </div>
                  <div className="h-5 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Goals Progress Skeleton */}
          <div className="p-6 border rounded-lg animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-16" />
                  </div>
                  <div className="h-2 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}