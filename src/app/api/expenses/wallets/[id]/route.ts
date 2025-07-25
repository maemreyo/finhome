// src/app/api/expenses/wallets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateWalletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required').optional(),
  wallet_type: z.enum(['cash', 'bank_account', 'credit_card', 'e_wallet', 'savings']).optional(),
  description: z.string().optional(),
  balance: z.number().min(0).optional(),
  currency: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_default: z.boolean().optional(),
  include_in_budget: z.boolean().optional(),
})

// PUT /api/expenses/wallets/[id] - Update wallet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateWalletSchema.parse(body)
    const walletId = (await params).id

    // First check if wallet exists and belongs to user
    const { data: existingWallet, error: fetchError } = await supabase
      .from('expense_wallets')
      .select('id, user_id, name, is_default')
      .eq('id', walletId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingWallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Check for name uniqueness if name is being updated
    if (validatedData.name && validatedData.name !== existingWallet.name) {
      const { data: nameCheck } = await supabase
        .from('expense_wallets')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', validatedData.name)
        .eq('is_active', true)
        .neq('id', walletId)
        .single()

      if (nameCheck) {
        return NextResponse.json({ error: 'Wallet name already exists' }, { status: 400 })
      }
    }

    // If setting as default, unset other defaults
    if (validatedData.is_default) {
      await supabase
        .from('expense_wallets')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('id', walletId)
    }

    // Update the wallet
    const { data: updatedWallet, error: updateError } = await supabase
      .from('expense_wallets')
      .update(validatedData)
      .eq('id', walletId)
      .eq('user_id', user.id)
      .select(`
        *,
        bank:banks(*)
      `)
      .single()

    if (updateError) {
      console.error('Error updating wallet:', updateError)
      return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 })
    }

    return NextResponse.json({ wallet: updatedWallet })

  } catch (error) {
    console.error('Update wallet error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid wallet data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/expenses/wallets/[id] - Delete wallet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const walletId = (await params).id

    // First check if wallet exists and belongs to user
    const { data: existingWallet, error: fetchError } = await supabase
      .from('expense_wallets')
      .select('id, user_id, name')
      .eq('id', walletId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingWallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Check if wallet has transactions - if so, soft delete
    const { data: transactions, error: transactionCheckError } = await supabase
      .from('expense_transactions')
      .select('id')
      .eq('wallet_id', walletId)
      .limit(1)

    if (transactionCheckError) {
      console.error('Error checking transactions:', transactionCheckError)
      return NextResponse.json({ error: 'Failed to check wallet usage' }, { status: 500 })
    }

    if (transactions && transactions.length > 0) {
      // Soft delete - mark as inactive
      const { error: softDeleteError } = await supabase
        .from('expense_wallets')
        .update({ is_active: false })
        .eq('id', walletId)
        .eq('user_id', user.id)

      if (softDeleteError) {
        console.error('Error soft deleting wallet:', softDeleteError)
        return NextResponse.json({ error: 'Failed to delete wallet' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Wallet deactivated successfully (has transaction history)',
        soft_delete: true 
      })
    } else {
      // Hard delete - no transactions
      const { error: hardDeleteError } = await supabase
        .from('expense_wallets')
        .delete()
        .eq('id', walletId)
        .eq('user_id', user.id)

      if (hardDeleteError) {
        console.error('Error hard deleting wallet:', hardDeleteError)
        return NextResponse.json({ error: 'Failed to delete wallet' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Wallet deleted successfully',
        soft_delete: false 
      })
    }

  } catch (error) {
    console.error('Delete wallet error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/expenses/wallets/[id] - Get single wallet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: wallet, error } = await supabase
      .from('expense_wallets')
      .select(`
        *,
        bank:banks(*),
        _count_transactions:expense_transactions(count)
      `)
      .eq('id', (await params).id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching wallet:', error)
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    return NextResponse.json({ wallet })

  } catch (error) {
    console.error('Get wallet error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}