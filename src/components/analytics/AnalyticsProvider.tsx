// Analytics provider component

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAnalytics } from '@/lib/analytics'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const analytics = useAnalytics()

  // Track page views
  useEffect(() => {
    analytics.page()
  }, [pathname, analytics])

  return <>{children}</>
}