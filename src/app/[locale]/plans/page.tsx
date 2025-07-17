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
import { type FinancialPlan, type CreatePlanRequest } from '@/lib/api/plans'
import { apiPlansToUIPlans, type UIFinancialPlan } from '@/lib/adapters/planAdapter'
import { type FinancialScenario } from '@/types/scenario'

// Convert UIFinancialPlan to FinancialScenario for detail view
function uiPlanToScenario(plan: UIFinancialPlan): FinancialScenario {
  return {
    id: plan.id,
    user_id: 'current-user', // This would come from auth context
    plan_name: plan.planName,
    description: plan.planDescription || '',
    plan_type: plan.planType,
    status: 'active',
    created_at: plan.createdAt.toISOString(),
    updated_at: plan.updatedAt.toISOString(),
    
    // Property details
    property_id: null,
    custom_property_data: null,
    purchase_price: plan.purchasePrice,
    down_payment: plan.downPayment,
    additional_costs: 0,
    other_debts: 0,
    
    // Personal finances
    target_age: null,
    current_monthly_income: null,
    monthly_income: plan.monthlyIncome,
    current_monthly_expenses: null,
    monthly_expenses: plan.monthlyExpenses,
    current_savings: plan.currentSavings,
    dependents: 0,
    
    // Investment specifics
    target_property_type: null,
    target_location: null,
    target_budget: null,
    target_timeframe_months: null,
    investment_purpose: null,
    desired_features: {},
    down_payment_target: null,
    risk_tolerance: 'moderate',
    investment_horizon_months: null,
    expected_roi: plan.roi || null,
    preferred_banks: null,
    expected_rental_income: plan.expectedRentalIncome || null,
    expected_appreciation_rate: null,
    
    // Targets
    emergency_fund_target: null,
    education_fund_target: null,
    retirement_fund_target: null,
    other_goals: {},
    
    // Metadata
    feasibility_score: plan.affordabilityScore || null,
    recommended_adjustments: {},
    is_public: plan.isPublic,
    view_count: 0,
    cached_calculations: null,
    calculations_last_updated: null,
    completed_at: null,
    
    // Scenario-specific properties
    scenarioType: 'baseline',
    riskLevel: 'medium',
    
    // Calculated metrics
    calculatedMetrics: {
      monthlyPayment: plan.monthlyPayment || 0,
      totalInterest: plan.totalInterest || 0,
      totalCost: (plan.monthlyPayment || 0) * 240, // Default to 20 years
      dtiRatio: plan.monthlyPayment && plan.monthlyIncome ? (plan.monthlyPayment / plan.monthlyIncome) * 100 : 0,
      ltvRatio: (plan.downPayment / plan.purchasePrice) * 100,
      affordabilityScore: plan.affordabilityScore || 0,
      payoffTimeMonths: 240, // Default to 20 years
      monthlySavings: plan.monthlyIncome && plan.monthlyExpenses && plan.monthlyPayment ? 
        plan.monthlyIncome - plan.monthlyExpenses - plan.monthlyPayment : 0
    }
  }
}

// Sample data for demo/fallback (UI format)
const samplePlans: UIFinancialPlan[] = [
  {
    id: '1',
    planName: 'My First Home Purchase',
    planDescription: 'Buying a 2-bedroom apartment in District 7',
    planType: 'home_purchase',
    purchasePrice: 3000000000, // 3B VND
    downPayment: 600000000, // 600M VND
    monthlyIncome: 50000000, // 50M VND
    monthlyExpenses: 25000000, // 25M VND
    currentSavings: 800000000, // 800M VND
    planStatus: 'active',
    isPublic: false,
    isFavorite: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    // Calculated metrics
    monthlyPayment: 17400000, // 17.4M VND
    totalInterest: 1200000000, // 1.2B VND
    affordabilityScore: 7,
    riskLevel: 'medium'
  },
  {
    id: '2',
    planName: 'Investment Property - Vinhomes',
    planDescription: 'Investment apartment for rental income',
    planType: 'investment',
    purchasePrice: 2500000000, // 2.5B VND
    downPayment: 500000000, // 500M VND
    monthlyIncome: 50000000, // 50M VND
    monthlyExpenses: 25000000, // 25M VND
    currentSavings: 800000000, // 800M VND
    expectedRentalIncome: 18000000, // 18M VND
    planStatus: 'draft',
    isPublic: true,
    isFavorite: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    // Calculated metrics
    monthlyPayment: 14500000, // 14.5M VND
    totalInterest: 980000000, // 980M VND
    affordabilityScore: 8,
    riskLevel: 'low',
    roi: 9.2
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

  // Use real API data with fallback to sample data for non-authenticated users
  const { 
    plans, 
    isLoading, 
    error, 
    createPlan, 
    updatePlan, 
    deletePlan,
    refreshPlans 
  } = usePlans(user ? {} : undefined) // Only load real data if user is authenticated

  // Convert API plans to UI format and fallback to sample data for non-authenticated users
  const displayPlans = user ? apiPlansToUIPlans(plans) : samplePlans
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
    const effectiveRate = selectedPlan.monthlyPayment ? 
      // If we have cached calculations, derive the rate from monthly payment
      10.5 : // Default rate when no cached data
      10.5 // Market average rate

    const loanParams: LoanParameters = {
      principal: selectedPlan.purchasePrice - selectedPlan.downPayment,
      annualRate: effectiveRate,
      termMonths: 240, // 20 years default
      promotionalRate: effectiveRate > 8 ? effectiveRate - 1.5 : undefined,
      promotionalPeriodMonths: 24
    }

    const personalFinances = {
      monthlyIncome: selectedPlan.monthlyIncome,
      monthlyExpenses: selectedPlan.monthlyExpenses
    }

    const investmentParams = selectedPlan.expectedRentalIncome ? {
      expectedRentalIncome: selectedPlan.expectedRentalIncome,
      propertyExpenses: selectedPlan.expectedRentalIncome * 0.1,
      appreciationRate: 8,
      initialPropertyValue: selectedPlan.purchasePrice
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

        // For authenticated users, use real API
        const planData: CreatePlanRequest = {
          planName: formData.planName,
          planDescription: formData.planDescription,
          planType: formData.planType || 'home_purchase',
          purchasePrice: formData.purchasePrice,
          downPayment: formData.downPayment,
          additionalCosts: formData.additionalCosts || 0,
          monthlyIncome: formData.monthlyIncome,
          monthlyExpenses: formData.monthlyExpenses,
          currentSavings: formData.currentSavings,
          otherDebts: formData.otherDebts || 0,
          expectedRentalIncome: formData.expectedRentalIncome,
          expectedAppreciationRate: formData.expectedAppreciationRate,
          investmentHorizonYears: formData.investmentHorizonYears,
          isPublic: formData.isPublic || false
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
          planName: `${planToDuplicate.planName} (${t('actions.copy')})`,
          planDescription: planToDuplicate.planDescription,
          planType: planToDuplicate.planType,
          purchasePrice: planToDuplicate.purchasePrice,
          downPayment: planToDuplicate.downPayment,
          additionalCosts: 0, // Default for duplicated plans
          monthlyIncome: planToDuplicate.monthlyIncome,
          monthlyExpenses: planToDuplicate.monthlyExpenses,
          currentSavings: planToDuplicate.currentSavings,
          otherDebts: 0, // Default for duplicated plans
          expectedRentalIncome: planToDuplicate.expectedRentalIncome,
          expectedAppreciationRate: undefined, // Will use default
          investmentHorizonYears: undefined, // Will use default
          isPublic: false
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
            plan={uiPlanToScenario(selectedPlan)}
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