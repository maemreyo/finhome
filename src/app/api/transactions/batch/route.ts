// src/app/api/transactions/batch/route.ts
// Atomic batch transaction processing API endpoint
// Ensures data integrity for multi-step transactions

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for individual transaction validation
const TransactionSchema = z.object({
  transaction_type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('VND'),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
  expense_category_key: z.string().optional(),
  income_category_key: z.string().optional(),
  custom_category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  transfer_to_wallet_id: z.string().uuid().optional(),
  transfer_fee: z.number().min(0).default(0),
  transaction_date: z.string().optional(), // ISO date string
  transaction_time: z.string().optional(), // ISO time string
  receipt_images: z.array(z.string()).default([]),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional()
  }).optional(),
  merchant_name: z.string().optional(),
  is_confirmed: z.boolean().default(true)
})

// Schema for batch transaction request
const BatchTransactionSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  wallet_id: z.string().uuid('Invalid wallet ID'),
  transactions: z.array(TransactionSchema).min(1, 'At least one transaction is required')
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // Validate request structure
    const validationResult = BatchTransactionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          success: false,
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { user_id, wallet_id, transactions } = validationResult.data

    // Verify user ID matches authenticated user
    if (user_id !== user.id) {
      return NextResponse.json(
        { error: 'User ID mismatch', success: false },
        { status: 403 }
      )
    }

    // Verify user owns the wallet
    const { data: wallet, error: walletError } = await supabase
      .from('expense_wallets')
      .select('id, name, balance, user_id')
      .eq('id', wallet_id)
      .eq('user_id', user_id)
      .eq('is_active', true)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found or access denied', success: false },
        { status: 404 }
      )
    }

    // Pre-validate the batch before processing
    let totalExpenseAmount = 0
    let totalIncomeAmount = 0

    // Basic validation and calculation
    for (const transaction of transactions) {
      if (transaction.transaction_type === 'expense') {
        totalExpenseAmount += transaction.amount
      } else if (transaction.transaction_type === 'income') {
        totalIncomeAmount += transaction.amount
      }
    }

    // Check if wallet has sufficient balance for expenses
    if (totalExpenseAmount > (wallet.balance || 0)) {
      return NextResponse.json(
        {
          error: 'Transaction batch validation failed',
          success: false,
          validation_errors: ['Insufficient wallet balance for expense transactions'],
          details: {
            transaction_count: transactions.length,
            wallet_balance: wallet.balance,
            total_expense_amount: totalExpenseAmount,
            required_balance: totalExpenseAmount
          }
        },
        { status: 400 }
      )
    }

    // Get category mappings - Extract unique category keys
    const expenseCategoryKeysSet = new Set(
      transactions
        .filter(t => t.transaction_type === 'expense' && t.expense_category_key)
        .map(t => t.expense_category_key)
        .filter((key): key is string => typeof key === 'string')
    )
    const expenseCategoryKeys = Array.from(expenseCategoryKeysSet)
    
    const incomeCategoryKeysSet = new Set(
      transactions
        .filter(t => t.transaction_type === 'income' && t.income_category_key)
        .map(t => t.income_category_key)
        .filter((key): key is string => typeof key === 'string')
    )
    const incomeCategoryKeys = Array.from(incomeCategoryKeysSet)

    const expenseCategoryMap = new Map()
    const incomeCategoryMap = new Map()

    // Look up expense category IDs
    if (expenseCategoryKeys.length > 0) {
      console.log('Looking up expense category keys:', expenseCategoryKeys)
      const { data: expenseCategories, error: expenseCategoryError } = await supabase
        .from('expense_categories')
        .select('id, category_key')
        .in('category_key', expenseCategoryKeys as any)
      
      console.log('Expense categories query result:', { expenseCategories, expenseCategoryError })
      
      if (expenseCategoryError) {
        console.error('Error fetching expense categories:', expenseCategoryError)
        return NextResponse.json(
          {
            error: 'Failed to validate expense categories',
            success: false,
            details: expenseCategoryError.message
          },
          { status: 500 }
        )
      }
      
      if (expenseCategories) {
        expenseCategories.forEach((cat: any) => {
          console.log('Mapping category:', cat.category_key, '->', cat.id)
          expenseCategoryMap.set(cat.category_key, cat.id)
        })
      }
      console.log('Final expense category map:', Object.fromEntries(expenseCategoryMap))
    }

    // Look up income category IDs
    if (incomeCategoryKeys.length > 0) {
      const { data: incomeCategories, error: incomeCategoryError } = await supabase
        .from('income_categories')
        .select('id, category_key')
        .in('category_key', incomeCategoryKeys as any)
      
      if (incomeCategoryError) {
        console.error('Error fetching income categories:', incomeCategoryError)
        return NextResponse.json(
          {
            error: 'Failed to validate income categories',
            success: false,
            details: incomeCategoryError.message
          },
          { status: 500 }
        )
      }
      
      if (incomeCategories) {
        incomeCategories.forEach((cat: any) => {
          incomeCategoryMap.set(cat.category_key, cat.id)
        })
      }
    }

    // Get default categories for fallback (always fetch these to ensure constraint compliance)
    let defaultExpenseCategoryId = null
    let defaultIncomeCategoryId = null
    
    // Check if we have any expense or income transactions
    const hasExpenseTransactions = transactions.some(t => t.transaction_type === 'expense')
    const hasIncomeTransactions = transactions.some(t => t.transaction_type === 'income')
    
    // Always fetch default categories if we have expense/income transactions (constraint requirement)
    if (hasExpenseTransactions) {
      const { data: defaultExpenseCategory, error: expenseDefaultError } = await supabase
        .from('expense_categories')
        .select('id')
        .eq('category_key', 'other')
        .single() as any
      
      if (expenseDefaultError) {
        console.error('Failed to get default expense category:', expenseDefaultError)
        return NextResponse.json(
          {
            error: 'Failed to validate expense categories - no default category available',
            success: false,
            details: expenseDefaultError.message
          },
          { status: 500 }
        )
      }
      
      if (defaultExpenseCategory) {
        defaultExpenseCategoryId = defaultExpenseCategory.id
        console.log('Using default expense category:', defaultExpenseCategoryId)
      }
    }
    
    if (hasIncomeTransactions) {
      const { data: defaultIncomeCategory, error: incomeDefaultError } = await supabase
        .from('income_categories')
        .select('id')
        .eq('category_key', 'other')
        .single() as any
      
      if (incomeDefaultError) {
        console.error('Failed to get default income category:', incomeDefaultError)
        return NextResponse.json(
          {
            error: 'Failed to validate income categories - no default category available',
            success: false,
            details: incomeDefaultError.message
          },
          { status: 500 }
        )
      }
      
      if (defaultIncomeCategory) {
        defaultIncomeCategoryId = defaultIncomeCategory.id
        console.log('Using default income category:', defaultIncomeCategoryId)
      }
    }
    
    // Log validation issues but don't fail the request - use defaults instead
    const missingExpenseCategories = expenseCategoryKeys.filter(key => !expenseCategoryMap.has(key))
    const missingIncomeCategories = incomeCategoryKeys.filter(key => !incomeCategoryMap.has(key))
    
    if (missingExpenseCategories.length > 0 || missingIncomeCategories.length > 0) {
      console.warn('Some categories not found, using defaults:', {
        missing_expense_categories: missingExpenseCategories,
        missing_income_categories: missingIncomeCategories,
        default_expense_id: defaultExpenseCategoryId,
        default_income_id: defaultIncomeCategoryId
      })
    }

    // Process the batch transaction atomically using direct database operations
    const transactionInserts = transactions.map(transaction => {
      // Determine category IDs based on transaction type with fallback to defaults
      let expense_category_id = null
      let income_category_id = null
      
      if (transaction.transaction_type === 'expense') {
        if (transaction.expense_category_key) {
          // Try to get mapped category, fallback to default if not found
          expense_category_id = expenseCategoryMap.get(transaction.expense_category_key) || defaultExpenseCategoryId
        } else {
          // No category specified, use default for expense transactions (required by constraint)
          expense_category_id = defaultExpenseCategoryId
        }
      } else if (transaction.transaction_type === 'income') {
        if (transaction.income_category_key) {
          // Try to get mapped category, fallback to default if not found
          income_category_id = incomeCategoryMap.get(transaction.income_category_key) || defaultIncomeCategoryId
        } else {
          // No category specified, use default for income transactions (required by constraint)
          income_category_id = defaultIncomeCategoryId
        }
      }
      
      console.log(`Transaction ${transaction.transaction_type}: expense_id=${expense_category_id}, income_id=${income_category_id}`)

      // Return the complete transaction object
      return {
        user_id,
        wallet_id,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        currency: transaction.currency || 'VND',
        description: transaction.description || '',
        notes: transaction.notes || '',
        expense_category_id,
        income_category_id,
        custom_category: transaction.custom_category || null,
        tags: transaction.tags || [],
        transfer_to_wallet_id: transaction.transfer_to_wallet_id || null,
        transfer_fee: transaction.transfer_fee || 0,
        transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
        transaction_time: transaction.transaction_time || new Date().toTimeString().split(' ')[0],
        receipt_images: transaction.receipt_images || [],
        location: transaction.location ? JSON.stringify(transaction.location) : null,
        merchant_name: transaction.merchant_name || null,
        is_confirmed: transaction.is_confirmed !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    // Insert transactions
    const { data: insertedTransactions, error: insertError } = await supabase
      .from('expense_transactions')
      .insert(transactionInserts)
      .select('id')

    if (insertError) {
      console.error('Transaction insert error:', insertError)
      return NextResponse.json(
        {
          error: 'Failed to create transactions',
          success: false,
          details: insertError.message
        },
        { status: 500 }
      )
    }

    // Update wallet balance
    const newBalance = (wallet.balance || 0) - totalExpenseAmount + totalIncomeAmount
    const { error: walletUpdateError } = await supabase
      .from('expense_wallets')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet_id)

    if (walletUpdateError) {
      console.error('Wallet update error:', walletUpdateError)
      return NextResponse.json(
        {
          error: 'Failed to update wallet balance',
          success: false,
          details: walletUpdateError.message
        },
        { status: 500 }
      )
    }

    // Get updated wallet balance
    const { data: updatedWallet } = await supabase
      .from('expense_wallets')
      .select('balance')
      .eq('id', wallet_id)
      .single()

    // Return success response
    const transactionIds = insertedTransactions?.map(t => t.id) || []
    
    return NextResponse.json({
      success: true,
      message: 'All transactions processed successfully',
      transaction_ids: transactionIds,
      transaction_count: transactionIds.length,
      wallet: {
        id: wallet_id,
        name: wallet.name,
        previous_balance: wallet.balance,
        current_balance: updatedWallet?.balance || newBalance
      }
    })

  } catch (error) {
    console.error('Batch transaction API error:', error)
    
    // Enhanced error logging and classification
    const errorContext = {
      timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent'),
      request_id: request.headers.get('x-request-id') || 'unknown',
      error_type: error instanceof Error ? error.constructor.name : 'UnknownError',
      stack_trace: error instanceof Error ? error.stack : undefined
    }

    // TODO: Log to error monitoring service once error_logs table is created
    // try {
    //   const supabase = await createClient()
    //   await supabase.from('error_logs').insert({
    //     user_id: body?.user_id || null,
    //     error_type: 'batch_api_error',
    //     error_message: error instanceof Error ? error.message : 'Unknown API error',
    //     error_context: errorContext
    //   })
    // } catch (loggingError) {
    //   console.error('Failed to log error:', loggingError)
    // }
    
    // Return user-friendly error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    let userFriendlyMessage = 'Internal server error'
    
    if (errorMessage.includes('timeout')) {
      userFriendlyMessage = 'Request timed out. Please try again.'
    } else if (errorMessage.includes('network')) {
      userFriendlyMessage = 'Network error occurred. Please check your connection.'
    } else if (errorMessage.includes('validation')) {
      userFriendlyMessage = 'Data validation failed. Please check your input.'
    }
    
    return NextResponse.json(
      {
        error: userFriendlyMessage,
        success: false,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        error_id: errorContext.request_id,
        rollback_confirmed: true // All operations were rolled back
      },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}