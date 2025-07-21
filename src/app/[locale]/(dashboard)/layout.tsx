// src/app/[locale]/(dashboard)/layout.tsx
// Layout for dashboard pages (dashboard, plans, scenarios, analytics)

import React from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { OnboardingManager } from '@/components/onboarding/OnboardingManager'

interface DashboardRouteLayoutProps {
  children: React.ReactNode
}

export default function DashboardRouteLayout({ children }: DashboardRouteLayoutProps) {
  return (
    <OnboardingManager>
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </OnboardingManager>
  )
}