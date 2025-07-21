// Dashboard sidebar navigation

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LayoutDashboard, 
  User, 
  CreditCard, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  BarChart3,
  FileText,
  Users,
  Calculator,
  TrendingUp,
  Trophy,
  Home,
  Beaker
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

// Navigation items with existing status
const navigationItems = [
  {
    nameKey: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    exists: true,
  },
  {
    nameKey: 'plans',
    href: '/dashboard/plans',
    icon: FileText,
    exists: true,
  },
  {
    nameKey: 'scenarios',
    href: '/dashboard/scenarios',
    icon: Calculator,
    exists: true,
  },
  {
    nameKey: 'laboratory',
    href: '/dashboard/laboratory',
    icon: Beaker,
    exists: true,
  },
  {
    nameKey: 'profile',
    href: '/dashboard/profile',
    icon: User,
    exists: true,
  },
  {
    nameKey: 'billing',
    href: '/dashboard/billing',
    icon: CreditCard,
    exists: true,
  },
  // These pages exist
  {
    nameKey: 'analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    exists: true,
  },
  {
    nameKey: 'achievements',
    href: '/dashboard/achievements',
    icon: Trophy,
    exists: true,
  },
  {
    nameKey: 'settings',
    href: '/dashboard/settings',
    icon: Settings,
    exists: true,
  },
  {
    nameKey: 'help',
    href: '/dashboard/help',
    icon: HelpCircle,
    exists: true,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const params = useParams()
  const locale = params?.locale as string || 'en'
  const t = useTranslations('Dashboard.navigation')

  // Create locale-prefixed navigation
  const navigation = navigationItems.filter(item => item.exists).map(item => ({
    ...item,
    name: t(item.nameKey),
    href: `/${locale}${item.href}`
  }))

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-full w-64 transform bg-background border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href={`/${locale}/dashboard`} className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">
                FinHome
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1" data-testid="dashboard-navigation">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== `/${locale}/dashboard` && pathname.startsWith(item.href))
                
                // Add data-testid for specific navigation items referenced in tours
                const getTestId = (nameKey: string) => {
                  switch (nameKey) {
                    case 'achievements':
                      return 'achievements-link'
                    case 'laboratory':
                      return 'laboratory-link'
                    default:
                      return undefined
                  }
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    data-testid={getTestId(item.nameKey)}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              © 2025 FinHome
            </div>
          </div>
        </div>
      </div>
    </>
  )
}