// src/app/[locale]/plans/page.tsx
// Consolidated financial plans page with i18n support

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import PlansList, { type FinancialPlan } from '@/components/financial-plans/PlansList'
import CreatePlanForm from '@/components/financial-plans/CreatePlanForm'
import PlanDetailView from '@/components/financial-plans/PlanDetailView'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { convertScenarioToTimeline } from '@/lib/timeline/timelineUtils'
import { ScenarioEngine, type ScenarioDefinition } from '@/lib/financial/scenarios'
import { type LoanParameters } from '@/lib/financial/calculations'
import { useAuth } from '@/hooks/useAuth'
import { getUserFinancialPlans } from '@/lib/supabase/server'

// Sample data for demo/fallback
const samplePlans: FinancialPlan[] = [
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
  const [plans, setPlans] = useState<FinancialPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedPlan = useMemo(
    () => plans.find(plan => plan.id === selectedPlanId),
    [plans, selectedPlanId]
  )

  // Load user plans on mount
  useEffect(() => {
    const loadPlans = async () => {
      if (user) {
        try {
          // In a real app, this would use server-side data fetching
          // const userPlans = await getUserFinancialPlans(user.id)
          // For now, use sample data
          setPlans(samplePlans)
        } catch (error) {
          console.error('Error loading plans:', error)
          toast.error(t('errors.loadFailed'))
          setPlans(samplePlans) // Fallback to sample data
        }
      } else {
        // For non-authenticated users, show sample data
        setPlans(samplePlans)
      }
      setIsLoading(false)
    }

    loadPlans()
  }, [user, t])

  // Generate scenarios for the selected plan
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

    const loanParams: LoanParameters = {
      principal: selectedPlan.purchasePrice - selectedPlan.downPayment,
      annualRate: 10.5,
      termMonths: 240, // 20 years
      promotionalRate: 7.5,
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newPlan: FinancialPlan = {
        id: Date.now().toString(),
        ...formData,
        planStatus: 'draft' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        // Calculate basic metrics (in real app, this would be done server-side)
        monthlyPayment: 15000000, // Placeholder
        affordabilityScore: 7,
        riskLevel: 'medium' as const
      }
      
      setPlans(prev => [newPlan, ...prev])
      setViewMode('list')
      
      toast.success(t('messages.createSuccess'))
    } catch (error) {
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

  const handleDeletePlan = (planId: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== planId))
    toast.success(t('messages.deleteSuccess'))
  }

  const handleDuplicatePlan = (planId: string) => {
    const planToDuplicate = plans.find(plan => plan.id === planId)
    if (planToDuplicate) {
      const duplicatedPlan: FinancialPlan = {
        ...planToDuplicate,
        id: Date.now().toString(),
        planName: `${planToDuplicate.planName} (${t('actions.copy')})`,
        planStatus: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false
      }
      
      setPlans(prev => [duplicatedPlan, ...prev])
      toast.success(t('messages.duplicateSuccess'))
    }
  }

  const handleToggleFavorite = (planId: string) => {
    setPlans(prev => prev.map(plan =>
      plan.id === planId
        ? { ...plan, isFavorite: !plan.isFavorite }
        : plan
    ))
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

  if (isLoading) {
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
        {viewMode === 'list' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground">
                  {t('description')}
                </p>
              </div>
              <Button onClick={() => setViewMode('create')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('actions.createNew')}
              </Button>
            </div>
            
            <PlansList
              plans={plans}
              onCreateNew={() => setViewMode('create')}
              onViewPlan={handleViewPlan}
              onEditPlan={handleEditPlan}
              onDeletePlan={handleDeletePlan}
              onDuplicatePlan={handleDuplicatePlan}
              onToggleFavorite={handleToggleFavorite}
              isLoading={false}
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
            plan={selectedPlan}
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