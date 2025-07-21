// src/app/api/stripe/create-checkout-session/route.ts
// Create Stripe checkout session for subscription upgrades

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: NextRequest) {
  try {
    const { planId, billing, userId, featureKey } = await request.json()

    if (!planId || !billing || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get the plan configuration
    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === planId)
    if (!plan || plan.tier === 'free') {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

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

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || user.email,
        metadata: {
          userId: user.id
        }
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Get the appropriate price ID (use real Stripe price IDs in production)
    const priceId = billing === 'yearly' ? plan.stripeIds.yearly : plan.stripeIds.monthly

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
      subscription_data: {
        trial_period_days: plan.trial?.enabled ? plan.trial.days : undefined,
        metadata: {
          userId,
          planId: plan.tier,
          featureKey: featureKey || ''
        }
      },
      metadata: {
        userId,
        planId: plan.tier,
        featureKey: featureKey || ''
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      custom_text: {
        submit: {
          message: 'Chúng tôi sẽ gửi email xác nhận khi thanh toán thành công.'
        }
      },
      locale: 'vi'
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}