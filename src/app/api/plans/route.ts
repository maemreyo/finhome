// src/app/api/plans/route.ts
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateFinancialMetrics, type LoanParameters } from '@/lib/financial/calculations'
import { getOptimalBankRate, getDefaultRates, bankRateToLoanParams } from '@/lib/financial/bankRateUtils'

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
      .select('*')
      .or(`user_id.eq.${user.id},and(is_public.eq.true)`)
      .order('updated_at', { ascending: false })
      .range(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit - 1)

    // Apply filters
    if (validatedQuery.status) {
      query = query.eq('status', validatedQuery.status)
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
      (plans || []).map(async (plan) => {
        try {
          let cachedCalculations = plan.cached_calculations

          // Recalculate if cache is stale or missing
          if (!cachedCalculations || (plan.calculations_last_updated && new Date(plan.calculations_last_updated) < new Date(Date.now() - 24 * 60 * 60 * 1000))) {
            const loanAmount = (plan.purchase_price || 0) - (plan.down_payment || 0)
            
            // Get optimal bank rate for this plan
            const optimalRate = await getOptimalBankRate(
              loanAmount,
              240, // 20 years default
              plan.plan_type || 'home_purchase',
              plan.down_payment && plan.purchase_price ? (plan.down_payment / plan.purchase_price) * 100 : undefined
            )

            // Use optimal rate or fallback to defaults
            const loanParams: LoanParameters = optimalRate 
              ? bankRateToLoanParams(optimalRate.bestRate, loanAmount, 240)
              : { ...getDefaultRates(plan.plan_type || 'home_purchase'), principal: loanAmount }

            const personalFinances = {
              monthlyIncome: plan.monthly_income || 0,
              monthlyExpenses: plan.monthly_expenses || 0
            }

            const investmentParams = plan.expected_rental_income ? {
              expectedRentalIncome: plan.expected_rental_income,
              propertyExpenses: plan.expected_rental_income * 0.1,
              appreciationRate: plan.expected_appreciation_rate || 8,
              initialPropertyValue: plan.purchase_price || 0
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

    // Calculate financial metrics with real bank rates
    const loanAmount = validatedData.purchasePrice - validatedData.downPayment
    
    // Get optimal bank rate for this loan scenario
    const optimalRate = await getOptimalBankRate(
      loanAmount,
      240, // 20 years default
      validatedData.planType || 'home_purchase',
      (validatedData.downPayment / validatedData.purchasePrice) * 100
    )

    // Use optimal rate or fallback to defaults
    const loanParams: LoanParameters = optimalRate 
      ? bankRateToLoanParams(optimalRate.bestRate, loanAmount, 240)
      : { ...getDefaultRates(validatedData.planType || 'home_purchase'), principal: loanAmount }

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
        description: validatedData.planDescription,
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
        investment_horizon_months: validatedData.investmentHorizonYears ? validatedData.investmentHorizonYears * 12 : null,
        is_public: validatedData.isPublic,
        status: 'draft',
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

    // Skip loan terms creation as table doesn't exist
    const loanTerms = null

    // Skip scenario creation as table doesn't exist
    const scenario = null

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