// src/lib/services/scenarioService.ts
// Service for financial scenario management and analysis

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import type {
  FinancialScenario,
  ScenarioParameters,
  ScenarioComparison,
  ScenarioAnalysisResult,
  CreateScenarioRequest,
  ScenarioTimelineEvent,
  ScenarioType,
  RiskLevel
} from '@/types/scenario'
import { calculateFinancialMetrics, calculateCashFlowProjections, type LoanParameters } from '@/lib/financial/calculations'
import { generateTimelineEvents } from '@/lib/timeline/timelineUtils'
import { bankService } from './bankService'

// Database types
type FinancialPlanRow = Database['public']['Tables']['financial_plans']['Row']
type FinancialPlanInsert = Database['public']['Tables']['financial_plans']['Insert']
type FinancialPlanUpdate = Database['public']['Tables']['financial_plans']['Update']
type LoanCalculationRow = Database['public']['Tables']['loan_calculations']['Row']
type LoanCalculationInsert = Database['public']['Tables']['loan_calculations']['Insert']

export interface ScenarioFilters {
  userId?: string
  planType?: Database['public']['Enums']['plan_type_enum']
  status?: Database['public']['Enums']['plan_status']
  riskLevel?: RiskLevel
  scenarioType?: ScenarioType
  priceRange?: { min: number; max: number }
  incomeRange?: { min: number; max: number }
}

export interface ScenarioStats {
  totalScenarios: number
  activeScenarios: number
  completedScenarios: number
  averagePrice: number
  averageIncome: number
  riskDistribution: Record<RiskLevel, number>
  typeDistribution: Record<ScenarioType, number>
}

class ScenarioService {
  private supabase = createClient()

  /**
   * Get all scenarios for a user with optional filtering
   */
  async getUserScenarios(userId: string, filters?: ScenarioFilters): Promise<FinancialScenario[]> {
    let query = this.supabase
      .from('financial_plans')
      .select(`
        *,
        loan_calculations (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    // Apply filters
    if (filters?.planType) {
      query = query.eq('plan_type', filters.planType)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priceRange) {
      query = query
        .gte('purchase_price', filters.priceRange.min)
        .lte('purchase_price', filters.priceRange.max)
    }
    if (filters?.incomeRange) {
      query = query
        .gte('monthly_income', filters.incomeRange.min)
        .lte('monthly_income', filters.incomeRange.max)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error fetching user scenarios: ${error.message}`)
    }

    return (data || []).map(item => this.mapToFinancialScenario(item))
  }

  /**
   * Get a specific scenario by ID
   */
  async getScenarioById(scenarioId: string): Promise<FinancialScenario | null> {
    const { data, error } = await this.supabase
      .from('financial_plans')
      .select(`
        *,
        loan_calculations (*)
      `)
      .eq('id', scenarioId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Error fetching scenario: ${error.message}`)
    }

    return this.mapToFinancialScenario(data)
  }

  /**
   * Create a new financial scenario
   */
  async createScenario(request: CreateScenarioRequest): Promise<FinancialScenario> {
    const { userId, parameters, basePlanId } = request
    
    // Prepare the financial plan data
    const planData: FinancialPlanInsert = {
      user_id: userId,
      plan_name: parameters.planName,
      description: `${parameters.scenarioType} scenario for ${parameters.planType} planning`,
      plan_type: parameters.planType,
      status: 'draft',
      
      // Property details
      purchase_price: parameters.purchasePrice,
      down_payment: parameters.downPayment,
      additional_costs: parameters.additionalCosts,
      other_debts: parameters.otherDebts,
      
      // Personal finances
      monthly_income: parameters.monthlyIncome,
      monthly_expenses: parameters.monthlyExpenses,
      current_savings: parameters.currentSavings,
      dependents: parameters.dependents,
      
      // Investment specifics
      expected_rental_income: parameters.expectedRentalIncome || null,
      expected_appreciation_rate: parameters.expectedAppreciationRate || null,
      
      // Strategy
      risk_tolerance: parameters.riskTolerance,
      investment_horizon_months: parameters.investmentHorizonMonths || null,
      target_timeframe_months: parameters.targetTimeframeMonths || null,
      
      // Goals
      emergency_fund_target: parameters.emergencyFundTarget || null,
      
      // Initialize as public scenario for sharing
      is_public: false,
      view_count: 0,
      
      // Metadata
      recommended_adjustments: {},
      other_goals: {},
      desired_features: []
    }

    // Insert the financial plan
    const { data: planResult, error: planError } = await this.supabase
      .from('financial_plans')
      .insert(planData)
      .select()
      .single()

    if (planError) {
      throw new Error(`Error creating financial plan: ${planError.message}`)
    }

    // Create associated loan calculation
    const loanCalculationData: LoanCalculationInsert = {
      user_id: userId,
      financial_plan_id: planResult.id,
      calculation_name: `${parameters.planName} - Loan Calculation`,
      
      // Input parameters
      property_price: parameters.purchasePrice,
      down_payment_amount: parameters.downPayment,
      loan_amount: parameters.loanAmount,
      interest_rate: parameters.interestRate,
      loan_term_months: parameters.loanTermYears * 12,
      
      // Borrower info
      monthly_income: parameters.monthlyIncome,
      monthly_expenses: parameters.monthlyExpenses,
      
      // Calculate results
      ...this.calculateLoanMetrics(parameters)
    }

    const { data: calculationResult, error: calculationError } = await this.supabase
      .from('loan_calculations')
      .insert(loanCalculationData)
      .select()
      .single()

    if (calculationError) {
      throw new Error(`Error creating loan calculation: ${calculationError.message}`)
    }

    // Return the complete scenario
    return this.mapToFinancialScenario({
      ...planResult,
      loan_calculations: [calculationResult]
    })
  }

  /**
   * Update an existing scenario
   */
  async updateScenario(scenarioId: string, parameters: Partial<ScenarioParameters>): Promise<FinancialScenario> {
    const updateData: FinancialPlanUpdate = {
      updated_at: new Date().toISOString()
    }

    // Map parameters to database fields
    if (parameters.planName) updateData.plan_name = parameters.planName
    if (parameters.planType) updateData.plan_type = parameters.planType
    if (parameters.purchasePrice) updateData.purchase_price = parameters.purchasePrice
    if (parameters.downPayment) updateData.down_payment = parameters.downPayment
    if (parameters.additionalCosts) updateData.additional_costs = parameters.additionalCosts
    if (parameters.monthlyIncome) updateData.monthly_income = parameters.monthlyIncome
    if (parameters.monthlyExpenses) updateData.monthly_expenses = parameters.monthlyExpenses
    if (parameters.currentSavings) updateData.current_savings = parameters.currentSavings
    if (parameters.otherDebts) updateData.other_debts = parameters.otherDebts
    if (parameters.expectedRentalIncome) updateData.expected_rental_income = parameters.expectedRentalIncome
    if (parameters.expectedAppreciationRate) updateData.expected_appreciation_rate = parameters.expectedAppreciationRate
    if (parameters.riskTolerance) updateData.risk_tolerance = parameters.riskTolerance
    if (parameters.investmentHorizonMonths) updateData.investment_horizon_months = parameters.investmentHorizonMonths
    if (parameters.targetTimeframeMonths) updateData.target_timeframe_months = parameters.targetTimeframeMonths
    if (parameters.emergencyFundTarget) updateData.emergency_fund_target = parameters.emergencyFundTarget
    if (parameters.dependents !== undefined) updateData.dependents = parameters.dependents

    const { data, error } = await this.supabase
      .from('financial_plans')
      .update(updateData)
      .eq('id', scenarioId)
      .select(`
        *,
        loan_calculations (*)
      `)
      .single()

    if (error) {
      throw new Error(`Error updating scenario: ${error.message}`)
    }

    return this.mapToFinancialScenario(data)
  }

  /**
   * Delete a scenario
   */
  async deleteScenario(scenarioId: string): Promise<void> {
    const { error } = await this.supabase
      .from('financial_plans')
      .delete()
      .eq('id', scenarioId)

    if (error) {
      throw new Error(`Error deleting scenario: ${error.message}`)
    }
  }

  /**
   * Compare multiple scenarios
   */
  async compareScenarios(scenarioIds: string[]): Promise<ScenarioComparison> {
    const scenarios = await Promise.all(
      scenarioIds.map(id => this.getScenarioById(id))
    )

    const validScenarios = scenarios.filter(s => s !== null) as FinancialScenario[]
    
    if (validScenarios.length === 0) {
      throw new Error('No valid scenarios found for comparison')
    }

    // Find baseline scenario or use the first one
    const baselineScenario = validScenarios.find(s => s.scenarioType === 'baseline') || validScenarios[0]
    
    // Find best and worst scenarios based on total cost
    const sortedByTotalCost = validScenarios.sort((a, b) => 
      (a.calculatedMetrics?.totalCost || 0) - (b.calculatedMetrics?.totalCost || 0)
    )
    const bestScenario = sortedByTotalCost[0]
    const worstScenario = sortedByTotalCost[sortedByTotalCost.length - 1]

    // Calculate average metrics
    const averageMetrics = {
      monthlyPayment: this.calculateAverage(validScenarios, s => s.calculatedMetrics?.monthlyPayment || 0),
      totalInterest: this.calculateAverage(validScenarios, s => s.calculatedMetrics?.totalInterest || 0),
      totalCost: this.calculateAverage(validScenarios, s => s.calculatedMetrics?.totalCost || 0),
      dtiRatio: this.calculateAverage(validScenarios, s => s.calculatedMetrics?.dtiRatio || 0),
      payoffTimeMonths: this.calculateAverage(validScenarios, s => s.calculatedMetrics?.payoffTimeMonths || 0)
    }

    // Calculate risk distribution
    const riskDistribution = validScenarios.reduce((acc, scenario) => {
      acc[scenario.riskLevel] = (acc[scenario.riskLevel] || 0) + 1
      return acc
    }, {} as Record<RiskLevel, number>)

    return {
      scenarios: validScenarios,
      baselineScenario,
      bestScenario,
      worstScenario,
      averageMetrics,
      riskDistribution
    }
  }

  /**
   * Analyze a scenario and provide insights
   */
  async analyzeScenario(scenarioId: string): Promise<ScenarioAnalysisResult> {
    const scenario = await this.getScenarioById(scenarioId)
    if (!scenario) {
      throw new Error('Scenario not found')
    }

    // Calculate feasibility score
    const feasibilityScore = this.calculateFeasibilityScore(scenario)
    
    // Generate recommendations
    const recommendedAdjustments = this.generateRecommendations(scenario)
    
    // Generate insights
    const keyInsights = this.generateInsights(scenario)
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(scenario)
    
    // Identify opportunities
    const opportunities = this.identifyOpportunities(scenario)

    return {
      scenario,
      feasibilityScore,
      recommendedAdjustments,
      keyInsights,
      riskFactors,
      opportunities
    }
  }

  /**
   * Get scenario statistics for dashboard
   */
  async getScenarioStats(userId: string): Promise<ScenarioStats> {
    const { data, error } = await this.supabase
      .from('financial_plans')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Error fetching scenario stats: ${error.message}`)
    }

    const scenarios = (data || []).map(item => this.mapToFinancialScenario(item))
    
    const totalScenarios = scenarios.length
    const activeScenarios = scenarios.filter(s => s.status === 'active').length
    const completedScenarios = scenarios.filter(s => s.status === 'completed').length
    
    const averagePrice = scenarios.reduce((sum, s) => sum + (s.purchase_price || 0), 0) / totalScenarios || 0
    const averageIncome = scenarios.reduce((sum, s) => sum + (s.monthly_income || 0), 0) / totalScenarios || 0
    
    const riskDistribution = scenarios.reduce((acc, scenario) => {
      acc[scenario.riskLevel] = (acc[scenario.riskLevel] || 0) + 1
      return acc
    }, {} as Record<RiskLevel, number>)

    const typeDistribution = scenarios.reduce((acc, scenario) => {
      acc[scenario.scenarioType] = (acc[scenario.scenarioType] || 0) + 1
      return acc
    }, {} as Record<ScenarioType, number>)

    return {
      totalScenarios,
      activeScenarios,
      completedScenarios,
      averagePrice,
      averageIncome,
      riskDistribution,
      typeDistribution
    }
  }

  /**
   * Generate multiple predefined scenarios from a base scenario
   */
  async generatePredefinedScenarios(baseScenarioId: string, userId: string): Promise<FinancialScenario[]> {
    const baseScenario = await this.getScenarioById(baseScenarioId)
    if (!baseScenario) {
      throw new Error('Base scenario not found')
    }

    const scenarios: CreateScenarioRequest[] = [
      // Optimistic scenario
      {
        userId,
        basePlanId: baseScenarioId,
        parameters: {
          ...this.extractParameters(baseScenario),
          planName: `${baseScenario.plan_name} - Optimistic`,
          scenarioType: 'optimistic',
          monthlyIncome: (baseScenario.monthly_income || 0) * 1.1, // 10% income increase
          interestRate: Math.max(1, (baseScenario.loanCalculations?.[0]?.interest_rate || 8) - 1), // 1% lower rate
          expectedAppreciationRate: (baseScenario.expected_appreciation_rate || 5) + 2 // 2% higher appreciation
        }
      },
      // Pessimistic scenario
      {
        userId,
        basePlanId: baseScenarioId,
        parameters: {
          ...this.extractParameters(baseScenario),
          planName: `${baseScenario.plan_name} - Pessimistic`,
          scenarioType: 'pessimistic',
          monthlyIncome: (baseScenario.monthly_income || 0) * 0.9, // 10% income decrease
          monthlyExpenses: (baseScenario.monthly_expenses || 0) * 1.1, // 10% expense increase
          interestRate: (baseScenario.loanCalculations?.[0]?.interest_rate || 8) + 1.5, // 1.5% higher rate
          expectedAppreciationRate: Math.max(0, (baseScenario.expected_appreciation_rate || 5) - 3) // 3% lower appreciation
        }
      },
      // Alternative scenario with higher down payment
      {
        userId,
        basePlanId: baseScenarioId,
        parameters: {
          ...this.extractParameters(baseScenario),
          planName: `${baseScenario.plan_name} - Higher Down Payment`,
          scenarioType: 'alternative',
          downPayment: (baseScenario.down_payment || 0) * 1.5, // 50% higher down payment
          loanAmount: (baseScenario.purchase_price || 0) - ((baseScenario.down_payment || 0) * 1.5)
        }
      }
    ]

    const results = await Promise.all(
      scenarios.map(scenario => this.createScenario(scenario))
    )

    return results
  }

  // Private helper methods

  private mapToFinancialScenario(data: any): FinancialScenario {
    // Determine scenario type and risk level based on plan characteristics
    const scenarioType = this.determineScenarioType(data)
    const riskLevel = this.determineRiskLevel(data)
    
    // Generate calculated metrics
    const calculatedMetrics = this.generateCalculatedMetrics(data)
    
    // Generate timeline events
    const events = this.generateTimelineEvents(data)

    return {
      ...data,
      scenarioType,
      riskLevel,
      calculatedMetrics,
      events,
      loanCalculations: data.loan_calculations || []
    }
  }

  private determineScenarioType(plan: any): ScenarioType {
    // Logic to determine scenario type based on plan characteristics
    if (plan.plan_name?.toLowerCase().includes('optimistic')) return 'optimistic'
    if (plan.plan_name?.toLowerCase().includes('pessimistic')) return 'pessimistic'
    if (plan.plan_name?.toLowerCase().includes('alternative')) return 'alternative'
    if (plan.plan_name?.toLowerCase().includes('stress')) return 'stress_test'
    return 'baseline'
  }

  private determineRiskLevel(plan: any): RiskLevel {
    const dtiRatio = this.calculateDTIRatio(plan)
    const ltvRatio = this.calculateLTVRatio(plan)
    
    if (dtiRatio > 40 || ltvRatio > 85) return 'high'
    if (dtiRatio > 30 || ltvRatio > 75) return 'medium'
    return 'low'
  }

  private generateCalculatedMetrics(plan: any) {
    const loanCalculation = plan.loan_calculations?.[0]
    if (!loanCalculation) return undefined

    const monthlyPayment = loanCalculation.monthly_payment || 0
    const totalInterest = loanCalculation.total_interest || 0
    const totalCost = (plan.purchase_price || 0) + totalInterest
    const dtiRatio = this.calculateDTIRatio(plan)
    const ltvRatio = this.calculateLTVRatio(plan)
    const affordabilityScore = this.calculateAffordabilityScore(plan)
    const payoffTimeMonths = loanCalculation.loan_term_months || 0

    return {
      monthlyPayment,
      totalInterest,
      totalCost,
      dtiRatio,
      ltvRatio,
      affordabilityScore,
      payoffTimeMonths
    }
  }

  private generateTimelineEvents(plan: any): ScenarioTimelineEvent[] {
    const loanCalculation = plan.loan_calculations?.[0]
    if (!loanCalculation) return []

    return generateTimelineEvents({
      loanAmount: loanCalculation.loan_amount || 0,
      loanTermMonths: loanCalculation.loan_term_months || 240,
      promotionalPeriodMonths: 0,
      startDate: new Date()
    })
  }

  private calculateDTIRatio(plan: any): number {
    const monthlyIncome = plan.monthly_income || 0
    const loanCalculation = plan.loan_calculations?.[0]
    const monthlyPayment = loanCalculation?.monthly_payment || 0
    
    return monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0
  }

  private calculateLTVRatio(plan: any): number {
    const purchasePrice = plan.purchase_price || 0
    const loanCalculation = plan.loan_calculations?.[0]
    const loanAmount = loanCalculation?.loan_amount || 0
    
    return purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0
  }

  private calculateAffordabilityScore(plan: any): number {
    const dtiRatio = this.calculateDTIRatio(plan)
    const ltvRatio = this.calculateLTVRatio(plan)
    const currentSavings = plan.current_savings || 0
    const monthlyIncome = plan.monthly_income || 0
    const savingsToIncomeRatio = monthlyIncome > 0 ? (currentSavings / monthlyIncome) : 0
    
    let score = 10
    
    // Deduct points for high DTI
    if (dtiRatio > 40) score -= 4
    else if (dtiRatio > 30) score -= 2
    
    // Deduct points for high LTV
    if (ltvRatio > 85) score -= 3
    else if (ltvRatio > 75) score -= 1
    
    // Add points for good savings
    if (savingsToIncomeRatio > 12) score += 2
    else if (savingsToIncomeRatio > 6) score += 1
    
    return Math.max(1, Math.min(10, score))
  }

  private calculateLoanMetrics(parameters: ScenarioParameters) {
    const monthlyRate = parameters.interestRate / 100 / 12
    const numPayments = parameters.loanTermYears * 12
    
    let monthlyPayment = 0
    if (monthlyRate === 0) {
      monthlyPayment = parameters.loanAmount / numPayments
    } else {
      monthlyPayment = (parameters.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                     (Math.pow(1 + monthlyRate, numPayments) - 1)
    }
    
    const totalPayment = monthlyPayment * numPayments
    const totalInterest = totalPayment - parameters.loanAmount
    const ltvRatio = (parameters.loanAmount / parameters.purchasePrice) * 100
    const dtiRatio = (monthlyPayment / parameters.monthlyIncome) * 100

    return {
      monthly_payment: monthlyPayment,
      total_interest: totalInterest,
      total_payment: totalPayment,
      loan_to_value_ratio: ltvRatio,
      debt_to_income_ratio: dtiRatio
    }
  }

  private calculateAverage(scenarios: FinancialScenario[], getValue: (s: FinancialScenario) => number): number {
    const values = scenarios.map(getValue).filter(v => v > 0)
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
  }

  private calculateFeasibilityScore(scenario: FinancialScenario): number {
    if (!scenario.calculatedMetrics) return 0
    
    const { dtiRatio, ltvRatio, affordabilityScore } = scenario.calculatedMetrics
    
    let score = affordabilityScore * 10 // Convert to 100 scale
    
    // Adjust based on ratios
    if (dtiRatio > 40) score -= 20
    if (ltvRatio > 85) score -= 15
    if (scenario.riskLevel === 'high') score -= 10
    
    return Math.max(0, Math.min(100, score))
  }

  private generateRecommendations(scenario: FinancialScenario): string[] {
    const recommendations: string[] = []
    
    if (!scenario.calculatedMetrics) return recommendations
    
    const { dtiRatio, ltvRatio, monthlyPayment } = scenario.calculatedMetrics
    
    if (dtiRatio > 40) {
      recommendations.push('Consider reducing the loan amount or increasing your down payment to lower the debt-to-income ratio')
    }
    
    if (ltvRatio > 85) {
      recommendations.push('Increase your down payment to achieve a better loan-to-value ratio')
    }
    
    if (scenario.riskLevel === 'high') {
      recommendations.push('Consider a more conservative scenario with lower risk exposure')
    }
    
    if (monthlyPayment > (scenario.monthly_income || 0) * 0.35) {
      recommendations.push('The monthly payment exceeds 35% of income. Consider a longer loan term or higher down payment')
    }
    
    return recommendations
  }

  private generateInsights(scenario: FinancialScenario): string[] {
    const insights: string[] = []
    
    if (!scenario.calculatedMetrics) return insights
    
    const { totalInterest, payoffTimeMonths, affordabilityScore } = scenario.calculatedMetrics
    
    insights.push(`Total interest over loan term: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalInterest)}`)
    insights.push(`Loan payoff time: ${Math.round(payoffTimeMonths / 12)} years`)
    insights.push(`Affordability score: ${affordabilityScore}/10`)
    
    if (scenario.expected_rental_income) {
      const annualRental = scenario.expected_rental_income * 12
      const roi = (annualRental / (scenario.purchase_price || 1)) * 100
      insights.push(`Expected annual ROI from rental: ${roi.toFixed(2)}%`)
    }
    
    return insights
  }

  private identifyRiskFactors(scenario: FinancialScenario): string[] {
    const risks: string[] = []
    
    if (!scenario.calculatedMetrics) return risks
    
    const { dtiRatio, ltvRatio } = scenario.calculatedMetrics
    
    if (dtiRatio > 40) risks.push('High debt-to-income ratio increases payment stress risk')
    if (ltvRatio > 85) risks.push('High loan-to-value ratio increases market risk exposure')
    if (scenario.riskLevel === 'high') risks.push('Overall high risk profile')
    if (!scenario.current_savings || scenario.current_savings < 3 * (scenario.monthly_expenses || 0)) {
      risks.push('Limited emergency fund may cause payment difficulties')
    }
    
    return risks
  }

  private identifyOpportunities(scenario: FinancialScenario): string[] {
    const opportunities: string[] = []
    
    if (!scenario.calculatedMetrics) return opportunities
    
    const { dtiRatio, affordabilityScore } = scenario.calculatedMetrics
    
    if (dtiRatio < 30) opportunities.push('Low debt ratio provides room for additional investments')
    if (affordabilityScore >= 8) opportunities.push('Strong affordability suggests potential for property upgrades')
    if (scenario.expected_rental_income) {
      opportunities.push('Rental income potential can accelerate debt payoff')
    }
    
    return opportunities
  }

  private extractParameters(scenario: FinancialScenario): ScenarioParameters {
    const loanCalculation = scenario.loanCalculations?.[0]
    
    return {
      planName: scenario.plan_name,
      planType: scenario.plan_type,
      scenarioType: scenario.scenarioType,
      
      purchasePrice: scenario.purchase_price || 0,
      downPayment: scenario.down_payment || 0,
      additionalCosts: scenario.additional_costs || 0,
      
      loanAmount: loanCalculation?.loan_amount || 0,
      interestRate: loanCalculation?.interest_rate || 8,
      loanTermYears: Math.round((loanCalculation?.loan_term_months || 240) / 12),
      
      monthlyIncome: scenario.monthly_income || 0,
      monthlyExpenses: scenario.monthly_expenses || 0,
      currentSavings: scenario.current_savings || 0,
      otherDebts: scenario.other_debts || 0,
      
      expectedRentalIncome: scenario.expected_rental_income || undefined,
      expectedAppreciationRate: scenario.expected_appreciation_rate || undefined,
      
      riskTolerance: scenario.risk_tolerance || 'moderate',
      investmentHorizonMonths: scenario.investment_horizon_months || undefined,
      
      emergencyFundTarget: scenario.emergency_fund_target || undefined,
      dependents: scenario.dependents || 0,
      targetTimeframeMonths: scenario.target_timeframe_months || undefined
    }
  }
}

export const scenarioService = new ScenarioService()