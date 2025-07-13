// Marketing website layout

export const dynamic = 'force-dynamic'

import { MarketingHeader } from '@/components/marketing/Header'
import { MarketingFooter } from '@/components/marketing/Footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  )
}