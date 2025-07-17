// src/app/[locale]/plans/page.tsx
// Consolidated financial plans page with i18n support

'use client'

import React, { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import PlansList from '@/components/financial-plans/PlansList'
import CreatePlanForm from '@/components/financial-plans/CreatePlanForm'
import PlanDetailView from '@/components/financial-plans/PlanDetailView'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { convertScenarioToTimeline } from '@/lib/timeline/timelineUtils'
import { ScenarioEngine, type ScenarioDefinition } from '@/lib/financial/scenarios'
import { type LoanParameters } from '@/lib/financial/calculations'
import { useAuth } from '@/hooks/useAuth'
import { usePlans } from '@/hooks/usePlans'
import { useOptimalRates } from '@/hooks/useBankRates'
import { type FinancialPlanWithMetrics, type CreatePlanRequest } from '@/lib/api/plans'
import { type FinancialScenario } from '@/types/scenario'

// Convert database FinancialPlan to FinancialScenario for detail view
function dbPlanToScenario(plan: FinancialPlanWithMetrics): FinancialScenario {
  return {
    ...plan,
    // Scenario-specific properties
    scenarioType: 'baseline',
    riskLevel: 'medium',
    
    // Calculated metrics from API response or cached calculations
    calculatedMetrics: plan.calculatedMetrics || (plan.cached_calculations as any) || {
      monthlyPayment: 0,
      totalInterest: 0,
      debtToIncomeRatio: 0,
      affordabilityScore: 0,
      roi: 0,
      paybackPeriod: 240
    }
  }
}

// Create demo data for non-authenticated users - using database format
const createDemoPlans = (): FinancialPlanWithMetrics[] => [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    plan_name: 'My First Home Purchase',
    description: 'Buying a 2-bedroom apartment in District 7',
    plan_type: 'home_purchase',
    status: 'draft',
    property_id: null,
    custom_property_data: null,
    target_age: null,
    current_monthly_income: null,
    monthly_income: 50000000,
    current_monthly_expenses: null,
    monthly_expenses: 25000000,
    current_savings: 800000000,
    dependents: 0,
    purchase_price: 3000000000,
    down_payment: 600000000,
    additional_costs: 0,
    other_debts: 0,
    target_property_type: null,
    target_location: null,
    target_budget: null,
    target_timeframe_months: null,
    investment_purpose: null,
    desired_features: {},
    down_payment_target: null,
    risk_tolerance: 'moderate',
    investment_horizon_months: null,
    expected_roi: null,
    preferred_banks: null,
    expected_rental_income: null,
    expected_appreciation_rate: null,
    emergency_fund_target: null,
    education_fund_target: null,
    retirement_fund_target: null,
    other_goals: {},
    feasibility_score: null,
    recommended_adjustments: {},
    is_public: false,
    view_count: 0,
    cached_calculations: {
      monthlyPayment: 17400000,
      totalInterest: 1200000000,
      debtToIncomeRatio: 34.8,
      affordabilityScore: 7
    },
    calculations_last_updated: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    completed_at: null,
    calculatedMetrics: {
      monthlyPayment: 17400000,
      totalInterest: 1200000000,
      debtToIncomeRatio: 34.8,
      affordabilityScore: 7,
      roi: 8.0,
      paybackPeriod: 240
    }
  }
]

type ViewMode = 'list' | 'create' | 'detail'

export default function PlansPage() {
  const t = useTranslations('PlansPage')
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Bank rates for real-time calculations
  const { getOptimalRates } = useOptimalRates()

  // Always load real API data, with demo data for non-authenticated users
  const { 
    plans, 
    isLoading, 
    error, 
    createPlan, 
    updatePlan, 
    deletePlan,
    refreshPlans 
  } = usePlans(user ? {} : undefined) // Only load real data if user is authenticated

  // Use database plans directly or demo data for non-authenticated users
  const displayPlans = user ? plans : createDemoPlans()
  const displayLoading = user ? isLoading : false

  const selectedPlan = useMemo(
    () => displayPlans.find(plan => plan.id === selectedPlanId),
    [displayPlans, selectedPlanId]
  )

  // Generate scenarios for the selected plan with real bank rates
  const scenarios = useMemo(() => {
    if (!selectedPlan) return []

    const baselineScenario: ScenarioDefinition = {
      id: 'baseline',
      name: t('scenarios.baseline.name'),
      type: 'baseline',
      description: t('scenarios.baseline.description'),
      parameters: {},
      assumptions: {
        economicGrowth: 5,
        inflationRate: 4,
        propertyMarketTrend: 'stable',
        personalCareerGrowth: 5,
        emergencyFundMonths: 6
      }
    }

    // Use cached calculation rates if available, otherwise use market averages
    const effectiveRate = selectedPlan.calculatedMetrics?.monthlyPayment ? 
      // If we have cached calculations, derive the rate from monthly payment
      10.5 : // Default rate when no cached data
      10.5 // Market average rate

    const loanParams: LoanParameters = {
      principal: (selectedPlan.purchase_price || 0) - (selectedPlan.down_payment || 0),
      annualRate: effectiveRate,
      termMonths: 240, // 20 years default
      promotionalRate: effectiveRate > 8 ? effectiveRate - 1.5 : undefined,
      promotionalPeriodMonths: 24
    }

    const personalFinances = {
      monthlyIncome: selectedPlan.monthly_income || 0,
      monthlyExpenses: selectedPlan.monthly_expenses || 0
    }

    const investmentParams = selectedPlan.expected_rental_income ? {
      expectedRentalIncome: selectedPlan.expected_rental_income,
      propertyExpenses: selectedPlan.expected_rental_income * 0.1,
      appreciationRate: selectedPlan.expected_appreciation_rate || 8,
      initialPropertyValue: selectedPlan.purchase_price || 0
    } : undefined

    const scenarioEngine = new ScenarioEngine(
      baselineScenario,
      loanParams,
      personalFinances,
      investmentParams
    )

    const allScenarioResults = [
      scenarioEngine.generateScenario(baselineScenario),
      ...scenarioEngine.generatePredefinedScenarios()
    ]

    return allScenarioResults.map(result => convertScenarioToTimeline(result))
  }, [selectedPlan, t])

  const handleCreatePlan = async (formData: any) => {
    setIsSubmitting(true)
    
    try {
      if (user) {
        // Get optimal bank rates for enhanced planning
        const loanAmount = formData.purchasePrice - formData.downPayment
        const optimalRatesData = await getOptimalRates({
          loanAmount,
          termMonths: 240, // 20 years default
          loanType: formData.planType || 'home_purchase',
          downPaymentRatio: (formData.downPayment / formData.purchasePrice) * 100
        })

        // Log optimal rates for debugging (remove in production)
        if (optimalRatesData) {
          console.log('Found optimal rates:', optimalRatesData.recommendedRates.length, 'options')
        }

        // For authenticated users, use real API with database field names
        const planData: CreatePlanRequest = {
          plan_name: formData.planName,
          description: formData.planDescription,
          plan_type: formData.planType || 'home_purchase',
          purchase_price: formData.purchasePrice,
          down_payment: formData.downPayment,
          additional_costs: formData.additionalCosts || 0,
          monthly_income: formData.monthlyIncome,
          monthly_expenses: formData.monthlyExpenses,
          current_savings: formData.currentSavings,
          other_debts: formData.otherDebts || 0,
          expected_rental_income: formData.expectedRentalIncome,
          expected_appreciation_rate: formData.expectedAppreciationRate,
          investment_horizon_months: formData.investmentHorizonYears ? formData.investmentHorizonYears * 12 : undefined,
          is_public: formData.isPublic || false
        }
        
        await createPlan(planData)
        setViewMode('list')
        
        // Show enhanced success message with rate info
        if (optimalRatesData && optimalRatesData.recommendedRates.length > 0) {
          const bestRate = optimalRatesData.recommendedRates[0]
          toast.success(`${t('messages.createSuccess')} - Best rate found: ${bestRate.effectiveRate}%`)
        } else {
          toast.success(t('messages.createSuccess'))
        }
      } else {
        // For non-authenticated users, show demo message
        toast.info('Demo mode: Sign in to save real financial plans')
        setViewMode('list')
      }
    } catch (error) {
      console.error('Error creating plan:', error)
      toast.error(t('messages.createError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewPlan = (planId: string) => {
    setSelectedPlanId(planId)
    setViewMode('detail')
  }

  const handleEditPlan = (planId: string) => {
    toast.info(t('messages.editComingSoon'))
  }

  const handleDeletePlan = async (planId: string) => {
    if (!user) {
      toast.info('Demo mode: Sign in to manage real financial plans')
      return
    }

    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return
    }

    try {
      await deletePlan(planId)
      toast.success(t('messages.deleteSuccess'))
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast.error('Failed to delete plan. Please try again.')
    }
  }

  const handleDuplicatePlan = async (planId: string) => {
    if (!user) {
      toast.info('Demo mode: Sign in to manage real financial plans')
      return
    }

    const planToDuplicate = displayPlans.find(plan => plan.id === planId)
    if (planToDuplicate) {
      try {
        const duplicateData: CreatePlanRequest = {
          plan_name: `${planToDuplicate.plan_name} (${t('actions.copy')})`,
          description: planToDuplicate.description,
          plan_type: planToDuplicate.plan_type,
          purchase_price: planToDuplicate.purchase_price,
          down_payment: planToDuplicate.down_payment,
          additional_costs: 0, // Default for duplicated plans
          monthly_income: planToDuplicate.monthly_income,
          monthly_expenses: planToDuplicate.monthly_expenses,
          current_savings: planToDuplicate.current_savings,
          other_debts: 0, // Default for duplicated plans
          expected_rental_income: planToDuplicate.expected_rental_income,
          expected_appreciation_rate: planToDuplicate.expected_appreciation_rate,
          investment_horizon_months: planToDuplicate.investment_horizon_months,
          is_public: false
        }
        
        await createPlan(duplicateData)
        toast.success(t('messages.duplicateSuccess'))
      } catch (error) {
        console.error('Error duplicating plan:', error)
        toast.error('Failed to duplicate plan. Please try again.')
      }
    }
  }

  const handleToggleFavorite = (planId: string) => {
    // This would need a separate API endpoint for toggling favorites
    // For now, just show info message
    toast.info('Favorite functionality coming soon')
  }

  const handleSharePlan = () => {
    toast.info(t('messages.shareComingSoon'))
  }

  const handleDownloadPlan = () => {
    toast.info(t('messages.downloadComingSoon'))
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedPlanId(null)
  }

  if (displayLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && user && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>
              {error}. <button onClick={refreshPlans} className="underline">Try again</button>
            </AlertDescription>
          </Alert>
        )}

        {/* Demo Mode Alert for Non-Authenticated Users */}
        {!user && (
          <Alert className="mb-6">
            <AlertDescription>
              You&apos;re viewing demo data. <Link href="/auth/login" className="underline">Sign in</Link> to create and manage real financial plans.
            </AlertDescription>
          </Alert>
        )}

        {viewMode === 'list' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground">
                  {t('description')}
                </p>
                {user && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {displayPlans.length} plans found
                  </p>
                )}
              </div>
              <Button onClick={() => setViewMode('create')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('actions.createNew')}
              </Button>
            </div>
            
            <PlansList
              plans={displayPlans}
              onCreateNew={() => setViewMode('create')}
              onViewPlan={handleViewPlan}
              onEditPlan={handleEditPlan}
              onDeletePlan={handleDeletePlan}
              onDuplicatePlan={handleDuplicatePlan}
              onToggleFavorite={handleToggleFavorite}
              isLoading={displayLoading}
            />
          </>
        )}

        {viewMode === 'create' && (
          <CreatePlanForm
            onSubmit={handleCreatePlan}
            onCancel={handleBackToList}
            isLoading={isSubmitting}
          />
        )}

        {viewMode === 'detail' && selectedPlan && (
          <PlanDetailView
            plan={dbPlanToScenario(selectedPlan)}
            scenarios={scenarios}
            onBack={handleBackToList}
            onEdit={() => handleEditPlan(selectedPlan.id)}
            onShare={handleSharePlan}
            onDownload={handleDownloadPlan}
          />
        )}
      </div>
    </div>
  )
}