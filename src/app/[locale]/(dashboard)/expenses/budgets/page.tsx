// src/app/[locale]/(dashboard)/expenses/budgets/page.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BudgetManager } from "@/components/expenses/BudgetManager";

export default async function ExpenseBudgetsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch expense categories and current budgets
  const [{ data: expenseCategories }, { data: currentBudgets }] =
    await Promise.all([
      supabase
        .from("expense_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),

      supabase
        .from("expense_budgets")
        .select(
          `
        *,
        category_allocations:budget_categories(
          *,
          category:expense_categories(*)
        )
      `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<BudgetsSkeleton />}>
        <BudgetManager
          categories={(expenseCategories || []).map(cat => ({
            ...cat,
            is_active: cat.is_active ?? false,
            sort_order: cat.sort_order ?? 0
          }))}
          initialBudgets={currentBudgets?.map(budget => ({
            ...budget,
            description: budget.description ?? undefined,
            alert_threshold_percentage: budget.alert_threshold_percentage ?? undefined,
            budget_period: budget.budget_period as 'weekly' | 'monthly' | 'yearly',
            remaining_amount: budget.remaining_amount || 0,
            is_active: budget.is_active || false,
            current_spent: 0, // TODO: Calculate from transactions
            progress_percentage: 0, // TODO: Calculate from current spent
            budget_allocation: budget.budget_allocation as Record<string, number> | undefined,
            category_mapping: budget.category_mapping as Record<string, string> | undefined,
            category_allocations: budget.category_allocations?.map(allocation => ({
              id: allocation.id,
              allocated_amount: allocation.allocated_amount,
              spent_amount: allocation.spent_amount || 0,
              remaining_amount: allocation.remaining_amount || 0,
              category: allocation.category ? {
                ...allocation.category,
                is_active: allocation.category.is_active ?? false,
                sort_order: allocation.category.sort_order ?? 0
              } : {
                id: allocation.category_id || '',
                name_vi: 'Unknown Category',
                name_en: 'Unknown Category',
                color: '#000000',
                icon: 'category',
                sort_order: 0,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                category_key: 'other' as const
              }
            })) || []
          })) || []}

        />
      </Suspense>
    </div>
  );
}

function BudgetsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Overall Progress Skeleton */}
      <div className="p-6 border rounded-lg animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded mb-2" />
        <div className="h-3 bg-muted rounded" />
      </div>
      {/* Budget Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border rounded-lg animate-pulse">
            <div className="h-6 bg-muted rounded w-1/2 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-2 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
