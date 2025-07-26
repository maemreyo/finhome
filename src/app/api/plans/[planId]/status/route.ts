// src/app/api/plans/[planId]/status/route.ts
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'completed', 'archived'])
})

interface RouteContext {
  params: Promise<{
    planId: string
  }>
}

// PATCH /api/plans/[planId]/status - Update plan status
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await context.params
    const body = await request.json()
    const { status } = updateStatusSchema.parse(body)

    const supabase = await createClient()

    // Check if user owns the plan
    const { data: plan, error: fetchError } = await supabase
      .from('financial_plans')
      .select('id, user_id, status')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found or access denied' },
        { status: 404 }
      )
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      draft: ['active', 'archived'],
      active: ['completed', 'archived'],
      completed: ['archived'],
      archived: ['draft']
    }

    const allowedStatuses = validTransitions[plan.status || 'draft'] || []
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${plan.status} to ${status}` },
        { status: 400 }
      )
    }

    // Create status history entry first
    const { error: historyError } = await supabase
      .from('plan_status_history')
      .insert({
        plan_id: planId,
        status: status,
        changed_by: user.id,
        note: `Status changed from ${plan.status} to ${status}`
      })

    if (historyError) {
      console.error('Failed to create status history:', historyError)
      return NextResponse.json(
        { error: 'Failed to record status change history' },
        { status: 500 }
      )
    }

    // Update plan status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    // Set completed_at when marking as completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    // Clear completed_at when moving from completed to another status
    if (plan.status === 'completed' && status !== 'completed') {
      updateData.completed_at = null
    }

    const { data: updatedPlan, error: updateError } = await supabase
      .from('financial_plans')
      .update(updateData)
      .eq('id', planId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update plan status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: updatedPlan,
      message: `Plan status updated to ${status}`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid status', details: error.issues },
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