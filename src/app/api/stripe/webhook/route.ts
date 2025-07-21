// src/app/api/stripe/webhook/route.ts
// Stripe webhook handler for subscription events

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id
          const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['customer']
          })
          
          // Update user subscription in database
          const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id || ''
            
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: session.metadata?.userId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: customerId,
              status: subscription.status,
              plan_id: session.metadata?.planId,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end
            })

          // Update user tier
          console.log(`[Webhook] Updating user ${session.metadata?.userId} to tier ${session.metadata?.planId}`)
          const { error: tierUpdateError } = await supabase
            .from('user_profiles')
            .update({ 
              subscription_tier: session.metadata?.planId,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.metadata?.userId)

          if (tierUpdateError) {
            console.error('[Webhook] Error updating user tier:', tierUpdateError)
          } else {
            console.log(`[Webhook] Successfully updated user tier to ${session.metadata?.planId}`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        // Downgrade user to free tier
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (subData) {
          await supabase
            .from('user_profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', subData.user_id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if ((invoice as any).subscription) {
          const subscriptionId = typeof (invoice as any).subscription === 'string' 
            ? (invoice as any).subscription 
            : (invoice as any).subscription.id
          await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if ((invoice as any).subscription) {
          const subscriptionId = typeof (invoice as any).subscription === 'string' 
            ? (invoice as any).subscription 
            : (invoice as any).subscription.id
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}