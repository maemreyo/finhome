// src/components/scenarios/hooks/useScenarioManagement.ts

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import type { TimelineScenario, FinancialScenario } from '@/types/scenario'
import { DashboardService } from '@/lib/services/dashboardService'
import { useAuth } from '@/hooks/useAuth'
import { useFeatureGate } from '@/components/subscription/FeatureGate'
import { getPlanByTier } from '@/config/subscriptionPlans'
import { createScenarioFromData, generateSmartScenarios, createDemoScenarios } from '../utils/ScenarioFactory'

export interface UseScenarioManagementReturn {
  scenarios: TimelineScenario[]
  selectedScenarioIds: string[]
  isLoading: boolean
  isLoadingDb: boolean
  smartScenariosLoading: boolean
  scenarioLimitReached: boolean
  maxScenarios: number | null
  chartScenarios: FinancialScenario[]
  aiAnalysis: {
    userProfileSummary: string
    marketContext: string
    overallStrategy: string
    nextSteps: string[]
  } | null
  isAIAnalysisModalOpen: boolean
  handleScenarioSelect: (scenarioId: string) => void
  handleSaveScenario: (scenario: TimelineScenario, isEditing: boolean) => void
  handleDeleteScenario: (scenarioId: string) => void
  handleGenerateSmartScenarios: () => Promise<void>
  setSelectedScenarioIds: React.Dispatch<React.SetStateAction<string[]>>
  setScenarios: React.Dispatch<React.SetStateAction<TimelineScenario[]>>
  setIsAIAnalysisModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const useScenarioManagement = (t: (key: string) => string): UseScenarioManagementReturn => {
  const { user } = useAuth()
  const [scenarios, setScenarios] = useState<TimelineScenario[]>([])
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>(['scenario-baseline'])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDb, setIsLoadingDb] = useState(true)
  const [smartScenariosLoading, setSmartScenariosLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<{
    userProfileSummary: string
    marketContext: string
    overallStrategy: string
    nextSteps: string[]
  } | null>(null)
  const [isAIAnalysisModalOpen, setIsAIAnalysisModalOpen] = useState(false)

  // Subscription and feature access hooks
  const smartScenariosGate = useFeatureGate({ featureKey: 'smart_scenarios' })

  // Get user's subscription limits
  const userPlan = user?.user_metadata?.subscription_tier ? getPlanByTier(user.user_metadata.subscription_tier) : getPlanByTier('free')
  const maxScenarios = userPlan?.limits.maxScenarios || null
  const canCreateMoreScenarios = maxScenarios === null || scenarios.length < maxScenarios
  const scenarioLimitReached = !canCreateMoreScenarios

  // Demo scenarios data for unauthenticated users
  const demoScenarios: TimelineScenario[] = useMemo(() => 
    createDemoScenarios(t), [t]
  )

  // Initialize scenarios with demo data only for unauthenticated users
  useEffect(() => {
    if (!user && scenarios.length === 0) {
      setScenarios(demoScenarios)
    }
  }, [user, demoScenarios, scenarios.length])

  // Load database scenarios
  useEffect(() => {
    const loadDbScenarios = async () => {
      try {
        setIsLoadingDb(true)
        if (user?.id) {
          const dbData = await DashboardService.getFinancialScenarios(user.id)
          
          // Convert database scenarios to TimelineScenario format
          if (dbData.length > 0) {
            const convertedScenarios = dbData.map(dbScenario => {
              return createScenarioFromData(
                dbScenario.id,
                dbScenario.scenario_name,
                dbScenario.scenario_type,
                dbScenario.description || t('mockScenarios.noDescriptionAvailable'),
                dbScenario.risk_level,
                3000000000, // Default purchase price
                600000000,  // Default down payment
                dbScenario.interest_rate || 8.5,
                dbScenario.loan_term_months || 240,
                50000000,   // Default monthly income
                30000000    // Default monthly expenses
              )
            })
            setScenarios(convertedScenarios)
          } else {
            // Use demo scenarios if no database data for authenticated users
            setScenarios(demoScenarios)
          }
        }
      } catch (error) {
        console.error('Error loading database scenarios:', error)
      } finally {
        setIsLoadingDb(false)
      }
    }

    loadDbScenarios()
  }, [user, t, demoScenarios])

  // Convert TimelineScenario to FinancialScenario for charts
  const chartScenarios: FinancialScenario[] = useMemo(() => {
    return scenarios.map(scenario => ({
      ...scenario,
      riskLevel: scenario.riskLevel,
      calculatedMetrics: scenario.calculatedMetrics
    } as FinancialScenario))
  }, [scenarios])

  // Handle scenario selection
  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenarioIds(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId)
      } else {
        return [...prev, scenarioId]
      }
    })
  }

  // Handle scenario creation/editing
  const handleSaveScenario = (scenario: TimelineScenario, isEditing: boolean) => {
    if (isEditing) {
      // Update existing scenario
      setScenarios(prev => prev.map(s => s.id === scenario.id ? scenario : s))
      toast.success(t('toasts.scenarioUpdated'))
    } else {
      // Check scenario limits for new scenarios
      if (scenarioLimitReached) {
        toast.error(`You've reached your scenario limit (${maxScenarios}). Upgrade to Premium for unlimited scenarios.`)
        return
      }
      
      // Create new scenario
      setScenarios(prev => [...prev, scenario])
      toast.success(t('toasts.scenarioCreated'))
      
      // Show upgrade hint if approaching limit
      if (maxScenarios !== null && scenarios.length + 1 >= maxScenarios * 0.8) {
        toast.info(`You're using ${scenarios.length + 1} of ${maxScenarios} scenarios. Upgrade to Premium for unlimited scenarios!`)
      }
    }
  }

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId))
    setSelectedScenarioIds(prev => prev.filter(id => id !== scenarioId))
    toast.success(t('toasts.scenarioDeleted'))
  }

  const handleGenerateSmartScenarios = async () => {
    // Check feature access first
    if (!smartScenariosGate.hasAccess) {
      toast.error('Smart Scenarios requires a Premium subscription')
      return
    }

    // Check scenario limits
    if (scenarioLimitReached) {
      toast.error(`You've reached your scenario limit (${maxScenarios}). Upgrade to create more scenarios.`)
      return
    }

    setSmartScenariosLoading(true)
    try {
      // Track usage
      await smartScenariosGate.trackUsage()
      
      if (!user?.id) {
        toast.error('Please sign in to use AI-powered scenario generation')
        return
      }

      // Get base data from existing scenarios or user profile
      const baseScenario = scenarios.find(s => s.scenarioType === 'baseline') || scenarios[0]
      const userProfile = {
        monthlyIncome: baseScenario?.monthly_income || 50000000,
        monthlyExpenses: baseScenario?.monthly_expenses || 30000000,
        riskTolerance: user.user_metadata?.risk_tolerance || 'moderate',
        investmentGoals: user.user_metadata?.investment_goals || 'home_purchase'
      }

      // Additional user data for enhanced AI analysis
      const additionalData = {
        currentSavings: user.user_metadata?.current_savings || 0,
        dependents: user.user_metadata?.dependents || 0,
        age: user.user_metadata?.age,
        location: user.user_metadata?.location || 'Ho Chi Minh City',
        investmentHorizon: baseScenario?.target_timeframe_months || 240
      }

      // Get current locale from URL or default to 'en'
      const locale = typeof window !== 'undefined' 
        ? window.location.pathname.split('/')[1] || 'en'
        : 'en'
      
      // Generate AI-powered scenarios with enhanced analysis
      const result = await generateSmartScenarios(baseScenario, userProfile, additionalData, locale)

      setScenarios(prev => [...prev, ...result.scenarios])
      
      // Store AI analysis for modal display
      setAiAnalysis(result.analysis)
      setIsAIAnalysisModalOpen(true)
      
      // Show AI analysis insights to user
      toast.success(`Generated ${result.scenarios.length} AI-optimized scenarios`, {
        description: result.analysis.userProfileSummary
      })
      
    } catch (error) {
      console.error('Smart scenarios generation error:', error)
      toast.error('Failed to generate smart scenarios. Please try again.')
    } finally {
      setSmartScenariosLoading(false)
    }
  }

  return {
    scenarios,
    selectedScenarioIds,
    isLoading,
    isLoadingDb,
    smartScenariosLoading,
    scenarioLimitReached,
    maxScenarios,
    chartScenarios,
    aiAnalysis,
    isAIAnalysisModalOpen,
    handleScenarioSelect,
    handleSaveScenario,
    handleDeleteScenario,
    handleGenerateSmartScenarios,
    setSelectedScenarioIds,
    setScenarios,
    setIsAIAnalysisModalOpen
  }
}