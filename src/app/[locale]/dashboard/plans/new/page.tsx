// src/app/[locale]/dashboard/plans/new/page.tsx
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreatePlanForm } from '@/components/plans/CreatePlanForm'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function NewPlanPage({ params }: PageProps) {
  const { locale } = await params
  const user = await getUser()
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tạo Kế Hoạch Tài Chính Mới</h1>
        <p className="text-muted-foreground">
          Bắt đầu hành trình mua nhà của bạn với kế hoạch tài chính chi tiết
        </p>
      </div>

      <CreatePlanForm userId={user.id} />
    </div>
  )
}