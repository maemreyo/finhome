"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditPlanForm } from '@/components/plans/EditPlanForm'
import { Database } from '@/src/types/supabase'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

type FinancialPlan = Database['public']['Tables']['financial_plans']['Row']

interface EditPlanPageClientProps {
  plan: FinancialPlan
  locale: string
}

export function EditPlanPageClient({ plan, locale }: EditPlanPageClientProps) {
  const router = useRouter()
  const t = useTranslations('EditPlanForm')
  const tCommon = useTranslations('PlansList')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case 'home_purchase': return tCommon('types.homePurchase')
      case 'investment': return tCommon('types.investment')
      case 'upgrade': return tCommon('types.upgrade')
      case 'refinance': return tCommon('types.refinance')
      default: return tCommon('types.unknown')
    }
  }

  const handleCancel = () => {
    router.push(`/${locale}/plans/${plan.id}`)
  }

  const handleSave = async (updatedPlan: FinancialPlan) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('financial_plans')
        .update({
          plan_name: updatedPlan.plan_name,
          plan_type: updatedPlan.plan_type,
          purchase_price: updatedPlan.purchase_price,
          down_payment: updatedPlan.down_payment,
          monthly_income: updatedPlan.monthly_income,
          monthly_expenses: updatedPlan.monthly_expenses,
          current_savings: updatedPlan.current_savings,
          other_debts: updatedPlan.other_debts,
          additional_costs: updatedPlan.additional_costs,
          expected_rental_income: updatedPlan.expected_rental_income,
          expected_appreciation_rate: updatedPlan.expected_appreciation_rate,
          investment_horizon_months: updatedPlan.investment_horizon_months,
          description: updatedPlan.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id)

      if (error) {
        console.error('Error updating plan:', error)
        toast.error(t('messages.error'))
        return
      }

      toast.success(t('messages.success'))
      router.push(`/${locale}/plans/${plan.id}`)
    } catch (error) {
      console.error('Error updating plan:', error)
      toast.error(t('messages.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with improved back button layout */}
      <div className="space-y-4">
        {/* Back Button - positioned prominently at top */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2 hover:bg-gray-100 -ml-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('header.backButton')}
          </Button>
        </div>
        
        {/* Page Title and Description */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('header.title')}
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            {t('header.description')}
          </p>
          
          {/* Plan context info */}
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{plan.plan_name}</span>
            <span>•</span>
            <span>{getPlanTypeLabel(plan.plan_type)}</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <EditPlanForm
        plan={plan}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  )
}