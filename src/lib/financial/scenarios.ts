// src/lib/financial/scenarios.ts
// Scenario modeling engine for financial planning

import { 
  LoanParameters, 
  CashFlowProjection, 
  FinancialMetrics,
  calculateFinancialMetrics,
  calculateCashFlowProjections,
  stressTestPlan
} from './calculations'

export interface ScenarioDefinition {
  id: string
  name: string
  type: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'
  description: string
  parameters: ScenarioParameters
  assumptions: ScenarioAssumptions
}

export interface ScenarioParameters {
  // Loan modifications
  loanAmount?: number
  interestRate?: number
  loanTermYears?: number
  downPayment?: number
  
  // Income/expense modifications
  monthlyIncomeChange?: number // absolute change
  monthlyExpenseChange?: number // absolute change
  
  // Investment parameters
  rentalIncomeChange?: number
  propertyExpenseChange?: number
  appreciationRateChange?: number
  
  // One-time events
  prepayments?: Array<{
    month: number
    amount: number
  }>
  
  // Market conditions
  interestRateChanges?: Array<{
    month: number
    newRate: number
  }>
}

export interface ScenarioAssumptions {
  economicGrowth?: number // annual %
  inflationRate?: number // annual %
  propertyMarketTrend?: 'bull' | 'bear' | 'stable'
  personalCareerGrowth?: number // annual income increase %
  emergencyFundMonths?: number
  additionalInvestments?: boolean
}

export interface ScenarioResults {
  scenario: ScenarioDefinition
  metrics: FinancialMetrics
  cashFlowProjections: CashFlowProjection[]
  keyInsights: string[]
  riskFactors: string[]
  opportunities: string[]
  comparisonToBaseline?: ScenarioComparison
}

export interface ScenarioComparison {
  monthlySavings: number
  totalInterestDifference: number
  payoffTimeDifference: number // months
  netWorthDifference: number
  affordabilityScoreDifference: number
}

export class ScenarioEngine {
  private baselineScenario: ScenarioDefinition
  private baseLoanParams: LoanParameters
  private basePersonalFinances: { monthlyIncome: number; monthlyExpenses: number }
  private baseInvestmentParams?: {
    expectedRentalIncome: number
    propertyExpenses: number
    appreciationRate: number
    initialPropertyValue: number
  }

  constructor(
    baselineScenario: ScenarioDefinition,
    baseLoanParams: LoanParameters,
    basePersonalFinances: { monthlyIncome: number; monthlyExpenses: number },
    baseInvestmentParams?: {
      expectedRentalIncome: number
      propertyExpenses: number
      appreciationRate: number
      initialPropertyValue: number
    }
  ) {
    this.baselineScenario = baselineScenario
    this.baseLoanParams = baseLoanParams
    this.basePersonalFinances = basePersonalFinances
    this.baseInvestmentParams = baseInvestmentParams
  }

  /**
   * Generate a scenario based on parameters
   */
  generateScenario(scenarioDefinition: ScenarioDefinition): ScenarioResults {
    const { parameters, assumptions } = scenarioDefinition
    
    // Apply parameter changes to base scenario
    const modifiedLoanParams = this.applyLoanModifications(parameters)
    const modifiedPersonalFinances = this.applyPersonalFinanceModifications(parameters)
    const modifiedInvestmentParams = this.applyInvestmentModifications(parameters)
    
    // Calculate metrics
    const metrics = calculateFinancialMetrics(
      modifiedLoanParams,
      modifiedPersonalFinances,
      modifiedInvestmentParams
    )
    
    // Generate cash flow projections
    const cashFlowProjections = calculateCashFlowProjections(
      modifiedLoanParams,
      modifiedPersonalFinances,
      modifiedInvestmentParams
    )
    
    // Apply dynamic changes (prepayments, rate changes)
    const adjustedProjections = this.applyDynamicChanges(cashFlowProjections, parameters)
    
    // Generate insights
    const insights = this.generateInsights(scenarioDefinition, metrics, adjustedProjections)
    const riskFactors = this.identifyRiskFactors(scenarioDefinition, metrics, adjustedProjections)
    const opportunities = this.identifyOpportunities(scenarioDefinition, metrics, adjustedProjections)
    
    // Compare to baseline if not baseline
    let comparisonToBaseline: ScenarioComparison | undefined
    if (scenarioDefinition.type !== 'baseline') {
      comparisonToBaseline = this.compareToBaseline(metrics, adjustedProjections)
    }
    
    return {
      scenario: scenarioDefinition,
      metrics,
      cashFlowProjections: adjustedProjections,
      keyInsights: insights,
      riskFactors,
      opportunities,
      comparisonToBaseline
    }
  }

  /**
   * Generate multiple predefined scenarios
   */
  generatePredefinedScenarios(): ScenarioResults[] {
    const scenarios: ScenarioDefinition[] = [
      this.createOptimisticScenario(),
      this.createPessimisticScenario(),
      this.createEarlyPayoffScenario(),
      this.createMarketCrashScenario(),
      this.createCareerGrowthScenario()
    ]
    
    return scenarios.map(scenario => this.generateScenario(scenario))
  }

  /**
   * Create optimistic scenario
   */
  private createOptimisticScenario(): ScenarioDefinition {
    return {
      id: 'optimistic',
      name: 'Kịch bản lạc quan',
      type: 'optimistic',
      description: 'Thu nhập tăng trưởng tốt, thị trường bất động sản phát triển mạnh',
      parameters: {
        monthlyIncomeChange: this.basePersonalFinances.monthlyIncome * 0.05, // 5% increase
        rentalIncomeChange: this.baseInvestmentParams ? 
          this.baseInvestmentParams.expectedRentalIncome * 0.1 : 0, // 10% increase
        appreciationRateChange: 2 // +2% appreciation
      },
      assumptions: {
        economicGrowth: 7,
        inflationRate: 3,
        propertyMarketTrend: 'bull',
        personalCareerGrowth: 8,
        emergencyFundMonths: 6,
        additionalInvestments: true
      }
    }
  }

  /**
   * Create pessimistic scenario
   */
  private createPessimisticScenario(): ScenarioDefinition {
    return {
      id: 'pessimistic',
      name: 'Kịch bản bi quan',
      type: 'pessimistic',
      description: 'Suy thoái kinh tế, thu nhập giảm, lãi suất tăng',
      parameters: {
        monthlyIncomeChange: -this.basePersonalFinances.monthlyIncome * 0.15, // 15% decrease
        monthlyExpenseChange: this.basePersonalFinances.monthlyExpenses * 0.1, // 10% increase
        interestRate: this.baseLoanParams.annualRate + 2, // +2% interest rate
        rentalIncomeChange: this.baseInvestmentParams ? 
          -this.baseInvestmentParams.expectedRentalIncome * 0.2 : 0, // 20% decrease
        appreciationRateChange: -3 // -3% appreciation (depreciation)
      },
      assumptions: {
        economicGrowth: -2,
        inflationRate: 6,
        propertyMarketTrend: 'bear',
        personalCareerGrowth: -5,
        emergencyFundMonths: 12,
        additionalInvestments: false
      }
    }
  }

  /**
   * Create early payoff scenario
   */
  private createEarlyPayoffScenario(): ScenarioDefinition {
    const extraPayment = this.basePersonalFinances.monthlyIncome * 0.1 // 10% of income
    const prepayments: Array<{ month: number; amount: number }> = []
    
    // Add annual prepayments
    for (let year = 1; year <= 10; year++) {
      prepayments.push({
        month: year * 12,
        amount: extraPayment * 12 // Annual bonus payment
      })
    }

    return {
      id: 'early_payoff',
      name: 'Kịch bản trả nợ sớm',
      type: 'alternative',
      description: 'Trả thêm 10% thu nhập mỗi tháng và thưởng cuối năm',
      parameters: {
        prepayments
      },
      assumptions: {
        economicGrowth: 5,
        inflationRate: 4,
        propertyMarketTrend: 'stable',
        personalCareerGrowth: 5,
        emergencyFundMonths: 8,
        additionalInvestments: false
      }
    }
  }

  /**
   * Create market crash scenario
   */
  private createMarketCrashScenario(): ScenarioDefinition {
    return {
      id: 'market_crash',
      name: 'Kịch bản khủng hoảng',
      type: 'stress_test',
      description: 'Khủng hoảng tài chính, giá bất động sản giảm mạnh',
      parameters: {
        monthlyIncomeChange: -this.basePersonalFinances.monthlyIncome * 0.3, // 30% income loss
        interestRate: this.baseLoanParams.annualRate + 3, // +3% interest
        rentalIncomeChange: this.baseInvestmentParams ? 
          -this.baseInvestmentParams.expectedRentalIncome * 0.4 : 0, // 40% rental loss
        appreciationRateChange: -15 // 15% property value drop
      },
      assumptions: {
        economicGrowth: -5,
        inflationRate: 8,
        propertyMarketTrend: 'bear',
        personalCareerGrowth: -20,
        emergencyFundMonths: 18,
        additionalInvestments: false
      }
    }
  }

  /**
   * Create career growth scenario
   */
  private createCareerGrowthScenario(): ScenarioDefinition {
    return {
      id: 'career_growth',
      name: 'Kịch bản thăng tiến',
      type: 'optimistic',
      description: 'Thăng chức, thu nhập tăng đáng kể sau 3 năm',
      parameters: {
        monthlyIncomeChange: this.basePersonalFinances.monthlyIncome * 0.5, // 50% increase after promotion
        monthlyExpenseChange: this.basePersonalFinances.monthlyExpenses * 0.2, // Lifestyle inflation
      },
      assumptions: {
        economicGrowth: 6,
        inflationRate: 4,
        propertyMarketTrend: 'stable',
        personalCareerGrowth: 15,
        emergencyFundMonths: 9,
        additionalInvestments: true
      }
    }
  }

  /**
   * Apply loan parameter modifications
   */
  private applyLoanModifications(parameters: ScenarioParameters): LoanParameters {
    return {
      ...this.baseLoanParams,
      principal: parameters.loanAmount || this.baseLoanParams.principal,
      annualRate: parameters.interestRate || this.baseLoanParams.annualRate,
      termMonths: parameters.loanTermYears ? 
        parameters.loanTermYears * 12 : this.baseLoanParams.termMonths
    }
  }

  /**
   * Apply personal finance modifications
   */
  private applyPersonalFinanceModifications(parameters: ScenarioParameters): {
    monthlyIncome: number
    monthlyExpenses: number
  } {
    return {
      monthlyIncome: this.basePersonalFinances.monthlyIncome + 
        (parameters.monthlyIncomeChange || 0),
      monthlyExpenses: this.basePersonalFinances.monthlyExpenses + 
        (parameters.monthlyExpenseChange || 0)
    }
  }

  /**
   * Apply investment parameter modifications
   */
  private applyInvestmentModifications(parameters: ScenarioParameters) {
    if (!this.baseInvestmentParams) return undefined

    return {
      ...this.baseInvestmentParams,
      expectedRentalIncome: this.baseInvestmentParams.expectedRentalIncome + 
        (parameters.rentalIncomeChange || 0),
      propertyExpenses: this.baseInvestmentParams.propertyExpenses + 
        (parameters.propertyExpenseChange || 0),
      appreciationRate: this.baseInvestmentParams.appreciationRate + 
        (parameters.appreciationRateChange || 0)
    }
  }

  /**
   * Apply dynamic changes to cash flow projections
   */
  private applyDynamicChanges(
    projections: CashFlowProjection[], 
    parameters: ScenarioParameters
  ): CashFlowProjection[] {
    let modifiedProjections = [...projections]

    // Apply prepayments
    if (parameters.prepayments) {
      parameters.prepayments.forEach(prepayment => {
        const targetMonth = modifiedProjections.find(p => p.month === prepayment.month)
        if (targetMonth) {
          targetMonth.remainingBalance = Math.max(0, 
            targetMonth.remainingBalance - prepayment.amount)
          targetMonth.netCashFlow -= prepayment.amount
          targetMonth.cumulativeCashFlow -= prepayment.amount
        }
      })
    }

    // Apply interest rate changes
    if (parameters.interestRateChanges) {
      // This would require recalculating from the point of rate change
      // For simplicity, we'll adjust the interest payments proportionally
      parameters.interestRateChanges.forEach(rateChange => {
        const changeIndex = modifiedProjections.findIndex(p => p.month >= rateChange.month)
        if (changeIndex >= 0) {
          const rateFactor = rateChange.newRate / this.baseLoanParams.annualRate
          for (let i = changeIndex; i < modifiedProjections.length; i++) {
            modifiedProjections[i].interestPayment *= rateFactor
            modifiedProjections[i].totalPayment = 
              modifiedProjections[i].principalPayment + modifiedProjections[i].interestPayment
          }
        }
      })
    }

    return modifiedProjections
  }

  /**
   * Generate insights for a scenario
   */
  private generateInsights(
    scenario: ScenarioDefinition,
    metrics: FinancialMetrics,
    projections: CashFlowProjection[]
  ): string[] {
    const insights: string[] = []

    // Monthly payment insight
    if (metrics.monthlyPayment > this.basePersonalFinances.monthlyIncome * 0.3) {
      insights.push(`Trả góp hàng tháng chiếm ${Math.round(metrics.debtToIncomeRatio)}% thu nhập`)
    }

    // Cash flow insight
    const negativeCashFlowMonths = projections.filter(p => p.netCashFlow < 0).length
    if (negativeCashFlowMonths > 0) {
      insights.push(`${negativeCashFlowMonths} tháng có dòng tiền âm trong kế hoạch`)
    }

    // Affordability insight
    if (metrics.affordabilityScore >= 8) {
      insights.push('Khả năng chi trả rất tốt, có thể cân nhắc đầu tư thêm')
    } else if (metrics.affordabilityScore < 5) {
      insights.push('Khả năng chi trả hạn chế, cần xem xét lại kế hoạch')
    }

    // ROI insight for investment properties
    if (metrics.roi) {
      if (metrics.roi > 8) {
        insights.push(`ROI ${metrics.roi}% rất hấp dẫn so với lãi suất ngân hàng`)
      } else if (metrics.roi < 5) {
        insights.push(`ROI ${metrics.roi}% thấp, cân nhắc các kênh đầu tư khác`)
      }
    }

    return insights
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(
    scenario: ScenarioDefinition,
    metrics: FinancialMetrics,
    projections: CashFlowProjection[]
  ): string[] {
    const risks: string[] = []

    if (metrics.debtToIncomeRatio > 40) {
      risks.push('Tỷ lệ nợ trên thu nhập cao (>40%)')
    }

    if (metrics.affordabilityScore < 5) {
      risks.push('Điểm khả năng chi trả thấp')
    }

    const maxNegativeCashFlow = Math.min(...projections.map(p => p.netCashFlow))
    if (maxNegativeCashFlow < -5000000) { // 5M VND negative
      risks.push('Dòng tiền âm lớn trong một số tháng')
    }

    if (scenario.assumptions?.propertyMarketTrend === 'bear') {
      risks.push('Thị trường bất động sản suy thoái')
    }

    return risks
  }

  /**
   * Identify opportunities
   */
  private identifyOpportunities(
    scenario: ScenarioDefinition,
    metrics: FinancialMetrics,
    projections: CashFlowProjection[]
  ): string[] {
    const opportunities: string[] = []

    if (metrics.affordabilityScore >= 8) {
      opportunities.push('Có thể trả thêm để giảm lãi suất')
    }

    const avgPositiveCashFlow = projections
      .filter(p => p.netCashFlow > 0)
      .reduce((sum, p) => sum + p.netCashFlow, 0) / 
      projections.filter(p => p.netCashFlow > 0).length

    if (avgPositiveCashFlow > 5000000) { // 5M VND positive
      opportunities.push('Dòng tiền dương tốt, có thể đầu tư thêm')
    }

    if (metrics.roi && metrics.roi > 10) {
      opportunities.push('ROI cao, cân nhắc mở rộng danh mục đầu tư')
    }

    if (scenario.assumptions?.personalCareerGrowth && scenario.assumptions.personalCareerGrowth > 10) {
      opportunities.push('Triển vọng thăng tiến tốt, có thể vay thêm')
    }

    return opportunities
  }

  /**
   * Compare scenario to baseline
   */
  private compareToBaseline(
    metrics: FinancialMetrics,
    projections: CashFlowProjection[]
  ): ScenarioComparison {
    // Calculate baseline metrics for comparison
    const baselineMetrics = calculateFinancialMetrics(
      this.baseLoanParams,
      this.basePersonalFinances,
      this.baseInvestmentParams
    )

    const baselineProjections = calculateCashFlowProjections(
      this.baseLoanParams,
      this.basePersonalFinances,
      this.baseInvestmentParams
    )

    return {
      monthlySavings: baselineMetrics.monthlyPayment - metrics.monthlyPayment,
      totalInterestDifference: baselineMetrics.totalInterest - metrics.totalInterest,
      payoffTimeDifference: 
        (baselineMetrics.payoffDate.getTime() - metrics.payoffDate.getTime()) / 
        (1000 * 60 * 60 * 24 * 30), // Convert to months
      netWorthDifference: 
        projections[projections.length - 1]?.equityPosition - 
        baselineProjections[baselineProjections.length - 1]?.equityPosition,
      affordabilityScoreDifference: metrics.affordabilityScore - baselineMetrics.affordabilityScore
    }
  }
}