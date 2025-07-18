// Billing management page with locale support
'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { SubscriptionCard } from '@/components/billing/SubscriptionCard'
import { BillingHistory } from '@/components/billing/BillingHistory'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function BillingPage() {
  const t = useTranslations('Dashboard.Billing')
  const { locale } = useParams() as { locale: string }

  return (
    <DashboardShell
      title={t('title')}
      description={t('description')}
      headerAction={
        <Button asChild>
          <Link href={`/${locale}/pricing`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            {t('viewAllPlans')}
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <SubscriptionCard />
        <BillingHistory />
      </div>
    </DashboardShell>
  )
}