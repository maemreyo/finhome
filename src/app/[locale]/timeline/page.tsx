// src/app/timeline/page.tsx
// Timeline demo page

import { Metadata } from 'next'
import TimelineDemo from '@/components/timeline/TimelineDemo'

export const metadata: Metadata = {
  title: 'Interactive Financial Timeline | FinHome',
  description: 'Visualize your real estate investment journey with our interactive timeline featuring scenario modeling, crisis management, and opportunity detection.',
  keywords: [
    'financial timeline',
    'loan visualization', 
    'scenario planning',
    'real estate investment',
    'financial planning',
    'Vietnam mortgage',
    'prepayment calculator'
  ]
}

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TimelineDemo />
    </div>
  )
}