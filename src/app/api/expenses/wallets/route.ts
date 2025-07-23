// src/app/api/expenses/wallets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createWalletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required'),
  wallet_type: z.enum(['cash', 'bank_account', 'credit_card', 'e_wallet', 'investment', 'other']),
  description: z.string().optional(),
  balance: z.number().min(0).optional(),
  currency: z.string().default('VND'),
  icon: z.string().optional(),
  color: z.string().optional(),
  bank_id: z.string().uuid().optional(),
  bank_account_number: z.string().optional(),
  is_default: z.boolean().optional(),
  include_in_budget: z.boolean().default(true),
})

const updateWalletSchema = createWalletSchema.partial()

// GET /api/expenses/wallets - Fetch user's wallets
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: wallets, error } = await supabase
      .from('expense_wallets')
      .select(`
        *,
        bank:banks(*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wallets:', error)
      return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 })
    }

    return NextResponse.json({ wallets })

  } catch (error) {
    console.error('Wallets API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/expenses/wallets - Create new wallet
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createWalletSchema.parse(body)

    // Check wallet name uniqueness for user
    const { data: existingWallet } = await supabase
      .from('expense_wallets')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', validatedData.name)
      .eq('is_active', true)
      .single()

    if (existingWallet) {
      return NextResponse.json({ error: 'Wallet name already exists' }, { status: 400 })
    }

    // Check subscription limits
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const { data: existingWallets } = await supabase
      .from('expense_wallets')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)

    const walletCount = existingWallets?.length || 0
    const maxWallets = userProfile?.subscription_tier === 'free' ? 3 : 
                     userProfile?.subscription_tier === 'premium' ? 10 : 50

    if (walletCount >= maxWallets) {
      return NextResponse.json({ 
        error: `Wallet limit reached. ${userProfile?.subscription_tier === 'free' ? 'Upgrade to add more wallets.' : ''}`,
        limit: maxWallets,
        current: walletCount
      }, { status: 403 })
    }

    // If this is set as default, unset other defaults
    if (validatedData.is_default) {
      await supabase
        .from('expense_wallets')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    // Create the wallet
    const walletData = {
      user_id: user.id,
      ...validatedData,
      balance: validatedData.balance || 0,
      icon: validatedData.icon || 'wallet',
      color: validatedData.color || '#3B82F6',
    }

    const { data: wallet, error: createError } = await supabase
      .from('expense_wallets')
      .insert([walletData])
      .select(`
        *,
        bank:banks(*)
      `)
      .single()

    if (createError) {
      console.error('Error creating wallet:', createError)
      return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 })
    }

    return NextResponse.json({ wallet }, { status: 201 })

  } catch (error) {
    console.error('Create wallet error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid wallet data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}