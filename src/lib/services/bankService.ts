// src/lib/services/bankService.ts
// Service for bank interest rates and loan products management

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase/types'

type InterestRateRow = Database['public']['Tables']['bank_interest_rates']['Row']
type InterestRateInsert = Database['public']['Tables']['bank_interest_rates']['Insert']

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
      .from('bank_interest_rates')
      .select('*')
      .eq('is_active', true)
      .order('interest_rate', { ascending: true })

    if (error) {
      throw new Error(`Error fetching interest rates: ${error.message}`)
    }

    return (data || []).map(this.mapToLoanProduct)
  }

  // Get rates by bank
  async getRatesByBank(bankId: string): Promise<BankLoanProduct[]> {
    const { data, error } = await this.supabase
      .from('bank_interest_rates')
      .select('*')
      .eq('bank_id', bankId)
      .eq('is_active', true)
      .order('min_term_months', { ascending: true })

    if (error) {
      throw new Error(`Error fetching rates for ${bankId}: ${error.message}`)
    }

    return (data || []).map(this.mapToLoanProduct)
  }

  // Get rates by loan term
  async getRatesByTerm(loanTermYears: number): Promise<BankLoanProduct[]> {
    const loanTermMonths = loanTermYears * 12
    const { data, error } = await this.supabase
      .from('bank_interest_rates')
      .select('*')
      .lte('min_term_months', loanTermMonths)
      .gte('max_term_months', loanTermMonths)
      .eq('is_active', true)
      .order('interest_rate', { ascending: true })

    if (error) {
      throw new Error(`Error fetching rates for ${loanTermMonths} months: ${error.message}`)
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
          effectiveRate,
          savings: 0 // Initialize savings field
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
      .from('bank_interest_rates')
      .select('bank_id')
      .eq('is_active', true)

    if (error) {
      throw new Error(`Error fetching banks: ${error.message}`)
    }

    // Group by bank and count products
    const bankMap = new Map()
    data?.forEach(rate => {
      const key = rate.bank_id
      if (!bankMap.has(key)) {
        bankMap.set(key, {
          name: rate.bank_id,
          code: rate.bank_id || rate.bank_id.toUpperCase(),
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
      {
        bank_id: 'vcb-001',
        product_name: 'VCB Home Loan Standard',
        loan_type: 'home_purchase',
        interest_rate: 8.2,
        min_loan_amount: 500000000,
        max_loan_amount: 50000000000,
        max_ltv_ratio: 80,
        min_term_months: 60,
        max_term_months: 240,
        effective_date: '2024-01-01',
        is_active: true,
        processing_fee: 0.2,
        early_payment_fee: 1.0,
        required_documents: {},
        eligibility_criteria: {}
      },
      {
        bank_id: 'bidv-001',
        product_name: 'BIDV Home Loan',
        loan_type: 'home_purchase',
        interest_rate: 7.8,
        min_loan_amount: 300000000,
        max_loan_amount: 40000000000,
        max_ltv_ratio: 85,
        min_term_months: 60,
        max_term_months: 300,
        effective_date: '2024-01-01',
        is_active: true,
        processing_fee: 0.15,
        early_payment_fee: 0.8,
        required_documents: {},
        eligibility_criteria: {}
      }
    ]

    const { error } = await this.supabase
      .from('bank_interest_rates')
      .insert(vietnameseBankRates)

    if (error) {
      throw new Error(`Error seeding bank data: ${error.message}`)
    }
  }

  // Private helper methods
  private mapToLoanProduct(rate: InterestRateRow): BankLoanProduct {
    return {
      id: rate.id,
      bankName: rate.bank_id, // Using bank_id as bank_name placeholder
      bankCode: rate.bank_id || '',
      productName: rate.product_name || `${rate.loan_type} loan`,
      rateType: 'standard', // Default value since rate_type field doesn't exist
      loanTermYears: Math.floor((rate.max_term_months || 240) / 12), // Convert months to years
      interestRate: rate.interest_rate,
      promotionalRate: rate.min_rate || undefined,
      promotionalPeriod: undefined, // Field doesn't exist in current schema
      minimumLoanAmount: rate.min_loan_amount || undefined,
      maximumLoanAmount: rate.max_loan_amount || undefined,
      minimumDownPayment: undefined, // Field doesn't exist in current schema
      processingFee: rate.processing_fee || 0,
      earlyPaymentPenalty: rate.early_payment_fee || 0,
      specialConditions: undefined, // Field doesn't exist in current schema
      isActive: rate.is_active,
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
      .from('bank_interest_rates')
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
      const key = `${rate.bank_id}-${rate.product_name || rate.loan_type}`
      if (!groupedData.has(key)) {
        groupedData.set(key, [])
      }
      groupedData.get(key)!.push(rate)
    })

    // Convert to history format
    return Array.from(groupedData.entries()).map(([key, rates]) => {
      const [bankId, productName] = key.split('-')
      const history = rates.map(rate => ({
        date: rate.effective_date,
        rate: rate.interest_rate,
        type: 'standard' as const
      }))

      const averageRate = history.reduce((sum, h) => sum + h.rate, 0) / history.length
      const volatility = this.calculateVolatility(history.map(h => h.rate))
      const trend = this.determineTrend(history)

      return {
        bankName: bankId,
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