// src/hooks/useScenarios.ts
// Hook for managing financial scenarios and comparisons

import { useState, useCallback, useMemo } from 'react'
import { FinancialPlan } from '@/components/financial-plans/PlansList'

// Enhanced scenario type with additional calculation fields
export interface LoanScenario {
  id: string
  name: string
  downPaymentPercent: number
  loanTermYears: number
  interestRate: number
  propertyPrice: number
  downPayment: number
  loanAmount: number
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  monthlyIncome: number
  monthlyExpenses: number
  netCashFlow: number
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: 'optimal' | 'safe' | 'aggressive' | 'risky'
  createdAt: Date
  planId?: string
}

export interface ScenarioCalculationParams {
  propertyPrice: number
  downPaymentPercent: number
  loanTermYears: number
  interestRate: number
  monthlyIncome: number
  monthlyExpenses: number
  promotionalRate?: number
  promotionalMonths?: number
}

interface UseScenariosReturn {
  scenarios: LoanScenario[]
  loading: boolean
  error: string | null
  createScenario: (params: ScenarioCalculationParams, name?: string) => LoanScenario
  updateScenario: (id: string, updates: Partial<ScenarioCalculationParams>) => void
  deleteScenario: (id: string) => void
  duplicateScenario: (id: string, newName?: string) => LoanScenario
  calculateScenario: (params: ScenarioCalculationParams) => Omit<LoanScenario, 'id' | 'name' | 'createdAt'>
  getRecommendation: (scenario: LoanScenario) => LoanScenario['recommendation']
  compareScenarios: (scenarioIds: string[]) => LoanScenario[]
  
}

// Vietnamese banking loan calculation with promotional rates
const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  termYears: number,
  promotionalRate?: number,
  promotionalMonths?: number
): { monthlyPayment: number; totalInterest: number; totalPayment: number } => {
  const monthlyRate = annualRate / 100 / 12
  const totalMonths = termYears * 12
  
  if (promotionalRate && promotionalMonths) {
    // Calculate with promotional rate for initial period
    const promoMonthlyRate = promotionalRate / 100 / 12
    const promoPayment = (principal * promoMonthlyRate * Math.pow(1 + promoMonthlyRate, totalMonths)) / 
                        (Math.pow(1 + promoMonthlyRate, totalMonths) - 1)
    
    // Calculate remaining balance after promotional period
    let remainingBalance = principal
    let totalInterest = 0
    
    // Promotional period payments
    for (let month = 1; month <= promotionalMonths; month++) {
      const interestPayment = remainingBalance * promoMonthlyRate
      const principalPayment = promoPayment - interestPayment
      remainingBalance -= principalPayment
      totalInterest += interestPayment
    }
    
    // Regular period payments
    const remainingMonths = totalMonths - promotionalMonths
    if (remainingMonths > 0) {
      const regularPayment = (remainingBalance * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / 
                            (Math.pow(1 + monthlyRate, remainingMonths) - 1)
      
      for (let month = 1; month <= remainingMonths; month++) {
        const interestPayment = remainingBalance * monthlyRate
        const principalPayment = regularPayment - interestPayment
        remainingBalance -= principalPayment
        totalInterest += interestPayment
      }
      
      // Return weighted average payment for UI display
      const avgPayment = (promoPayment * promotionalMonths + regularPayment * remainingMonths) / totalMonths
      return {
        monthlyPayment: avgPayment,
        totalInterest,
        totalPayment: principal + totalInterest
      }
    }
    
    return {
      monthlyPayment: promoPayment,
      totalInterest,
      totalPayment: principal + totalInterest
    }
  }
  
  // Standard loan calculation
  const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                        (Math.pow(1 + monthlyRate, totalMonths) - 1)
  const totalPayment = monthlyPayment * totalMonths
  const totalInterest = totalPayment - principal
  
  return {
    monthlyPayment,
    totalInterest,
    totalPayment
  }
}

// Risk assessment based on financial ratios
const assessRiskLevel = (
  monthlyPayment: number,
  monthlyIncome: number,
  netCashFlow: number,
  downPaymentPercent: number,
  loanTermYears: number
): 'low' | 'medium' | 'high' => {
  const debtToIncomeRatio = (monthlyPayment / monthlyIncome) * 100
  
  let riskScore = 0
  
  // Debt-to-income ratio scoring
  if (debtToIncomeRatio > 50) riskScore += 40
  else if (debtToIncomeRatio > 40) riskScore += 25
  else if (debtToIncomeRatio > 30) riskScore += 10
  
  // Cash flow scoring
  if (netCashFlow < -2000000) riskScore += 30 // -2M VND
  else if (netCashFlow < 0) riskScore += 15
  
  // Down payment scoring
  if (downPaymentPercent < 10) riskScore += 25
  else if (downPaymentPercent < 20) riskScore += 15
  
  // Loan term scoring
  if (loanTermYears > 25) riskScore += 10
  else if (loanTermYears > 20) riskScore += 5
  
  if (riskScore >= 50) return 'high'
  if (riskScore >= 25) return 'medium'
  return 'low'
}

// Generate recommendation based on scenario characteristics
const generateRecommendation = (scenario: Omit<LoanScenario, 'recommendation'>): LoanScenario['recommendation'] => {
  const debtToIncomeRatio = (scenario.monthlyPayment / scenario.monthlyIncome) * 100
  
  // Optimal: Good balance of all factors
  if (
    debtToIncomeRatio <= 35 &&
    scenario.netCashFlow >= 0 &&
    scenario.downPaymentPercent >= 20 &&
    scenario.loanTermYears <= 25 &&
    scenario.riskLevel === 'low'
  ) {
    return 'optimal'
  }
  
  // Safe: Conservative approach
  if (
    debtToIncomeRatio <= 30 &&
    scenario.netCashFlow >= 1000000 && // 1M VND buffer
    scenario.downPaymentPercent >= 25 &&
    scenario.riskLevel === 'low'
  ) {
    return 'safe'
  }
  
  // Aggressive: Higher risk but potentially higher returns
  if (
    debtToIncomeRatio <= 45 &&
    scenario.netCashFlow >= -500000 && // -500K VND acceptable
    scenario.downPaymentPercent >= 15 &&
    scenario.riskLevel === 'medium'
  ) {
    return 'aggressive'
  }
  
  // Risky: High risk factors present
  return 'risky'
}

export function useScenarios(initialScenarios: LoanScenario[] = []): UseScenariosReturn {
  const [scenarios, setScenarios] = useState<LoanScenario[]>(initialScenarios)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate all loan metrics for a scenario
  const calculateScenario = useCallback((params: ScenarioCalculationParams): Omit<LoanScenario, 'id' | 'name' | 'createdAt'> => {
    try {
      const downPayment = params.propertyPrice * (params.downPaymentPercent / 100)
      const loanAmount = params.propertyPrice - downPayment
      
      const { monthlyPayment, totalInterest, totalPayment } = calculateMonthlyPayment(
        loanAmount,
        params.interestRate,
        params.loanTermYears,
        params.promotionalRate,
        params.promotionalMonths
      )
      
      const netCashFlow = params.monthlyIncome - params.monthlyExpenses - monthlyPayment
      const riskLevel = assessRiskLevel(
        monthlyPayment,
        params.monthlyIncome,
        netCashFlow,
        params.downPaymentPercent,
        params.loanTermYears
      )
      
      const scenarioData = {
        downPaymentPercent: params.downPaymentPercent,
        loanTermYears: params.loanTermYears,
        interestRate: params.interestRate,
        propertyPrice: params.propertyPrice,
        downPayment,
        loanAmount,
        monthlyPayment,
        totalInterest,
        totalPayment,
        monthlyIncome: params.monthlyIncome,
        monthlyExpenses: params.monthlyExpenses,
        netCashFlow,
        riskLevel
      }
      
      const recommendation = generateRecommendation(scenarioData)
      
      return {
        ...scenarioData,
        recommendation
      }
    } catch (err) {
      console.error('Error calculating scenario:', err)
      throw new Error('Failed to calculate scenario')
    }
  }, [])

  // Create a new scenario
  const createScenario = useCallback((params: ScenarioCalculationParams, name?: string): LoanScenario => {
    try {
      const calculatedScenario = calculateScenario(params)
      const newScenario: LoanScenario = {
        id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name || `Kịch bản ${scenarios.length + 1}`,
        ...calculatedScenario,
        createdAt: new Date()
      }
      
      setScenarios(prev => [...prev, newScenario])
      setError(null)
      
      return newScenario
    } catch (err) {
      setError('Failed to create scenario')
      throw err
    }
  }, [scenarios.length, calculateScenario])

  // Update existing scenario
  const updateScenario = useCallback((id: string, updates: Partial<ScenarioCalculationParams>) => {
    try {
      setScenarios(prev => prev.map(scenario => {
        if (scenario.id === id) {
          const updatedParams = {
            propertyPrice: updates.propertyPrice ?? scenario.propertyPrice,
            downPaymentPercent: updates.downPaymentPercent ?? scenario.downPaymentPercent,
            loanTermYears: updates.loanTermYears ?? scenario.loanTermYears,
            interestRate: updates.interestRate ?? scenario.interestRate,
            monthlyIncome: updates.monthlyIncome ?? scenario.monthlyIncome,
            monthlyExpenses: updates.monthlyExpenses ?? scenario.monthlyExpenses,
            promotionalRate: updates.promotionalRate,
            promotionalMonths: updates.promotionalMonths
          }
          
          const recalculated = calculateScenario(updatedParams)
          
          return {
            ...scenario,
            ...recalculated
          }
        }
        return scenario
      }))
      setError(null)
    } catch (err) {
      setError('Failed to update scenario')
    }
  }, [calculateScenario])

  // Delete scenario
  const deleteScenario = useCallback((id: string) => {
    setScenarios(prev => prev.filter(scenario => scenario.id !== id))
  }, [])

  // Duplicate scenario
  const duplicateScenario = useCallback((id: string, newName?: string): LoanScenario => {
    const originalScenario = scenarios.find(s => s.id === id)
    if (!originalScenario) {
      throw new Error('Scenario not found')
    }
    
    const duplicatedScenario: LoanScenario = {
      ...originalScenario,
      id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${originalScenario.name} (Copy)`,
      createdAt: new Date()
    }
    
    setScenarios(prev => [...prev, duplicatedScenario])
    return duplicatedScenario
  }, [scenarios])

  // Get recommendation for a scenario
  const getRecommendation = useCallback((scenario: LoanScenario): LoanScenario['recommendation'] => {
    return generateRecommendation(scenario)
  }, [])

  // Compare selected scenarios
  const compareScenarios = useCallback((scenarioIds: string[]): LoanScenario[] => {
    return scenarios.filter(scenario => scenarioIds.includes(scenario.id))
  }, [scenarios])

  return {
    scenarios,
    loading,
    error,
    createScenario,
    updateScenario,
    deleteScenario,
    duplicateScenario,
    calculateScenario,
    getRecommendation,
    compareScenarios
  }
}

// Helper function to create scenarios from a financial plan
export function createScenariosFromPlan(plan: FinancialPlan): LoanScenario[] {
  const baseParams = {
    propertyPrice: plan.purchasePrice,
    downPaymentPercent: (plan.downPayment / plan.purchasePrice) * 100,
    loanTermYears: 20, // Default term
    interestRate: 8.5, // Default rate
    monthlyIncome: plan.monthlyIncome,
    monthlyExpenses: plan.monthlyExpenses
  }
  
  const scenarios: ScenarioCalculationParams[] = [
    // Conservative scenario
    {
      ...baseParams,
      downPaymentPercent: 30,
      loanTermYears: 15,
      interestRate: 8.0
    },
    // Balanced scenario
    {
      ...baseParams,
      downPaymentPercent: 20,
      loanTermYears: 20,
      interestRate: 8.5
    },
    // Aggressive scenario
    {
      ...baseParams,
      downPaymentPercent: 15,
      loanTermYears: 25,
      interestRate: 9.0
    }
  ]
  
  return scenarios.map((params, index) => {
    // Create a temporary calculation instance to avoid circular dependency
    const downPayment = params.propertyPrice * (params.downPaymentPercent / 100)
    const loanAmount = params.propertyPrice - downPayment
    
    const { monthlyPayment, totalInterest, totalPayment } = calculateMonthlyPayment(
      loanAmount,
      params.interestRate,
      params.loanTermYears,
      params.promotionalRate,
      params.promotionalMonths
    )
    
    const netCashFlow = params.monthlyIncome - params.monthlyExpenses - monthlyPayment
    const riskLevel = assessRiskLevel(
      monthlyPayment,
      params.monthlyIncome,
      netCashFlow,
      params.downPaymentPercent,
      params.loanTermYears
    )
    
    const scenarioData = {
      downPaymentPercent: params.downPaymentPercent,
      loanTermYears: params.loanTermYears,
      interestRate: params.interestRate,
      propertyPrice: params.propertyPrice,
      downPayment,
      loanAmount,
      monthlyPayment,
      totalInterest,
      totalPayment,
      monthlyIncome: params.monthlyIncome,
      monthlyExpenses: params.monthlyExpenses,
      netCashFlow,
      riskLevel
    }
    
    const recommendation = generateRecommendation(scenarioData)
    
    return {
      id: `scenario-${index + 1}`,
      name: ['Bảo Thủ', 'Cân Bằng', 'Tích Cực'][index],
      ...scenarioData,
      recommendation,
      createdAt: new Date()
    }
  })
}