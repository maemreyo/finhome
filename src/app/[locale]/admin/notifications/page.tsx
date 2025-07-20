// src/app/[locale]/admin/notifications/page.tsx
// Localized notification management page with real Supabase data

import React from 'react'
import { getTranslations } from 'next-intl/server'
import { NotificationManagementTableConnected } from '@/components/admin/NotificationManagementTableConnected'
import { AdminPageActions } from '@/components/admin/AdminPageActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/admin'
import { AdminQueries } from '@/lib/supabase/admin-queries'

interface NotificationsPageProps {
  params: Promise<{ locale: string }>
}

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { locale } = await params
  
  // Require admin authentication
  await requireAdmin()
  
  // Get initial notification data
  const initialNotifications = await AdminQueries.getAllNotifications()

  // Get translations
  const t = await getTranslations({ locale, namespace: 'Admin.notifications' })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-600" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('description')}
          </p>
        </div>
        <AdminPageActions
          entityType="notifications"
          totalCount={initialNotifications.length}
        />
      </div>

      {/* Notification Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allNotifications')} ({initialNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <NotificationManagementTableConnected initialData={initialNotifications} locale={locale} />
        </CardContent>
      </Card>
    </div>
  )
}