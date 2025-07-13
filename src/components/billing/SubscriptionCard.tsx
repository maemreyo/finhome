// Current subscription status card

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSubscription } from '@/hooks/useAuth'
import { format } from 'date-fns'
import { CreditCard, Calendar } from 'lucide-react'

export function SubscriptionCard() {
  const { subscription, loading } = useSubscription()

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      trialing: 'secondary',
      past_due: 'destructive',
      canceled: 'destructive',
      unpaid: 'destructive',
      inactive: 'secondary',
    }

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Current Plan
          {subscription && getStatusBadge(subscription.status)}
        </CardTitle>
        <CardDescription>
          Manage your subscription and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!subscription || subscription.status === 'inactive' ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Free Plan</h3>
            <p className="text-muted-foreground mb-4">
              You&apos;re currently on the free plan
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {subscription.plan_name || 'Pro Plan'}
                </h3>
                <p className="text-muted-foreground">
                  {subscription.status === 'trialing' ? 'Trial period' : 'Active subscription'}
                </p>
              </div>
            </div>

            {subscription.current_period_end && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {subscription.cancel_at_period_end ? 'Cancels' : 'Renews'} on{' '}
                  {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                </span>
              </div>
            )}

            {subscription.cancel_at_period_end && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  Your subscription will be canceled at the end of the current billing period.
                  You&apos;ll continue to have access until then.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleManageSubscription} className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Manage Subscription
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/pricing'}
              >
                Change Plan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}