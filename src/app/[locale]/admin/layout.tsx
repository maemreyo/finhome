// src/app/[locale]/admin/layout.tsx
// Localized admin dashboard layout with sidebar navigation

import React from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AdminLayoutProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Admin.metadata' })

  return {
    title: t('title'),
    description: t('description'),
    robots: {
      index: false, // Don't index admin pages
      follow: false,
    },
  }
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <AdminHeader />
      
      <div className="flex">
        {/* Admin Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}