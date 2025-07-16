// src/components/admin/AdminSidebar.tsx
// Localized admin sidebar navigation component

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  LayoutDashboard,
  Building2,
  Percent,
  Trophy,
  Bell,
  Users,
  Settings,
  BarChart3,
  FileText,
  Shield,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface NavItem {
  titleKey: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
}

const navigationItems: NavItem[] = [
  {
    titleKey: 'dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Admin overview and statistics'
  },
  {
    titleKey: 'banks',
    href: '/admin/banks',
    icon: Building2,
    description: 'Manage Vietnamese banks'
  },
  {
    titleKey: 'rates',
    href: '/admin/rates',
    icon: Percent,
    description: 'Update bank interest rates'
  },
  {
    titleKey: 'achievements',
    href: '/admin/achievements',
    icon: Trophy,
    description: 'Manage achievement system'
  },
  {
    titleKey: 'notifications',
    href: '/admin/notifications',
    icon: Bell,
    badge: 'New',
    description: 'Notification templates'
  },
  {
    titleKey: 'users',
    href: '/admin/users',
    icon: Users,
    description: 'User management'
  },
  {
    titleKey: 'analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Usage analytics'
  },
  {
    titleKey: 'content',
    href: '/admin/content',
    icon: FileText,
    description: 'Marketing content'
  },
  {
    titleKey: 'system',
    href: '/admin/system',
    icon: Database,
    description: 'System settings'
  },
  {
    titleKey: 'settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Admin preferences'
  }
]

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('Admin.navigation')

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Admin Badge */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
          <Shield className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Admin Panel</h3>
            <p className="text-xs text-blue-600">Management Console</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            // Create localized href
            const localizedHref = locale ? `/${locale}${item.href}` : item.href
            const isActive = pathname === localizedHref || pathname.endsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={localizedHref}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon 
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  )}
                />
                <span className="flex-1">{t(item.titleKey)}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Users</span>
              <span className="font-medium">1,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Banks</span>
              <span className="font-medium">25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Achievements</span>
              <span className="font-medium">18</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Notifications</span>
              <span className="font-medium text-blue-600">5 pending</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}