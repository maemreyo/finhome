// src/app/[locale]/admin/page.tsx
// Localized admin dashboard overview page with real-time data

import React from 'react'
import { getTranslations } from 'next-intl/server'
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient'
import { requireAdmin, getAdminStats } from '@/lib/supabase/admin'

interface AdminDashboardProps {
  params: Promise<{ locale: string }>
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = await params
  
  // Require admin authentication
  await requireAdmin()
  
  // Get initial stats
  const initialStats = await getAdminStats()

  // Get translations
  const t = await getTranslations({ locale, namespace: 'Admin.dashboard' })

  return <AdminDashboardClient initialStats={initialStats} locale={locale} />
}