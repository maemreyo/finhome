// Individual pricing plan card component

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth, useSubscription } from '@/hooks/useAuth'
import { PricingPlan } from '@/lib/stripe/config'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PricingCardProps {
  plan: PricingPlan
  annual?: boolean
  onSelectPlan: (planId: string) => Promise<void>
}

export function PricingCard({ plan, annual = false, onSelectPlan }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { subscription, isActive } = useSubscription()

  const isCurrentPlan = subscription?.plan_name === plan.name
  const price = annual ? Math.floor(plan.price * 12 * 0.8) : plan.price // 20% discount for annual

  const handleSelectPlan = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe')
      return
    }

    if (plan.id === 'starter') {
      toast.info('You are already on the free plan')
      return
    }

    setIsLoading(true)
    try {
      await onSelectPlan(plan.id)
    } catch (error) {
      console.error('Error selecting plan:', error)
      toast.error('Failed to start checkout process')
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    if (!user) return plan.cta
    if (isCurrentPlan && isActive) return 'Current Plan'
    if (plan.id === 'starter') return 'Current Plan'
    if (plan.id === 'enterprise') return 'Contact Sales'
    return plan.cta
  }

  const isButtonDisabled = () => {
    if (isLoading) return true
    if (!user) return false
    if (isCurrentPlan && isActive) return true
    if (plan.id === 'starter' && !subscription?.stripe_subscription_id) return true
    return false
  }

  return (
    <Card className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
      {plan.popular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center pb-2">
        <div className="mb-4">
          {plan.price === 0 ? (
            <div className="text-3xl font-bold">Free</div>
          ) : (
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold">${annual ? price : plan.price}</span>
              <span className="text-muted-foreground ml-1">
                /{annual ? 'year' : 'month'}
              </span>
            </div>
          )}
          {annual && plan.price > 0 && (
            <div className="text-sm text-green-600 mt-1">
              Save ${Math.floor(plan.price * 12 * 0.2)}/year
            </div>
          )}
        </div>

        <ul className="space-y-2 text-sm text-left">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={plan.popular ? 'default' : 'outline'}
          onClick={handleSelectPlan}
          disabled={isButtonDisabled()}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  )
}