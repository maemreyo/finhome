// src/lib/financial/calculations.ts
// Core financial calculation engine for FinHome

export interface LoanParameters {
  principal: number
  annualRate: number
  termMonths: number
  gracePeriodMonths?: number
  promotionalRate?: number
  promotionalPeriodMonths?: number
}

export interface PaymentScheduleItem {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
  cumulativeInterest: number
  rate: number
}

export interface CashFlowProjection {
  month: number
  date: Date
  principalPayment: number
  interestPayment: number
  totalPayment: number
  remainingBalance: number
  rentalIncome: number
  propertyExpenses: number
  netCashFlow: number
  cumulativeCashFlow: number
  propertyValue: number
  equityPosition: number
}

export interface FinancialMetrics {
  monthlyPayment: number
  totalInterest: number
  totalPayments: number
  payoffDate: Date
  debtToIncomeRatio: number
  affordabilityScore: number
  roi?: number // For investment properties
  paybackPeriod?: number // In months
}

/**
 * Calculate monthly payment for a loan with Vietnamese banking specifics
 */
export function calculateMonthlyPayment(params: LoanParameters): number {
  const { principal, annualRate, termMonths } = params
  
  if (annualRate === 0) {
    return Math.round(principal / termMonths)
  }
  
  const monthlyRate = annualRate / 100 / 12
  const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / 
                 (Math.pow(1 + monthlyRate, termMonths) - 1)
  
  return Math.round(payment)
}

/**
 * Calculate monthly payment for Vietnamese loan with promotional periods
 */
export function calculateVietnameseLoanPayment(params: LoanParameters): {
  promotionalPayment: number
  regularPayment: number
  totalInterest: number
} {
  const { 
    principal, 
    annualRate, 
    termMonths, 
    gracePeriodMonths = 0,
    promotionalRate,
    promotionalPeriodMonths = 0 
  } = params

  let promotionalPayment = 0
  let regularPayment = 0
  let totalInterest = 0

  if (promotionalRate && promotionalPeriodMonths > 0) {
    // Phase 1: Promotional period payment
    promotionalPayment = calculateMonthlyPayment({
      principal,
      annualRate: promotionalRate,
      termMonths
    })

    // Calculate remaining balance after promotional period
    const remainingBalance = calculateRemainingBalance(
      principal,
      promotionalRate / 100 / 12,
      promotionalPeriodMonths,
      promotionalPayment
    )

    // Phase 2: Regular rate payment for remaining term
    const remainingMonths = termMonths - promotionalPeriodMonths
    regularPayment = calculateMonthlyPayment({
      principal: remainingBalance,
      annualRate,
      termMonths: remainingMonths
    })

    // Calculate total interest
    const promoInterest = (promotionalPayment * promotionalPeriodMonths) - 
                         (principal - remainingBalance)
    const regularInterest = (regularPayment * remainingMonths) - remainingBalance
    totalInterest = promoInterest + regularInterest
  } else {
    // No promotional rate
    regularPayment = calculateMonthlyPayment(params)
    totalInterest = (regularPayment * termMonths) - principal
  }

  return {
    promotionalPayment: Math.round(promotionalPayment),
    regularPayment: Math.round(regularPayment),
    totalInterest: Math.round(totalInterest)
  }
}

/**
 * Calculate remaining loan balance after a number of payments
 */
export function calculateRemainingBalance(
  principal: number,
  monthlyRate: number,
  monthsPaid: number,
  monthlyPayment: number
): number {
  if (monthlyRate === 0) {
    return Math.max(0, principal - (monthlyPayment * monthsPaid))
  }

  const balance = principal * Math.pow(1 + monthlyRate, monthsPaid) - 
                 monthlyPayment * (Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate

  return Math.max(0, Math.round(balance))
}

/**
 * Generate complete payment schedule for a loan
 */
export function generatePaymentSchedule(params: LoanParameters): PaymentScheduleItem[] {
  const { 
    principal, 
    annualRate, 
    termMonths, 
    promotionalRate,
    promotionalPeriodMonths = 0 
  } = params

  const schedule: PaymentScheduleItem[] = []
  let balance = principal
  let cumulativeInterest = 0

  for (let month = 1; month <= termMonths; month++) {
    const isPromotionalPeriod = promotionalRate && month <= promotionalPeriodMonths
    const currentRate = isPromotionalPeriod ? promotionalRate! : annualRate
    const monthlyRate = currentRate / 100 / 12

    // Calculate payment for this period
    const remainingMonths = termMonths - month + 1
    const payment = calculateMonthlyPayment({
      principal: balance,
      annualRate: currentRate,
      termMonths: remainingMonths
    })

    // For the last payment, adjust to pay off exactly
    const interest = Math.round(balance * monthlyRate)
    const principal_payment = month === termMonths ? balance : Math.round(payment - interest)
    
    balance -= principal_payment
    cumulativeInterest += interest

    schedule.push({
      month,
      payment: principal_payment + interest,
      principal: principal_payment,
      interest,
      balance: Math.max(0, balance),
      cumulativeInterest,
      rate: currentRate
    })

    if (balance <= 0) break
  }

  return schedule
}

/**
 * Calculate cash flow projections including rental income and expenses
 */
export function calculateCashFlowProjections(
  loanParams: LoanParameters,
  personalFinances: {
    monthlyIncome: number
    monthlyExpenses: number
  },
  investmentParams?: {
    expectedRentalIncome: number
    propertyExpenses: number
    appreciationRate: number
    initialPropertyValue: number
  }
): CashFlowProjection[] {
  const schedule = generatePaymentSchedule(loanParams)
  const projections: CashFlowProjection[] = []
  let cumulativeCashFlow = 0
  const startDate = new Date()

  schedule.forEach((payment, index) => {
    const month = index + 1
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)

    const rentalIncome = investmentParams?.expectedRentalIncome || 0
    const propertyExpenses = investmentParams?.propertyExpenses || 0
    
    // Calculate property value with appreciation
    const propertyValue = investmentParams ? 
      investmentParams.initialPropertyValue * Math.pow(
        1 + (investmentParams.appreciationRate / 100 / 12), 
        month
      ) : 0

    const netCashFlow = personalFinances.monthlyIncome - personalFinances.monthlyExpenses - 
                       payment.payment + rentalIncome - propertyExpenses
    
    cumulativeCashFlow += netCashFlow

    const equityPosition = propertyValue - payment.balance

    projections.push({
      month,
      date,
      principalPayment: payment.principal,
      interestPayment: payment.interest,
      totalPayment: payment.payment,
      remainingBalance: payment.balance,
      rentalIncome,
      propertyExpenses,
      netCashFlow: Math.round(netCashFlow),
      cumulativeCashFlow: Math.round(cumulativeCashFlow),
      propertyValue: Math.round(propertyValue),
      equityPosition: Math.round(equityPosition)
    })
  })

  return projections
}

/**
 * Calculate key financial metrics
 */
export function calculateFinancialMetrics(
  loanParams: LoanParameters,
  personalFinances: {
    monthlyIncome: number
    monthlyExpenses: number
  },
  investmentParams?: {
    expectedRentalIncome: number
    propertyExpenses: number
    appreciationRate: number
    initialPropertyValue: number
  }
): FinancialMetrics {
  const { promotionalPayment, regularPayment, totalInterest } = 
    calculateVietnameseLoanPayment(loanParams)
  
  const monthlyPayment = regularPayment
  const totalPayments = loanParams.principal + totalInterest
  
  // Calculate payoff date
  const payoffDate = new Date()
  payoffDate.setMonth(payoffDate.getMonth() + loanParams.termMonths)
  
  // Debt-to-income ratio
  const debtToIncomeRatio = (monthlyPayment / personalFinances.monthlyIncome) * 100
  
  // Affordability score (1-10 scale)
  const netIncome = personalFinances.monthlyIncome - personalFinances.monthlyExpenses
  const paymentRatio = monthlyPayment / netIncome
  let affordabilityScore = 10
  
  if (paymentRatio > 0.8) affordabilityScore = 1
  else if (paymentRatio > 0.6) affordabilityScore = 3
  else if (paymentRatio > 0.4) affordabilityScore = 5
  else if (paymentRatio > 0.3) affordabilityScore = 7
  else if (paymentRatio > 0.2) affordabilityScore = 8
  
  let roi: number | undefined
  let paybackPeriod: number | undefined
  
  if (investmentParams) {
    // Calculate ROI for investment properties
    const annualRentalIncome = investmentParams.expectedRentalIncome * 12
    const annualExpenses = investmentParams.propertyExpenses * 12
    const netAnnualIncome = annualRentalIncome - annualExpenses - (monthlyPayment * 12)
    const totalInvestment = loanParams.principal - (loanParams.principal - 
      (investmentParams.initialPropertyValue - loanParams.principal)) // Down payment + costs
    
    roi = (netAnnualIncome / totalInvestment) * 100
    
    // Calculate payback period
    if (netAnnualIncome > 0) {
      paybackPeriod = Math.round((totalInvestment / (netAnnualIncome / 12)))
    }
  }

  return {
    monthlyPayment,
    totalInterest,
    totalPayments,
    payoffDate,
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
    affordabilityScore,
    roi: roi ? Math.round(roi * 100) / 100 : undefined,
    paybackPeriod
  }
}

/**
 * Calculate prepayment impact
 */
export function calculatePrepaymentImpact(
  currentParams: LoanParameters,
  prepaymentAmount: number,
  prepaymentMonth: number
): {
  newSchedule: PaymentScheduleItem[]
  interestSaved: number
  monthsSaved: number
  newPayoffDate: Date
} {
  // Original schedule
  const originalSchedule = generatePaymentSchedule(currentParams)
  const originalInterest = originalSchedule.reduce((sum, item) => sum + item.interest, 0)
  
  // Find balance at prepayment month
  const balanceAtPrepayment = originalSchedule[prepaymentMonth - 1]?.balance || 0
  const newPrincipal = Math.max(0, balanceAtPrepayment - prepaymentAmount)
  
  // Calculate new schedule from prepayment point
  const remainingMonths = currentParams.termMonths - prepaymentMonth
  const newParams: LoanParameters = {
    ...currentParams,
    principal: newPrincipal,
    termMonths: remainingMonths
  }
  
  const newScheduleFromPrepayment = generatePaymentSchedule(newParams)
  
  // Combine original schedule up to prepayment with new schedule
  const newSchedule: PaymentScheduleItem[] = [
    ...originalSchedule.slice(0, prepaymentMonth),
    ...newScheduleFromPrepayment.map((item, index) => ({
      ...item,
      month: prepaymentMonth + 1 + index
    }))
  ]
  
  const newTotalInterest = newSchedule.reduce((sum, item) => sum + item.interest, 0)
  const interestSaved = originalInterest - newTotalInterest
  const monthsSaved = originalSchedule.length - newSchedule.length
  
  const newPayoffDate = new Date()
  newPayoffDate.setMonth(newPayoffDate.getMonth() + newSchedule.length)
  
  return {
    newSchedule,
    interestSaved: Math.round(interestSaved),
    monthsSaved,
    newPayoffDate
  }
}

/**
 * Stress test the financial plan
 */
export function stressTestPlan(
  loanParams: LoanParameters,
  personalFinances: {
    monthlyIncome: number
    monthlyExpenses: number
  },
  stressFactors: {
    interestRateIncrease?: number // percentage points
    incomeReduction?: number // percentage
    expenseIncrease?: number // percentage
    rentalVacancy?: number // months per year
  }
): {
  baseScenario: FinancialMetrics
  stressedScenario: FinancialMetrics
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
} {
  // Base scenario
  const baseMetrics = calculateFinancialMetrics(loanParams, personalFinances)
  
  // Stressed scenario
  const stressedLoanParams: LoanParameters = {
    ...loanParams,
    annualRate: loanParams.annualRate + (stressFactors.interestRateIncrease || 0)
  }
  
  const stressedFinances = {
    monthlyIncome: personalFinances.monthlyIncome * (1 - (stressFactors.incomeReduction || 0) / 100),
    monthlyExpenses: personalFinances.monthlyExpenses * (1 + (stressFactors.expenseIncrease || 0) / 100)
  }
  
  const stressedMetrics = calculateFinancialMetrics(stressedLoanParams, stressedFinances)
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  const recommendations: string[] = []
  
  if (stressedMetrics.debtToIncomeRatio > 50) {
    riskLevel = 'high'
    recommendations.push('Tỷ lệ nợ trên thu nhập quá cao trong điều kiện căng thẳng')
    recommendations.push('Cân nhắc giảm số tiền vay hoặc tăng thu nhập')
  } else if (stressedMetrics.debtToIncomeRatio > 35) {
    riskLevel = 'medium'
    recommendations.push('Cần có kế hoạch dự phòng cho các tình huống khó khăn')
  }
  
  if (stressedMetrics.affordabilityScore < 5) {
    riskLevel = riskLevel === 'high' ? 'high' : 'medium'
    recommendations.push('Cần tăng cường dự trữ khẩn cấp')
  }
  
  return {
    baseScenario: baseMetrics,
    stressedScenario: stressedMetrics,
    riskLevel,
    recommendations
  }
}

/**
 * Calculate optimal loan structure
 */
export function optimizeLoanStructure(
  propertyPrice: number,
  availableDownPayment: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  availableRates: Array<{
    bank: string
    promotionalRate: number
    regularRate: number
    termYears: number
    minDownPaymentPercent: number
  }>
): Array<{
  bank: string
  recommendation: string
  loanAmount: number
  downPayment: number
  monthlyPayment: number
  totalCost: number
  affordabilityScore: number
  pros: string[]
  cons: string[]
}> {
  const recommendations: Array<{
    bank: string
    recommendation: string
    loanAmount: number
    downPayment: number
    monthlyPayment: number
    totalCost: number
    affordabilityScore: number
    pros: string[]
    cons: string[]
  }> = []

  availableRates.forEach(rate => {
    const minDownPayment = propertyPrice * (rate.minDownPaymentPercent / 100)
    const downPayment = Math.max(minDownPayment, availableDownPayment)
    const loanAmount = propertyPrice - downPayment
    
    if (loanAmount <= 0) return // Skip if no loan needed
    
    const loanParams: LoanParameters = {
      principal: loanAmount,
      annualRate: rate.regularRate,
      termMonths: rate.termYears * 12,
      promotionalRate: rate.promotionalRate,
      promotionalPeriodMonths: 24 // Assume 2 years promotional period
    }
    
    const { regularPayment, totalInterest } = calculateVietnameseLoanPayment(loanParams)
    const metrics = calculateFinancialMetrics(loanParams, { monthlyIncome, monthlyExpenses })
    
    const pros: string[] = []
    const cons: string[] = []
    
    // Analyze pros and cons
    if (rate.promotionalRate < 8) {
      pros.push(`Lãi suất ưu đãi thấp ${rate.promotionalRate}%`)
    }
    
    if (metrics.debtToIncomeRatio < 30) {
      pros.push('Tỷ lệ nợ trên thu nhập an toàn')
    } else if (metrics.debtToIncomeRatio > 40) {
      cons.push('Tỷ lệ nợ trên thu nhập cao')
    }
    
    if (metrics.affordabilityScore >= 7) {
      pros.push('Khả năng chi trả tốt')
    } else if (metrics.affordabilityScore < 5) {
      cons.push('Khả năng chi trả hạn chế')
    }
    
    if (rate.termYears <= 20) {
      pros.push('Thời gian vay ngắn, tiết kiệm lãi')
    } else {
      cons.push('Thời gian vay dài')
    }
    
    let recommendation = 'Phù hợp'
    if (metrics.affordabilityScore >= 8 && metrics.debtToIncomeRatio < 30) {
      recommendation = 'Rất phù hợp'
    } else if (metrics.affordabilityScore < 5 || metrics.debtToIncomeRatio > 50) {
      recommendation = 'Không khuyến nghị'
    } else if (metrics.affordabilityScore < 7 || metrics.debtToIncomeRatio > 40) {
      recommendation = 'Cần cân nhắc'
    }
    
    recommendations.push({
      bank: rate.bank,
      recommendation,
      loanAmount,
      downPayment,
      monthlyPayment: regularPayment,
      totalCost: loanAmount + totalInterest,
      affordabilityScore: metrics.affordabilityScore,
      pros,
      cons
    })
  })
  
  // Sort by affordability score and total cost
  return recommendations.sort((a, b) => {
    if (a.affordabilityScore !== b.affordabilityScore) {
      return b.affordabilityScore - a.affordabilityScore
    }
    return a.totalCost - b.totalCost
  })
}