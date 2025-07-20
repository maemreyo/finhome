// src/components/admin/AdminHeader.tsx
// Admin header with user profile and quick actions

'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Bell,
  Settings,
  User,
  LogOut,
  Home,
  Search,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const AdminHeader: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload()
  }

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      await supabase.auth.signOut()
      
      // Redirect to login page
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: force redirect even if logout fails
      window.location.href = '/auth/login'
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FH</span>
            </div>
            <span className="font-bold text-xl text-gray-900">FinHome</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Admin Panel
          </Badge>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, banks, settings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right: Actions and Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="w-4 h-4" />
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <Badge 
              className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center text-xs"
              variant="destructive"
            >
              3
            </Badge>
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@finhome.com</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}