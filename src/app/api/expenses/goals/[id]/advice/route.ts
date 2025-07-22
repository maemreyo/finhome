// src/app/api/expenses/goals/[id]/advice/route.ts
// API endpoint for generating personalized financial advice for specific savings goals

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoalAdviceService } from '@/lib/services/goalAdviceService'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/expenses/goals/[id]/advice - Get personalized advice for a specific goal
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const goalId = params.id
    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    // Verify goal ownership
    const { data: goal, error: goalError } = await supabase
      .from('expense_goals')
      .select('id, user_id')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 })
    }

    // Initialize advice service and generate recommendations
    const adviceService = new GoalAdviceService()
    const advice = await adviceService.generateGoalAdvice(user.id, goalId)

    return NextResponse.json({ advice })

  } catch (error) {
    console.error('Goal advice API error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate advice',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/expenses/goals/[id]/advice - Update user's response to advice (for analytics)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const goalId = params.id
    const body = await request.json()
    const { action, category_id, recommendation_id, feedback } = body

    // Log user's interaction with advice for analytics
    const { error: logError } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: 'goal_advice_interaction',
        action,
        resource_type: 'expense_goal',
        resource_id: goalId,
        metadata: {
          category_id,
          recommendation_id,
          feedback,
          timestamp: new Date().toISOString()
        }
      })

    if (logError) {
      console.error('Error logging advice interaction:', logError)
    }

    // If user accepted a recommendation, create a spending plan
    if (action === 'accept_recommendation' && category_id) {
      const { error: planError } = await supabase
        .from('expense_budgets')
        .upsert({
          user_id: user.id,
          category_id,
          amount: body.new_budget_limit || 0,
          period_type: 'monthly',
          is_active: true,
          created_from: 'goal_advice',
          metadata: {
            goal_id: goalId,
            recommendation_type: 'spending_reduction',
            original_spending: body.original_spending,
            target_reduction: body.target_reduction
          }
        })

      if (planError) {
        console.error('Error creating spending plan:', planError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Advice interaction recorded successfully' 
    })

  } catch (error) {
    console.error('Goal advice interaction error:', error)
    return NextResponse.json({ 
      error: 'Failed to record advice interaction' 
    }, { status: 500 })
  }
}