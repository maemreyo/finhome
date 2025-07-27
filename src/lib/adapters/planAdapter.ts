// src/lib/adapters/planAdapter.ts
// Adapter to convert between API data structure and UI component structure

import { type FinancialPlanWithMetrics as APIPlan } from '@/lib/api/plans'
import { DashboardService } from '@/lib/services/dashboardService'

// Legacy UI component interface
export interface UIFinancialPlan {
  id: string
  planName: string
  planDescription?: string
  planType: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
  purchasePrice: number
  downPayment: number
  monthlyIncome: number
  monthlyExpenses: number
  currentSavings: number
  planStatus: 'draft' | 'active' | 'completed' | 'archived'
  isPublic: boolean
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  // Calculated metrics
  monthlyPayment?: number
  totalInterest?: number
  affordabilityScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
  roi?: number
  expectedRentalIncome?: number
}

/**
 * Convert API plan to UI plan format
 */
export async function apiPlanToUIplan(apiPlan: APIPlan, userId?: string): Promise<UIFinancialPlan> {
  // Check if plan is favorited by current user
  let isFavorite = false
  if (userId) {
    try {
      isFavorite = await DashboardService.isFavorite(userId, 'financial_plan', apiPlan.id)
    } catch (error) {
      console.error('Error checking favorite status:', error)
      isFavorite = false
    }
  }
  return {
    id: apiPlan.id,
    planName: apiPlan.plan_name,
    planDescription: apiPlan.description || undefined,
    planType: apiPlan.plan_type || 'home_purchase',
    purchasePrice: apiPlan.purchase_price || 0,
    downPayment: apiPlan.down_payment || 0,
    monthlyIncome: apiPlan.monthly_income || 0,
    monthlyExpenses: apiPlan.monthly_expenses || 0,
    currentSavings: apiPlan.current_savings || 0,
    planStatus: apiPlan.status || 'draft',
    isPublic: !!apiPlan.is_public,
    isFavorite,
    createdAt: apiPlan.created_at ? new Date(apiPlan.created_at) : new Date(),
    updatedAt: apiPlan.updated_at ? new Date(apiPlan.updated_at) : new Date(),
    // Calculated metrics from cached calculations
    monthlyPayment: apiPlan.cached_calculations ? (apiPlan.cached_calculations as any).monthlyPayment : undefined,
    totalInterest: apiPlan.cached_calculations ? (apiPlan.cached_calculations as any).totalInterest : undefined,
    affordabilityScore: apiPlan.cached_calculations ? (apiPlan.cached_calculations as any).affordabilityScore : undefined,
    riskLevel: calculateRiskLevel(apiPlan),
    roi: apiPlan.cached_calculations ? (apiPlan.cached_calculations as any).roi : undefined,
    expectedRentalIncome: apiPlan.expected_rental_income || undefined
  }
}

/**
 * Convert array of API plans to UI plans
 */
export async function apiPlansToUIPlans(apiPlans: APIPlan[], userId?: string): Promise<UIFinancialPlan[]> {
  return Promise.all(apiPlans.map(plan => apiPlanToUIplan(plan, userId)))
}

/**
 * Calculate comprehensive risk level based on multiple factors
 */
function calculateRiskLevel(apiPlan: APIPlan): 'low' | 'medium' | 'high' {
  const calculations = apiPlan.cached_calculations as any || {}
  
  let riskScore = 0
  let factorCount = 0
  
  // Factor 1: Affordability Score (40% weight)
  if (calculations.affordabilityScore !== undefined) {
    const affordabilityRisk = calculations.affordabilityScore >= 8 ? 1 : 
                             calculations.affordabilityScore >= 5 ? 2 : 3
    riskScore += affordabilityRisk * 0.4
    factorCount++
  }
  
  // Factor 2: Debt-to-Income Ratio (30% weight)
  if (calculations.debtToIncomeRatio !== undefined) {
    const dtiRisk = calculations.debtToIncomeRatio <= 0.3 ? 1 :
                   calculations.debtToIncomeRatio <= 0.4 ? 2 : 3
    riskScore += dtiRisk * 0.3
    factorCount++
  }
  
  // Factor 3: Down Payment Ratio (20% weight)
  if (apiPlan.purchase_price && apiPlan.down_payment) {
    const downPaymentRatio = apiPlan.down_payment / apiPlan.purchase_price
    const downPaymentRisk = downPaymentRatio >= 0.3 ? 1 :
                           downPaymentRatio >= 0.2 ? 2 : 3
    riskScore += downPaymentRisk * 0.2
    factorCount++
  }
  
  // Factor 4: Current Savings vs Monthly Expenses (10% weight)
  if (apiPlan.current_savings && apiPlan.monthly_expenses) {
    const emergencyFundMonths = apiPlan.current_savings / apiPlan.monthly_expenses
    const savingsRisk = emergencyFundMonths >= 6 ? 1 :
                       emergencyFundMonths >= 3 ? 2 : 3
    riskScore += savingsRisk * 0.1
    factorCount++
  }
  
  // If no factors available, default to medium risk
  if (factorCount === 0) return 'medium'
  
  // Calculate final risk level
  const finalScore = riskScore / factorCount
  
  if (finalScore <= 1.5) return 'low'
  if (finalScore <= 2.5) return 'medium'
  return 'high'
}

/**
 * Get plan type display label
 */
export function getPlanTypeLabel(planType: string): string {
  const labels = {
    'home_purchase': 'Home Purchase',
    'investment': 'Investment',
    'upgrade': 'Property Upgrade',
    'refinance': 'Refinancing'
  }
  return labels[planType as keyof typeof labels] || planType
}

/**
 * Get plan status display info
 */
export function getPlanStatusInfo(status: string): { label: string, color: string } {
  const statusMap = {
    'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    'active': { label: 'Active', color: 'bg-green-100 text-green-800' },
    'completed': { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
    'archived': { label: 'Archived', color: 'bg-yellow-100 text-yellow-800' }
  }
  return statusMap[status as keyof typeof statusMap] || statusMap.draft
}

/**
 * Get risk level display info
 */
export function getRiskLevelInfo(riskLevel: string): { label: string, color: string, icon: 'up' | 'down' | 'neutral' } {
  const riskMap = {
    'low': { label: 'Low Risk', color: 'text-green-600', icon: 'down' as const },
    'medium': { label: 'Medium Risk', color: 'text-yellow-600', icon: 'neutral' as const },
    'high': { label: 'High Risk', color: 'text-red-600', icon: 'up' as const }
  }
  return riskMap[riskLevel as keyof typeof riskMap] || riskMap.medium
}