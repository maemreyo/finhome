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
          description,
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
        <GoalManager 
          goals={activeGoals?.map(goal => ({
            ...goal,
            description: goal.description ?? undefined,
            monthly_target: goal.monthly_target ?? undefined,
            target_date: goal.target_date ?? undefined,
            deadline: goal.deadline ?? undefined,
            icon: goal.icon ?? undefined,
            color: goal.color ?? undefined,
            house_purchase_data: goal.house_purchase_data ? (goal.house_purchase_data as {
              property_type?: string
              preferred_location?: string
              budget_range?: { min?: number; max?: number }
              timeline_months?: number
              down_payment_percentage?: number
              funnel_stage?: string
            }) : undefined,
            months_remaining: goal.months_remaining ?? undefined,
            required_monthly_savings: goal.required_monthly_savings ?? undefined,
            is_on_track: goal.is_on_track ?? undefined,
            completed_at: goal.completed_at ?? undefined,
            contributions: goal.contributions?.map(contrib => ({
              ...contrib,
              description: contrib.description ?? undefined,
            })) ?? undefined,
          })) || []} 
          wallets={wallets || []} 
        />
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
