// src/components/layout/AppLayout.tsx
// Main application layout wrapper integrating all systems

'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import { ToastProvider } from '@/components/notifications/ToastNotification'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  className
}) => {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't show navigation on auth pages
  const hideNavigation = pathname?.startsWith('/auth') || pathname?.startsWith('/login') || pathname?.startsWith('/signup')

  if (!mounted) {
    return null // Prevent hydration issues
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {!hideNavigation && <Navigation currentPath={pathname} />}
        
        <main className={cn("", className)}>
          {children}
        </main>

        {/* Global Footer (optional) */}
        {!hideNavigation && (
          <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">F</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    © 2024 FinHome. Giải pháp tài chính bất động sản thông minh.
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <Link href="/privacy" className="hover:text-gray-700">Chính sách bảo mật</Link>
                  <Link href="/terms" className="hover:text-gray-700">Điều khoản</Link>
                  <Link href="/help" className="hover:text-gray-700">Trợ giúp</Link>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </ToastProvider>
  )
}

export default AppLayout