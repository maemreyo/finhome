// Server-side Supabase client for Server Components, Server Actions, and Route Handlers

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../../types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Admin client with service role key (bypasses RLS)
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for admin client
        },
      },
    }
  )
}

// Helper function to get user from server
export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }
  
  return profile
}

// Helper function to get user's financial plans
export async function getUserFinancialPlans(userId: string) {
  const supabase = await createClient()
  const { data: plans, error } = await supabase
    .from('financial_plans')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  if (error) {
    console.error('Error getting financial plans:', error)
    return []
  }
  
  return plans
}

// Helper function to get financial plan with loan terms
export async function getFinancialPlanWithDetails(planId: string) {
  const supabase = await createClient()
  const { data: plan, error: planError } = await supabase
    .from('financial_plans')
    .select('*')
    .eq('id', planId)
    .single()
  
  if (planError) {
    console.error('Error getting financial plan details:', planError)
    return null
  }
  
  return plan
}

// Helper function to get current interest rates
export async function getCurrentInterestRates() {
  const supabase = await createClient()
  const { data: rates, error } = await supabase
    .from('bank_interest_rates')
    .select('*')
    .eq('is_active', true)
    .order('bank_id', { ascending: true })
  
  if (error) {
    console.error('Error getting interest rates:', error)
    return []
  }
  
  return rates
}

// Helper function to create or update user profile
export async function upsertUserProfile(userId: string, profileData: any) {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .upsert({ 
      id: userId, 
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error upserting user profile:', error)
    return null
  }
  
  return profile
}