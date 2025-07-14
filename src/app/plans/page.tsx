// src/app/plans/page.tsx
// Financial Plans management page

'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'

import PlansList, { type FinancialPlan } from '@/components/financial-plans/PlansList'
import CreatePlanForm from '@/components/financial-plans/CreatePlanForm'
import PlanDetailView from '@/components/financial-plans/PlanDetailView'
import { convertScenarioToTimeline } from '@/lib/timeline/timelineUtils'
import { ScenarioEngine, type ScenarioDefinition } from '@/lib/financial/scenarios'
import { type LoanParameters } from '@/lib/financial/calculations'

// Sample data for demo
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
  },
  {
    id: '3',
    planName: 'Upgrade to Villa',
    planDescription: 'Selling current home to buy larger property',
    planType: 'upgrade',
    purchasePrice: 5000000000, // 5B VND
    downPayment: 1500000000, // 1.5B VND
    monthlyIncome: 80000000, // 80M VND
    monthlyExpenses: 35000000, // 35M VND
    currentSavings: 2000000000, // 2B VND
    planStatus: 'completed',
    isPublic: false,
    isFavorite: false,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-10'),
    // Calculated metrics
    monthlyPayment: 25000000, // 25M VND
    totalInterest: 1800000000, // 1.8B VND
    affordabilityScore: 6,
    riskLevel: 'medium'
  }
]

type ViewMode = 'list' | 'create' | 'detail'

export default function PlansPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [plans, setPlans] = useState<FinancialPlan[]>(samplePlans)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const selectedPlan = useMemo(
    () => plans.find(plan => plan.id === selectedPlanId),
    [plans, selectedPlanId]
  )

  // Generate scenarios for the selected plan
  const scenarios = useMemo(() => {
    if (!selectedPlan) return []

    const baselineScenario: ScenarioDefinition = {
      id: 'baseline',
      name: 'Kịch bản cơ bản',
      type: 'baseline',
      description: 'Kế hoạch tài chính ban đầu',
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
  }, [selectedPlan])

  const handleCreatePlan = async (formData: any) => {
    setIsLoading(true)
    
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
      
      toast.success('Financial plan created successfully!')
    } catch (error) {
      toast.error('Failed to create plan. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPlan = (planId: string) => {
    setSelectedPlanId(planId)
    setViewMode('detail')
  }

  const handleEditPlan = (planId: string) => {
    toast.info('Edit functionality coming soon!')
  }

  const handleDeletePlan = (planId: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== planId))
    toast.success('Plan deleted successfully!')
  }

  const handleDuplicatePlan = (planId: string) => {
    const planToDuplicate = plans.find(plan => plan.id === planId)
    if (planToDuplicate) {
      const duplicatedPlan: FinancialPlan = {
        ...planToDuplicate,
        id: Date.now().toString(),
        planName: `${planToDuplicate.planName} (Copy)`,
        planStatus: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false
      }
      
      setPlans(prev => [duplicatedPlan, ...prev])
      toast.success('Plan duplicated successfully!')
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
    toast.info('Share functionality coming soon!')
  }

  const handleDownloadPlan = () => {
    toast.info('Download functionality coming soon!')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedPlanId(null)
  }

  const handleBackToPlanDetail = () => {
    setViewMode('detail')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {viewMode === 'list' && (
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
        )}

        {viewMode === 'create' && (
          <CreatePlanForm
            onSubmit={handleCreatePlan}
            onCancel={handleBackToList}
            isLoading={isLoading}
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