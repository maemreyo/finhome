// src/app/[locale]/(public)/layout.tsx
// Layout for public pages (banks, properties, investments, pricing)

import React from 'react'
import { MarketingHeader } from '@/components/marketing/Header'
import { MarketingFooter } from '@/components/marketing/Footer'

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  )
}