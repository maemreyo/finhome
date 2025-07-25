// src/app/api/shared-wallets/[id]/route.ts
// API endpoints for individual shared wallet management

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateSharedWalletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required').max(100).optional(),
  description: z.string().max(500).optional(),
  wallet_type: z.enum(['cash', 'bank_account', 'credit_card', 'e_wallet', 'investment', 'other']).optional(),
  currency: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).optional(),
  require_approval_for_expenses: z.boolean().optional(),
  expense_approval_threshold: z.number().min(0).optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/shared-wallets/[id] - Get specific shared wallet details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const walletId = (await params).id
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this wallet
    const { data: membership } = await supabase
      .from('shared_wallet_members')
      .select('role, can_add_transactions, can_edit_transactions, can_delete_transactions, can_manage_budget')
      .eq('shared_wallet_id', walletId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get wallet details with members and recent transactions
    const { data: wallet, error } = await supabase
      .from('shared_expense_wallets')
      .select(`
        *,
        members:shared_wallet_members(
          id,
          user_id,
          role,
          can_add_transactions,
          can_edit_transactions,
          can_delete_transactions,
          can_manage_budget,
          is_active,
          joined_at,
          invited_at,
          user:user_profiles(
            id,
            full_name,
            avatar_url
          )
        ),
        recent_transactions:shared_wallet_transactions(
          id,
          transaction_type,
          amount,
          description,
          transaction_date,
          is_approved,
          requires_approval,
          user:user_profiles(
            full_name,
            avatar_url
          ),
          expense_category:expense_categories(
            name_vi,
            color,
            icon
          )
        )
      `)
      .eq('id', walletId)
      .eq('is_active', true)
      .order('transaction_date', { 
        foreignTable: 'shared_wallet_transactions', 
        ascending: false 
      })
      .limit(10, { foreignTable: 'shared_wallet_transactions' })
      .single()

    if (error) {
      console.error('Error fetching shared wallet:', error)
      return NextResponse.json(
        { error: 'Failed to fetch wallet details' }, 
        { status: 500 }
      )
    }

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Get budget summary
    const { data: budgetSummary } = await supabase
      .rpc('get_shared_wallet_budget_summary', { wallet_id: walletId })
      .single()

    // Transform the response
    const response = {
      ...wallet,
      user_role: membership.role,
      user_permissions: {
        can_add_transactions: membership.can_add_transactions,
        can_edit_transactions: membership.can_edit_transactions,
        can_delete_transactions: membership.can_delete_transactions,
        can_manage_budget: membership.can_manage_budget,
      },
      budget_summary: budgetSummary || {},
      member_count: wallet.members.filter((m: any) => m.is_active).length,
      active_members: wallet.members.filter((m: any) => m.is_active),
      pending_members: wallet.members.filter((m: any) => !m.is_active && m.invited_at),
    }

    return NextResponse.json({ wallet: response })

  } catch (error) {
    console.error('Get shared wallet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// PUT /api/shared-wallets/[id] - Update shared wallet
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const walletId = (await params).id
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSharedWalletSchema.parse(body)

    // Check if user has permission to edit this wallet
    const { data: membership } = await supabase
      .from('shared_wallet_members')
      .select('role')
      .eq('shared_wallet_id', walletId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update the wallet
    const { data: wallet, error } = await supabase
      .from('shared_expense_wallets')
      .update(validatedData)
      .eq('id', walletId)
      .select()
      .single()

    if (error) {
      console.error('Error updating shared wallet:', error)
      return NextResponse.json(
        { error: 'Failed to update wallet' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ wallet })

  } catch (error) {
    console.error('Update shared wallet error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid wallet data', details: error.errors }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// DELETE /api/shared-wallets/[id] - Delete shared wallet
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const walletId = (await params).id
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is the owner of this wallet
    const { data: wallet } = await supabase
      .from('shared_expense_wallets')
      .select('owner_id')
      .eq('id', walletId)
      .single()

    if (!wallet || wallet.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only wallet owner can delete the wallet' }, { status: 403 })
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('shared_expense_wallets')
      .update({ is_active: false })
      .eq('id', walletId)

    if (error) {
      console.error('Error deleting shared wallet:', error)
      return NextResponse.json(
        { error: 'Failed to delete wallet' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Wallet deleted successfully' })

  } catch (error) {
    console.error('Delete shared wallet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}