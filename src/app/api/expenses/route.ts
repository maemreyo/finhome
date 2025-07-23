// src/app/api/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Transaction validation schema
const createTransactionSchema = z.object({
  wallet_id: z.string().uuid(),
  transaction_type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive(),
  description: z.string().optional(),
  notes: z.string().optional(),
  expense_category_id: z.string().uuid().optional(),
  income_category_id: z.string().uuid().optional(),
  transfer_to_wallet_id: z.string().uuid().optional(),
  transfer_fee: z.number().min(0).optional(),
  transaction_date: z.string().optional(),
  transaction_time: z.string().optional(),
  receipt_images: z.array(z.string()).optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
  merchant_name: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const querySchema = z.object({
  wallet_id: z.string().uuid().optional(),
  transaction_type: z.enum(['income', 'expense', 'transfer']).optional(),
  category_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  limit: z.string().transform(val => parseInt(val) || 50).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
  sort: z.enum(['date_desc', 'date_asc', 'amount_desc', 'amount_asc']).optional(),
})

// GET /api/expenses - Fetch user's transactions
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
      .from('expense_transactions')
      .select(`
        *,
        expense_category:expense_categories(*),
        income_category:income_categories(*),
        wallet:expense_wallets!expense_transactions_wallet_id_fkey(*),
        transfer_wallet:expense_wallets!expense_transactions_transfer_to_wallet_id_fkey(*)
      `)
      .eq('user_id', user.id)

    // Apply filters
    if (validatedQuery.wallet_id) {
      query = query.eq('wallet_id', validatedQuery.wallet_id)
    }
    if (validatedQuery.transaction_type) {
      query = query.eq('transaction_type', validatedQuery.transaction_type)
    }
    if (validatedQuery.category_id) {
      query = query.or(`expense_category_id.eq.${validatedQuery.category_id},income_category_id.eq.${validatedQuery.category_id}`)
    }
    if (validatedQuery.start_date) {
      query = query.gte('transaction_date', validatedQuery.start_date)
    }
    if (validatedQuery.end_date) {
      query = query.lte('transaction_date', validatedQuery.end_date)
    }

    // Apply sorting
    switch (validatedQuery.sort) {
      case 'date_asc':
        query = query.order('transaction_date', { ascending: true })
        break
      case 'amount_desc':
        query = query.order('amount', { ascending: false })
        break
      case 'amount_asc':
        query = query.order('amount', { ascending: true })
        break
      default:
        query = query.order('transaction_date', { ascending: false })
    }

    // Apply pagination
    if (validatedQuery.limit) {
      query = query.limit(validatedQuery.limit)
    }
    if (validatedQuery.offset) {
      query = query.range(validatedQuery.offset, validatedQuery.offset + (validatedQuery.limit || 50) - 1)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json({ 
      transactions,
      pagination: {
        limit: validatedQuery.limit || 50,
        offset: validatedQuery.offset || 0,
        total: transactions.length
      }
    })

  } catch (error) {
    console.error('Expenses API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/expenses - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received transaction data:', body) // Debug log
    const validatedData = createTransactionSchema.parse(body)
    console.log('Validated transaction data:', validatedData) // Debug log

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

    // Create the transaction
    const transactionData = {
      user_id: user.id,
      ...validatedData,
      transaction_date: validatedData.transaction_date || new Date().toISOString().split('T')[0],
      transaction_time: validatedData.transaction_time || new Date().toISOString().split('T')[1].split('.')[0],
    }

    console.log('Transaction data being inserted:', transactionData) // Debug log
    
    const { data: transaction, error: createError } = await supabase
      .from('expense_transactions')
      .insert([transactionData])
      .select(`
        *,
        expense_category:expense_categories(*),
        income_category:income_categories(*),
        wallet:expense_wallets!expense_transactions_wallet_id_fkey(*),
        transfer_wallet:expense_wallets!expense_transactions_transfer_to_wallet_id_fkey(*)
      `)
      .single()

    if (createError) {
      console.error('Error creating transaction:', createError)
      console.error('Transaction data that failed:', transactionData) // Debug log
      return NextResponse.json({ error: 'Failed to create transaction', details: createError.message }, { status: 500 })
    }

    // Skip user activity tracking for now (table doesn't exist in current schema)

    return NextResponse.json({ transaction }, { status: 201 })

  } catch (error) {
    console.error('Create transaction error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid transaction data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}