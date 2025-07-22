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
    { data: wallets },
    { data: expenseCategories },
    { data: incomeCategories },
    { data: recentTransactions },
    { data: currentBudgets },
    { data: activeGoals }
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
        wallet:expense_wallets(*),
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
          wallet:expense_wallets(name, icon, color)
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3) // Only show top 3 goals
  ])

  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<ExpenseTrackingDashboardSkeleton />}>
        <ExpenseTrackingDashboard
          userId={user.id}
          initialData={{
            wallets: wallets || [],
            expenseCategories: expenseCategories || [],
            incomeCategories: incomeCategories || [],
            recentTransactions: recentTransactions || [],
            currentBudgets: currentBudgets || [],
            activeGoals: activeGoals || []
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