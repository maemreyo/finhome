// Create Stripe Customer Portal Session

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCustomerPortalSession } from '@/lib/stripe/config'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's Stripe customer ID
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (error || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Create customer portal session
    const portalSession = await createCustomerPortalSession(
      subscription.stripe_customer_id,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`
    )

    return NextResponse.json({ url: portalSession.url })

  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}