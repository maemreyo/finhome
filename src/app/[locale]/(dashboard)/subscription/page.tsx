// src/app/[locale]/(dashboard)/subscription/page.tsx
// Subscription management page

import React from 'react'
import { useTranslations } from 'next-intl'
import { SubscriptionPlansCard } from '@/components/subscription/SubscriptionPlansCard'

export default function SubscriptionPage() {
  const t = useTranslations('SubscriptionPlans')

  return (
    <div className="space-y-6">
      <div className="container mx-auto px-6">
        <SubscriptionPlansCard />
      </div>
    </div>
  )
}