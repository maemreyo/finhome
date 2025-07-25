// src/app/api/expenses/recurring/[id]/route.ts
// API endpoints for individual recurring transaction operations
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Update recurring transaction validation schema
const updateRecurringTransactionSchema = z.object({
  name: z.string().min(1).optional(),
  wallet_id: z.string().uuid().optional(),
  transaction_type: z.enum(['income', 'expense', 'transfer']).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  expense_category_id: z.string().uuid().optional(),
  income_category_id: z.string().uuid().optional(),
  transfer_to_wallet_id: z.string().uuid().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  frequency_interval: z.number().min(1).max(365).optional(),
  start_date: z.string().optional(), // ISO date string
  end_date: z.string().optional(), // ISO date string
  max_occurrences: z.number().positive().optional(),
  is_active: z.boolean().optional(),
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

// GET /api/expenses/recurring/[id] - Get single recurring transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: recurringTransaction, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        expense_category:expense_categories(*),
        income_category:income_categories(*),
        wallet:expense_wallets(*),
        transfer_wallet:expense_wallets!recurring_transactions_transfer_to_wallet_id_fkey(*),
        created_transactions:expense_transactions!expense_transactions_recurring_transaction_id_fkey(
          id,
          amount,
          transaction_date,
          created_at
        )
      `)
      .eq('id', (await params).id)
      .eq('user_id', user.id)
      .single()

    if (error || !recurringTransaction) {
      return NextResponse.json({ error: 'Recurring transaction not found' }, { status: 404 })
    }

    return NextResponse.json({ recurringTransaction })

  } catch (error) {
    console.error('Get recurring transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/expenses/recurring/[id] - Update recurring transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateRecurringTransactionSchema.parse(body)

    // Get existing recurring transaction
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', (await params).id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: 'Recurring transaction not found' }, { status: 404 })
    }

    // Validate business rules if transaction type is being changed
    const newTransactionType = validatedData.transaction_type || existingTransaction.transaction_type
    if (newTransactionType === 'expense' && 
        !validatedData.expense_category_id && 
        !existingTransaction.expense_category_id) {
      return NextResponse.json({ error: 'Expense category is required for expense transactions' }, { status: 400 })
    }
    if (newTransactionType === 'income' && 
        !validatedData.income_category_id && 
        !existingTransaction.income_category_id) {
      return NextResponse.json({ error: 'Income category is required for income transactions' }, { status: 400 })
    }
    if (newTransactionType === 'transfer' && 
        !validatedData.transfer_to_wallet_id && 
        !existingTransaction.transfer_to_wallet_id) {
      return NextResponse.json({ error: 'Destination wallet is required for transfer transactions' }, { status: 400 })
    }

    // Verify wallet ownership if wallet is being changed
    if (validatedData.wallet_id) {
      const { data: wallet, error: walletError } = await supabase
        .from('expense_wallets')
        .select('*')
        .eq('id', validatedData.wallet_id)
        .eq('user_id', user.id)
        .single()

      if (walletError || !wallet) {
        return NextResponse.json({ error: 'Wallet not found or unauthorized' }, { status: 404 })
      }
    }

    // For transfers, verify destination wallet if being changed
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

    // Calculate new next due date if frequency or start date changed
    const updateData = { ...validatedData }
    if (validatedData.frequency || validatedData.frequency_interval || validatedData.start_date) {
      const startDate = new Date(validatedData.start_date || existingTransaction.start_date)
      const frequency = validatedData.frequency || existingTransaction.frequency
      const interval = validatedData.frequency_interval || existingTransaction.frequency_interval
      
      const nextDueDate = calculateNextDueDate(startDate, frequency, interval)
      updateData.next_due_date = nextDueDate.toISOString().split('T')[0]
    }

    // Update the recurring transaction
    const { data: recurringTransaction, error: updateError } = await supabase
      .from('recurring_transactions')
      .update(updateData)
      .eq('id', (await params).id)
      .eq('user_id', user.id)
      .select(`
        *,
        expense_category:expense_categories(*),
        income_category:income_categories(*),
        wallet:expense_wallets(*),
        transfer_wallet:expense_wallets!recurring_transactions_transfer_to_wallet_id_fkey(*)
      `)
      .single()

    if (updateError) {
      console.error('Error updating recurring transaction:', updateError)
      return NextResponse.json({ error: 'Failed to update recurring transaction' }, { status: 500 })
    }

    // Update user activity tracking
    await supabase.from('user_activities').insert({
      user_id: user.id,
      activity_type: 'expense_tracking',
      action: 'update_recurring_transaction',
      resource_type: 'recurring_transaction',
      resource_id: recurringTransaction.id,
      metadata: {
        name: recurringTransaction.name,
        changes: Object.keys(validatedData)
      }
    })

    return NextResponse.json({ recurringTransaction })

  } catch (error) {
    console.error('Update recurring transaction error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid recurring transaction data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/expenses/recurring/[id] - Delete recurring transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if recurring transaction exists and belongs to user
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('id, name, transaction_type')
      .eq('id', (await params).id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: 'Recurring transaction not found' }, { status: 404 })
    }

    // Soft delete - set is_active to false instead of hard delete
    // This preserves the connection to any transactions that were already created
    const { error: deleteError } = await supabase
      .from('recurring_transactions')
      .update({ is_active: false })
      .eq('id', (await params).id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting recurring transaction:', deleteError)
      return NextResponse.json({ error: 'Failed to delete recurring transaction' }, { status: 500 })
    }

    // Update user activity tracking
    await supabase.from('user_activities').insert({
      user_id: user.id,
      activity_type: 'expense_tracking',
      action: 'delete_recurring_transaction',
      resource_type: 'recurring_transaction',
      resource_id: (await params).id,
      metadata: {
        name: existingTransaction.name,
        transaction_type: existingTransaction.transaction_type
      }
    })

    return NextResponse.json({ message: 'Recurring transaction deleted successfully' })

  } catch (error) {
    console.error('Delete recurring transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}