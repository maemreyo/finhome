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
  Beaker,
  Wallet,
  Target,
  PieChart,
  Award
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

// Expense tracking navigation items (primary section)
const expenseTrackingItems = [
  {
    nameKey: 'expenses',
    href: '/expenses',
    icon: Wallet,
    exists: true,
  },
  {
    nameKey: 'wallets',
    href: '/wallets',
    icon: CreditCard,
    exists: true,
  },
  {
    nameKey: 'analytics',
    href: '/expenses/analytics',
    icon: BarChart3,
    exists: true,
  },
  {
    nameKey: 'budgets',
    href: '/expenses/budgets', 
    icon: PieChart,
    exists: true,
  },
  {
    nameKey: 'goals',
    href: '/expenses/goals',
    icon: Target,
    exists: true,
  },
  {
    nameKey: 'achievements',
    href: '/expenses/achievements',
    icon: Award,
    exists: true,
  },
]

// Financial planning navigation items (hidden for future release)
const financialPlanningItems = [
  {
    nameKey: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    exists: false, // Hidden until future release
  },
  {
    nameKey: 'plans',
    href: '/plans',
    icon: FileText,
    exists: false, // Hidden until future release
  },
  {
    nameKey: 'scenarios',
    href: '/scenarios',
    icon: Calculator,
    exists: false, // Hidden until future release
  },
  {
    nameKey: 'laboratory',
    href: '/laboratory',
    icon: Beaker,
    exists: false, // Hidden until future release
  },
]

// User account navigation items (separate section)
const userAccountItems = [
  {
    nameKey: 'profile',
    href: '/profile',
    icon: User,
    exists: true,
  },
  {
    nameKey: 'billing',
    href: '/billing',
    icon: CreditCard,
    exists: true,
  },
  {
    nameKey: 'settings',
    href: '/settings',
    icon: Settings,
    exists: true,
  },
  {
    nameKey: 'help',
    href: '/help',
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

  // Create locale-prefixed navigation for expense tracking
  const expenseNavigation = expenseTrackingItems.filter(item => item.exists).map(item => ({
    ...item,
    name: t(item.nameKey),
    href: `/${locale}${item.href}`
  }))

  // Create locale-prefixed navigation for financial planning (hidden)
  const financialPlanningNavigation = financialPlanningItems.filter(item => item.exists).map(item => ({
    ...item,
    name: t(item.nameKey),
    href: `/${locale}${item.href}`
  }))

  // Create locale-prefixed navigation for user account items
  const userAccountNavigation = userAccountItems.filter(item => item.exists).map(item => ({
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
            <nav className="space-y-6" data-testid="dashboard-navigation">
              {/* Expense Tracking Section */}
              <div>
                <div className="px-3 mb-2">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("expensesTracking")}
                  </h2>
                </div>
                <div className="space-y-1">
                  {expenseNavigation.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== `/${locale}/expenses` && pathname.startsWith(item.href))
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
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
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-border"></div>

              {/* Financial Planning Section (Hidden for future release) */}
              {financialPlanningNavigation.length > 0 && (
                <>
                  <div>
                    <div className="px-3 mb-2">
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("plans")}
                      </h2>
                    </div>
                    <div className="space-y-1">
                      {financialPlanningNavigation.map((item) => {
                        const isActive = pathname === item.href || 
                          (item.href !== `/${locale}/dashboard` && pathname.startsWith(item.href))
                        
                        // Add data-testid for specific navigation items referenced in tours
                        const getTestId = (nameKey: string) => {
                          switch (nameKey) {
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
                    </div>
                  </div>
                  
                  {/* Separator */}
                  <div className="border-t border-border"></div>
                </>
              )}

              {/* User Account Section */}
              <div>
                <div className="px-3 mb-2">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("account")}
                  </h2>
                </div>
                <div className="space-y-1">
                  {userAccountNavigation.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== `/${locale}/dashboard` && pathname.startsWith(item.href))

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
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
                </div>
              </div>
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