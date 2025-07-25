// src/app/api/expenses/reports/storytelling/route.ts
// API endpoint for generating storytelling expense reports with insights

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExpenseAnalysisService } from '@/lib/services/expenseAnalysisService'
import { z } from 'zod'
import { subMonths, subDays, parseISO } from 'date-fns'

const reportQuerySchema = z.object({
  period: z.enum(['7d', '30d', '3m', '6m', '1y']).default('30d'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

// GET /api/expenses/reports/storytelling - Generate storytelling expense report
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      period: searchParams.get('period') || '30d',
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
    }
    
    const validatedQuery = reportQuerySchema.parse(queryParams)

    // Calculate date range
    let startDate: Date, endDate: Date
    
    if (validatedQuery.start_date && validatedQuery.end_date) {
      startDate = parseISO(validatedQuery.start_date)
      endDate = parseISO(validatedQuery.end_date)
    } else {
      endDate = new Date()
      
      switch (validatedQuery.period) {
        case '7d':
          startDate = subDays(endDate, 7)
          break
        case '30d':
          startDate = subDays(endDate, 30)
          break
        case '3m':
          startDate = subMonths(endDate, 3)
          break
        case '6m':
          startDate = subMonths(endDate, 6)
          break
        case '1y':
          startDate = subMonths(endDate, 12)
          break
        default:
          startDate = subDays(endDate, 30)
      }
    }

    // Fetch transactions with extended date range for comparison
    const extendedStartDate = subMonths(startDate, 6) // 6 months back for better analysis
    
    const { data: transactions, error: transactionError } = await supabase
      .from('expense_transactions')
      .select(`
        id,
        transaction_type,
        amount,
        transaction_date,
        description,
        merchant_name,
        expense_category:expense_categories(
          id,
          name_vi,
          color
        ),
        income_category:income_categories(
          id,
          name_vi,
          color
        ),
        wallet:expense_wallets!expense_transactions_wallet_id_fkey(
          name,
          color
        )
      `)
      .eq('user_id', user.id)
      .gte('transaction_date', extendedStartDate.toISOString().split('T')[0])
      .lte('transaction_date', endDate.toISOString().split('T')[0])
      .order('transaction_date', { ascending: false })

    if (transactionError) {
      console.error('Error fetching transactions:', transactionError)
      return NextResponse.json(
        { error: 'Failed to fetch transaction data' }, 
        { status: 500 }
      )
    }

    // Transform data to match service interface
    const transformedTransactions = (transactions || []).map(t => ({
      id: t.id,
      transaction_type: t.transaction_type,
      amount: t.amount,
      transaction_date: t.transaction_date,
      description: t.description || undefined,
      merchant_name: t.merchant_name || undefined,
      expense_category: t.expense_category ? {
        id: t.expense_category.id,
        name_vi: t.expense_category.name_vi,
        color: t.expense_category.color
      } : undefined,
      income_category: t.income_category ? {
        id: t.income_category.id,
        name_vi: t.income_category.name_vi,
        color: t.income_category.color
      } : undefined,
      wallet: {
        name: t.wallet?.name || 'Unknown',
        color: t.wallet?.color || '#6B7280'
      }
    }))

    // Generate storytelling report
    const report = ExpenseAnalysisService.generateStorytellingReport(
      transformedTransactions,
      user.id,
      startDate,
      endDate
    )

    // Add metadata
    const response = {
      report,
      metadata: {
        total_transactions_analyzed: transformedTransactions.length,
        period_transactions: transformedTransactions.filter(t => 
          new Date(t.transaction_date) >= startDate && 
          new Date(t.transaction_date) <= endDate
        ).length,
        insights_generated: report.insights.length,
        generated_in_ms: Date.now() - new Date(report.generated_at).getTime()
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Storytelling report error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
                { error: "Invalid input", details: error.issues }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/expenses/reports/storytelling - Generate custom storytelling report
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const requestSchema = z.object({
      start_date: z.string(),
      end_date: z.string(),
      categories: z.array(z.string()).optional(),
      wallets: z.array(z.string()).optional(),
      insight_types: z.array(z.enum(['trend', 'anomaly', 'comparison', 'milestone', 'habit', 'recommendation'])).optional(),
    })
    
    const validatedData = requestSchema.parse(body)
    
    const startDate = parseISO(validatedData.start_date)
    const endDate = parseISO(validatedData.end_date)
    
    // Build query with filters
    let query = supabase
      .from('expense_transactions')
      .select(`
        id,
        transaction_type,
        amount,
        transaction_date,
        description,
        merchant_name,
        expense_category:expense_categories(
          id,
          name_vi,
          color
        ),
        income_category:income_categories(
          id,
          name_vi,
          color
        ),
        wallet:expense_wallets!expense_transactions_wallet_id_fkey(
          name,
          color
        )
      `)
      .eq('user_id', user.id)
      .gte('transaction_date', subMonths(startDate, 6).toISOString().split('T')[0])
      .lte('transaction_date', endDate.toISOString().split('T')[0])
    
    // Apply category filter
    if (validatedData.categories && validatedData.categories.length > 0) {
      query = query.in('expense_category_id', validatedData.categories)
    }
    
    // Apply wallet filter  
    if (validatedData.wallets && validatedData.wallets.length > 0) {
      query = query.in('wallet_id', validatedData.wallets)
    }
    
    const { data: transactions, error: transactionError } = await query

    if (transactionError) {
      console.error('Error fetching transactions:', transactionError)
      return NextResponse.json(
        { error: 'Failed to fetch transaction data' }, 
        { status: 500 }
      )
    }

    // Transform data
    const transformedTransactions = (transactions || []).map(t => ({
      id: t.id,
      transaction_type: t.transaction_type,
      amount: t.amount,
      transaction_date: t.transaction_date,
      description: t.description || undefined,
      merchant_name: t.merchant_name || undefined,
      expense_category: t.expense_category ? {
        id: t.expense_category.id,
        name_vi: t.expense_category.name_vi,
        color: t.expense_category.color
      } : undefined,
      income_category: t.income_category ? {
        id: t.income_category.id,
        name_vi: t.income_category.name_vi,
        color: t.income_category.color
      } : undefined,
      wallet: {
        name: t.wallet?.name || 'Unknown',
        color: t.wallet?.color || '#6B7280'
      }
    }))

    // Generate report
    const report = ExpenseAnalysisService.generateStorytellingReport(
      transformedTransactions,
      user.id,
      startDate,
      endDate
    )

    // Filter insights by requested types
    if (validatedData.insight_types && validatedData.insight_types.length > 0) {
      report.insights = report.insights.filter(insight => 
        validatedData.insight_types!.includes(insight.type)
      )
    }

    const response = {
      report,
      filters_applied: {
        categories: validatedData.categories,
        wallets: validatedData.wallets,
        insight_types: validatedData.insight_types
      },
      metadata: {
        total_transactions_analyzed: transformedTransactions.length,
        insights_generated: report.insights.length
      }
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Custom storytelling report error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}