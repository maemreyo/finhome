// src/components/plans/PlansList.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase/types'

type FinancialPlan = Database['public']['Tables']['financial_plans']['Row']

interface PlansListProps {
  plans: FinancialPlan[]
}

const statusMap = {
  draft: { label: 'Bản nháp', variant: 'secondary' as const },
  active: { label: 'Đang hoạt động', variant: 'default' as const },
  completed: { label: 'Hoàn thành', variant: 'outline' as const },
  archived: { label: 'Lưu trữ', variant: 'destructive' as const },
}

const typeMap = {
  home_purchase: 'Mua nhà ở',
  investment: 'Đầu tư',
  upgrade: 'Nâng cấp',
  refinance: 'Tái cấu trúc',
}

export function PlansList({ plans }: PlansListProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Chưa có kế hoạch nào</h3>
        <p className="text-muted-foreground mb-4">
          Bắt đầu tạo kế hoạch tài chính đầu tiên của bạn
        </p>
        <Link href="/dashboard/plans/new">
          <Button>Tạo Kế Hoạch Đầu Tiên</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                <CardDescription>
                  {typeMap[plan.plan_type]} • {new Date(plan.created_at).toLocaleDateString('vi-VN')}
                </CardDescription>
              </div>
              <Badge variant={statusMap[plan.status as keyof typeof statusMap]?.variant || 'secondary'}>
                {statusMap[plan.status as keyof typeof statusMap]?.label || 'Unknown'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Giá mua:</span>
                <span className="font-semibold">{formatCurrency(plan.purchase_price || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vốn tự có:</span>
                <span className="font-semibold">{formatCurrency(plan.down_payment || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Thu nhập:</span>
                <span className="font-semibold">{formatCurrency(plan.monthly_income || 0)}/tháng</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Link href={`/dashboard/plans/${plan.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="w-4 h-4 mr-1" />
                  Xem
                </Button>
              </Link>
              <Link href={`/dashboard/plans/${plan.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}