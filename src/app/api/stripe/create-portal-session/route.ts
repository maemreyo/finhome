// Create Stripe Customer Portal Session - Simplified for debugging

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    console.log('Portal session endpoint hit')
    
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('Auth failed:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Authenticated user:', user.id)

    // Get user's subscription data
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('id, stripe_customer_id, status, user_id')
      .eq('user_id', user.id)
      .single()

    console.log('Subscription data:', { subscription, error })

    if (error || !subscription) {
      return NextResponse.json(
        { 
          error: 'No subscription found',
          debug: { userId: user.id, error: error?.message }
        },
        { status: 404 }
      )
    }

    // If no stripe_customer_id, return info for manual setup
    if (!subscription.stripe_customer_id) {
      return NextResponse.json(
        { 
          error: 'Subscription not linked to Stripe',
          debug: { 
            subscriptionId: subscription.id,
            status: subscription.status,
            needsStripeCustomer: true
          }
        },
        { status: 400 }
      )
    }

    // Try to create portal session
    const { createCustomerPortalSession } = await import('@/lib/stripe/config')
    
    try {
      const portalSession = await createCustomerPortalSession(
        subscription.stripe_customer_id,
        `${process.env.NEXT_PUBLIC_APP_URL}/billing`
      )

      console.log('Portal session created successfully')
      return NextResponse.json({ url: portalSession.url })
    } catch (stripeError: any) {
      // If portal not configured, return helpful message
      if (stripeError.code === 'invalid_request_error' && stripeError.message?.includes('No configuration provided')) {
        return NextResponse.json(
          { 
            error: 'Customer portal not configured',
            message: 'The Stripe Customer Portal needs to be configured in the Stripe Dashboard.',
            action: 'Please configure it at: https://dashboard.stripe.com/test/settings/billing/portal',
            debug: {
              stripeCustomerId: subscription.stripe_customer_id,
              subscriptionStatus: subscription.status
            }
          },
          { status: 503 }
        )
      }
      throw stripeError
    }

  } catch (error) {
    console.error('Portal session error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}