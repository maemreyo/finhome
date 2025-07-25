// src/components/plans/PlanDetailView.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculateMonthlyPayment } from '@/lib/utils'
import { Edit, Download, Share2 } from 'lucide-react'
import { Database } from '@/src/types/supabase'
import { EditPlanForm } from './EditPlanForm'
import { SharePlanDialog } from './SharePlanDialog'
import { ExportPlanDialog } from './ExportPlanDialog'
import { useTranslations } from 'next-intl'
import { CashFlowChart } from '@/components/charts/CashFlowChart'
import { ExpensesBreakdownChart } from '@/components/charts/ExpensesBreakdownChart'
import { AmortizationChart } from '@/components/charts/AmortizationChart'

type FinancialPlanDetail = Database['public']['Tables']['financial_plans']['Row']

interface PlanDetailViewProps {
  plan: FinancialPlanDetail
}

const statusMap = {
  draft: { variant: 'secondary' as const },
  active: { variant: 'default' as const },
  completed: { variant: 'outline' as const },
  archived: { variant: 'destructive' as const },
}

const typeMap = {
  home_purchase: 'homePurchase',
  investment: 'investment',
  upgrade: 'upgrade',
  refinance: 'refinance',
}

export function PlanDetailView({ plan }: PlanDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(plan)
  const t = useTranslations('PlanDetailView')

  // Calculate monthly payment with default values since loan_terms table doesn't exist
  const loanAmount = (currentPlan.purchase_price || 0) - (currentPlan.down_payment || 0)
  const monthlyPayment = loanAmount > 0 ? 
    calculateMonthlyPayment(
      loanAmount,
      8.5, // Default interest rate
      240 // Default 20 year term
    ) : 0

  const netCashFlow = (currentPlan.monthly_income || 0) - (currentPlan.monthly_expenses || 0) - monthlyPayment + (currentPlan.expected_rental_income || 0)

  const handleSave = (updatedPlan: FinancialPlanDetail) => {
    setCurrentPlan(updatedPlan)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleVisibilityChange = (isPublic: boolean) => {
    setCurrentPlan(prev => ({ ...prev, is_public: isPublic }))
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return t('status.draft')
      case 'active': return t('status.active')
      case 'completed': return t('status.completed')
      case 'archived': return t('status.archived')
      default: return t('status.unknown')
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

  // If in editing mode, show the edit form
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('editTitle')}</h1>
        </div>
        <EditPlanForm
          plan={currentPlan}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{currentPlan.plan_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={statusMap[currentPlan.status].variant}>
              {getStatusLabel(currentPlan.status)}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{getTypeLabel(currentPlan.plan_type)}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {t('createdOn')} {new Date(currentPlan.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
          {currentPlan.description && (
            <p className="text-muted-foreground mt-2">{currentPlan.description}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-1" />
            {t('buttons.edit')}
          </Button>
          <ExportPlanDialog plan={currentPlan} />
          <SharePlanDialog 
            plan={currentPlan} 
            onVisibilityChange={handleVisibilityChange}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="metric-label">{t('metrics.purchasePrice')}</div>
            <div className="metric-value">{formatCurrency(currentPlan.purchase_price || 0)}</div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="metric-label">{t('metrics.downPayment')}</div>
            <div className="metric-value">{formatCurrency(currentPlan.down_payment || 0)}</div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="metric-label">{t('metrics.monthlyPayment')}</div>
            <div className="metric-value">{formatCurrency(monthlyPayment)}</div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="metric-label">{t('metrics.netCashFlow')}</div>
            <div className={`metric-value ${netCashFlow >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatCurrency(netCashFlow)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Details - Using calculated values since loan_terms table doesn't exist */}
      <Card>
        <CardHeader>
          <CardTitle>{t('loanDetails.title')}</CardTitle>
          <CardDescription>
            {t('loanDetails.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">{t('loanDetails.loanAmount')}</div>
              <div className="text-xl font-semibold">{formatCurrency(loanAmount)}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground">{t('loanDetails.loanTerm')}</div>
              <div className="text-xl font-semibold">{t('loanDetails.loanTermValue')}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground">{t('loanDetails.interestRate')}</div>
              <div className="text-xl font-semibold">{t('loanDetails.interestRateValue')}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground">{t('loanDetails.bank')}</div>
              <div className="text-xl font-semibold">{t('loanDetails.bankValue')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('financialSummary.title')}</CardTitle>
          <CardDescription>
            {t('financialSummary.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">{t('financialSummary.income.title')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('financialSummary.income.basicSalary')}</span>
                  <span className="font-medium">{formatCurrency(currentPlan.monthly_income || 0)}</span>
                </div>
                {currentPlan.expected_rental_income && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('financialSummary.income.rental')}</span>
                    <span className="font-medium text-positive">
                      {formatCurrency(currentPlan.expected_rental_income)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>{t('financialSummary.income.total')}</span>
                  <span>{formatCurrency((currentPlan.monthly_income || 0) + (currentPlan.expected_rental_income || 0))}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">{t('financialSummary.expenses.title')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('financialSummary.expenses.living')}</span>
                  <span className="font-medium">{formatCurrency(currentPlan.monthly_expenses || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('financialSummary.expenses.mortgage')}</span>
                  <span className="font-medium">{formatCurrency(monthlyPayment)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>{t('financialSummary.expenses.total')}</span>
                  <span>{formatCurrency((currentPlan.monthly_expenses || 0) + monthlyPayment)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">{t('financialSummary.netCashFlow')}</span>
              <span className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatCurrency(netCashFlow)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {netCashFlow >= 0 
                ? t('financialSummary.positiveFlow')
                : t('financialSummary.negativeFlow')
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loan Amortization Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t('timeline.title')}</CardTitle>
          <CardDescription>
            {t('timeline.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AmortizationChart
            loanAmount={loanAmount}
            interestRate={8.5}
            loanTermMonths={240}
            monthlyPayment={monthlyPayment}
          />
        </CardContent>
      </Card>

      {/* Interactive Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.cashFlow.title')}</CardTitle>
            <CardDescription>
              {t('charts.cashFlow.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CashFlowChart
              monthlyIncome={currentPlan.monthly_income || 0}
              monthlyExpenses={currentPlan.monthly_expenses || 0}
              monthlyPayment={monthlyPayment}
              expectedRentalIncome={currentPlan.expected_rental_income || 0}
              timeframe={currentPlan.target_timeframe_months || 60}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.expenses.title')}</CardTitle>
            <CardDescription>
              {t('charts.expenses.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensesBreakdownChart
              monthlyExpenses={currentPlan.monthly_expenses || 0}
              monthlyPayment={monthlyPayment}
              additionalCosts={currentPlan.additional_costs || 0}
              otherDebts={currentPlan.other_debts || 0}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}