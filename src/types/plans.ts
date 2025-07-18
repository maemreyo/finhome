// src/types/plans.ts
// Common types for plan-related components

export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived'

export interface PlanMilestone {
  id: string
  title: string
  description: string
  category: 'financial' | 'legal' | 'property' | 'admin'
  targetDate: Date
  completedDate?: Date
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  requiredAmount?: number
  currentAmount?: number
  dependencies?: string[]
  notes?: string
}

export interface PlanProgress {
  totalProgress: number
  financialProgress: number
  milestones: PlanMilestone[]
  currentSavings: number
  savingsTarget: number
  monthlyContribution: number
  estimatedCompletionDate: Date
  statusHistory: Array<{
    status: PlanStatus
    date: Date
    note?: string
  }>
}

export interface PlanFinancialPlan {
  id: string
  planName: string
  planType: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
  planStatus: PlanStatus
  purchasePrice?: number
  downPayment?: number
  monthlyIncome?: number
  monthlyExpenses?: number
  expectedRentalIncome?: number
  affordabilityScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

export interface PlanStatusHistory {
  id: string
  previousStatus: PlanStatus
  newStatus: PlanStatus
  changedBy: string
  changedAt: Date
  reason?: string
  notes?: string
}

export interface PlanStatusInfo {
  status: PlanStatus
  progress: number
  statusHistory: PlanStatusHistory[]
  canTransitionTo: PlanStatus[]
  estimatedCompletionDate?: Date
  actualCompletionDate?: Date
  archiveReason?: string
  createdAt: Date
  updatedAt: Date
}