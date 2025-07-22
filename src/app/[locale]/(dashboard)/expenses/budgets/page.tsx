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
          categories={expenseCategories || []}
          initialBudgets={currentBudgets || []}
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
