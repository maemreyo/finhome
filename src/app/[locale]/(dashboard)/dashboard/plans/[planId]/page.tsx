// src/app/[locale]/dashboard/plans/[planId]/page.tsx
import { getUser, getFinancialPlanWithDetails } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PlanDetailView } from '@/components/plans/PlanDetailView'

interface PlanDetailPageProps {
  params: Promise<{
    locale: string
    planId: string
  }>
}

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
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
      <PlanDetailView plan={plan} />
    </div>
  )
}