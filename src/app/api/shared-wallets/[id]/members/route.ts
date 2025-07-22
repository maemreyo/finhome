// src/app/api/shared-wallets/[id]/members/route.ts
// API endpoints for shared wallet member management

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const inviteMemberSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
  permissions: z.object({
    can_add_transactions: z.boolean().default(true),
    can_edit_transactions: z.boolean().default(false),
    can_delete_transactions: z.boolean().default(false),
    can_manage_budget: z.boolean().default(false),
  }).optional(),
})

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']).optional(),
  can_add_transactions: z.boolean().optional(),
  can_edit_transactions: z.boolean().optional(),
  can_delete_transactions: z.boolean().optional(),
  can_manage_budget: z.boolean().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/shared-wallets/[id]/members - Get wallet members
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const walletId = params.id
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this wallet
    const { data: userMembership } = await supabase
      .from('shared_wallet_members')
      .select('role')
      .eq('shared_wallet_id', walletId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!userMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all members of the wallet
    const { data: members, error } = await supabase
      .from('shared_wallet_members')
      .select(`
        *,
        user:user_profiles(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('shared_wallet_id', walletId)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching wallet members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch members' }, 
        { status: 500 }
      )
    }

    const transformedMembers = members?.map(member => ({
      ...member,
      is_current_user: member.user_id === user.id,
      can_be_managed: userMembership.role === 'owner' || 
        (userMembership.role === 'admin' && member.role !== 'owner')
    }))

    return NextResponse.json({ members: transformedMembers })

  } catch (error) {
    console.error('Get wallet members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/shared-wallets/[id]/members - Invite member to wallet
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const walletId = params.id
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = inviteMemberSchema.parse(body)

    // Check if user has permission to invite members
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

    // Find user by email
    const { data: targetUser } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', validatedData.email)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('shared_wallet_members')
      .select('id, is_active')
      .eq('shared_wallet_id', walletId)
      .eq('user_id', targetUser.id)
      .single()

    if (existingMember) {
      if (existingMember.is_active) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
      } else {
        // Reactivate existing membership
        const { data: member, error: updateError } = await supabase
          .from('shared_wallet_members')
          .update({
            role: validatedData.role,
            is_active: true,
            joined_at: new Date().toISOString(),
            ...validatedData.permissions
          })
          .eq('id', existingMember.id)
          .select(`
            *,
            user:user_profiles(
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .single()

        if (updateError) {
          console.error('Error reactivating member:', updateError)
          return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
        }

        return NextResponse.json({ member }, { status: 201 })
      }
    }

    // Create new membership
    const permissions = validatedData.permissions || {
      can_add_transactions: validatedData.role !== 'viewer',
      can_edit_transactions: validatedData.role === 'admin',
      can_delete_transactions: validatedData.role === 'admin',
      can_manage_budget: validatedData.role === 'admin',
    }

    const { data: member, error } = await supabase
      .from('shared_wallet_members')
      .insert({
        shared_wallet_id: walletId,
        user_id: targetUser.id,
        role: validatedData.role,
        is_active: true,
        invited_at: new Date().toISOString(),
        joined_at: new Date().toISOString(),
        ...permissions
      })
      .select(`
        *,
        user:user_profiles(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error adding member:', error)
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
    }

    return NextResponse.json({ member }, { status: 201 })

  } catch (error) {
    console.error('Invite member error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid invitation data', details: error.errors }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}