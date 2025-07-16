// src/app/[locale]/admin/notifications/page.tsx
// Localized notification management page with real Supabase data

import React from 'react'
import { getTranslations } from 'next-intl/server'
import { NotificationManagementTableConnected } from '@/components/admin/NotificationManagementTableConnected'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, Download, Upload } from 'lucide-react'
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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {initialNotifications.length} {t('activeNotifications')}
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
            {t('addNotification')}
          </Button>
        </div>
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