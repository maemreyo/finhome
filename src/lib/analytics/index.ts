// Analytics and monitoring utilities

'use client'

// Track events for analytics
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
}

// Simple analytics wrapper that can work with multiple providers
class Analytics {
  private userId: string | null = null
  private isEnabled: boolean

  constructor() {
    this.isEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
  }

  // Set user identity
  identify(userId: string, traits?: Record<string, any>) {
    this.userId = userId
    
    if (!this.isEnabled) return

    // Add your analytics providers here
    // Example: analytics.identify(userId, traits)
    console.log('Analytics: Identify', { userId, traits })
  }

  // Track custom events
  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return

    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
      },
      userId: this.userId,
    }

    // Send to analytics providers
    this.sendToProviders(eventData)
    
    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics: Track', eventData)
    }
  }

  // Track page views
  page(name?: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return

    this.track('Page Viewed', {
      page: name || document.title,
      path: window.location.pathname,
      search: window.location.search,
      ...properties,
    })
  }

  // Track user sign up
  signUp(method?: string) {
    this.track('User Signed Up', {
      method: method || 'email',
    })
  }

  // Track user sign in
  signIn(method?: string) {
    this.track('User Signed In', {
      method: method || 'email',
    })
  }

  // Track subscription events
  subscribe(planName: string, amount: number, interval: string) {
    this.track('Subscription Created', {
      plan: planName,
      amount,
      interval,
    })
  }

  // Track feature usage
  featureUsed(feature: string, properties?: Record<string, any>) {
    this.track('Feature Used', {
      feature,
      ...properties,
    })
  }

  // Send to analytics providers
  private sendToProviders(eventData: AnalyticsEvent) {
    // Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', eventData.event, eventData.properties)
    }

    // Plausible Analytics
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(eventData.event, {
        props: eventData.properties,
      })
    }

    // Store in Supabase for custom analytics
    this.storeInDatabase(eventData)
  }

  // Store analytics events in database
  private async storeInDatabase(eventData: AnalyticsEvent) {
    try {
      if (!this.userId) return

      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventData.event,
          properties: eventData.properties,
          user_id: this.userId,
        }),
      })
    } catch (error) {
      console.error('Failed to store analytics event:', error)
    }
  }
}

// Export singleton instance
export const analytics = new Analytics()

// React hook for analytics
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

export function useAnalytics() {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      analytics.identify(user.id, {
        email: user.email,
        created_at: user.created_at,
      })
    }
  }, [user])

  return analytics
}