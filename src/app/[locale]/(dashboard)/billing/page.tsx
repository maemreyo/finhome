// Billing management page with locale support
'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { EnhancedSubscriptionCard } from '@/components/billing/EnhancedSubscriptionCard'
import { UsageTrackingCard } from '@/components/billing/UsageTrackingCard'
import { BillingHistory } from '@/components/billing/BillingHistory'
import { Button } from '@/components/ui/button'
import { ExternalLink, Settings } from 'lucide-react'
import Link from 'next/link'

export default function BillingPage() {
  const t = useTranslations('BillingPage')
  const { locale } = useParams() as { locale: string }

  return (
    <DashboardShell
      title={t('title')}
      description={t('description')}
      headerAction={
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/subscription`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('viewAllPlans') || 'View All Plans'}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              {t('accountSettings') || 'Account Settings'}
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Main Subscription Information */}
        <EnhancedSubscriptionCard />
        
        {/* Usage Tracking for Free Users */}
        <UsageTrackingCard />
        
        {/* Billing History */}
        <BillingHistory />
      </div>
    </DashboardShell>
  )
}