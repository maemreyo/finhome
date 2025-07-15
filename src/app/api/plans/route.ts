// src/app/api/plans/route.ts
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateFinancialMetrics, type LoanParameters } from '@/lib/financial/calculations'

const createPlanSchema = z.object({
  planName: z.string().min(1, 'Plan name is required').max(255),
  planDescription: z.string().optional(),
  planType: z.enum(['home_purchase', 'investment', 'upgrade', 'refinance']),
  purchasePrice: z.number().min(100000000, 'Minimum 100M VND'),
  downPayment: z.number().min(10000000, 'Minimum 10M VND'),
  additionalCosts: z.number().min(0).default(0),
  monthlyIncome: z.number().min(5000000, 'Minimum 5M VND'),
  monthlyExpenses: z.number().min(1000000, 'Minimum 1M VND'),
  currentSavings: z.number().min(0),
  otherDebts: z.number().min(0).default(0),
  expectedRentalIncome: z.number().optional(),
  expectedAppreciationRate: z.number().min(0).max(30).optional(),
  investmentHorizonYears: z.number().min(1).max(30).optional(),
  isPublic: z.boolean().default(false)
})

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
  planType: z.enum(['home_purchase', 'investment', 'upgrade', 'refinance']).optional(),
  isPublic: z.coerce.boolean().optional(),
  search: z.string().optional()
})

// GET /api/plans - Get user's financial plans
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const validatedQuery = querySchema.parse(queryParams)

    const supabase = await createClient()
    
    // Build query
    let query = supabase
      .from('financial_plans')
      .select(`
        *,
        loan_terms (*),
        scenarios (
          id,
          scenario_name,
          scenario_type,
          calculated_results
        )
      `)
      .or(`user_id.eq.${user.id},and(is_public.eq.true)`)
      .order('updated_at', { ascending: false })
      .range(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit - 1)

    // Apply filters
    if (validatedQuery.status) {
      query = query.eq('plan_status', validatedQuery.status)
    }

    if (validatedQuery.planType) {
      query = query.eq('plan_type', validatedQuery.planType)
    }

    if (validatedQuery.isPublic !== undefined) {
      query = query.eq('is_public', validatedQuery.isPublic)
    }

    if (validatedQuery.search) {
      query = query.ilike('plan_name', `%${validatedQuery.search}%`)
    }

    const { data: plans, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch plans' },
        { status: 500 }
      )
    }

    // Calculate financial metrics for each plan if not cached
    const plansWithMetrics = await Promise.all(
      plans?.map(async (plan) => {
        try {
          let cachedCalculations = plan.cached_calculations

          // Recalculate if cache is stale or missing
          if (!cachedCalculations || new Date(plan.calculations_last_updated) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            const loanAmount = plan.purchase_price - plan.down_payment
            const loanParams: LoanParameters = {
              principal: loanAmount,
              annualRate: 10.5, // Default rate - should come from loan_terms
              termMonths: 240,
              promotionalRate: 7.5,
              promotionalPeriodMonths: 24
            }

            const personalFinances = {
              monthlyIncome: plan.monthly_income,
              monthlyExpenses: plan.monthly_expenses
            }

            const investmentParams = plan.expected_rental_income ? {
              expectedRentalIncome: plan.expected_rental_income,
              propertyExpenses: plan.expected_rental_income * 0.1,
              appreciationRate: plan.expected_appreciation_rate || 8,
              initialPropertyValue: plan.purchase_price
            } : undefined

            const metrics = calculateFinancialMetrics(
              loanParams,
              personalFinances,
              investmentParams
            )

            cachedCalculations = {
              monthlyPayment: metrics.monthlyPayment,
              totalInterest: metrics.totalInterest,
              debtToIncomeRatio: metrics.debtToIncomeRatio,
              affordabilityScore: metrics.affordabilityScore,
              roi: metrics.roi,
              paybackPeriod: metrics.paybackPeriod
            }

            // Update cache in database (fire and forget)
            supabase
              .from('financial_plans')
              .update({
                cached_calculations: cachedCalculations,
                calculations_last_updated: new Date().toISOString()
              })
              .eq('id', plan.id)
              .then()
          }

          return {
            ...plan,
            calculatedMetrics: cachedCalculations
          }
        } catch (error) {
          console.error(`Error calculating metrics for plan ${plan.id}:`, error)
          return plan
        }
      }) || []
    )

    return NextResponse.json({
      data: plansWithMetrics,
      count,
      pagination: {
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        total: count || 0
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/plans - Create new financial plan
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createPlanSchema.parse(body)

    // Calculate financial metrics
    const loanAmount = validatedData.purchasePrice - validatedData.downPayment
    const loanParams: LoanParameters = {
      principal: loanAmount,
      annualRate: 10.5, // Default rate
      termMonths: 240, // 20 years
      promotionalRate: 7.5,
      promotionalPeriodMonths: 24
    }

    const personalFinances = {
      monthlyIncome: validatedData.monthlyIncome,
      monthlyExpenses: validatedData.monthlyExpenses
    }

    const investmentParams = validatedData.expectedRentalIncome ? {
      expectedRentalIncome: validatedData.expectedRentalIncome,
      propertyExpenses: validatedData.expectedRentalIncome * 0.1,
      appreciationRate: validatedData.expectedAppreciationRate || 8,
      initialPropertyValue: validatedData.purchasePrice
    } : undefined

    const metrics = calculateFinancialMetrics(
      loanParams,
      personalFinances,
      investmentParams
    )

    const cachedCalculations = {
      monthlyPayment: metrics.monthlyPayment,
      totalInterest: metrics.totalInterest,
      debtToIncomeRatio: metrics.debtToIncomeRatio,
      affordabilityScore: metrics.affordabilityScore,
      roi: metrics.roi,
      paybackPeriod: metrics.paybackPeriod
    }

    const supabase = await createClient()

    // Insert financial plan
    const { data: plan, error: planError } = await supabase
      .from('financial_plans')
      .insert({
        user_id: user.id,
        plan_name: validatedData.planName,
        plan_description: validatedData.planDescription,
        plan_type: validatedData.planType,
        purchase_price: validatedData.purchasePrice,
        down_payment: validatedData.downPayment,
        additional_costs: validatedData.additionalCosts,
        monthly_income: validatedData.monthlyIncome,
        monthly_expenses: validatedData.monthlyExpenses,
        current_savings: validatedData.currentSavings,
        other_debts: validatedData.otherDebts,
        expected_rental_income: validatedData.expectedRentalIncome,
        expected_appreciation_rate: validatedData.expectedAppreciationRate,
        investment_horizon_years: validatedData.investmentHorizonYears,
        is_public: validatedData.isPublic,
        plan_status: 'draft',
        cached_calculations: cachedCalculations,
        calculations_last_updated: new Date().toISOString()
      })
      .select()
      .single()

    if (planError) {
      console.error('Failed to create plan:', planError)
      return NextResponse.json(
        { error: 'Failed to create plan' },
        { status: 500 }
      )
    }

    // Create default loan terms
    const { data: loanTerms, error: loanTermsError } = await supabase
      .from('loan_terms')
      .insert({
        financial_plan_id: plan.id,
        loan_amount: loanAmount,
        loan_term_years: 20,
        promotional_rate: 7.5,
        promotional_period_months: 24,
        regular_rate: 10.5,
        rate_type: 'fixed',
        bank_name: 'TBD',
        monthly_payment_promotional: Math.round(loanAmount * 0.075 / 12 * Math.pow(1 + 0.075/12, 240) / (Math.pow(1 + 0.075/12, 240) - 1)),
        monthly_payment_regular: metrics.monthlyPayment,
        total_interest: metrics.totalInterest,
        total_payments: loanAmount + metrics.totalInterest
      })
      .select()
      .single()

    if (loanTermsError) {
      console.error('Failed to create loan terms:', loanTermsError)
      // Clean up the plan if loan terms creation failed
      await supabase.from('financial_plans').delete().eq('id', plan.id)
      return NextResponse.json({ error: 'Failed to create loan terms' }, { status: 500 })
    }

    // Create baseline scenario
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .insert({
        financial_plan_id: plan.id,
        scenario_name: 'Kịch bản cơ bản',
        scenario_type: 'baseline',
        scenario_description: 'Kế hoạch tài chính ban đầu',
        modified_parameters: {},
        assumptions: {
          economicGrowth: 5,
          inflationRate: 4,
          propertyMarketTrend: 'stable',
          personalCareerGrowth: 5,
          emergencyFundMonths: 6
        },
        calculated_results: cachedCalculations,
        is_favorite: false
      })
      .select()
      .single()

    if (scenarioError) {
      console.error('Error creating baseline scenario:', scenarioError)
      // Don't fail the whole operation, just log the error
    }

    return NextResponse.json({
      data: {
        ...plan,
        calculatedMetrics: cachedCalculations,
        loanTerms,
        scenario
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
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