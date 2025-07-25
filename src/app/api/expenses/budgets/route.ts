// src/app/api/expenses/budgets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createBudgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  description: z.string().optional(),
  budget_period: z.enum(["weekly", "monthly", "yearly"]),
  budget_method: z.string().optional().default("manual"),
  start_date: z.string(),
  end_date: z.string(),
  total_budget: z.number().positive(),
  category_budgets: z.record(z.string(), z.number().min(0)).optional(),
  alert_threshold_percentage: z.number().min(0).max(100).optional(),
  budget_allocation: z.record(z.string(), z.number()).optional(),
  category_mapping: z.record(z.string(), z.string()).optional(),
});

const updateBudgetSchema = createBudgetSchema.partial();

// GET /api/expenses/budgets - Fetch user's budgets
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

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("active") === "true";
    const period = searchParams.get("period") as
      | "weekly"
      | "monthly"
      | "yearly"
      | null;

    let query = supabase
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
      .order("created_at", { ascending: false });

    if (isActive) {
      query = query.eq("is_active", true);
    }

    if (period) {
      query = query.eq("budget_period", period);
    }

    const { data: budgets, error } = await query;

    if (error) {
      console.error("Error fetching budgets:", error);
      return NextResponse.json(
        { error: "Failed to fetch budgets" },
        { status: 500 }
      );
    }

    // Enhance budgets with current spending data
    const enhancedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        // Get current spending for this budget period
        const { data: transactions } = await supabase
          .from("expense_transactions")
          .select("amount, expense_category_id")
          .eq("user_id", user.id)
          .eq("transaction_type", "expense")
          .gte("transaction_date", budget.start_date)
          .lte("transaction_date", budget.end_date);

        const currentSpent =
          transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const spendingByCategory =
          transactions?.reduce(
            (acc, t) => {
              if (t.expense_category_id) {
                acc[t.expense_category_id] =
                  (acc[t.expense_category_id] || 0) + Number(t.amount);
              }
              return acc;
            },
            {} as Record<string, number>
          ) || {};

        return {
          ...budget,
          current_spent: currentSpent,
          spending_by_category: spendingByCategory,
          remaining_amount: Number(budget.total_budget) - currentSpent,
          progress_percentage:
            (currentSpent / Number(budget.total_budget)) * 100,
        };
      })
    );

    return NextResponse.json({ budgets: enhancedBudgets });
  } catch (error) {
    console.error("Budgets API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/expenses/budgets - Create new budget
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBudgetSchema.parse(body);

    // Validate dates
    const startDate = new Date(validatedData.start_date);
    const endDate = new Date(validatedData.end_date);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Check for overlapping active budgets
    const { data: overlappingBudgets } = await supabase
      .from("expense_budgets")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .or(
        `start_date.lte.${validatedData.end_date},end_date.gte.${validatedData.start_date}`
      );

    if (overlappingBudgets && overlappingBudgets.length > 0) {
      return NextResponse.json(
        {
          error: "Budget period overlaps with existing active budget",
          overlapping_budgets: overlappingBudgets,
        },
        { status: 400 }
      );
    }

    // Validate category budgets sum
    const categoryBudgets = validatedData.category_budgets || {};
    const categoryBudgetSum = Object.values(categoryBudgets).reduce(
      (sum, amount) => sum + amount,
      0
    );

    if (categoryBudgetSum > validatedData.total_budget) {
      return NextResponse.json(
        {
          error: "Sum of category budgets exceeds total budget",
          total_budget: validatedData.total_budget,
          category_sum: categoryBudgetSum,
        },
        { status: 400 }
      );
    }

    // Create the budget
    const budgetData = {
      user_id: user.id,
      ...validatedData,
      // Store budget_allocation and category_mapping in category_budgets JSONB field
      category_budgets: {
        ...validatedData.category_budgets,
        ...(validatedData.budget_allocation && {
          budget_allocation: validatedData.budget_allocation,
        }),
        ...(validatedData.category_mapping && {
          category_mapping: validatedData.category_mapping,
        }),
      },
    };

    const { data: budget, error: createError } = await supabase
      .from("expense_budgets")
      .insert([budgetData])
      .select("*")
      .single();

    if (createError) {
      console.error("Error creating budget:", createError);
      return NextResponse.json(
        { error: "Failed to create budget" },
        { status: 500 }
      );
    }

    // Create category allocations if provided
    if (categoryBudgets && Object.keys(categoryBudgets).length > 0) {
      const categoryAllocations = Object.entries(categoryBudgets).map(
        ([categoryId, amount]) => ({
          budget_id: budget.id,
          category_id: categoryId,
          allocated_amount: amount,
        })
      );

      const { error: allocationsError } = await supabase
        .from("budget_categories")
        .insert(categoryAllocations);

      if (allocationsError) {
        console.error("Error creating category allocations:", allocationsError);
        // Note: We could consider rolling back the budget creation here
      }
    }

    // Fetch the complete budget with allocations
    const { data: completeBudget } = await supabase
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
      .eq("id", budget.id)
      .single();

    return NextResponse.json({ budget: completeBudget }, { status: 201 });
  } catch (error) {
    console.error("Create budget error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid budget data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
