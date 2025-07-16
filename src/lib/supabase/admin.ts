// src/lib/supabase/admin.ts
// Admin authentication and role-based access control

import { createAdminClient, createClient } from './server'
import { redirect } from 'next/navigation'
import type { UserProfile } from './types'

// Check if user is admin based on subscription tier
export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    // Use the is_admin function from the database
    const { data, error } = await supabase.rpc('is_admin', { user_uuid: userId })
    
    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }
    
    return data || false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Get current user and check admin status
export async function getCurrentAdminUser(): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }
    
    // Check if user is admin
    const isAdmin = await isUserAdmin(user.id)
    
    if (!isAdmin) {
      return null
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Error getting admin profile:', profileError)
      return null
    }
    
    return profile
  } catch (error) {
    console.error('Error getting current admin user:', error)
    return null
  }
}

// Require admin authentication middleware
export async function requireAdmin(): Promise<UserProfile> {
  const adminUser = await getCurrentAdminUser()
  
  if (!adminUser) {
    // Redirect to login page or access denied
    redirect('/auth/login?error=admin_required')
  }
  
  return adminUser
}

// Admin-only database operations using service role
export async function getAdminStats() {
  const adminClient = createAdminClient()
  
  try {
    // Get user stats
    const { count: totalUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
    
    const { count: activeUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    const { count: premiumUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .in('subscription_tier', ['premium', 'professional'])
    
    // Get bank stats
    const { count: totalBanks } = await adminClient
      .from('banks')
      .select('*', { count: 'exact', head: true })
    
    const { count: activeBanks } = await adminClient
      .from('banks')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    // Get rate stats
    const { count: totalRates } = await adminClient
      .from('bank_interest_rates')
      .select('*', { count: 'exact', head: true })
    
    const { count: activeRates } = await adminClient
      .from('bank_interest_rates')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    // Get achievement stats
    const { count: totalAchievements } = await adminClient
      .from('achievements')
      .select('*', { count: 'exact', head: true })
    
    const { count: activeAchievements } = await adminClient
      .from('achievements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    return {
      users: {
        total: totalUsers || 0,
        active: activeUsers || 0,
        premium: premiumUsers || 0,
        inactive: (totalUsers || 0) - (activeUsers || 0)
      },
      banks: {
        total: totalBanks || 0,
        active: activeBanks || 0
      },
      rates: {
        total: totalRates || 0,
        active: activeRates || 0
      },
      achievements: {
        total: totalAchievements || 0,
        active: activeAchievements || 0
      }
    }
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return {
      users: { total: 0, active: 0, premium: 0, inactive: 0 },
      banks: { total: 0, active: 0 },
      rates: { total: 0, active: 0 },
      achievements: { total: 0, active: 0 }
    }
  }
}

// Admin audit logging
export async function logAdminAction(
  adminUserId: string,
  action: string,
  targetTable: string,
  targetId?: string,
  details?: any
) {
  const adminClient = createAdminClient()
  
  try {
    const { error } = await adminClient
      .from('analytics_events')
      .insert({
        user_id: adminUserId,
        event_type: 'admin_action',
        event_data: {
          action,
          target_table: targetTable,
          target_id: targetId,
          details,
          timestamp: new Date().toISOString(),
          ip_address: null // TODO: Get from headers
        }
      })
    
    if (error) {
      console.error('Error logging admin action:', error)
    }
  } catch (error) {
    console.error('Error logging admin action:', error)
  }
}

// Verify admin access and log action
export async function withAdminAction<T>(
  action: string,
  targetTable: string,
  operation: () => Promise<T>,
  targetId?: string,
  details?: any
): Promise<T> {
  // Require admin authentication
  const adminUser = await requireAdmin()
  
  try {
    // Execute the operation
    const result = await operation()
    
    // Log the successful action
    await logAdminAction(adminUser.id, action, targetTable, targetId, details)
    
    return result
  } catch (error) {
    // Log the failed action
    await logAdminAction(adminUser.id, `${action}_failed`, targetTable, targetId, {
      error: error instanceof Error ? error.message : 'Unknown error',
      details
    })
    
    throw error
  }
}