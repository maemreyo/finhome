// src/app/api/plans/[planId]/route.ts
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updatePlanSchema = z.object({
  plan_name: z.string().min(1).optional(),
  plan_description: z.string().optional(),
  plan_type: z.enum(['home_purchase', 'investment', 'upgrade', 'refinance']).optional(),
  purchase_price: z.number().min(1).optional(),
  down_payment: z.number().min(1).optional(),
  monthly_income: z.number().min(1).optional(),
  monthly_expenses: z.number().min(0).optional(),
  current_savings: z.number().min(0).optional(),
  additional_costs: z.number().optional(),
  other_debts: z.number().optional(),
  expected_rental_income: z.number().optional(),
  expected_appreciation_rate: z.number().optional(),
  investment_horizon_years: z.number().optional(),
  plan_status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
  is_public: z.boolean().optional(),
})

// GET /api/plans/[planId] - Get specific financial plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await params
    const supabase = await createClient()
    const { data: plan, error } = await supabase
      .from('financial_plans')
      .select(`
        *,
        loan_terms (*),
        scenarios (*),
        properties (*)
      `)
      .eq('id', planId)
      .single()

    if (error) {
      console.error('Error fetching plan:', error)
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user owns the plan or if it's public
    if (plan.user_id !== user.id && !plan.is_public) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Unexpected error in GET /api/plans/[planId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/plans/[planId] - Update financial plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updatePlanSchema.parse(body)

    const { planId } = await params
    const supabase = await createClient()

    // First check if user owns the plan
    const { data: existingPlan, error: fetchError } = await supabase
      .from('financial_plans')
      .select('user_id')
      .eq('id', planId)
      .single()

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (existingPlan.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the plan
    const { data: plan, error: updateError } = await supabase
      .from('financial_plans')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating plan:', updateError)
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
    }

    return NextResponse.json({ plan })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Unexpected error in PUT /api/plans/[planId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/plans/[planId] - Delete financial plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await params
    const supabase = await createClient()

    // First check if user owns the plan
    const { data: existingPlan, error: fetchError } = await supabase
      .from('financial_plans')
      .select('user_id')
      .eq('id', planId)
      .single()

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (existingPlan.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the plan (cascade deletes will handle related records)
    const { error: deleteError } = await supabase
      .from('financial_plans')
      .delete()
      .eq('id', planId)

    if (deleteError) {
      console.error('Error deleting plan:', deleteError)
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/plans/[planId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}