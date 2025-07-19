// src/components/dashboard/Header.tsx
// Dashboard header with user menu and i18n support

'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth, useAuthActions } from '@/hooks/useAuth'
import { User, Settings, CreditCard, LogOut, Bell, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LevelIndicator } from '@/components/gamification/LevelIndicator'
import { UserProgress } from '@/lib/gamification/achievements'

interface HeaderProps {
  title?: string
  description?: string
  userProgress?: UserProgress
}

export function Header({ title, description, userProgress }: HeaderProps) {
  const { user } = useAuth()
  const { signOut } = useAuthActions()
  const params = useParams()
  const locale = params?.locale as string || 'en'
  const t = useTranslations('Dashboard.navigation')
  const tCommon = useTranslations('Dashboard.Header')

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Title Section */}
        <div>
          {title && (
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* User Level Indicator */}
          {userProgress && (
            <LevelIndicator 
              userProgress={userProgress} 
              compact={true}
              className="hidden md:flex"
            />
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" title={tCommon('notifications')}>
            <Bell className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.user_metadata?.avatar_url} 
                    alt={user?.user_metadata?.full_name || user?.email || 'User'} 
                  />
                  <AvatarFallback>
                    {user?.user_metadata?.full_name?.[0] || 
                     user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || tCommon('defaultUser')}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/dashboard/profile`}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/dashboard/billing`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>{t('billing')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/dashboard/achievements`}>
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>{t('achievements')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/dashboard/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{tCommon('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}