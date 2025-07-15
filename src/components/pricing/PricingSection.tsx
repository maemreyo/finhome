// Complete pricing section with billing toggle

'use client'

import { useState } from 'react'
import { PricingCard } from './PricingCard'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PRICING_PLANS } from '@/lib/stripe/client-config'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from 'next-intl'

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const locale = useLocale()

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      router.push(`/${locale}/auth/signup`)
      return
    }

    if (planId === 'enterprise') {
      // Redirect to contact page
      router.push(`/${locale}/contact?plan=enterprise`)
      return
    }

    // Create checkout session
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        annual: isAnnual,
      }),
    })

    if (response.ok) {
      const { url } = await response.json()
      window.location.href = url
    } else {
      throw new Error('Failed to create checkout session')
    }
  }

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <Label htmlFor="billing-toggle" className={!isAnnual ? 'font-semibold' : ''}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-toggle" className={isAnnual ? 'font-semibold' : ''}>
              Annual
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              annual={isAnnual}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Have questions about our pricing?
          </p>
          <Button variant="outline" onClick={() => router.push('/faq')}>
            View FAQ
          </Button>
        </div>
      </div>
    </section>
  )
}