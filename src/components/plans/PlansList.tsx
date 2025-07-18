// src/components/plans/PlansList.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase/types'
import { useTranslations } from 'next-intl'

type FinancialPlan = Database['public']['Tables']['financial_plans']['Row']

interface PlansListProps {
  plans: FinancialPlan[]
}

// Status and type maps will be replaced with translation keys

export function PlansList({ plans }: PlansListProps) {
  const t = useTranslations('PlansList')

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return t('status.draft')
      case 'active': return t('status.active')
      case 'completed': return t('status.completed')
      case 'archived': return t('status.archived')
      default: return t('status.unknown')
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary' as const
      case 'active': return 'default' as const
      case 'completed': return 'outline' as const
      case 'archived': return 'destructive' as const
      default: return 'secondary' as const
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'home_purchase': return t('types.homePurchase')
      case 'investment': return t('types.investment')
      case 'upgrade': return t('types.upgrade')
      case 'refinance': return t('types.refinance')
      default: return t('types.unknown')
    }
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">{t('empty.title')}</h3>
        <p className="text-muted-foreground mb-4">
          {t('empty.description')}
        </p>
        <Link href="/dashboard/plans/new">
          <Button>{t('empty.createButton')}</Button>
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
                  {getTypeLabel(plan.plan_type)} • {new Date(plan.created_at).toLocaleDateString('vi-VN')}
                </CardDescription>
              </div>
              <Badge variant={getStatusVariant(plan.status)}>
                {getStatusLabel(plan.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('details.purchasePrice')}:</span>
                <span className="font-semibold">{formatCurrency(plan.purchase_price || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('details.downPayment')}:</span>
                <span className="font-semibold">{formatCurrency(plan.down_payment || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('details.monthlyIncome')}:</span>
                <span className="font-semibold">{formatCurrency(plan.monthly_income || 0)}/{t('details.month')}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Link href={`/dashboard/plans/${plan.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="w-4 h-4 mr-1" />
                  {t('actions.view')}
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