// src/app/[locale]/admin/rates/page.tsx
// Localized interest rate management page with real Supabase data

import React from 'react'
import { getTranslations } from 'next-intl/server'
import { InterestRateManagementTableConnected } from '@/components/admin/InterestRateManagementTableConnected'
import { AdminPageActions } from '@/components/admin/AdminPageActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/admin'
import { AdminQueries } from '@/lib/supabase/admin-queries'

interface RatesPageProps {
  params: Promise<{ locale: string }>
}

export default async function RatesPage({ params }: RatesPageProps) {
  const { locale } = await params
  
  // Require admin authentication
  await requireAdmin()
  
  // Get initial rate data
  const initialRates = await AdminQueries.getAllInterestRates()

  // Get translations
  const t = await getTranslations({ locale, namespace: 'Admin.rates' })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('description')}
          </p>
        </div>
        <AdminPageActions
          entityType="rates"
          totalCount={initialRates.length}
        />
      </div>

      {/* Interest Rate Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allRates')} ({initialRates.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <InterestRateManagementTableConnected initialData={initialRates} locale={locale} />
        </CardContent>
      </Card>
    </div>
  )
}