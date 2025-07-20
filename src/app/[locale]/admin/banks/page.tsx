// src/app/[locale]/admin/banks/page.tsx
// Localized bank management page with real Supabase data

import React from 'react'
import { getTranslations } from 'next-intl/server'
import { BankManagementTableConnected } from '@/components/admin/BankManagementTableConnected'
import { AdminPageActions } from '@/components/admin/AdminPageActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/admin'
import { AdminQueries } from '@/lib/supabase/admin-queries'

interface BanksPageProps {
  params: Promise<{ locale: string }>
}

export default async function BanksPage({ params }: BanksPageProps) {
  const { locale } = await params
  
  // Require admin authentication
  await requireAdmin()
  
  // Get initial bank data
  const initialBanks = await AdminQueries.getAllBanks()

  // Get translations
  const t = await getTranslations({ locale, namespace: 'Admin.banks' })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('description')}
          </p>
        </div>
        <AdminPageActions
          entityType="banks"
          totalCount={initialBanks.length}
        />
      </div>

      {/* Bank Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allBanks')} ({initialBanks.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <BankManagementTableConnected initialData={initialBanks} locale={locale} />
        </CardContent>
      </Card>
    </div>
  )
}