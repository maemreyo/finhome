// src/app/[locale]/dashboard/plans/page.tsx
import { Suspense, use } from 'react'
import { getUser, getUserFinancialPlans } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlansList } from '@/components/plans/PlansList'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function PlansPage({ params }: PageProps) {
  const { locale } = await params
  const user = await getUser()
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }
  
  const plans = await getUserFinancialPlans(user.id)
  const t = await getTranslations('DashboardPlansPage')

  return (
    <DashboardShell
      title={t('title')}
      description={t('description')}
      headerAction={
        <Link href={`/${locale}/dashboard/plans/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('createButton')}
          </Button>
        </Link>
      }
    >
      <Suspense fallback={<div>{t('loading')}</div>}>
        <PlansList plans={plans} />
      </Suspense>
    </DashboardShell>
  )
}