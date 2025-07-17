// src/app/api/bank-rates/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  loanAmount: z.coerce.number().min(1000000),
  termMonths: z.coerce.number().min(12).max(360),
  loanType: z.enum(['home_purchase', 'investment', 'upgrade', 'refinance']),
  downPaymentRatio: z.coerce.number().min(0).max(100).optional()
})

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const { loanAmount, termMonths, loanType, downPaymentRatio } = querySchema.parse(params)

    const supabase = await createClient()

    // Query bank rates that match the loan criteria
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
      .eq('loan_type', loanType)
      .eq('is_active', true)
      .eq('banks.is_active', true)
      .lte('min_loan_amount', loanAmount)
      .gte('max_loan_amount', loanAmount)
      .lte('min_term_months', termMonths)
      .gte('max_term_months', termMonths)
      .order('interest_rate', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch bank rates' }, { status: 500 })
    }

    // Transform to client format
    const bankRates = (rates || []).map(rate => ({
      bankId: rate.bank_id,
      bankName: rate.banks.bank_name,
      bankCode: rate.banks.bank_code,
      interestRate: rate.interest_rate,
      minAmount: rate.min_loan_amount,
      maxAmount: rate.max_loan_amount,
      minTermMonths: rate.min_term_months,
      maxTermMonths: rate.max_term_months,
      processingFee: rate.processing_fee,
      maxLtvRatio: rate.max_ltv_ratio
    }))

    const bestRate = bankRates[0]
    const marketAverage = bankRates.length > 0 
      ? bankRates.reduce((sum, rate) => sum + rate.interestRate, 0) / bankRates.length
      : 10.5

    return NextResponse.json({
      bestRate,
      recommendedRates: bankRates.slice(0, 5),
      marketAverage,
      totalOptions: bankRates.length
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}