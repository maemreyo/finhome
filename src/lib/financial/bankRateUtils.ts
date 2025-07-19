// src/lib/financial/bankRateUtils.ts
// Utilities for getting optimal bank rates for financial calculations

import { createClient } from '@/lib/supabase/server'
import { type LoanParameters } from '@/lib/financial/calculations'

export interface BankRateOption {
  bankId: string
  bankName: string
  bankCode: string
  interestRate: number
  promotionalRate?: number
  promotionalPeriodMonths?: number
  maxLtvRatio?: number
  processingFee?: number
  minAmount?: number
  maxAmount?: number
  minTermMonths?: number
  maxTermMonths?: number
}

export interface OptimalRateResult {
  bestRate: BankRateOption
  alternativeRates: BankRateOption[]
  marketAverage: number
  recommendations: {
    rate: BankRateOption
    reason: string
    savings?: number
  }[]
}

/**
 * Get optimal bank rate for a specific loan scenario
 */
export async function getOptimalBankRate(
  loanAmount: number,
  termMonths: number,
  loanType: 'home_purchase' | 'investment' | 'upgrade' | 'refinance',
  downPaymentRatio?: number
): Promise<OptimalRateResult | null> {
  try {
    const supabase = await createClient()

    // Query bank rates that match the loan criteria
    const { data: rates, error } = await supabase
      .from('bank_interest_rates')
      .select(`
        *,
        banks!inner (
          id,
          bank_code,
          bank_name,
          bank_name_en,
          logo_url,
          is_active
        )
      `)
      .eq('loan_type', loanType)
      .eq('is_active', true)
      .eq('banks.is_active', true)
      .lte('min_loan_amount', loanAmount)
      .gte('max_loan_amount', loanAmount)
      .lte('min_term_months', termMonths)
      .gte('max_term_months', termMonths)
      .order('interest_rate', { ascending: true })

    if (error || !rates || rates.length === 0) {
      console.warn('No bank rates found for criteria, using default rates')
      return null
    }

    // Transform database rates to our format
    const bankRateOptions: BankRateOption[] = rates.map(rate => ({
      bankId: rate.bank_id,
      bankName: rate.banks.bank_name,
      bankCode: rate.banks.bank_code,
      interestRate: rate.interest_rate,
      promotionalRate: rate.promotional_rate || undefined,
      promotionalPeriodMonths: rate.promotional_period_months || undefined,
      maxLtvRatio: rate.max_ltv_ratio || undefined,
      processingFee: rate.processing_fee || undefined,
      minAmount: rate.min_loan_amount || undefined,
      maxAmount: rate.max_loan_amount || undefined,
      minTermMonths: rate.min_term_months || undefined,
      maxTermMonths: rate.max_term_months || undefined
    }))

    // Find the best rate (lowest interest rate)
    const bestRate = bankRateOptions[0] // Already sorted by interest_rate ascending

    // Calculate market average
    const marketAverage = bankRateOptions.reduce((sum, rate) => sum + rate.interestRate, 0) / bankRateOptions.length

    // Generate recommendations
    const recommendations = generateRecommendations(bankRateOptions, loanAmount, termMonths)

    return {
      bestRate,
      alternativeRates: bankRateOptions.slice(1, 4), // Top 3 alternatives
      marketAverage,
      recommendations
    }

  } catch (error) {
    console.error('Error getting optimal bank rate:', error)
    return null
  }
}

/**
 * Get default rates when no database rates are available
 * Now uses more realistic current market rates for Vietnam (2024)
 */
export function getDefaultRates(loanType: string): LoanParameters {
  // Current market rates in Vietnam as of 2024
  const defaultRates = {
    home_purchase: { regular: 8.5, promotional: 7.2 },
    investment: { regular: 9.0, promotional: 7.8 },
    upgrade: { regular: 8.2, promotional: 6.9 },
    refinance: { regular: 8.0, promotional: 6.5 }
  }

  const rates = defaultRates[loanType as keyof typeof defaultRates] || defaultRates.home_purchase

  return {
    principal: 0, // Will be set by caller
    annualRate: rates.regular,
    termMonths: 240, // 20 years default
    promotionalRate: rates.promotional,
    promotionalPeriodMonths: 12 // Updated to 1 year promotional period (more realistic)
  }
}

/**
 * Convert optimal rate result to loan parameters
 */
export function bankRateToLoanParams(
  bankRate: BankRateOption,
  principal: number,
  termMonths: number = 240
): LoanParameters {
  return {
    principal,
    annualRate: bankRate.interestRate,
    termMonths,
    promotionalRate: bankRate.promotionalRate,
    promotionalPeriodMonths: bankRate.promotionalPeriodMonths
  }
}

/**
 * Generate recommendations based on available rates
 */
function generateRecommendations(
  rates: BankRateOption[],
  loanAmount: number,
  termMonths: number
): OptimalRateResult['recommendations'] {
  const recommendations: OptimalRateResult['recommendations'] = []

  if (rates.length === 0) return recommendations

  const bestRate = rates[0]
  const worstRate = rates[rates.length - 1]

  // Best rate recommendation
  recommendations.push({
    rate: bestRate,
    reason: `Lowest interest rate at ${bestRate.interestRate}%`,
    savings: calculateSavings(bestRate.interestRate, worstRate.interestRate, loanAmount, termMonths)
  })

  // Promotional rate recommendation
  const bestPromotional = rates.find(rate => rate.promotionalRate && rate.promotionalPeriodMonths)
  if (bestPromotional && bestPromotional.promotionalRate) {
    recommendations.push({
      rate: bestPromotional,
      reason: `Best promotional rate: ${bestPromotional.promotionalRate}% for ${bestPromotional.promotionalPeriodMonths} months`,
      savings: calculatePromotionalSavings(bestPromotional, loanAmount, termMonths)
    })
  }

  // Low fee recommendation
  const lowFee = rates.find(rate => (rate.processingFee || 0) < 1000000) // Less than 1M VND
  if (lowFee) {
    recommendations.push({
      rate: lowFee,
      reason: `Low processing fees: ${(lowFee.processingFee || 0).toLocaleString()} VND`
    })
  }

  return recommendations.slice(0, 3) // Top 3 recommendations
}

/**
 * Calculate savings between two interest rates
 */
function calculateSavings(
  lowerRate: number,
  higherRate: number,
  principal: number,
  termMonths: number
): number {
  const monthlyRateLower = lowerRate / 100 / 12
  const monthlyRateHigher = higherRate / 100 / 12

  const paymentLower = principal * monthlyRateLower * Math.pow(1 + monthlyRateLower, termMonths) / 
                      (Math.pow(1 + monthlyRateLower, termMonths) - 1)

  const paymentHigher = principal * monthlyRateHigher * Math.pow(1 + monthlyRateHigher, termMonths) / 
                       (Math.pow(1 + monthlyRateHigher, termMonths) - 1)

  const totalSavings = (paymentHigher - paymentLower) * termMonths
  return Math.round(totalSavings)
}

/**
 * Calculate savings from promotional rate
 */
function calculatePromotionalSavings(
  rate: BankRateOption,
  principal: number,
  termMonths: number
): number {
  if (!rate.promotionalRate || !rate.promotionalPeriodMonths) return 0

  const regularMonthlyRate = rate.interestRate / 100 / 12
  const promotionalMonthlyRate = rate.promotionalRate / 100 / 12

  const regularPayment = principal * regularMonthlyRate * Math.pow(1 + regularMonthlyRate, termMonths) / 
                        (Math.pow(1 + regularMonthlyRate, termMonths) - 1)

  const promotionalPayment = principal * promotionalMonthlyRate * Math.pow(1 + promotionalMonthlyRate, termMonths) / 
                            (Math.pow(1 + promotionalMonthlyRate, termMonths) - 1)

  const monthlySavings = regularPayment - promotionalPayment
  const totalPromotionalSavings = monthlySavings * rate.promotionalPeriodMonths

  return Math.round(totalPromotionalSavings)
}