// src/app/api/expenses/goals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  description: z.string().optional(),
  goal_type: z.enum(['general_savings', 'emergency_fund', 'vacation', 'education', 'buy_house', 'buy_car', 'other']),
  target_amount: z.number().positive(),
  monthly_target: z.number().positive().optional(),
  target_date: z.string().optional(),
  deadline: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  image_url: z.string().optional(),
  house_purchase_data: z.object({
    property_type: z.string().optional(),
    preferred_location: z.string().optional(),
    budget_range: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    timeline_months: z.number().optional(),
    down_payment_percentage: z.number().min(0).max(100).optional(),
  }).optional(),
})

const addContributionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  wallet_id: z.string().uuid(),
  contribution_date: z.string().optional(),
})

// GET /api/expenses/goals - Fetch user's savings goals
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'active' | 'completed' | 'paused' | 'cancelled' | null
    const goalType = searchParams.get('type') as string | null

    let query = supabase
      .from('expense_goals')
      .select(`
        *,
        contributions:goal_contributions(
          id,
          amount,
          contribution_date,
          description,
          wallet:expense_wallets(name, icon, color)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (goalType) {
      query = query.eq('goal_type', goalType as any)
    }

    const { data: goals, error } = await query

    if (error) {
      console.error('Error fetching goals:', error)
      return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
    }

    // Enhance goals with calculated fields
    const enhancedGoals = goals.map(goal => {
      const totalContributions = goal.contributions?.reduce(
        (sum: number, contrib: any) => sum + Number(contrib.amount), 
        0
      ) || 0
      
      const progressPercentage = goal.target_amount > 0 ? 
        (totalContributions / Number(goal.target_amount)) * 100 : 0

      const monthsRemaining = goal.target_date ? 
        Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))) : null

      const requiredMonthlySavings = monthsRemaining && monthsRemaining > 0 ? 
        (Number(goal.target_amount) - totalContributions) / monthsRemaining : null

      return {
        ...goal,
        current_amount: totalContributions,
        progress_percentage: Math.min(progressPercentage, 100),
        months_remaining: monthsRemaining,
        required_monthly_savings: requiredMonthlySavings,
        is_on_track: goal.monthly_target ? 
          (requiredMonthlySavings ? requiredMonthlySavings <= Number(goal.monthly_target) : true) : null,
      }
    })

    return NextResponse.json({ goals: enhancedGoals })

  } catch (error) {
    console.error('Goals API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/expenses/goals - Create new savings goal
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createGoalSchema.parse(body)

    // Validate dates
    if (validatedData.target_date && validatedData.deadline) {
      const targetDate = new Date(validatedData.target_date)
      const deadline = new Date(validatedData.deadline)
      
      if (deadline < targetDate) {
        return NextResponse.json({ error: 'Deadline must be after target date' }, { status: 400 })
      }
    }

    // Special handling for house purchase goals
    if (validatedData.goal_type === 'buy_house') {
      // Set default funnel stage
      validatedData.house_purchase_data = {
        ...validatedData.house_purchase_data,
        funnel_stage: 'initial'
      } as any

      // Validate house purchase specific data
      if (validatedData.house_purchase_data && 
          !validatedData.house_purchase_data?.budget_range?.min && 
          !validatedData.house_purchase_data?.budget_range?.max) {
        // Provide default budget range based on target amount
        const estimatedPropertyPrice = Number(validatedData.target_amount) * 4 // Assuming 25% down payment
        validatedData.house_purchase_data.budget_range = {
          min: estimatedPropertyPrice * 0.8,
          max: estimatedPropertyPrice * 1.2
        }
      }
    }

    // Create the goal
    const goalData = {
      user_id: user.id,
      ...validatedData,
      start_date: new Date().toISOString().split('T')[0],
    }

    const { data: goal, error: createError } = await supabase
      .from('expense_goals')
      .insert([goalData])
      .select('*')
      .single()

    if (createError) {
      console.error('Error creating goal:', createError)
      return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
    }

    // Create initial activity log
    await supabase.from('user_activities').insert({
      user_id: user.id,
      activity_type: 'goal_management',
      action: 'create_goal',
      resource_type: 'expense_goal',
      resource_id: goal.id,
      metadata: {
        goal_type: goal.goal_type,
        target_amount: goal.target_amount,
        is_house_goal: goal.goal_type === 'buy_house'
      }
    })

    // If this is a house purchase goal, create a notification
    if (goal.goal_type === 'buy_house') {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'achievement',
        title: 'House Purchase Goal Created!',
        message: 'Great start on your home ownership journey! Track your progress and get personalized recommendations.',
        action_url: `/dashboard/expenses/goals/${goal.id}`,
        metadata: {
          goal_id: goal.id,
          funnel_trigger: true,
          stage: 'goal_created'
        }
      })

      // Check for house purchase achievement
      const { data: achievement } = await supabase
        .from('expense_achievements')
        .select('*')
        .eq('name_en', 'House Fund Started')
        .single()

      if (achievement) {
        // Check if user already has this achievement
        const { data: existingUserAchievement } = await supabase
          .from('user_expense_achievements')
          .select('*')
          .eq('user_id', user.id)
          .eq('achievement_id', achievement.id)
          .single()

        if (!existingUserAchievement) {
          await supabase.from('user_expense_achievements').insert({
            user_id: user.id,
            achievement_id: achievement.id,
            current_progress: 1,
            required_progress: 1,
            is_unlocked: true,
            unlocked_at: new Date().toISOString()
          })

          // Update user experience
          await supabase.rpc('update_user_experience' as any, {
            user_uuid: user.id,
            points: achievement.experience_points
          })
        }
      }
    }

    return NextResponse.json({ goal }, { status: 201 })

  } catch (error) {
    console.error('Create goal error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid goal data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}