// src/app/api/banks/rates/route.ts
// API routes for bank interest rates with real database integration

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { calculateMonthlyPayment, calculateFinancialMetrics, type LoanParameters } from '@/lib/financial/calculations'

const querySchema = z.object({
  loanType: z.enum(['personal', 'home_purchase', 'investment', 'commercial']).optional(),
  bankId: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  termMonths: z.coerce.number().optional(),
  isActive: z.coerce.boolean().optional(),
  action: z.enum(['compare', 'optimal']).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = querySchema.parse(queryParams)

    const supabase = await createClient()

    // Handle special actions
    if (validatedQuery.action === 'compare') {
      return handleCompareRates(supabase, validatedQuery)
    }

    // Build base query for bank interest rates with bank information
    let query = supabase
      .from('bank_interest_rates')
      .select(`
        *,
        banks!inner (
          id,
          bank_code,
          bank_name,
          bank_name_en,
          logo_url,
          is_active
        )
      `)
      .eq('is_active', true)
      .eq('banks.is_active', true)
      .order('base_rate', { ascending: true })

    // Apply filters
    if (validatedQuery.loanType) {
      query = query.eq('loan_type', validatedQuery.loanType)
    }

    if (validatedQuery.bankId) {
      query = query.eq('bank_id', validatedQuery.bankId)
    }

    if (validatedQuery.minAmount) {
      query = query.lte('min_amount', validatedQuery.minAmount)
    }

    if (validatedQuery.maxAmount) {
      query = query.gte('max_amount', validatedQuery.maxAmount)
    }

    if (validatedQuery.termMonths) {
      query = query
        .lte('min_term_months', validatedQuery.termMonths)
        .gte('max_term_months', validatedQuery.termMonths)
    }

    const { data: rates, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bank rates' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: rates || [] })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
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

const optimalRateSchema = z.object({
  loanAmount: z.number().min(100000000, 'Minimum 100M VND'),
  termMonths: z.number().min(12).max(360),
  loanType: z.enum(['personal', 'home_purchase', 'investment', 'commercial']),
  downPaymentRatio: z.number().min(0).max(100).default(20)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = optimalRateSchema.parse(body)
    
    const supabase = await createClient()

    // Get all applicable rates for the loan
    const { data: rates, error } = await supabase
      .from('bank_interest_rates')
      .select(`
        *,
        banks!inner (
          id,
          bank_code,
          bank_name,
          bank_name_en,
          logo_url,
          is_active
        )
      `)
      .eq('loan_type', validatedData.loanType)
      .eq('is_active', true)
      .eq('banks.is_active', true)
      .lte('min_amount', validatedData.loanAmount)
      .gte('max_amount', validatedData.loanAmount)
      .lte('min_term_months', validatedData.termMonths)
      .gte('max_term_months', validatedData.termMonths)
      .order('base_rate', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bank rates' },
        { status: 500 }
      )
    }

    // Calculate optimal rates with recommendations
    const recommendedRates = (rates || []).map(rate => {
      const loanParams: LoanParameters = {
        principal: validatedData.loanAmount,
        annualRate: rate.interest_rate,
        termMonths: validatedData.termMonths
      }

      const monthlyPayment = calculateMonthlyPayment(loanParams)
      const totalInterest = (monthlyPayment * validatedData.termMonths) - validatedData.loanAmount
      const processingFee = rate.processing_fee || 0
      const totalCost = validatedData.loanAmount + totalInterest + processingFee

      const effectiveRate = rate.interest_rate
      
      // Generate recommendation
      let recommendation: 'excellent' | 'good' | 'average' | 'poor' = 'average'
      const pros: string[] = []
      const cons: string[] = []

      if (effectiveRate < 8) {
        recommendation = 'excellent'
        pros.push(`Excellent rate of ${effectiveRate}%`)
      } else if (effectiveRate < 10) {
        recommendation = 'good'
        pros.push(`Competitive rate of ${effectiveRate}%`)
      } else if (effectiveRate > 12) {
        recommendation = 'poor'
        cons.push(`High interest rate of ${effectiveRate}%`)
      }

      if (processingFee < 1000000) { // Less than 1M VND
        pros.push('Low processing fees')
      } else if (processingFee > 5000000) { // More than 5M VND
        cons.push('High processing fees')
      }

      if (rate.max_ltv_ratio && rate.max_ltv_ratio >= 85) {
        pros.push('High LTV ratio available')
      }

      return {
        rate,
        effectiveRate,
        monthlyPayment,
        totalInterest,
        totalCost,
        recommendation,
        pros,
        cons
      }
    })

    // Calculate market averages
    const marketAverage = {
      baseRate: rates?.reduce((sum, rate) => sum + rate.interest_rate, 0) / (rates?.length || 1) || 0,
      processingFee: rates?.reduce((sum, rate) => sum + (rate.processing_fee || 0), 0) / (rates?.length || 1) || 0
    }

    return NextResponse.json({
      recommendedRates,
      marketAverage
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
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

// Handle comparing rates with real database
async function handleCompareRates(supabase: any, validatedQuery: any) {
  try {
    // Get all active rates for comparison
    const { data: rates, error } = await supabase
      .from('bank_interest_rates')
      .select(`
        *,
        banks!inner (
          id,
          bank_code,
          bank_name,
          bank_name_en,
          logo_url,
          is_active
        )
      `)
      .eq('is_active', true)
      .eq('banks.is_active', true)
      .order('base_rate', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bank rates for comparison' },
        { status: 500 }
      )
    }

    // Group rates by loan type for comparison
    const ratesByType = (rates || []).reduce((acc: any, rate: any) => {
      if (!acc[rate.loan_type]) {
        acc[rate.loan_type] = []
      }
      acc[rate.loan_type].push(rate)
      return acc
    }, {})

    // Calculate market statistics
    const marketStats = Object.keys(ratesByType).reduce((stats: any, loanType: string) => {
      const typeRates = ratesByType[loanType]
      const baseRates = typeRates.map((r: any) => r.base_rate)
      
      stats[loanType] = {
        averageRate: baseRates.reduce((sum: number, rate: number) => sum + rate, 0) / baseRates.length,
        minRate: Math.min(...baseRates),
        maxRate: Math.max(...baseRates),
        totalOffers: typeRates.length
      }
      return stats
    }, {})

    return NextResponse.json({
      ratesByType,
      marketStats,
      totalRates: rates?.length || 0
    })

  } catch (error) {
    console.error('Error comparing rates:', error)
    return NextResponse.json(
      { error: 'Failed to compare loan options' },
      { status: 500 }
    )
  }
}