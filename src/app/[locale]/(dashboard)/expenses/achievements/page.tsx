// src/app/[locale]/(dashboard)/expenses/achievements/page.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GamificationCenter } from "@/components/expenses/GamificationCenter";

export default async function ExpenseAchievementsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch gamification data
  const [
    { data: userLevel },
    { data: achievements },
    { data: challenges },
    { data: availableChallenges },
  ] = await Promise.all([
    // User level and experience
    supabase
      .from("user_experience")
      .select("*")
      .eq("user_id", user.id)
      .single(),

    // User achievements
    supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", user.id),

    // User challenges
    supabase
      .from("user_challenges")
      .select(
        `
        *,
        challenge:expense_challenges(*)
      `
      )
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .eq("is_abandoned", false),

    // Available challenges
    supabase
      .from("expense_challenges")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  ]);

  // Transform achievements data to match expected interface
  const transformedAchievements = achievements?.map(achievement => ({
    id: achievement.id,
    achievement_id: achievement.achievement_id,
    achievement: {
      id: achievement.achievement_id,
      name_en: 'Achievement',
      name_vi: 'Thành tựu', 
      description_en: 'Achievement description',
      description_vi: 'Mô tả thành tựu',
      category: 'first_time' as const,
      requirement_type: 'count',
      requirement_value: 1,
      experience_points: 100,
      badge_icon: '🏆',
      badge_color: '#F59E0B',
      triggers_funnel_action: false,
      is_active: true
    },
    current_progress: achievement.current_progress || 0,
    required_progress: achievement.required_progress || 1,
    progress_percentage: achievement.progress_percentage || 0,
    is_unlocked: !!achievement.unlocked_at,
    unlocked_at: achievement.unlocked_at ?? undefined
  })) || [];

  // Transform challenges data to match expected interface
  const transformedChallenges = challenges?.map(challenge => ({
    ...challenge,
    completed_at: challenge.completed_at ?? undefined,
    progress_data: (challenge.progress_data as Record<string, any>) || {},
    challenge: {
      ...challenge.challenge,
      target_value: challenge.challenge.target_value ?? undefined,
      completion_badge: challenge.challenge.completion_badge ?? undefined,
      start_date: challenge.challenge.start_date ?? undefined,
      end_date: challenge.challenge.end_date ?? undefined
    }
  })) || [];

  // Transform available challenges data to match expected interface  
  const transformedAvailableChallenges = availableChallenges?.map(challenge => ({
    ...challenge,
    target_value: challenge.target_value ?? undefined,
    completion_badge: challenge.completion_badge ?? undefined,
    start_date: challenge.start_date ?? undefined,
    end_date: challenge.end_date ?? undefined
  })) || [];

  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<AchievementsSkeleton />}>
        <GamificationCenter
          userLevel={
            userLevel || {
              current_level: 1,
              total_experience: 0,
              experience_in_level: 0,
              experience_to_next_level: 100,
              current_login_streak: 0,
              longest_login_streak: 0,
              achievements_unlocked: 0,
            }
          }
          achievements={transformedAchievements}
          challenges={transformedChallenges}
          availableChallenges={transformedAvailableChallenges}
        />
      </Suspense>
    </div>
  );
}

function AchievementsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Level Progress Skeleton */}
      <div className="p-6 border rounded-lg animate-pulse">
        <div className="h-6 bg-muted rounded w-1/2 mb-4" />
        <div className="h-4 bg-muted rounded mb-2" />
        <div className="h-3 bg-muted rounded" />
      </div>
      {/* Achievements Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-muted rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
