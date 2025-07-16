// src/app/[locale]/admin/rates/page.tsx
// Localized interest rate management page with real Supabase data

import React from 'react'
import { getTranslations } from 'next-intl/server'
import { InterestRateManagementTableConnected } from '@/components/admin/InterestRateManagementTableConnected'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Plus, Download, Upload } from 'lucide-react'
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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {initialRates.length} {t('currentRates')}
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('export')}
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            {t('import')}
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('addRate')}
          </Button>
        </div>
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