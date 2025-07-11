// Billing management page

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { SubscriptionCard } from '@/components/billing/SubscriptionCard'
import { BillingHistory } from '@/components/billing/BillingHistory'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Billing',
  description: 'Manage your subscription and billing information',
}

export default function BillingPage() {
  return (
    <DashboardShell
      title="Billing"
      description="Manage your subscription, payment methods, and billing history"
      headerAction={
        <Button asChild>
          <Link href="/pricing">
            <ExternalLink className="mr-2 h-4 w-4" />
            View All Plans
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