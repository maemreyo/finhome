// src/app/[locale]/admin/achievements/page.tsx
// Localized achievement management page with real Supabase data

import React from 'react'
import { getTranslations } from 'next-intl/server'
import { AchievementManagementTableConnected } from '@/components/admin/AchievementManagementTableConnected'
import { AdminPageActions } from '@/components/admin/AdminPageActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/admin'
import { AdminQueries } from '@/lib/supabase/admin-queries'

interface AchievementsPageProps {
  params: Promise<{ locale: string }>
}

export default async function AchievementsPage({ params }: AchievementsPageProps) {
  const { locale } = await params
  
  // Require admin authentication
  await requireAdmin()
  
  // Get initial achievement data
  const initialAchievements = await AdminQueries.getAllAchievements()

  // Get translations
  const t = await getTranslations({ locale, namespace: 'Admin.achievements' })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('description')}
          </p>
        </div>
        <AdminPageActions
          entityType="achievements"
          totalCount={initialAchievements.length}
        />
      </div>

      {/* Achievement Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allAchievements')} ({initialAchievements.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AchievementManagementTableConnected initialData={initialAchievements} locale={locale} />
        </CardContent>
      </Card>
    </div>
  )
}