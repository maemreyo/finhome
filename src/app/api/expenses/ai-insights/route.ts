// src/app/api/expenses/ai-insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z, ZodError } from "zod";

const aiInsightRequestSchema = z.object({
  insight_type: z
    .enum([
      "spending_analysis",
      "budget_optimization",
      "saving_opportunities",
      "goal_recommendations",
      "comprehensive",
    ])
    .optional()
    .default("comprehensive"),
  time_period: z
    .enum(["current_month", "last_3_months", "last_6_months", "last_year"])
    .optional()
    .default("last_3_months"),
  focus_areas: z.array(z.string()).optional(),
});

interface FinancialInsight {
  id: string;
  type:
    | "spending_pattern"
    | "saving_opportunity"
    | "budget_alert"
    | "goal_advice"
    | "risk_warning";
  title: string;
  title_vi: string;
  insight: string;
  insight_vi: string;
  actionable_steps: string[];
  actionable_steps_vi: string[];
  priority: "low" | "medium" | "high";
  impact_score: number; // 1-10
  confidence: number; // 0-1
  category?: string;
  amount_impact?: number;
  related_categories?: string[];
}

interface AIAnalysisResult {
  user_profile_summary: string;
  user_profile_summary_vi: string;
  insights: FinancialInsight[];
  overall_financial_health_score: number; // 1-100
  recommendations: {
    immediate_actions: string[];
    immediate_actions_vi: string[];
    long_term_strategies: string[];
    long_term_strategies_vi: string[];
  };
  personalized_tips: {
    tip: string;
    tip_vi: string;
    category: string;
  }[];
}

// GET /api/expenses/ai-insights - Get AI-powered financial insights
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has premium access
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const hasPremiumAccess =
      userProfile?.subscription_tier &&
      ["premium", "professional"].includes(userProfile.subscription_tier);

    if (!hasPremiumAccess) {
      return NextResponse.json(
        {
          error: "Premium subscription required",
          upgrade_required: true,
          feature: "ai_financial_advisor",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestData = {
      insight_type: searchParams.get("insight_type") || "comprehensive",
      time_period: searchParams.get("time_period") || "last_3_months",
      focus_areas: searchParams.get("focus_areas")?.split(",") || [],
    };

    const validatedData = aiInsightRequestSchema.parse(requestData);

    // Check if we have cached insights (less than 24 hours old)
    let cachedInsights = null;
    try {
      const { data } = await supabase
        .from("ai_financial_insights")
        .select("*")
        .eq("user_id", user.id)
        .eq("insight_type", validatedData.insight_type)
        .gte(
          "generated_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .order("generated_at", { ascending: false })
        .limit(1);
      cachedInsights = data;
    } catch (error) {
      console.log("AI insights table not found, skipping cache check");
    }

    if (cachedInsights && cachedInsights.length > 0) {
      return NextResponse.json({
        insights: JSON.parse(cachedInsights[0].insight_text),
        cached: true,
        generated_at: cachedInsights[0].generated_at,
      });
    }

    // Prepare financial data for AI analysis
    const financialData = await prepareFinancialDataForAI(
      supabase,
      user.id,
      validatedData.time_period
    );

    // Generate AI insights
    const aiInsights = await generateAIInsights(financialData, validatedData);

    // Cache the insights
    try {
      await supabase.from("ai_financial_insights").insert({
        user_id: user.id,
        insight_type: validatedData.insight_type,
        insight_text: JSON.stringify(aiInsights),
        metadata: {
          time_period: validatedData.time_period,
          focus_areas: validatedData.focus_areas,
          data_points: financialData.summary.total_transactions,
        } as any,
      });
    } catch (error) {
      console.log("Could not cache AI insights:", error);
      // Continue without caching - this is not critical
    }

    return NextResponse.json({
      insights: aiInsights,
      cached: false,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI insights API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function prepareFinancialDataForAI(
  supabase: any,
  userId: string,
  timePeriod: string
) {
  const periodMap = {
    current_month: 1,
    last_3_months: 3,
    last_6_months: 6,
    last_year: 12,
  };

  const monthsBack = periodMap[timePeriod as keyof typeof periodMap] || 3;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  // Get transactions
  const { data: transactions } = await supabase
    .from("expense_transactions")
    .select(
      `
      *,
      expense_category:expense_categories(name_vi, name_en),
      income_category:income_categories(name_vi, name_en)
    `
    )
    .eq("user_id", userId)
    .gte("transaction_date", startDate.toISOString().split("T")[0])
    .order("transaction_date", { ascending: false });

  // Get active budgets
  const { data: budgets } = await supabase
    .from("expense_budgets")
    .select(
      `
      *,
      category_allocations:budget_categories(
        *,
        category:expense_categories(name_vi, name_en)
      )
    `
    )
    .eq("user_id", userId)
    .eq("is_active", true);

  // Get active goals
  const { data: goals } = await supabase
    .from("expense_goals")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active"]);

  // Get monthly analytics if available
  const { data: monthlyAnalytics } = await supabase
    .from("expense_analytics_monthly")
    .select("*")
    .eq("user_id", userId)
    .gte("year", startDate.getFullYear())
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(monthsBack);

  // Aggregate and analyze data
  const expenses =
    transactions?.filter((t: any) => t.transaction_type === "expense") || [];
  const income =
    transactions?.filter((t: any) => t.transaction_type === "income") || [];

  const totalExpenses = expenses.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const totalIncome = income.reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  // Category breakdown
  const expenseByCategory = expenses.reduce(
    (acc: Record<string, number>, t: any) => {
      const categoryName = t.expense_category?.name_vi || "Khác";
      acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
      return acc;
    },
    {} as Record<string, number>
  );

  // Spending trends (week-over-week)
  const weeklySpending = expenses.reduce(
    (acc: Record<string, number>, t: any) => {
      const week = getWeekKey(new Date(t.transaction_date));
      acc[week] = (acc[week] || 0) + Number(t.amount);
      return acc;
    },
    {} as Record<string, number>
  );

  // Budget performance
  const budgetPerformance =
    budgets?.map((budget: any) => ({
      name: budget.name,
      budgeted: Number(budget.total_budget),
      spent: Number(budget.total_spent),
      remaining: Number(budget.remaining_amount),
      performance_percentage:
        (Number(budget.total_spent) / Number(budget.total_budget)) * 100,
    })) || [];

  // Goal progress
  const goalProgress =
    goals?.map((goal: any) => ({
      name: goal.name,
      target: Number(goal.target_amount),
      current: Number(goal.current_amount),
      progress_percentage:
        (Number(goal.current_amount) / Number(goal.target_amount)) * 100,
      monthly_target: Number(goal.monthly_target || 0),
      target_date: goal.target_date,
    })) || [];

  return {
    summary: {
      time_period: timePeriod,
      total_transactions: transactions?.length || 0,
      total_expenses: totalExpenses,
      total_income: totalIncome,
      net_income: totalIncome - totalExpenses,
      savings_rate:
        totalIncome > 0
          ? ((totalIncome - totalExpenses) / totalIncome) * 100
          : 0,
    },
    spending_patterns: {
      by_category: expenseByCategory,
      weekly_trends: weeklySpending,
      average_transaction:
        expenses.length > 0 ? totalExpenses / expenses.length : 0,
      largest_expenses: expenses
        .sort((a: any, b: any) => Number(b.amount) - Number(a.amount))
        .slice(0, 5)
        .map((t: any) => ({
          amount: Number(t.amount),
          description: t.description,
          category: t.expense_category?.name_vi,
          date: t.transaction_date,
        })),
    },
    budget_analysis: {
      active_budgets: budgets?.length || 0,
      budget_performance: budgetPerformance,
      over_budget_categories: budgetPerformance.filter(
        (b: any) => b.performance_percentage > 100
      ),
      under_budget_categories: budgetPerformance.filter(
        (b: any) => b.performance_percentage < 80
      ),
    },
    goal_analysis: {
      active_goals: goals?.length || 0,
      goal_progress: goalProgress,
      on_track_goals: goalProgress.filter((g: any) => {
        const monthsToTarget = g.target_date
          ? Math.max(
              1,
              Math.ceil(
                (new Date(g.target_date).getTime() - Date.now()) /
                  (30 * 24 * 60 * 60 * 1000)
              )
            )
          : 12;
        const requiredMonthlyProgress = (g.target - g.current) / monthsToTarget;
        return g.monthly_target >= requiredMonthlyProgress * 0.8; // 80% tolerance
      }),
      behind_goals: goalProgress.filter((g: any) => g.progress_percentage < 50),
    },
    monthly_analytics: monthlyAnalytics || [],
  };
}

async function generateAIInsights(
  financialData: any,
  requestParams: any
): Promise<AIAnalysisResult> {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = buildFinancialAdvisorPrompt(financialData, requestParams);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    const aiAnalysis = JSON.parse(jsonMatch[0]) as AIAnalysisResult;

    // Validate and enhance the response
    return validateAndEnhanceInsights(aiAnalysis, financialData);
  } catch (error) {
    console.error("Error generating AI insights:", error);
    // Return fallback insights
    return generateFallbackInsights(financialData);
  }
}

function buildFinancialAdvisorPrompt(
  financialData: any,
  requestParams: any
): string {
  const { summary, spending_patterns, budget_analysis, goal_analysis } =
    financialData;
  const savingsRate = summary.savings_rate.toFixed(1);
  const netIncome = (summary.net_income / 1000000).toFixed(1);

  return `
Bạn là một cố vấn tài chính cá nhân AI chuyên nghiệp cho người Việt Nam. Hãy phân tích dữ liệu tài chính chi tiết dưới đây và cung cấp những insight sâu sắc, cá nhân hóa cùng các đề xuất hành động cụ thể.

DỮ LIỆU TÀI CHÍNH NGƯỜI DÙNG:
- Thời gian phân tích: ${requestParams.time_period} (${summary.total_transactions} giao dịch)
- Tổng thu nhập: ${(summary.total_income / 1000000).toFixed(1)}M VND
- Tổng chi tiêu: ${(summary.total_expenses / 1000000).toFixed(1)}M VND
- Thu nhập ròng: ${netIncome}M VND
- Tỷ lệ tiết kiệm: ${savingsRate}%

CHI TIÊU THEO DANH MỤC:
${Object.entries(spending_patterns.by_category)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 8)
  .map(
    ([category, amount]) =>
      `- ${category}: ${((amount as number) / 1000000).toFixed(1)}M VND`
  )
  .join("\n")}

CHI TIÊU LỚN NHẤT:
${spending_patterns.largest_expenses
  .map(
    (exp: any) =>
      `- ${(exp.amount / 1000000).toFixed(1)}M VND: ${exp.description} (${exp.category})`
  )
  .join("\n")}

HIỆU SUẤT NGÂN SÁCH:
${budget_analysis.budget_performance
  .map(
    (budget: any) =>
      `- ${budget.name}: ${budget.performance_percentage.toFixed(1)}% (${(budget.spent / 1000000).toFixed(1)}M/${(budget.budgeted / 1000000).toFixed(1)}M VND)`
  )
  .join("\n")}

TIẾN ĐỘ MỤC TIÊU:
${goal_analysis.goal_progress
  .map(
    (goal: any) =>
      `- ${goal.name}: ${goal.progress_percentage.toFixed(1)}% (${(goal.current / 1000000).toFixed(1)}M/${(goal.target / 1000000).toFixed(1)}M VND)`
  )
  .join("\n")}

Hãy tạo một phân tích tài chính toàn diện với:
1. Các insight cụ thể về thói quen chi tiêu
2. Cơ hội tiết kiệm được cá nhân hóa
3. Cảnh báo ngân sách và đề xuất tối ưu hóa
4. Lời khuyên đạt mục tiêu tài chính
5. Đánh giá sức khỏe tài chính tổng thể (1-100)

Định dạng phản hồi như JSON hợp lệ:

{
  "user_profile_summary": "Phân tích ngắn gọn về tình hình tài chính hiện tại của người dùng",
  "user_profile_summary_vi": "Bản tiếng Việt của phân tích trên",
  "overall_financial_health_score": 75,
  "insights": [
    {
      "id": "insight_1",
      "type": "spending_pattern",
      "title": "Spending Pattern Insight",
      "title_vi": "Phát hiện về thói quen chi tiêu",
      "insight": "Detailed analysis in English",
      "insight_vi": "Phân tích chi tiết bằng tiếng Việt",
      "actionable_steps": ["Step 1", "Step 2"],
      "actionable_steps_vi": ["Bước 1", "Bước 2"],
      "priority": "high",
      "impact_score": 8,
      "confidence": 0.9,
      "category": "food_dining",
      "amount_impact": 500000,
      "related_categories": ["food_dining", "entertainment"]
    }
  ],
  "recommendations": {
    "immediate_actions": ["Action 1", "Action 2"],
    "immediate_actions_vi": ["Hành động 1", "Hành động 2"],
    "long_term_strategies": ["Strategy 1", "Strategy 2"],
    "long_term_strategies_vi": ["Chiến lược 1", "Chiến lược 2"]
  },
  "personalized_tips": [
    {
      "tip": "Personalized tip in English",
      "tip_vi": "Mẹo cá nhân hóa bằng tiếng Việt",
      "category": "budgeting"
    }
  ]
}

Tập trung vào:
- Insights thiết thực và có thể hành động được
- Số liệu cụ thể và khuyến nghị chính xác
- Ngữ cảnh văn hóa và tài chính Việt Nam
- Cơ hội tiết kiệm thực tế và khả thi
- Cảnh báo rủi ro và lời khuyên phòng ngừa
`.trim();
}

function validateAndEnhanceInsights(
  aiAnalysis: AIAnalysisResult,
  financialData: any
): AIAnalysisResult {
  // Ensure all required fields exist and are valid
  const validated: AIAnalysisResult = {
    user_profile_summary:
      aiAnalysis.user_profile_summary || "Phân tích dữ liệu tài chính của bạn",
    user_profile_summary_vi:
      aiAnalysis.user_profile_summary_vi ||
      aiAnalysis.user_profile_summary ||
      "Phân tích dữ liệu tài chính của bạn",
    overall_financial_health_score: Math.min(
      100,
      Math.max(1, aiAnalysis.overall_financial_health_score || 50)
    ),
    insights: (aiAnalysis.insights || []).map((insight, index) => ({
      id: insight.id || `insight_${index + 1}`,
      type: insight.type || "spending_pattern",
      title: insight.title || "Financial Insight",
      title_vi: insight.title_vi || insight.title || "Phát hiện tài chính",
      insight: insight.insight || "AI-generated financial insight",
      insight_vi:
        insight.insight_vi ||
        insight.insight ||
        "Phát hiện tài chính được AI tạo ra",
      actionable_steps: insight.actionable_steps || ["Review your spending"],
      actionable_steps_vi: insight.actionable_steps_vi ||
        insight.actionable_steps || ["Xem lại chi tiêu của bạn"],
      priority: insight.priority || "medium",
      impact_score: Math.min(10, Math.max(1, insight.impact_score || 5)),
      confidence: Math.min(1, Math.max(0, insight.confidence || 0.7)),
      category: insight.category,
      amount_impact: insight.amount_impact,
      related_categories: insight.related_categories || [],
    })),
    recommendations: {
      immediate_actions: aiAnalysis.recommendations?.immediate_actions || [
        "Review your financial data",
      ],
      immediate_actions_vi: aiAnalysis.recommendations?.immediate_actions_vi ||
        aiAnalysis.recommendations?.immediate_actions || [
          "Xem lại dữ liệu tài chính",
        ],
      long_term_strategies: aiAnalysis.recommendations
        ?.long_term_strategies || ["Create a long-term financial plan"],
      long_term_strategies_vi: aiAnalysis.recommendations
        ?.long_term_strategies_vi ||
        aiAnalysis.recommendations?.long_term_strategies || [
          "Tạo kế hoạch tài chính dài hạn",
        ],
    },
    personalized_tips: (aiAnalysis.personalized_tips || []).map((tip) => ({
      tip: tip.tip || "Financial tip",
      tip_vi: tip.tip_vi || tip.tip || "Mẹo tài chính",
      category: tip.category || "general",
    })),
  };

  return validated;
}

function generateFallbackInsights(financialData: any): AIAnalysisResult {
  const { summary, spending_patterns, budget_analysis } = financialData;
  const insights: FinancialInsight[] = [];

  // Generate basic insights based on data patterns
  if (summary.savings_rate < 10) {
    insights.push({
      id: "low_savings_rate",
      type: "saving_opportunity",
      title: "Low Savings Rate Detected",
      title_vi: "Phát hiện tỷ lệ tiết kiệm thấp",
      insight: `Your current savings rate is ${summary.savings_rate.toFixed(1)}%, which is below the recommended 20%.`,
      insight_vi: `Tỷ lệ tiết kiệm hiện tại của bạn là ${summary.savings_rate.toFixed(1)}%, thấp hơn mức khuyến nghị 20%.`,
      actionable_steps: [
        "Review your largest expense categories",
        "Set up automatic savings transfers",
        "Look for subscription services to cancel",
      ],
      actionable_steps_vi: [
        "Xem lại các danh mục chi tiêu lớn nhất",
        "Thiết lập chuyển khoản tiết kiệm tự động",
        "Tìm các dịch vụ đăng ký để hủy",
      ],
      priority: "high",
      impact_score: 8,
      confidence: 0.9,
    });
  }

  // Check for budget overruns
  const overBudgetCategories = budget_analysis.over_budget_categories || [];
  if (overBudgetCategories.length > 0) {
    insights.push({
      id: "budget_overrun",
      type: "budget_alert",
      title: "Budget Categories Exceeded",
      title_vi: "Vượt quá ngân sách một số danh mục",
      insight: `You've exceeded budget in ${overBudgetCategories.length} categories this month.`,
      insight_vi: `Bạn đã vượt quá ngân sách ở ${overBudgetCategories.length} danh mục trong tháng này.`,
      actionable_steps: [
        "Review spending in over-budget categories",
        "Adjust budget allocations if needed",
        "Set up spending alerts",
      ],
      actionable_steps_vi: [
        "Xem lại chi tiêu ở các danh mục vượt ngân sách",
        "Điều chỉnh phân bổ ngân sách nếu cần",
        "Thiết lập cảnh báo chi tiêu",
      ],
      priority: "medium",
      impact_score: 6,
      confidence: 0.8,
    });
  }

  return {
    user_profile_summary: `Based on ${summary.total_transactions} transactions over the analysis period, your financial health shows room for improvement.`,
    user_profile_summary_vi: `Dựa trên ${summary.total_transactions} giao dịch trong khoảng thời gian phân tích, sức khỏe tài chính của bạn còn nhiều chỗ để cải thiện.`,
    overall_financial_health_score: Math.max(
      30,
      Math.min(70, 50 + summary.savings_rate)
    ),
    insights,
    recommendations: {
      immediate_actions: [
        "Review your top spending categories",
        "Set up a monthly budget if you haven't already",
        "Track daily expenses more carefully",
      ],
      immediate_actions_vi: [
        "Xem lại các danh mục chi tiêu hàng đầu",
        "Thiết lập ngân sách hàng tháng nếu chưa có",
        "Theo dõi chi tiêu hàng ngày cẩn thận hơn",
      ],
      long_term_strategies: [
        "Build an emergency fund covering 3-6 months of expenses",
        "Consider investing surplus savings",
        "Review and optimize recurring subscriptions annually",
      ],
      long_term_strategies_vi: [
        "Xây dựng quỹ khẩn cấp đủ chi trả 3-6 tháng",
        "Cân nhắc đầu tư tiền tiết kiệm thừa",
        "Xem lại và tối ưu hóa các dịch vụ đăng ký định kỳ hàng năm",
      ],
    },
    personalized_tips: [
      {
        tip: "Try the 50/30/20 budgeting rule: 50% needs, 30% wants, 20% savings",
        tip_vi:
          "Thử quy tắc ngân sách 50/30/20: 50% nhu cầu, 30% mong muốn, 20% tiết kiệm",
        category: "budgeting",
      },
    ],
  };
}

function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const week = Math.ceil(
    (date.getTime() - new Date(year, 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );
  return `${year}-W${week}`;
}
