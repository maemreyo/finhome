// src/app/dashboard/plans/new/page.tsx
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreatePlanForm } from '@/components/plans/CreatePlanForm'

export default async function NewPlanPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/login')
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