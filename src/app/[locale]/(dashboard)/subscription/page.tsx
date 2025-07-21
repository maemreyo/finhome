// src/app/[locale]/(dashboard)/subscription/page.tsx
// Subscription management page

import React from 'react'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/dashboard/Header'
import { SubscriptionPlansCard } from '@/components/subscription/SubscriptionPlansCard'

export default function SubscriptionPage() {
  const t = useTranslations('SubscriptionPlans')

  return (
    <div className="space-y-6">
      <Header 
        title={t('title')}
        description={t('subtitle')}
      />
      
      <div className="container mx-auto px-6">
        <SubscriptionPlansCard />
      </div>
    </div>
  )
}