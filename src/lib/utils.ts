import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import numeral from "numeral"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting for Vietnamese Dong
export function formatCurrency(amount: number, options?: { compact?: boolean }): string {
  if (options?.compact) {
    if (amount >= 1000000000) {
      return numeral(amount / 1000000000).format('0.0') + ' tỷ ₫'
    }
    if (amount >= 1000000) {
      return numeral(amount / 1000000).format('0.0') + ' tr ₫'
    }
    if (amount >= 1000) {
      return numeral(amount / 1000).format('0.0') + ' k ₫'
    }
  }
  return numeral(amount).format('0,0') + ' ₫'
}

// Parse currency string back to number
export function parseCurrency(currency: string): number {
  return numeral(currency.replace('₫', '').trim()).value() || 0
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return numeral(value / 100).format(`0.${'0'.repeat(decimals)}%`)
}

// Format large numbers with abbreviations
export function formatLargeNumber(value: number): string {
  if (value >= 1000000000) {
    return numeral(value).format('0.0a').replace('b', ' tỷ')
  }
  if (value >= 1000000) {
    return numeral(value).format('0.0a').replace('m', ' triệu')
  }
  if (value >= 1000) {
    return numeral(value).format('0.0a').replace('k', ' nghìn')
  }
  return numeral(value).format('0,0')
}

// Calculate loan payment using standard formula
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) {
    return principal / termMonths
  }
  
  const monthlyRate = annualRate / 100 / 12
  const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / 
                 (Math.pow(1 + monthlyRate, termMonths) - 1)
  
  return Math.round(payment)
}

// Calculate debt-to-income ratio
export function calculateDebtToIncomeRatio(
  monthlyDebtPayments: number,
  monthlyIncome: number
): number {
  return (monthlyDebtPayments / monthlyIncome) * 100
}

// Validate Vietnamese phone number
export function isValidVietnamesePhone(phone: string): boolean {
  const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Format Vietnamese phone number
export function formatVietnamesePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('84')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  return phone
}
