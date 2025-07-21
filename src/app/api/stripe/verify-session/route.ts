// src/app/api/stripe/verify-session/route.ts
// Verify Stripe checkout session and ensure subscription is updated

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      console.error('[verify-session] No session ID provided')
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    console.log(`[verify-session] Verifying session: ${sessionId}`)

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    if (!session) {
      console.error('[verify-session] Session not found:', sessionId)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    console.log('[verify-session] Session retrieved:', {
      id: session.id,
      mode: session.mode,
      payment_status: session.payment_status,
      has_subscription: !!session.subscription,
      metadata: session.metadata
    })

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() {}
        }
      }
    )

    // If this was a subscription checkout (allow unpaid for test cards that complete immediately)
    if (session.mode === 'subscription' && session.subscription) {
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId

      console.log('[verify-session] Processing subscription session:', {
        userId,
        planId,
        subscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
      })

      if (!userId || !planId) {
        console.error('[verify-session] Missing metadata:', { userId, planId })
        return NextResponse.json(
          { error: 'Missing user or plan information' },
          { status: 400 }
        )
      }

      // Ensure the user's subscription tier is updated
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_tier: planId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating user tier:', updateError)
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        )
      }

      // Also ensure subscription record exists
      const subscriptionId = typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription.id
      
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id || ''

      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          status: subscription.status,
          plan_id: planId,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end
        })

      return NextResponse.json({ 
        success: true,
        session: {
          id: session.id,
          paymentStatus: session.payment_status,
          userId,
          planId
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      session: {
        id: session.id,
        paymentStatus: session.payment_status
      }
    })

  } catch (error) {
    console.error('[verify-session] Error verifying session:', error)
    console.error('[verify-session] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { error: 'Failed to verify session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}