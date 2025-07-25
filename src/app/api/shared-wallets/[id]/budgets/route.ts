// src/app/api/shared-wallets/[id]/budgets/route.ts
// API endpoints for shared wallet budget management

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100),
  description: z.string().max(500).optional(),
  budget_period: z.enum(['weekly', 'monthly', 'quarterly', 'yearly', 'custom']).default('monthly'),
  start_date: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid start date'),
  end_date: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid end date'),
  total_budget: z.number().min(0, 'Budget must be positive'),
  alert_threshold_percentage: z.number().min(0).max(100).default(80),
  enable_category_alerts: z.boolean().default(true),
  enable_overspending_alerts: z.boolean().default(true),
  categories: z.array(z.object({
    category_id: z.string().uuid(),
    allocated_amount: z.number().min(0),
    category_alert_threshold: z.number().min(0).optional(),
  })).optional(),
})

const updateBudgetSchema = createBudgetSchema.partial().omit({ categories: true })

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/shared-wallets/[id]/budgets - Get shared wallet budgets
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const walletId = (await params).id
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this wallet
    const { data: membership } = await supabase
      .from('shared_wallet_members')
      .select('role')
      .eq('shared_wallet_id', walletId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'
    const period = searchParams.get('period')

    let query = supabase
      .from('shared_budgets')
      .select(`
        *,
        categories:shared_budget_categories(
          *,
          category:expense_categories(
            id,
            name_vi,
            color,
            icon
          )
        )
      `)
      .eq('shared_wallet_id', walletId)
      .order('created_at', { ascending: false })

    // Filter by active status
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    // Filter by period if specified
    if (period) {
      query = query.eq('budget_period', period)
    }

    const { data: budgets, error } = await query

    if (error) {
      console.error('Error fetching shared budgets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch budgets' }, 
        { status: 500 }
      )
    }

    // Calculate additional metrics for each budget
    const enhancedBudgets = budgets?.map(budget => {
      const spentPercentage = budget.total_budget > 0 
        ? (budget.total_spent / budget.total_budget) * 100 
        : 0
      
      const allocatedPercentage = budget.total_budget > 0
        ? (budget.total_allocated / budget.total_budget) * 100
        : 0

      const isOverBudget = budget.total_spent > budget.total_budget
      const isNearLimit = spentPercentage >= budget.alert_threshold_percentage
      
      const daysRemaining = Math.ceil(
        (new Date(budget.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        ...budget,
        metrics: {
          spent_percentage: spentPercentage,
          allocated_percentage: allocatedPercentage,
          remaining_budget: budget.total_budget - budget.total_spent,
          unallocated_budget: budget.total_budget - budget.total_allocated,
          is_over_budget: isOverBudget,
          is_near_limit: isNearLimit,
          days_remaining: daysRemaining,
          is_active_period: new Date() >= new Date(budget.start_date) && 
                           new Date() <= new Date(budget.end_date)
        }
      }
    })

    return NextResponse.json({ budgets: enhancedBudgets })

  } catch (error) {
    console.error('Get shared budgets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/shared-wallets/[id]/budgets - Create new shared budget
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const walletId = (await params).id
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createBudgetSchema.parse(body)

    // Check if user has permission to manage budgets
    const { data: membership } = await supabase
      .from('shared_wallet_members')
      .select('can_manage_budget')
      .eq('shared_wallet_id', walletId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!membership || !membership.can_manage_budget) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Validate date range
    const startDate = new Date(validatedData.start_date)
    const endDate = new Date(validatedData.end_date)
    
    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    // Check for overlapping budgets (same period and wallet)
    const { data: overlappingBudgets } = await supabase
      .from('shared_budgets')
      .select('id, name')
      .eq('shared_wallet_id', walletId)
      .eq('is_active', true)
      .or(`and(start_date.lte.${validatedData.start_date},end_date.gte.${validatedData.start_date}),and(start_date.lte.${validatedData.end_date},end_date.gte.${validatedData.end_date})`)

    if (overlappingBudgets && overlappingBudgets.length > 0) {
      return NextResponse.json({ 
        error: 'Budget period overlaps with existing budget', 
        conflicting_budget: overlappingBudgets[0].name 
      }, { status: 400 })
    }

    // Create the budget
    const { data: budget, error: budgetError } = await supabase
      .from('shared_budgets')
      .insert({
        shared_wallet_id: walletId,
        name: validatedData.name,
        description: validatedData.description,
        budget_period: validatedData.budget_period,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        total_budget: validatedData.total_budget,
        alert_threshold_percentage: validatedData.alert_threshold_percentage,
        enable_category_alerts: validatedData.enable_category_alerts,
        enable_overspending_alerts: validatedData.enable_overspending_alerts,
        created_by: user.id,
      })
      .select()
      .single()

    if (budgetError) {
      console.error('Error creating shared budget:', budgetError)
      return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 })
    }

    // Add category allocations if provided
    if (validatedData.categories && validatedData.categories.length > 0) {
      const categoryInserts = validatedData.categories.map(cat => ({
        shared_budget_id: budget.id,
        category_id: cat.category_id,
        allocated_amount: cat.allocated_amount,
        category_alert_threshold: cat.category_alert_threshold,
      }))

      const { error: categoriesError } = await supabase
        .from('shared_budget_categories')
        .insert(categoryInserts)

      if (categoriesError) {
        console.error('Error creating budget categories:', categoriesError)
        // Rollback budget creation
        await supabase.from('shared_budgets').delete().eq('id', budget.id)
        return NextResponse.json({ error: 'Failed to create budget categories' }, { status: 500 })
      }
    }

    // Log budget creation activity
    await supabase
      .from('shared_budget_activities')
      .insert({
        shared_budget_id: budget.id,
        activity_type: 'created',
        description: `Budget "${validatedData.name}" was created`,
        new_values: {
          total_budget: validatedData.total_budget,
          period: validatedData.budget_period,
          categories_count: validatedData.categories?.length || 0
        },
        performed_by: user.id,
      })

    // Fetch the complete budget with categories
    const { data: completeBudget } = await supabase
      .from('shared_budgets')
      .select(`
        *,
        categories:shared_budget_categories(
          *,
          category:expense_categories(
            id,
            name_vi,
            color,
            icon
          )
        )
      `)
      .eq('id', budget.id)
      .single()

    return NextResponse.json({ budget: completeBudget }, { status: 201 })

  } catch (error) {
    console.error('Create shared budget error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid budget data', details: error.errors }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}