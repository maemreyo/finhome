// src/app/api/shared-wallets/route.ts
// API endpoints for shared wallet management

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createSharedWalletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required').max(100),
  description: z.string().max(500).optional(),
  wallet_type: z.enum(['cash', 'bank_account', 'credit_card', 'e_wallet', 'investment', 'other']).default('bank_account'),
  currency: z.string().default('VND'),
  icon: z.string().default('wallet'),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).default('#3B82F6'),
  initial_balance: z.number().default(0),
  require_approval_for_expenses: z.boolean().default(false),
  expense_approval_threshold: z.number().min(0).optional(),
})

const updateSharedWalletSchema = createSharedWalletSchema.partial()

// GET /api/shared-wallets - Get user's shared wallets
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get shared wallets where user is a member
    const { data: wallets, error } = await supabase
      .from('shared_expense_wallets')
      .select(`
        *,
        members:shared_wallet_members!inner(
          id,
          user_id,
          role,
          can_add_transactions,
          can_edit_transactions,
          can_delete_transactions,
          can_manage_budget,
          is_active,
          joined_at,
          user:user_profiles(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('shared_wallet_members.user_id', user.id)
      .eq('shared_wallet_members.is_active', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shared wallets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shared wallets' }, 
        { status: 500 }
      )
    }

    // Transform the data to include user's role and permissions
    const transformedWallets = wallets?.map(wallet => {
      const userMembership = wallet.members.find((m: any) => m.user_id === user.id)
      
      return {
        ...wallet,
        user_role: userMembership?.role,
        user_permissions: {
          can_add_transactions: userMembership?.can_add_transactions,
          can_edit_transactions: userMembership?.can_edit_transactions,
          can_delete_transactions: userMembership?.can_delete_transactions,
          can_manage_budget: userMembership?.can_manage_budget,
        },
        member_count: wallet.members.filter((m: any) => m.is_active).length,
        all_members: wallet.members
      }
    })

    return NextResponse.json({ wallets: transformedWallets })

  } catch (error) {
    console.error('Shared wallets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/shared-wallets - Create new shared wallet
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSharedWalletSchema.parse(body)

    // Start transaction
    const { data: wallet, error: walletError } = await supabase
      .from('shared_expense_wallets')
      .insert({
        ...validatedData,
        balance: validatedData.initial_balance,
        owner_id: user.id,
      })
      .select()
      .single()

    if (walletError) {
      console.error('Error creating shared wallet:', walletError)
      return NextResponse.json(
        { error: 'Failed to create shared wallet' }, 
        { status: 500 }
      )
    }

    // Add the creator as owner member
    const { error: memberError } = await supabase
      .from('shared_wallet_members')
      .insert({
        shared_wallet_id: wallet.id,
        user_id: user.id,
        role: 'owner',
        can_add_transactions: true,
        can_edit_transactions: true,
        can_delete_transactions: true,
        can_manage_budget: true,
        is_active: true,
        joined_at: new Date().toISOString(),
      })

    if (memberError) {
      // Rollback: delete the wallet if member creation fails
      await supabase
        .from('shared_expense_wallets')
        .delete()
        .eq('id', wallet.id)
      
      console.error('Error adding owner as member:', memberError)
      return NextResponse.json(
        { error: 'Failed to setup wallet ownership' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ wallet }, { status: 201 })

  } catch (error) {
    console.error('Create shared wallet error:', error)
    
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