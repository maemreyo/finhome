// src/app/[locale]/(dashboard)/dashboard/plans/[planId]/edit/page.tsx
import { getUser, getFinancialPlanWithDetails } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditPlanPageClient } from './EditPlanPageClient'

interface EditPlanPageProps {
  params: Promise<{
    locale: string
    planId: string
  }>
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const user = await getUser()
  const { locale, planId } = await params
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }

  const plan = await getFinancialPlanWithDetails(planId)
  
  if (!plan || plan.user_id !== user.id) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <EditPlanPageClient plan={plan} locale={locale} />
    </div>
  )
}