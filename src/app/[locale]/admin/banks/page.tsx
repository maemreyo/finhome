// src/app/[locale]/admin/banks/page.tsx
// Localized bank management page with real Supabase data

import React from 'react'
import { getTranslations } from 'next-intl/server'
import { BankManagementTableConnected } from '@/components/admin/BankManagementTableConnected'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, Download, Upload } from 'lucide-react'
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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {initialBanks.filter(bank => bank.is_active).length} {t('activeBanks')}
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
            {t('addBank')}
          </Button>
        </div>
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