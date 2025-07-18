// src/app/api/plans/[planId]/visibility/route.ts
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateVisibilitySchema = z.object({
  is_public: z.boolean()
})

// PUT /api/plans/[planId]/visibility - Update plan visibility
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
    const { is_public } = updateVisibilitySchema.parse(body)

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

    // Update plan visibility
    const { data: plan, error: updateError } = await supabase
      .from('financial_plans')
      .update({
        is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating plan visibility:', updateError)
      return NextResponse.json({ error: 'Failed to update plan visibility' }, { status: 500 })
    }

    return NextResponse.json({ data: plan })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Unexpected error in PUT /api/plans/[planId]/visibility:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}