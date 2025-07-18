// src/app/[locale]/dashboard/plans/page.tsx
import { Suspense, use } from 'react'
import { getUser, getUserFinancialPlans } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlansList } from '@/components/plans/PlansList'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

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

  return (
    <DashboardShell
      title="Kế Hoạch Tài Chính"
      description="Quản lý và theo dõi các kế hoạch mua nhà của bạn"
      headerAction={
        <Link href={`/${locale}/dashboard/plans/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo Kế Hoạch Mới
          </Button>
        </Link>
      }
    >
      <Suspense fallback={<div>Đang tải...</div>}>
        <PlansList plans={plans} />
      </Suspense>
    </DashboardShell>
  )
}