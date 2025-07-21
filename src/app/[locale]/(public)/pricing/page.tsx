// src/app/[locale]/pricing/page.tsx
// Redirect pricing page to subscription page

import { redirect } from 'next/navigation'

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/subscription`)
}