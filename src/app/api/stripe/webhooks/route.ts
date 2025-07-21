// src/app/api/stripe/webhooks/route.ts
// Stripe webhook handler for subscription events

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { SubscriptionService } from '@/lib/services/subscriptionService'
import { UserSubscriptionTier } from '@/lib/supabase/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

async function createSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      }
    }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!customerId || !subscriptionId) return

  const customer = await stripe.customers.retrieve(customerId)
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const userId = (customer as any).metadata?.userId
  if (!userId) {
    console.error('No userId found in customer metadata')
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const tier = getTierFromPriceId(priceId)

  await SubscriptionService.updateUserTier(userId, tier)

  await SubscriptionService.upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    status: subscription.status as any,
    planId: tier,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    trialStart: (subscription as any).trial_start ? new Date((subscription as any).trial_start * 1000) : null,
    trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null
  })

  await SubscriptionService.trackSubscriptionEvent({
    eventType: 'subscription_created',
    userId,
    subscriptionId,
    toTier: tier,
    amount: subscription.items.data[0]?.price.unit_amount || 0,
    currency: subscription.currency || 'vnd',
    timestamp: new Date()
  })

  console.log(`Subscription created for user ${userId}: ${tier}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId)
  const userId = (customer as any).metadata?.userId

  if (!userId) return

  const priceId = subscription.items.data[0]?.price.id
  const tier = getTierFromPriceId(priceId)

  await SubscriptionService.updateUserTier(userId, tier)

  await SubscriptionService.upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    status: subscription.status as any,
    planId: tier,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    trialStart: (subscription as any).trial_start ? new Date((subscription as any).trial_start * 1000) : null,
    trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null
  })

  await SubscriptionService.trackSubscriptionEvent({
    eventType: 'subscription_updated',
    userId,
    subscriptionId: subscription.id,
    toTier: tier,
    timestamp: new Date()
  })
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId)
  const userId = (customer as any).metadata?.userId

  if (!userId) return

  await SubscriptionService.updateUserTier(userId, 'free')

  await SubscriptionService.upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: 'canceled',
    planId: 'free',
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: true
  })

  await SubscriptionService.trackSubscriptionEvent({
    eventType: 'subscription_canceled',
    userId,
    subscriptionId: subscription.id,
    toTier: 'free',
    timestamp: new Date()
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const customer = await stripe.customers.retrieve(customerId)
  const userId = (customer as any).metadata?.userId

  if (!userId) return

  await SubscriptionService.recordBillingEvent({
    userId,
    stripeInvoiceId: invoice.id || null,
    stripePaymentIntentId: (invoice as any).payment_intent || null,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status || 'paid',
    invoiceUrl: invoice.hosted_invoice_url || null,
    invoicePdf: invoice.invoice_pdf || null,
    billingReason: invoice.billing_reason
  })

  await SubscriptionService.trackSubscriptionEvent({
    eventType: 'payment_succeeded',
    userId,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    timestamp: new Date()
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const customer = await stripe.customers.retrieve(customerId)
  const userId = (customer as any).metadata?.userId

  if (!userId) return

  await SubscriptionService.recordBillingEvent({
    userId,
    stripeInvoiceId: invoice.id || null,
    stripePaymentIntentId: (invoice as any).payment_intent || null,
    amountPaid: 0,
    currency: invoice.currency,
    status: 'failed',
    invoiceUrl: invoice.hosted_invoice_url || null,
    invoicePdf: invoice.invoice_pdf || null,
    billingReason: invoice.billing_reason
  })

  await SubscriptionService.trackSubscriptionEvent({
    eventType: 'payment_failed',
    userId,
    amount: invoice.amount_due,
    currency: invoice.currency,
    reason: 'Payment failed',
    timestamp: new Date()
  })
}

function getTierFromPriceId(priceId: string): UserSubscriptionTier {
  const priceIdToTier: Record<string, UserSubscriptionTier> = {
    'price_premium_monthly_vnd': 'premium',
    'price_premium_yearly_vnd': 'premium',
    'price_professional_monthly_vnd': 'professional',
    'price_professional_yearly_vnd': 'professional'
  }

  return priceIdToTier[priceId] || 'free'
}