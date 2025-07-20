// src/app/api/milestones/[milestoneId]/route.ts
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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
    milestoneId: string
  }>
}

// PATCH /api/milestones/[milestoneId] - Update milestone
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { milestoneId } = await context.params
    const body = await request.json()
    const validatedData = updateMilestoneSchema.parse(body)

    const supabase = await createClient()

    // Verify user owns the milestone through the plan
    const { data: milestone, error: fetchError } = await supabase
      .from('plan_milestones')
      .select(`
        id,
        plan_id,
        status,
        financial_plans!inner(user_id)
      `)
      .eq('id', milestoneId)
      .single()

    if (fetchError || !milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    // Check if user owns the plan
    if ((milestone.financial_plans as any).user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = { ...validatedData }

    // Set completed_date when marking as completed
    if (validatedData.status === 'completed' && milestone.status !== 'completed') {
      updateData.completed_date = new Date().toISOString()
    }

    // Clear completed_date when moving from completed to another status
    if (milestone.status === 'completed' && validatedData.status && validatedData.status !== 'completed') {
      updateData.completed_date = null
    }

    // Update milestone
    const { data: updatedMilestone, error: updateError } = await supabase
      .from('plan_milestones')
      .update(updateData)
      .eq('id', milestoneId)
      .select()
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update milestone' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: updatedMilestone,
      message: 'Milestone updated successfully'
    })

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

// DELETE /api/milestones/[milestoneId] - Delete milestone
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { milestoneId } = await context.params
    const supabase = await createClient()

    // Verify user owns the milestone through the plan
    const { data: milestone, error: fetchError } = await supabase
      .from('plan_milestones')
      .select(`
        id,
        plan_id,
        financial_plans!inner(user_id)
      `)
      .eq('id', milestoneId)
      .single()

    if (fetchError || !milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    // Check if user owns the plan
    if ((milestone.financial_plans as any).user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete milestone
    const { error: deleteError } = await supabase
      .from('plan_milestones')
      .delete()
      .eq('id', milestoneId)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete milestone' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Milestone deleted successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}