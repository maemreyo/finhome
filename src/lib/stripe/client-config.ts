// Client-side Stripe configuration and utilities

import { loadStripe, type Stripe as StripeJS } from '@stripe/stripe-js'

// Client-side Stripe instance
let stripePromise: Promise<StripeJS | null>
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable')
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Pricing plans configuration (client-safe)
export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  stripePriceId: string
  features: string[]
  popular?: boolean
  cta: string
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small teams getting started',
    price: 0,
    currency: 'usd',
    interval: 'month',
    stripePriceId: '', // Free plan - no Stripe price ID needed
    features: [
      'Up to 3 projects',
      'Basic analytics',
      'Email support',
      '5GB storage',
      'Basic integrations'
    ],
    cta: 'Get Started Free'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Advanced features for growing businesses',
    price: 29,
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_pro_monthly', // Placeholder - will be replaced by server
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '100GB storage',
      'All integrations',
      'Team collaboration',
      'Custom branding'
    ],
    popular: true,
    cta: 'Start Pro Trial'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: 99,
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_enterprise_monthly', // Placeholder - will be replaced by server
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'Unlimited storage',
      'Advanced security',
      'SLA guarantee',
      'Custom contracts'
    ],
    cta: 'Contact Sales'
  }
]

// Helper function to get plan by ID
export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => plan.id === planId)
}

// Helper function to get plan by Stripe price ID
export function getPlanByStripePriceId(priceId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => plan.stripePriceId === priceId)
}