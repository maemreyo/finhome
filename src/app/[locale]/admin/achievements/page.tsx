// src/app/[locale]/admin/achievements/page.tsx
// Localized achievement management page with real Supabase data

import React from 'react'
import { getTranslations } from 'next-intl/server'
import { AchievementManagementTableConnected } from '@/components/admin/AchievementManagementTableConnected'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Plus, Download, Upload } from 'lucide-react'
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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {initialAchievements.filter(achievement => achievement.is_active).length} {t('activeAchievements')}
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
            {t('addAchievement')}
          </Button>
        </div>
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