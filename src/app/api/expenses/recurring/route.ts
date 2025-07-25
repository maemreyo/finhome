// src/app/api/expenses/recurring/route.ts
// API endpoints for managing recurring transactions
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Recurring transaction validation schema
const createRecurringTransactionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  wallet_id: z.string().uuid(),
  transaction_type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive(),
  description: z.string().optional(),
  expense_category_id: z.string().uuid().optional(),
  income_category_id: z.string().uuid().optional(),
  transfer_to_wallet_id: z.string().uuid().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  frequency_interval: z.number().min(1).max(365).default(1),
  start_date: z.string(), // ISO date string
  end_date: z.string().optional(), // ISO date string
  max_occurrences: z.number().positive().optional(),
})

const updateRecurringTransactionSchema = createRecurringTransactionSchema.partial()

const querySchema = z.object({
  user_id: z.string().uuid().optional(),
  is_active: z.enum(['true', 'false']).optional(),
  transaction_type: z.enum(['income', 'expense', 'transfer']).optional(),
  limit: z.string().transform(val => parseInt(val) || 50).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
})

// Calculate next due date based on frequency
function calculateNextDueDate(startDate: Date, frequency: string, interval: number): Date {
  const nextDate = new Date(startDate)
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval)
      break
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (interval * 7))
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval)
      break
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval)
      break
  }
  
  return nextDate
}

// GET /api/expenses/recurring - Fetch user's recurring transactions
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
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = querySchema.parse(queryParams)

    // Build the query
    let query = supabase
      .from('recurring_transactions')
      .select(`
        *,
        expense_category:expense_categories(*),
        income_category:income_categories(*),
        wallet:expense_wallets(*),
        transfer_wallet:expense_wallets!recurring_transactions_transfer_to_wallet_id_fkey(*)
      `)
      .eq('user_id', user.id)

    // Apply filters
    if (validatedQuery.is_active !== undefined) {
      query = query.eq('is_active', validatedQuery.is_active === 'true')
    }
    if (validatedQuery.transaction_type) {
      query = query.eq('transaction_type', validatedQuery.transaction_type)
    }

    // Apply pagination and sorting
    query = query.order('created_at', { ascending: false })
    if (validatedQuery.limit) {
      query = query.limit(validatedQuery.limit)
    }
    if (validatedQuery.offset) {
      query = query.range(validatedQuery.offset, validatedQuery.offset + (validatedQuery.limit || 50) - 1)
    }

    const { data: recurringTransactions, error } = await query

    if (error) {
      console.error('Error fetching recurring transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch recurring transactions' }, { status: 500 })
    }

    return NextResponse.json({ 
      recurringTransactions,
      pagination: {
        limit: validatedQuery.limit || 50,
        offset: validatedQuery.offset || 0,
        total: recurringTransactions.length
      }
    })

  } catch (error) {
    console.error('Recurring transactions API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/expenses/recurring - Create new recurring transaction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRecurringTransactionSchema.parse(body)

    // Validate business rules
    if (validatedData.transaction_type === 'expense' && !validatedData.expense_category_id) {
      return NextResponse.json({ error: 'Expense category is required for expense transactions' }, { status: 400 })
    }
    if (validatedData.transaction_type === 'income' && !validatedData.income_category_id) {
      return NextResponse.json({ error: 'Income category is required for income transactions' }, { status: 400 })
    }
    if (validatedData.transaction_type === 'transfer' && !validatedData.transfer_to_wallet_id) {
      return NextResponse.json({ error: 'Destination wallet is required for transfer transactions' }, { status: 400 })
    }

    // Verify wallet ownership
    const { data: wallet, error: walletError } = await supabase
      .from('expense_wallets')
      .select('*')
      .eq('id', validatedData.wallet_id)
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Wallet not found or unauthorized' }, { status: 404 })
    }

    // For transfers, verify destination wallet
    if (validatedData.transfer_to_wallet_id) {
      const { data: transferWallet, error: transferWalletError } = await supabase
        .from('expense_wallets')
        .select('*')
        .eq('id', validatedData.transfer_to_wallet_id)
        .eq('user_id', user.id)
        .single()

      if (transferWalletError || !transferWallet) {
        return NextResponse.json({ error: 'Transfer destination wallet not found' }, { status: 404 })
      }
    }

    // Calculate next due date
    const startDate = new Date(validatedData.start_date)
    const nextDueDate = calculateNextDueDate(startDate, validatedData.frequency, validatedData.frequency_interval)

    // Create the recurring transaction
    const recurringData = {
      user_id: user.id,
      ...validatedData,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date || null,
      next_due_date: nextDueDate.toISOString().split('T')[0],
      occurrences_created: 0,
      is_active: true,
    }

    const { data: recurringTransaction, error: createError } = await supabase
      .from('recurring_transactions')
      .insert([recurringData])
      .select(`
        *,
        expense_category:expense_categories(*),
        income_category:income_categories(*),
        wallet:expense_wallets(*),
        transfer_wallet:expense_wallets!recurring_transactions_transfer_to_wallet_id_fkey(*)
      `)
      .single()

    if (createError) {
      console.error('Error creating recurring transaction:', createError)
      return NextResponse.json({ error: 'Failed to create recurring transaction' }, { status: 500 })
    }

    // Update user activity tracking
    await supabase.from('user_activities').insert({
      user_id: user.id,
      activity_type: 'expense_tracking',
      action: 'create_recurring_transaction',
      resource_type: 'recurring_transaction',
      resource_id: recurringTransaction.id,
      metadata: {
        name: recurringTransaction.name,
        transaction_type: recurringTransaction.transaction_type,
        amount: recurringTransaction.amount,
        frequency: recurringTransaction.frequency
      }
    })

    return NextResponse.json({ recurringTransaction }, { status: 201 })

  } catch (error) {
    console.error('Create recurring transaction error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid recurring transaction data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}