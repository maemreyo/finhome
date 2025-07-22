// src/app/[locale]/(dashboard)/expenses/goals/page.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GoalManager } from "@/components/expenses/GoalManager";

export default async function ExpenseGoalsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch active goals and wallets
  const [{ data: activeGoals }, { data: wallets }] = await Promise.all([
    supabase
      .from("expense_goals")
      .select(
        `
        *,
        contributions:goal_contributions(
          id,
          amount,
          contribution_date,
          wallet:expense_wallets(name, icon, color)
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),

    supabase
      .from("expense_wallets")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<GoalsSkeleton />}>
        <GoalManager goals={activeGoals || []} wallets={wallets || []} />
      </Suspense>
    </div>
  );
}

function GoalsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Goals Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
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
