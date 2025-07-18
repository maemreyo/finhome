// src/app/[locale]/(tools)/layout.tsx
// Layout for standalone tools (charts, timeline)

import React from 'react'
import { MarketingHeader } from '@/components/marketing/Header'
import { MarketingFooter } from '@/components/marketing/Footer'

interface ToolsLayoutProps {
  children: React.ReactNode
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <MarketingFooter />
    </div>
  )
}