// src/app/api/expenses/recent/route.ts
// API endpoint for fetching user's recent transactions for personalized suggestions

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const days = parseInt(searchParams.get('days') || '30') // Look back 30 days by default

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch recent transactions
    const { data: transactions, error: fetchError } = await supabase
      .from('expense_transactions')
      .select(`
        id,
        description,
        amount,
        transaction_type,
        merchant_name,
        transaction_date,
        expense_categories (
          name_vi,
          name_en
        ),
        income_categories (
          name_vi,
          name_en
        )
      `)
      .eq('user_id', session.user.id)
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit * 2) // Fetch more to account for duplicates

    if (fetchError) {
      console.error('Error fetching recent transactions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch recent transactions' },
        { status: 500 }
      )
    }

    // Process and deduplicate transactions
    const processedTransactions = transactions?.map(transaction => ({
      id: transaction.id,
      description: transaction.description || '',
      amount: transaction.amount,
      transaction_type: transaction.transaction_type,
      merchant_name: transaction.merchant_name || '',
      transaction_date: transaction.transaction_date,
      category_name: transaction.transaction_type === 'expense' 
        ? (transaction.expense_categories as any)?.name_vi 
        : (transaction.income_categories as any)?.name_vi
    })) || []

    // Remove duplicate patterns (same description and similar amount)
    const uniqueTransactions = []
    const seenPatterns = new Set()

    for (const transaction of processedTransactions) {
      const pattern = `${transaction.description.toLowerCase().trim()}_${Math.round(transaction.amount / 10000)}`
      
      if (!seenPatterns.has(pattern)) {
        seenPatterns.add(pattern)
        uniqueTransactions.push(transaction)
      }
      
      if (uniqueTransactions.length >= limit) break
    }

    // Calculate frequency for remaining transactions
    const frequencyMap = new Map<string, number>()
    processedTransactions.forEach(transaction => {
      const key = transaction.description.toLowerCase().trim()
      if (key.length > 2) {
        frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1)
      }
    })

    // Add frequency to results
    const transactionsWithFrequency = uniqueTransactions.map(transaction => ({
      ...transaction,
      frequency: frequencyMap.get(transaction.description.toLowerCase().trim()) || 1
    }))

    return NextResponse.json({
      success: true,
      transactions: transactionsWithFrequency,
      metadata: {
        total_found: transactions?.length || 0,
        unique_patterns: uniqueTransactions.length,
        date_range: {
          start: startDate.toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      }
    })

  } catch (error) {
    console.error('Unexpected error in recent transactions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}