// src/lib/adapters/planAdapter.ts
// Adapter to convert between API data structure and UI component structure

import { type FinancialPlanWithMetrics as APIPlan } from '@/lib/api/plans'

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
export function apiPlanToUIplan(apiPlan: APIPlan): UIFinancialPlan {
  return {
    id: apiPlan.id,
    planName: apiPlan.plan_name,
    planDescription: apiPlan.description || undefined,
    planType: apiPlan.plan_type,
    purchasePrice: apiPlan.purchase_price || 0,
    downPayment: apiPlan.down_payment || 0,
    monthlyIncome: apiPlan.monthly_income || 0,
    monthlyExpenses: apiPlan.monthly_expenses || 0,
    currentSavings: apiPlan.current_savings || 0,
    planStatus: apiPlan.status,
    isPublic: apiPlan.is_public,
    isFavorite: false, // TODO: Add favorites functionality
    createdAt: new Date(apiPlan.created_at),
    updatedAt: new Date(apiPlan.updated_at),
    // Calculated metrics from cached calculations
    monthlyPayment: apiPlan.cached_calculations?.monthlyPayment,
    totalInterest: apiPlan.cached_calculations?.totalInterest,
    affordabilityScore: apiPlan.cached_calculations?.affordabilityScore,
    riskLevel: getRiskLevel(apiPlan.cached_calculations?.affordabilityScore),
    roi: apiPlan.cached_calculations?.roi,
    expectedRentalIncome: apiPlan.expected_rental_income
  }
}

/**
 * Convert array of API plans to UI plans
 */
export function apiPlansToUIPlans(apiPlans: APIPlan[]): UIFinancialPlan[] {
  return apiPlans.map(apiPlanToUIplan)
}

/**
 * Determine risk level based on affordability score
 */
function getRiskLevel(affordabilityScore?: number): 'low' | 'medium' | 'high' {
  if (!affordabilityScore) return 'medium'
  
  if (affordabilityScore >= 8) return 'low'
  if (affordabilityScore >= 5) return 'medium'
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