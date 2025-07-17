// src/types/scenario.ts
// Scenario types aligned with database schema

import type { FinancialPlan, LoanCalculation, Database } from '@/lib/supabase/types'

// Extract plan status from database enum
export type PlanStatus = Database['public']['Enums']['plan_status']
export type PlanType = Database['public']['Enums']['plan_type_enum']

// Scenario types based on financial planning workflow
export type ScenarioType = 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'

// Risk levels for scenario analysis
export type RiskLevel = 'low' | 'medium' | 'high'

// Enhanced financial plan with calculated metrics
export interface FinancialScenario extends FinancialPlan {
  // Additional calculated fields for scenario analysis
  calculatedMetrics?: {
    monthlyPayment: number
    totalInterest: number
    totalCost: number
    dtiRatio: number
    ltvRatio: number
    affordabilityScore: number
    payoffTimeMonths: number
    monthlySavings?: number
  }
  
  // Scenario-specific properties
  scenarioType: ScenarioType
  riskLevel: RiskLevel
  
  // Timeline events for visualization
  events?: ScenarioTimelineEvent[]
  
  // Comparison data
  comparisonToBaseline?: {
    monthlySavingsDifference: number
    totalCostDifference: number
    timeToPayoffDifference: number
  }
  
  // Associated loan calculations
  loanCalculations?: LoanCalculation[]
}

// Scenario comparison interface
export interface ScenarioComparison {
  scenarios: FinancialScenario[]
  baselineScenario: FinancialScenario
  bestScenario: FinancialScenario
  worstScenario: FinancialScenario
  averageMetrics: {
    monthlyPayment: number
    totalInterest: number
    totalCost: number
    dtiRatio: number
    payoffTimeMonths: number
  }
  riskDistribution: Record<RiskLevel, number>
}

// Scenario parameters for editing/creation
export interface ScenarioParameters {
  planName: string
  planType: PlanType
  scenarioType: ScenarioType
  
  // Property details
  purchasePrice: number
  downPayment: number
  additionalCosts: number
  
  // Loan details
  loanAmount: number
  interestRate: number
  loanTermYears: number
  
  // Personal finances
  monthlyIncome: number
  monthlyExpenses: number
  currentSavings: number
  otherDebts: number
  
  // Investment specifics
  expectedRentalIncome?: number
  expectedAppreciationRate?: number
  
  // Risk and strategy
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentHorizonMonths?: number
  
  // Additional parameters
  emergencyFundTarget?: number
  dependents: number
  targetTimeframeMonths?: number
}

// Timeline event for scenario visualization
export interface ScenarioTimelineEvent {
  id: string
  type: 'loan_start' | 'payment' | 'rate_change' | 'prepayment' | 'completion' | 'milestone' | 'crisis_event' | 'opportunity' | 'loan_signing' | 'property_handover' | 'first_payment' | 'loan_completion'
  name: string
  description: string
  scheduledDate: Date
  month: number // Months from start
  financialImpact?: number
  balanceAfterEvent?: number
  status: 'scheduled' | 'completed' | 'projected'
  priority: number
}

// Scenario creation request
export interface CreateScenarioRequest {
  basePlanId?: string
  parameters: ScenarioParameters
  userId: string
}

// Scenario analysis result
export interface ScenarioAnalysisResult {
  scenario: FinancialScenario
  feasibilityScore: number
  recommendedAdjustments: string[]
  keyInsights: string[]
  riskFactors: string[]
  opportunities: string[]
}

// Export types for external use
export type {
  FinancialPlan,
  LoanCalculation,
  Database
}