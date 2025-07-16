// src/lib/api/plans.ts
// API client for financial plans

export interface FinancialPlan {
  id: string
  user_id: string
  plan_name: string
  plan_description?: string
  plan_type: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
  purchase_price: number
  down_payment: number
  additional_costs: number
  monthly_income: number
  monthly_expenses: number
  current_savings: number
  other_debts: number
  expected_rental_income?: number
  expected_appreciation_rate?: number
  investment_horizon_years?: number
  is_public: boolean
  status: 'draft' | 'active' | 'completed' | 'archived'
  cached_calculations?: {
    monthlyPayment: number
    totalInterest: number
    debtToIncomeRatio: number
    affordabilityScore: number
    roi?: number
    paybackPeriod?: number
  }
  created_at: string
  updated_at: string
  calculations_last_updated?: string
}

export interface CreatePlanRequest {
  planName: string
  planDescription?: string
  planType: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
  purchasePrice: number
  downPayment: number
  additionalCosts?: number
  monthlyIncome: number
  monthlyExpenses: number
  currentSavings: number
  otherDebts?: number
  expectedRentalIncome?: number
  expectedAppreciationRate?: number
  investmentHorizonYears?: number
  isPublic?: boolean
}

export interface PlansResponse {
  data: FinancialPlan[]
  count: number
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

export interface PlanFilters {
  limit?: number
  offset?: number
  status?: 'draft' | 'active' | 'completed' | 'archived'
  planType?: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
  isPublic?: boolean
  search?: string
}

class PlansAPI {
  private baseUrl = '/api/plans'

  async getPlans(filters?: PlanFilters): Promise<PlansResponse> {
    const params = new URLSearchParams()
    
    if (filters?.limit) params.set('limit', filters.limit.toString())
    if (filters?.offset) params.set('offset', filters.offset.toString())
    if (filters?.status) params.set('status', filters.status)
    if (filters?.planType) params.set('planType', filters.planType)
    if (filters?.isPublic !== undefined) params.set('isPublic', filters.isPublic.toString())
    if (filters?.search) params.set('search', filters.search)

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async createPlan(planData: CreatePlanRequest): Promise<FinancialPlan> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    return result.data
  }

  async getPlan(planId: string): Promise<FinancialPlan> {
    const response = await fetch(`${this.baseUrl}/${planId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    return result.data
  }

  async updatePlan(planId: string, updates: Partial<CreatePlanRequest>): Promise<FinancialPlan> {
    const response = await fetch(`${this.baseUrl}/${planId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    return result.data
  }

  async deletePlan(planId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${planId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
  }
}

export const plansAPI = new PlansAPI()