// src/app/[locale]/admin/users/page.tsx
// Localized user management page with real Supabase data

import React from 'react'
import { getTranslations } from 'next-intl/server'
import { UserManagementTableConnected } from '@/components/admin/UserManagementTableConnected'
import { AdminPageActions } from '@/components/admin/AdminPageActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/admin'
import { AdminQueries } from '@/lib/supabase/admin-queries'

interface UsersPageProps {
  params: Promise<{ locale: string }>
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { locale } = await params
  
  // Require admin authentication
  await requireAdmin()
  
  // Get initial user data
  const initialUsers = await AdminQueries.getAllUsers()

  // Get translations
  const t = await getTranslations({ locale, namespace: 'Admin.users' })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('description')}
          </p>
        </div>
        <AdminPageActions
          entityType="users"
          totalCount={initialUsers.length}
        />
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allUsers')} ({initialUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <UserManagementTableConnected initialData={initialUsers} locale={locale} />
        </CardContent>
      </Card>
    </div>
  )
}