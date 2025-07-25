// src/app/[locale]/(dashboard)/expenses/analytics/page.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpenseAnalytics } from "@/components/expenses/ExpenseAnalytics";

export default async function ExpenseAnalyticsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch all transactions for analytics
  const { data: rawTransactions } = await supabase
    .from("expense_transactions")
    .select(
      `
      *,
      expense_category:expense_categories(*),
      income_category:income_categories(*),
      wallet:expense_wallets(*)
    `
    )
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  // Transform transactions to match the expected interface
  const allTransactions = rawTransactions?.map((transaction) => ({
    ...transaction,
    expense_category: transaction.expense_category ? {
      id: transaction.expense_category.id,
      name_vi: transaction.expense_category.name_vi,
      color: transaction.expense_category.color,
    } : undefined,
    income_category: transaction.income_category ? {
      id: transaction.income_category.id,
      name_vi: transaction.income_category.name_vi,
      color: transaction.income_category.color,
    } : undefined,
  })) || [];

  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<AnalyticsSkeleton />}>
        <ExpenseAnalytics
          transactions={allTransactions}
          loading={false}
        />
      </Suspense>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 border rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
      {/* Chart Skeleton */}
      <div className="p-6 border rounded-lg animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </div>
    </div>
  );
}
