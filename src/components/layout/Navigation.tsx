// src/components/layout/Navigation.tsx
// Main navigation component integrating all systems

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard,
  Home,
  TrendingUp,
  Building,
  Calculator,
  Award,
  Bell,
  Settings,
  User,
  Menu,
  X,
  Search,
  HelpCircle,
  ChevronDown
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import { cn } from '@/lib/utils'

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<any>
  badge?: string | number
  children?: NavigationItem[]
}

interface NavigationProps {
  currentPath?: string
  className?: string
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPath = '/dashboard',
  className
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Tổng Quan',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'properties',
      label: 'Bất Động Sản',
      href: '/properties',
      icon: Home,
      children: [
        { id: 'search', label: 'Tìm Kiếm', href: '/properties', icon: Search },
        { id: 'favorites', label: 'Yêu Thích', href: '/properties?tab=favorites', icon: Home },
        { id: 'market', label: 'Thị Trường', href: '/properties?tab=market', icon: TrendingUp }
      ]
    },
    {
      id: 'investments',
      label: 'Đầu Tư',
      href: '/investments',
      icon: TrendingUp,
      children: [
        { id: 'portfolio', label: 'Danh Mục', href: '/investments', icon: Building },
        { id: 'analysis', label: 'Phân Tích ROI', href: '/investments?tab=analytics', icon: TrendingUp },
        { id: 'performance', label: 'Hiệu Suất', href: '/investments?tab=performance', icon: TrendingUp }
      ]
    },
    {
      id: 'banks',
      label: 'Ngân Hàng',
      href: '/banks',
      icon: Building,
      children: [
        { id: 'rates', label: 'So Sánh Lãi Suất', href: '/banks', icon: Calculator },
        { id: 'trends', label: 'Xu Hướng', href: '/banks?tab=trends', icon: TrendingUp },
        { id: 'guide', label: 'Hướng Dẫn', href: '/banks?tab=guide', icon: HelpCircle }
      ]
    },
    {
      id: 'plans',
      label: 'Kế Hoạch',
      href: '/plans',
      icon: Calculator,
      badge: 3,
      children: [
        { id: 'active', label: 'Đang Hoạt Động', href: '/plans?status=active', icon: Calculator },
        { id: 'drafts', label: 'Bản Nháp', href: '/plans?status=draft', icon: Calculator },
        { id: 'new', label: 'Tạo Mới', href: '/plans/new', icon: Calculator }
      ]
    },
    {
      id: 'achievements',
      label: 'Thành Tích',
      href: '/achievements',
      icon: Award,
      badge: 'Mới'
    }
  ]

  const userMenuItems = [
    { label: 'Hồ Sơ', href: '/profile', icon: User },
    { label: 'Cài Đặt', href: '/settings', icon: Settings },
    { label: 'Trợ Giúp', href: '/help', icon: HelpCircle }
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/'
    }
    return currentPath.startsWith(href)
  }

  const NavItem: React.FC<{ item: NavigationItem; mobile?: boolean }> = ({ item, mobile = false }) => {
    const isActive = isActiveRoute(item.href)
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren && !mobile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                "justify-between h-auto px-3 py-2",
                isActive && "bg-blue-100 text-blue-700 hover:bg-blue-200"
              )}
            >
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => window.location.href = item.href}>
              <item.icon className="w-4 h-4 mr-2" />
              Tổng Quan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {item.children?.map((child) => (
              <DropdownMenuItem 
                key={child.id}
                onClick={() => window.location.href = child.href}
              >
                <child.icon className="w-4 h-4 mr-2" />
                {child.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          "justify-start h-auto px-3 py-2",
          isActive && "bg-blue-100 text-blue-700 hover:bg-blue-200",
          mobile && "w-full"
        )}
        onClick={() => {
          window.location.href = item.href
          if (mobile) setIsMobileOpen(false)
        }}
      >
        <div className="flex items-center gap-2">
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs ml-1">
              {item.badge}
            </Badge>
          )}
        </div>
      </Button>
    )
  }

  return (
    <nav className={cn("bg-white border-b shadow-sm", className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FinHome</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback>MN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">Matthew Ngo</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      matthew@example.com
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {userMenuItems.map((item) => (
                  <DropdownMenuItem 
                    key={item.href}
                    onClick={() => window.location.href = item.href}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Đăng Xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">FinHome</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <NavItem item={item} mobile />
                      {item.children && (
                        <div className="ml-6 space-y-1">
                          {item.children?.map((child) => (
                            <NavItem key={child.id} item={child} mobile />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t mt-6 pt-6 space-y-2">
                  {userMenuItems.map((item) => (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        window.location.href = item.href
                        setIsMobileOpen(false)
                      }}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation