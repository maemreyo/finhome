// src/lib/api/bankRates.ts
// API client for bank interest rates

export interface BankRate {
  id: string
  bank_id: string
  product_name: string
  loan_type: 'personal' | 'home_purchase' | 'investment' | 'commercial'
  min_amount: number
  max_amount: number
  min_term_months: number
  max_term_months: number
  base_rate: number
  promotional_rate?: number
  promotional_period_months?: number
  max_ltv_ratio: number
  processing_fee_rate: number
  early_payment_fee_rate: number
  is_active: boolean
  effective_from: string
  effective_to?: string
  created_at: string
  updated_at: string
  // Joined bank data
  bank?: {
    id: string
    bank_code: string
    bank_name: string
    bank_name_en?: string
    logo_url?: string
    is_active: boolean
  }
}

export interface BankRateFilters {
  loanType?: 'personal' | 'home_purchase' | 'investment' | 'commercial'
  bankId?: string
  minAmount?: number
  maxAmount?: number
  termMonths?: number
  isActive?: boolean
}

export interface OptimalRateRequest {
  loanAmount: number
  termMonths: number
  loanType: 'personal' | 'home_purchase' | 'investment' | 'commercial'
  downPaymentRatio?: number
}

export interface OptimalRateResponse {
  recommendedRates: Array<{
    rate: BankRate
    effectiveRate: number
    monthlyPayment: number
    totalInterest: number
    totalCost: number
    recommendation: 'excellent' | 'good' | 'average' | 'poor'
    pros: string[]
    cons: string[]
  }>
  marketAverage: {
    baseRate: number
    promotionalRate: number
    processingFee: number
  }
}

class BankRatesAPI {
  private baseUrl = '/api/banks/rates'

  async getBankRates(filters?: BankRateFilters): Promise<BankRate[]> {
    const params = new URLSearchParams()
    
    if (filters?.loanType) params.set('loanType', filters.loanType)
    if (filters?.bankId) params.set('bankId', filters.bankId)
    if (filters?.minAmount) params.set('minAmount', filters.minAmount.toString())
    if (filters?.maxAmount) params.set('maxAmount', filters.maxAmount.toString())
    if (filters?.termMonths) params.set('termMonths', filters.termMonths.toString())
    if (filters?.isActive !== undefined) params.set('isActive', filters.isActive.toString())

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

    const result = await response.json()
    return result.data || []
  }

  async getOptimalRates(request: OptimalRateRequest): Promise<OptimalRateResponse> {
    const params = new URLSearchParams({
      loanAmount: request.loanAmount.toString(),
      termMonths: request.termMonths.toString(),
      loanType: request.loanType,
    })

    if (request.downPaymentRatio) {
      params.set('downPaymentRatio', request.downPaymentRatio.toString())
    }

    const response = await fetch(`/api/bank-rates?${params}`, {
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

  async getBankRateById(rateId: string): Promise<BankRate> {
    const response = await fetch(`${this.baseUrl}/${rateId}`, {
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

  async getRatesForLoan(
    loanAmount: number, 
    termMonths: number, 
    loanType: 'personal' | 'home_purchase' | 'investment' | 'commercial'
  ): Promise<BankRate[]> {
    return this.getBankRates({
      loanType,
      minAmount: loanAmount,
      maxAmount: loanAmount,
      termMonths,
      isActive: true
    })
  }
}

export const bankRatesAPI = new BankRatesAPI()

/**
 * Get the best rate from a list of rates
 */
export function getBestRate(rates: BankRate[]): BankRate | null {
  if (rates.length === 0) return null
  
  return rates.reduce((best, current) => {
    const bestEffectiveRate = best.promotional_rate || best.base_rate
    const currentEffectiveRate = current.promotional_rate || current.base_rate
    
    return currentEffectiveRate < bestEffectiveRate ? current : best
  })
}

/**
 * Calculate effective interest rate including fees
 */
export function calculateEffectiveRate(rate: BankRate, loanAmount: number): number {
  const baseRate = rate.promotional_rate || rate.base_rate
  const processingFeeRate = rate.processing_fee_rate || 0
  
  // Simplified effective rate calculation
  // In practice, this would be more complex considering the fee amortization
  return baseRate + (processingFeeRate / 100)
}