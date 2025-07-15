// src/app/api/banks/rates/route.ts
// API routes for bank interest rates

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { bankService } from '@/lib/services/bankService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bankName = searchParams.get('bank')
    const loanTerm = searchParams.get('term')
    const action = searchParams.get('action')

    // Handle different actions
    switch (action) {
      case 'compare':
        return handleCompareRates(searchParams)
      case 'trends':
        return handleGetTrends(bankName)
      case 'banks':
        return handleGetBanks()
      default:
        return handleGetRates(bankName, loanTerm)
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'seed') {
      // Seed initial bank data (admin only)
      await bankService.seedBankData()
      return NextResponse.json({ success: true, message: 'Bank data seeded successfully' })
    }

    // Create new interest rate entry
    const {
      bank_name,
      bank_code,
      rate_type,
      loan_term_years,
      interest_rate,
      ...otherData
    } = body

    if (!bank_name || !rate_type || !loan_term_years || !interest_rate) {
      return NextResponse.json(
        { error: 'Missing required fields: bank_name, rate_type, loan_term_years, interest_rate' },
        { status: 400 }
      )
    }

    const { data: rate, error } = await supabase
      .from('bank_interest_rates')
      .insert([{
        ...otherData,
        bank_name,
        bank_code,
        rate_type,
        loan_term_years,
        interest_rate,
        effective_date: new Date().toISOString().split('T')[0],
        is_current: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create interest rate' },
        { status: 500 }
      )
    }

    return NextResponse.json(rate, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle getting interest rates
async function handleGetRates(bankName: string | null, loanTerm: string | null) {
  try {
    let rates

    if (bankName) {
      rates = await bankService.getRatesByBank(bankName)
    } else if (loanTerm) {
      rates = await bankService.getRatesByTerm(Number(loanTerm))
    } else {
      rates = await bankService.getCurrentRates()
    }

    return NextResponse.json(rates)

  } catch (error) {
    console.error('Error fetching rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interest rates' },
      { status: 500 }
    )
  }
}

// Handle loan comparison
async function handleCompareRates(searchParams: URLSearchParams) {
  try {
    const loanAmount = Number(searchParams.get('amount'))
    const loanTerm = Number(searchParams.get('term'))
    const downPayment = Number(searchParams.get('downPayment')) || 20

    if (!loanAmount || !loanTerm) {
      return NextResponse.json(
        { error: 'Missing required parameters: amount, term' },
        { status: 400 }
      )
    }

    const comparison = await bankService.compareLoanOptions(
      loanAmount,
      loanTerm,
      downPayment
    )

    return NextResponse.json(comparison)

  } catch (error) {
    console.error('Error comparing loans:', error)
    return NextResponse.json(
      { error: 'Failed to compare loan options' },
      { status: 500 }
    )
  }
}

// Handle getting rate trends
async function handleGetTrends(bankName: string | null) {
  try {
    const trends = await bankService.getInterestRateTrends(bankName || undefined)
    return NextResponse.json(trends)

  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interest rate trends' },
      { status: 500 }
    )
  }
}

// Handle getting available banks
async function handleGetBanks() {
  try {
    const banks = await bankService.getVietnameseBanks()
    return NextResponse.json(banks)

  } catch (error) {
    console.error('Error fetching banks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banks' },
      { status: 500 }
    )
  }
}