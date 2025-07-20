// src/app/api/plans/[planId]/milestones/route.ts
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createMilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(['financial', 'legal', 'property', 'admin', 'personal']),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  required_amount: z.number().optional(),
  target_date: z.string().optional()
})

const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.enum(['financial', 'legal', 'property', 'admin', 'personal']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  required_amount: z.number().optional(),
  current_amount: z.number().optional(),
  target_date: z.string().optional()
})

interface RouteContext {
  params: Promise<{
    planId: string
  }>
}

// GET /api/plans/[planId]/milestones - Get plan milestones
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await context.params
    const supabase = await createClient()

    // Verify user owns the plan
    const { data: plan, error: planError } = await supabase
      .from('financial_plans')
      .select('id, user_id')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found or access denied' },
        { status: 404 }
      )
    }

    // Get milestones
    const { data: milestones, error } = await supabase
      .from('plan_milestones')
      .select('*')
      .eq('plan_id', planId)
      .order('target_date', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch milestones' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: milestones })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/plans/[planId]/milestones - Create a new milestone
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await context.params
    const body = await request.json()
    const validatedData = createMilestoneSchema.parse(body)

    const supabase = await createClient()

    // Verify user owns the plan
    const { data: plan, error: planError } = await supabase
      .from('financial_plans')
      .select('id, user_id')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found or access denied' },
        { status: 404 }
      )
    }

    // Create milestone
    const { data: milestone, error } = await supabase
      .from('plan_milestones')
      .insert({
        plan_id: planId,
        ...validatedData,
        current_amount: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create milestone' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: milestone,
      message: 'Milestone created successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}