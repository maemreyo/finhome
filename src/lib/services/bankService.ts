// src/lib/services/bankService.ts
// Service for bank interest rates and loan products management

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase/types'

type InterestRateRow = Database['public']['Tables']['interest_rates']['Row']
type InterestRateInsert = Database['public']['Tables']['interest_rates']['Insert']

export interface BankLoanProduct {
  id: string
  bankName: string
  bankCode: string
  productName: string
  rateType: 'promotional' | 'standard' | 'vip' | 'prime'
  loanTermYears: number
  interestRate: number
  promotionalRate?: number
  promotionalPeriod?: number
  minimumLoanAmount?: number
  maximumLoanAmount?: number
  minimumDownPayment?: number
  processingFee?: number
  earlyPaymentPenalty?: number
  specialConditions?: string[]
  isActive: boolean
  lastUpdated: Date
}

export interface BankComparison {
  loanAmount: number
  loanTermYears: number
  downPaymentPercent: number
  products: Array<{
    product: BankLoanProduct
    monthlyPayment: number
    totalInterest: number
    totalPayment: number
    effectiveRate: number
    savings?: number
  }>
  bestOptions: {
    lowestRate: BankLoanProduct
    lowestPayment: BankLoanProduct
    bestValue: BankLoanProduct
  }
}

export interface InterestRateHistory {
  bankName: string
  productName: string
  history: Array<{
    date: string
    rate: number
    type: 'promotional' | 'standard'
  }>
  trend: 'increasing' | 'decreasing' | 'stable'
  averageRate: number
  volatility: number
}

class BankService {
  private supabase = createClientComponentClient<Database>()

  // Get current interest rates
  async getCurrentRates(): Promise<BankLoanProduct[]> {
    const { data, error } = await this.supabase
      .from('interest_rates')
      .select('*')
      .eq('is_current', true)
      .order('interest_rate', { ascending: true })

    if (error) {
      throw new Error(`Error fetching interest rates: ${error.message}`)
    }

    return (data || []).map(this.mapToLoanProduct)
  }

  // Get rates by bank
  async getRatesByBank(bankName: string): Promise<BankLoanProduct[]> {
    const { data, error } = await this.supabase
      .from('interest_rates')
      .select('*')
      .eq('bank_name', bankName)
      .eq('is_current', true)
      .order('loan_term_years', { ascending: true })

    if (error) {
      throw new Error(`Error fetching rates for ${bankName}: ${error.message}`)
    }

    return (data || []).map(this.mapToLoanProduct)
  }

  // Get rates by loan term
  async getRatesByTerm(loanTermYears: number): Promise<BankLoanProduct[]> {
    const { data, error } = await this.supabase
      .from('interest_rates')
      .select('*')
      .eq('loan_term_years', loanTermYears)
      .eq('is_current', true)
      .order('interest_rate', { ascending: true })

    if (error) {
      throw new Error(`Error fetching rates for ${loanTermYears} years: ${error.message}`)
    }

    return (data || []).map(this.mapToLoanProduct)
  }

  // Compare loan options
  async compareLoanOptions(
    loanAmount: number,
    loanTermYears: number,
    downPaymentPercent: number = 20
  ): Promise<BankComparison> {
    const products = await this.getRatesByTerm(loanTermYears)
    const actualLoanAmount = loanAmount * ((100 - downPaymentPercent) / 100)

    const calculations = products
      .filter(product => this.isEligibleForLoan(product, actualLoanAmount))
      .map(product => {
        const monthlyPayment = this.calculateMonthlyPayment(
          actualLoanAmount,
          product.interestRate,
          loanTermYears
        )
        const totalPayment = monthlyPayment * loanTermYears * 12
        const totalInterest = totalPayment - actualLoanAmount
        const effectiveRate = this.calculateEffectiveRate(product)

        return {
          product,
          monthlyPayment,
          totalInterest,
          totalPayment,
          effectiveRate
        }
      })
      .sort((a, b) => a.monthlyPayment - b.monthlyPayment)

    // Calculate savings compared to highest option
    if (calculations.length > 1) {
      const highestPayment = Math.max(...calculations.map(c => c.totalPayment))
      calculations.forEach(calc => {
        calc.savings = highestPayment - calc.totalPayment
      })
    }

    // Find best options
    const bestOptions = {
      lowestRate: calculations.sort((a, b) => a.effectiveRate - b.effectiveRate)[0]?.product,
      lowestPayment: calculations.sort((a, b) => a.monthlyPayment - b.monthlyPayment)[0]?.product,
      bestValue: calculations.sort((a, b) => a.totalPayment - b.totalPayment)[0]?.product
    }

    return {
      loanAmount: actualLoanAmount,
      loanTermYears,
      downPaymentPercent,
      products: calculations,
      bestOptions
    }
  }

  // Get Vietnamese banks data
  async getVietnameseBanks(): Promise<Array<{ name: string; code: string; products: number }>> {
    const { data, error } = await this.supabase
      .from('interest_rates')
      .select('bank_name, bank_code')
      .eq('is_current', true)

    if (error) {
      throw new Error(`Error fetching banks: ${error.message}`)
    }

    // Group by bank and count products
    const bankMap = new Map()
    data?.forEach(rate => {
      const key = rate.bank_name
      if (!bankMap.has(key)) {
        bankMap.set(key, {
          name: rate.bank_name,
          code: rate.bank_code || rate.bank_name.toUpperCase(),
          products: 0
        })
      }
      bankMap.get(key).products++
    })

    return Array.from(bankMap.values())
  }

  // Seed initial bank data
  async seedBankData(): Promise<void> {
    const vietnameseBankRates: InterestRateInsert[] = [
      // Vietcombank
      {
        bank_name: 'Vietcombank',
        bank_code: 'VCB',
        rate_type: 'promotional',
        loan_term_years: 15,
        interest_rate: 7.5,
        minimum_loan_amount: 500000000, // 500M VND
        maximum_loan_amount: 50000000000, // 50B VND
        minimum_down_payment_percent: 20,
        effective_date: '2024-01-01',
        is_current: true,
        origination_fee: 0.8,
        processing_fee: 0.2,
        early_payment_penalty_rate: 1.0,
        late_payment_penalty_rate: 2.0,
        mortgage_insurance_required: true,
        property_insurance_required: true,
        special_conditions: ['Lương qua VCB từ 3 tháng', 'Sổ đỏ chính chủ']
      },
      {
        bank_name: 'Vietcombank',
        bank_code: 'VCB',
        rate_type: 'standard',
        loan_term_years: 20,
        interest_rate: 8.2,
        minimum_loan_amount: 500000000,
        maximum_loan_amount: 50000000000,
        minimum_down_payment_percent: 20,
        effective_date: '2024-01-01',
        is_current: true,
        origination_fee: 0.8,
        processing_fee: 0.2,
        early_payment_penalty_rate: 1.0,
        late_payment_penalty_rate: 2.0,
        mortgage_insurance_required: true,
        property_insurance_required: true
      },
      
      // BIDV
      {
        bank_name: 'BIDV',
        bank_code: 'BIDV',
        rate_type: 'promotional',
        loan_term_years: 15,
        interest_rate: 7.3,
        minimum_loan_amount: 300000000,
        maximum_loan_amount: 40000000000,
        minimum_down_payment_percent: 15,
        effective_date: '2024-01-01',
        is_current: true,
        origination_fee: 0.7,
        processing_fee: 0.15,
        early_payment_penalty_rate: 0.8,
        late_payment_penalty_rate: 1.8,
        mortgage_insurance_required: false,
        property_insurance_required: true,
        special_conditions: ['Khách hàng VIP từ 1 năm', 'Thu nhập ổn định 6 tháng']
      },
      {
        bank_name: 'BIDV',
        bank_code: 'BIDV',
        rate_type: 'standard',
        loan_term_years: 20,
        interest_rate: 8.0,
        minimum_loan_amount: 300000000,
        maximum_loan_amount: 40000000000,
        minimum_down_payment_percent: 20,
        effective_date: '2024-01-01',
        is_current: true,
        origination_fee: 0.7,
        processing_fee: 0.15,
        early_payment_penalty_rate: 0.8,
        late_payment_penalty_rate: 1.8,
        mortgage_insurance_required: false,
        property_insurance_required: true
      },

      // Vietinbank
      {
        bank_name: 'Vietinbank',
        bank_code: 'VTB',
        rate_type: 'promotional',
        loan_term_years: 15,
        interest_rate: 7.7,
        minimum_loan_amount: 400000000,
        maximum_loan_amount: 45000000000,
        minimum_down_payment_percent: 20,
        effective_date: '2024-01-01',
        is_current: true,
        origination_fee: 0.9,
        processing_fee: 0.25,
        early_payment_penalty_rate: 1.2,
        late_payment_penalty_rate: 2.2,
        mortgage_insurance_required: true,
        property_insurance_required: true,
        special_conditions: ['Gửi tiết kiệm tối thiểu 100M trong 6 tháng']
      },

      // Techcombank
      {
        bank_name: 'Techcombank',
        bank_code: 'TCB',
        rate_type: 'promotional',
        loan_term_years: 15,
        interest_rate: 7.9,
        minimum_loan_amount: 500000000,
        maximum_loan_amount: 60000000000,
        minimum_down_payment_percent: 20,
        effective_date: '2024-01-01',
        is_current: true,
        origination_fee: 0.6,
        processing_fee: 0.1,
        early_payment_penalty_rate: 0.5,
        late_payment_penalty_rate: 1.5,
        mortgage_insurance_required: false,
        property_insurance_required: true,
        special_conditions: ['Khách hàng Priority từ 6 tháng', 'Mở thẻ tín dụng']
      },
      {
        bank_name: 'Techcombank',
        bank_code: 'TCB',
        rate_type: 'standard',
        loan_term_years: 20,
        interest_rate: 8.4,
        minimum_loan_amount: 500000000,
        maximum_loan_amount: 60000000000,
        minimum_down_payment_percent: 20,
        effective_date: '2024-01-01',
        is_current: true,
        origination_fee: 0.6,
        processing_fee: 0.1,
        early_payment_penalty_rate: 0.5,
        late_payment_penalty_rate: 1.5,
        mortgage_insurance_required: false,
        property_insurance_required: true
      },

      // VPBank
      {
        bank_name: 'VPBank',
        bank_code: 'VPB',
        rate_type: 'promotional',
        loan_term_years: 15,
        interest_rate: 8.1,
        minimum_loan_amount: 300000000,
        maximum_loan_amount: 35000000000,
        minimum_down_payment_percent: 15,
        effective_date: '2024-01-01',
        is_current: true,
        origination_fee: 0.5,
        processing_fee: 0.1,
        early_payment_penalty_rate: 0.3,
        late_payment_penalty_rate: 1.2,
        mortgage_insurance_required: false,
        property_insurance_required: true,
        special_conditions: ['Duyệt nhanh trong 24h', 'Giải ngân linh hoạt']
      },

      // Military Bank (MB)
      {
        bank_name: 'Military Bank',
        bank_code: 'MB',
        rate_type: 'promotional',
        loan_term_years: 15,
        interest_rate: 7.6,
        minimum_loan_amount: 200000000,
        maximum_loan_amount: 30000000000,
        minimum_down_payment_percent: 20,
        effective_date: '2024-01-01',
        is_current: true,
        origination_fee: 0.8,
        processing_fee: 0.2,
        early_payment_penalty_rate: 1.0,
        late_payment_penalty_rate: 2.0,
        mortgage_insurance_required: true,
        property_insurance_required: true,
        special_conditions: ['Ưu đãi cho quân nhân', 'Lãi suất cố định 3 năm đầu']
      }
    ]

    const { error } = await this.supabase
      .from('interest_rates')
      .insert(vietnameseBankRates)

    if (error) {
      throw new Error(`Error seeding bank data: ${error.message}`)
    }
  }

  // Private helper methods
  private mapToLoanProduct(rate: InterestRateRow): BankLoanProduct {
    return {
      id: rate.id,
      bankName: rate.bank_name,
      bankCode: rate.bank_code || '',
      productName: rate.loan_product_name || `${rate.rate_type} ${rate.loan_term_years} năm`,
      rateType: rate.rate_type,
      loanTermYears: rate.loan_term_years,
      interestRate: rate.interest_rate,
      promotionalRate: rate.promotional_rate || undefined,
      promotionalPeriod: rate.promotional_period_months || undefined,
      minimumLoanAmount: rate.minimum_loan_amount || undefined,
      maximumLoanAmount: rate.maximum_loan_amount || undefined,
      minimumDownPayment: rate.minimum_down_payment_percent || undefined,
      processingFee: rate.processing_fee || 0,
      earlyPaymentPenalty: rate.early_payment_penalty_rate || 0,
      specialConditions: rate.special_conditions || undefined,
      isActive: rate.is_current,
      lastUpdated: new Date(rate.updated_at)
    }
  }

  private isEligibleForLoan(product: BankLoanProduct, loanAmount: number): boolean {
    if (product.minimumLoanAmount && loanAmount < product.minimumLoanAmount) {
      return false
    }
    if (product.maximumLoanAmount && loanAmount > product.maximumLoanAmount) {
      return false
    }
    return true
  }

  private calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
    const monthlyRate = annualRate / 100 / 12
    const numPayments = termYears * 12

    if (monthlyRate === 0) {
      return principal / numPayments
    }

    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
           (Math.pow(1 + monthlyRate, numPayments) - 1)
  }

  private calculateEffectiveRate(product: BankLoanProduct): number {
    // Include fees in effective rate calculation
    const baseRate = product.interestRate
    const feeImpact = (product.processingFee || 0) * 0.1 // Rough conversion to rate impact
    return baseRate + feeImpact
  }

  // Get interest rate trends
  async getInterestRateTrends(bankName?: string): Promise<InterestRateHistory[]> {
    let query = this.supabase
      .from('interest_rates')
      .select('*')
      .order('effective_date', { ascending: false })

    if (bankName) {
      query = query.eq('bank_name', bankName)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error fetching rate trends: ${error.message}`)
    }

    // Group by bank and product
    const groupedData = new Map<string, InterestRateRow[]>()
    data?.forEach(rate => {
      const key = `${rate.bank_name}-${rate.loan_product_name || rate.rate_type}`
      if (!groupedData.has(key)) {
        groupedData.set(key, [])
      }
      groupedData.get(key)!.push(rate)
    })

    // Convert to history format
    return Array.from(groupedData.entries()).map(([key, rates]) => {
      const [bankName, productName] = key.split('-')
      const history = rates.map(rate => ({
        date: rate.effective_date,
        rate: rate.interest_rate,
        type: rate.rate_type as 'promotional' | 'standard'
      }))

      const averageRate = history.reduce((sum, h) => sum + h.rate, 0) / history.length
      const volatility = this.calculateVolatility(history.map(h => h.rate))
      const trend = this.determineTrend(history)

      return {
        bankName,
        productName,
        history,
        trend,
        averageRate,
        volatility
      }
    })
  }

  private calculateVolatility(rates: number[]): number {
    if (rates.length < 2) return 0
    
    const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length
    const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / rates.length
    return Math.sqrt(variance)
  }

  private determineTrend(history: Array<{ date: string; rate: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (history.length < 2) return 'stable'
    
    const recentRates = history.slice(0, 3).map(h => h.rate)
    const olderRates = history.slice(-3).map(h => h.rate)
    
    const recentAvg = recentRates.reduce((sum, rate) => sum + rate, 0) / recentRates.length
    const olderAvg = olderRates.reduce((sum, rate) => sum + rate, 0) / olderRates.length
    
    const threshold = 0.1 // 0.1% threshold for stability
    
    if (recentAvg - olderAvg > threshold) return 'increasing'
    if (olderAvg - recentAvg > threshold) return 'decreasing'
    return 'stable'
  }
}

export const bankService = new BankService()