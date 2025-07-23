// src/app/api/expenses/recurring/process/route.ts
// API endpoint for processing recurring transactions and creating actual transactions
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Calculate next due date based on frequency
function calculateNextDueDate(currentDate: Date, frequency: string, interval: number): Date {
  const nextDate = new Date(currentDate)
  
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

// Check if recurring transaction should end
function shouldEndRecurring(
  recurringTransaction: any, 
  newOccurrencesCount: number
): boolean {
  // Check max occurrences
  if (recurringTransaction.max_occurrences && 
      newOccurrencesCount >= recurringTransaction.max_occurrences) {
    return true
  }
  
  // Check end date
  if (recurringTransaction.end_date) {
    const endDate = new Date(recurringTransaction.end_date)
    const today = new Date()
    if (today > endDate) {
      return true
    }
  }
  
  return false
}

// POST /api/expenses/recurring/process - Process all due recurring transactions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // This endpoint should be called by a scheduled job or cron
    // For security, you might want to add API key authentication here
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.RECURRING_PROCESSOR_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    
    // Get all active recurring transactions that are due today or overdue
    const { data: dueRecurringTransactions, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true)
      .lte('next_due_date', today)

    if (fetchError) {
      console.error('Error fetching due recurring transactions:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch recurring transactions' }, { status: 500 })
    }

    const processedTransactions = []
    const errors = []

    // Process each due recurring transaction
    for (const recurringTransaction of dueRecurringTransactions) {
      try {
        // Create the actual transaction
        const transactionData = {
          user_id: recurringTransaction.user_id,
          wallet_id: recurringTransaction.wallet_id,
          transaction_type: recurringTransaction.transaction_type,
          amount: recurringTransaction.amount,
          description: recurringTransaction.description || `Recurring: ${recurringTransaction.name}`,
          expense_category_id: recurringTransaction.expense_category_id,
          income_category_id: recurringTransaction.income_category_id,
          transfer_to_wallet_id: recurringTransaction.transfer_to_wallet_id,
          transaction_date: today,
          recurring_transaction_id: recurringTransaction.id,
          is_confirmed: true,
        }

        const { data: newTransaction, error: createError } = await supabase
          .from('expense_transactions')
          .insert([transactionData])
          .select('*')
          .single()

        if (createError) {
          throw createError
        }

        // Update the recurring transaction
        const newOccurrencesCount = recurringTransaction.occurrences_created + 1
        const shouldEnd = shouldEndRecurring(recurringTransaction, newOccurrencesCount)
        
        const updateData: any = {
          occurrences_created: newOccurrencesCount,
          updated_at: new Date().toISOString(),
        }

        if (shouldEnd) {
          // Deactivate the recurring transaction if it should end
          updateData.is_active = false
        } else {
          // Calculate next due date
          const currentDueDate = new Date(recurringTransaction.next_due_date)
          const nextDueDate = calculateNextDueDate(
            currentDueDate, 
            recurringTransaction.frequency, 
            recurringTransaction.frequency_interval
          )
          updateData.next_due_date = nextDueDate.toISOString().split('T')[0]
        }

        const { error: updateError } = await supabase
          .from('recurring_transactions')
          .update(updateData)
          .eq('id', recurringTransaction.id)

        if (updateError) {
          throw updateError
        }

        processedTransactions.push({
          recurringTransactionId: recurringTransaction.id,
          recurringTransactionName: recurringTransaction.name,
          newTransactionId: newTransaction.id,
          amount: newTransaction.amount,
          transactionType: newTransaction.transaction_type,
          isCompleted: shouldEnd,
        })

        // Log activity
        await supabase.from('user_activities').insert({
          user_id: recurringTransaction.user_id,
          activity_type: 'expense_tracking',
          action: 'create_recurring_transaction_instance',
          resource_type: 'expense_transaction',
          resource_id: newTransaction.id,
          metadata: {
            recurring_transaction_id: recurringTransaction.id,
            recurring_transaction_name: recurringTransaction.name,
            amount: newTransaction.amount,
            transaction_type: newTransaction.transaction_type,
            occurrence_number: newOccurrencesCount,
          }
        })

      } catch (error) {
        console.error(`Error processing recurring transaction ${recurringTransaction.id}:`, error)
        errors.push({
          recurringTransactionId: recurringTransaction.id,
          recurringTransactionName: recurringTransaction.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: processedTransactions.length,
      errorCount: errors.length,
      processedTransactions,
      errors,
      processedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Recurring transaction processor error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/expenses/recurring/process - Get processing status and next scheduled runs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user (for manual checks)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    
    // Get user's recurring transactions due today or overdue
    const { data: dueTransactions, error: dueError } = await supabase
      .from('recurring_transactions')
      .select('id, name, amount, transaction_type, next_due_date, frequency')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .lte('next_due_date', today)

    if (dueError) {
      console.error('Error fetching due transactions:', dueError)
      return NextResponse.json({ error: 'Failed to fetch due transactions' }, { status: 500 })
    }

    // Get upcoming recurring transactions (next 7 days)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekStr = nextWeek.toISOString().split('T')[0]

    const { data: upcomingTransactions, error: upcomingError } = await supabase
      .from('recurring_transactions')
      .select('id, name, amount, transaction_type, next_due_date, frequency')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gt('next_due_date', today)
      .lte('next_due_date', nextWeekStr)
      .order('next_due_date', { ascending: true })

    if (upcomingError) {
      console.error('Error fetching upcoming transactions:', upcomingError)
      return NextResponse.json({ error: 'Failed to fetch upcoming transactions' }, { status: 500 })
    }

    return NextResponse.json({
      dueTransactions: dueTransactions || [],
      upcomingTransactions: upcomingTransactions || [],
      processingStatus: {
        hasDueTransactions: (dueTransactions?.length || 0) > 0,
        dueCount: dueTransactions?.length || 0,
        upcomingCount: upcomingTransactions?.length || 0,
      }
    })

  } catch (error) {
    console.error('Get recurring process status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}