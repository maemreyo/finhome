// src/app/timeline/page.tsx
// Timeline demo page

import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import TimelineDemo from '@/components/timeline/TimelineDemo'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'TimelinePage.metadata' })
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(',').map(k => k.trim())
  }
}

export default function TimelinePage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TimelineDemo />
    </div>
  )
}