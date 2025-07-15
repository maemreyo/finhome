// src/app/dashboard/plans/page.tsx
import { Suspense } from 'react'
import { getUser, getUserFinancialPlans } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlansList } from '@/components/plans/PlansList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PlansPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/en/auth/login')
  }

  const plans = await getUserFinancialPlans(user.id)

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kế Hoạch Tài Chính</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi các kế hoạch mua nhà của bạn
          </p>
        </div>
        <Link href="/dashboard/plans/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo Kế Hoạch Mới
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Đang tải...</div>}>
        <PlansList plans={plans} />
      </Suspense>
    </div>
  )
}