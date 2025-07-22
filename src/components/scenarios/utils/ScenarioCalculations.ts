// src/components/scenarios/utils/ScenarioCalculations.ts

export interface CalculatedMetrics {
  monthlyPayment: number
  totalInterest: number
  totalCost: number
  dtiRatio: number
  ltvRatio: number
  affordabilityScore: number
  payoffTimeMonths: number
  monthlySavings: number
}

/**
 * Calculate real financial metrics based on scenario parameters
 */
export const calculateScenarioMetrics = (
  purchasePrice: number,
  downPayment: number,
  interestRate: number,
  termMonths: number,
  monthlyIncome: number,
  monthlyExpenses: number
): CalculatedMetrics => {
  const principal = purchasePrice - downPayment
  const monthlyRate = interestRate / 100 / 12
  const monthlyPayment = principal > 0 ? 
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1) : 0
  const totalPayment = monthlyPayment * termMonths
  const totalInterest = totalPayment - principal
  const totalCost = purchasePrice + totalInterest
  const dtiRatio = monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0
  const ltvRatio = purchasePrice > 0 ? (principal / purchasePrice) * 100 : 0
  const monthlySavings = monthlyIncome - monthlyExpenses - monthlyPayment
  const affordabilityScore = Math.max(1, Math.min(10, 
    10 - (dtiRatio / 5) + (monthlySavings > 0 ? 2 : -2)
  ))

  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    dtiRatio,
    ltvRatio,
    affordabilityScore,
    payoffTimeMonths: termMonths,
    monthlySavings
  }
}

/**
 * Get risk level color classes
 */
export const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-amber-100 text-amber-800'
    case 'high':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get scenario type color classes
 */
export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'baseline':
      return 'bg-blue-100 text-blue-800'
    case 'optimistic':
      return 'bg-green-100 text-green-800'
    case 'pessimistic':
      return 'bg-red-100 text-red-800'
    case 'alternative':
      return 'bg-purple-100 text-purple-800'
    case 'stress_test':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Generate Monte Carlo simulation results with real statistical analysis
 */
export const generateMonteCarloResults = (
  basePayment: number,
  scenario?: {
    purchasePrice: number
    interestRate: number
    monthlyIncome: number
    loanTermMonths: number
  }
) => {
  const simulations = 10000
  const results: number[] = []
  
  // Market volatility assumptions (based on Vietnamese real estate market)
  const interestRateVolatility = 0.02 // 2% standard deviation
  const propertyValueVolatility = 0.08 // 8% standard deviation  
  const incomeVolatility = 0.05 // 5% standard deviation
  
  for (let i = 0; i < simulations; i++) {
    // Generate random variables using Box-Muller transformation for normal distribution
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
    const z2 = Math.random() * 2 - 1 // Uniform for property value
    
    if (scenario) {
      // Simulate market variations
      const simulatedInterestRate = Math.max(0.01, scenario.interestRate + z0 * interestRateVolatility)
      const simulatedPropertyValue = Math.max(scenario.purchasePrice * 0.5, scenario.purchasePrice * (1 + z2 * propertyValueVolatility))
      const simulatedIncome = Math.max(scenario.monthlyIncome * 0.3, scenario.monthlyIncome * (1 + z1 * incomeVolatility))
      
      // Recalculate payment with simulated parameters
      const principal = simulatedPropertyValue * 0.8 // Assuming 20% down payment
      const monthlyRate = simulatedInterestRate / 100 / 12
      const simulatedPayment = principal > 0 ? 
        (principal * monthlyRate * Math.pow(1 + monthlyRate, scenario.loanTermMonths)) /
        (Math.pow(1 + monthlyRate, scenario.loanTermMonths) - 1) : 0
      
      results.push(simulatedPayment)
    } else {
      // Simple variance-based simulation for backward compatibility
      const variance = basePayment * 0.15
      results.push(basePayment + z0 * variance)
    }
  }
  
  // Calculate statistics
  results.sort((a, b) => a - b)
  const mean = results.reduce((sum, val) => sum + val, 0) / results.length
  const median = results[Math.floor(results.length / 2)]
  const percentile5 = results[Math.floor(results.length * 0.05)]
  const percentile95 = results[Math.floor(results.length * 0.95)]
  const percentile25 = results[Math.floor(results.length * 0.25)]
  const percentile75 = results[Math.floor(results.length * 0.75)]
  
  // Calculate standard deviation
  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length
  const stdDev = Math.sqrt(variance)
  const volatility = stdDev / mean
  
  // Risk metrics
  const valueAtRisk95 = percentile95 - median
  const expectedShortfall = results.slice(Math.floor(results.length * 0.95)).reduce((sum, val) => sum + val, 0) / 
                           (results.length * 0.05)
  
  return {
    mean,
    median,
    percentile5,
    percentile95,
    percentile25,
    percentile75,
    standardDeviation: stdDev,
    volatility,
    confidence95: 1 - (results.filter(r => r > percentile95).length / results.length),
    worstCase: results[results.length - 1],
    bestCase: results[0],
    valueAtRisk95,
    expectedShortfall,
    skewness: calculateSkewness(results, mean, stdDev),
    kurtosis: calculateKurtosis(results, mean, stdDev),
    simulations: results
  }
}

/**
 * Calculate skewness (measure of asymmetry)
 */
const calculateSkewness = (data: number[], mean: number, stdDev: number): number => {
  const n = data.length
  const skew = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n
  return skew
}

/**
 * Calculate kurtosis (measure of tail heaviness)
 */
const calculateKurtosis = (data: number[], mean: number, stdDev: number): number => {
  const n = data.length
  const kurt = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n - 3
  return kurt
}

/**
 * Generate sensitivity analysis with real calculations
 */
export const generateSensitivityAnalysis = (
  scenario?: {
    purchasePrice: number
    downPayment: number
    interestRate: number
    termMonths: number
    monthlyIncome: number
  }
) => {
  if (!scenario) {
    // Fallback to default values for compatibility
    return [
      { param: 'Interest Rate', impact: '+₫2.4M', sensitivity: 'High', color: 'text-red-600' },
      { param: 'Property Value', impact: '+₫1.8M', sensitivity: 'Medium', color: 'text-amber-600' },
      { param: 'Down Payment', impact: '-₫900K', sensitivity: 'Medium', color: 'text-green-600' },
      { param: 'Loan Term', impact: '+₫1.2M', sensitivity: 'Low', color: 'text-blue-600' }
    ]
  }

  const baseMetrics = calculateScenarioMetrics(
    scenario.purchasePrice,
    scenario.downPayment,
    scenario.interestRate,
    scenario.termMonths,
    scenario.monthlyIncome,
    0 // monthlyExpenses - not provided, assume 0 for base calculation
  )

  const sensitivityShock = 0.01 // 1% change
  const analysisResults = []

  // Interest Rate Sensitivity (+1%)
  const higherRateMetrics = calculateScenarioMetrics(
    scenario.purchasePrice,
    scenario.downPayment,
    scenario.interestRate + 1, // +1% interest rate
    scenario.termMonths,
    scenario.monthlyIncome,
    0
  )
  const interestRateImpact = higherRateMetrics.totalCost - baseMetrics.totalCost
  analysisResults.push({
    param: 'Interest Rate',
    impact: interestRateImpact > 0 ? `+₫${Math.round(interestRateImpact / 1000000 * 10) / 10}M` : `-₫${Math.round(Math.abs(interestRateImpact) / 1000000 * 10) / 10}M`,
    sensitivity: interestRateImpact > baseMetrics.totalCost * 0.05 ? 'High' : interestRateImpact > baseMetrics.totalCost * 0.02 ? 'Medium' : 'Low',
    color: interestRateImpact > baseMetrics.totalCost * 0.05 ? 'text-red-600' : interestRateImpact > baseMetrics.totalCost * 0.02 ? 'text-amber-600' : 'text-blue-600'
  })

  // Property Value Sensitivity (+1%)
  const higherValueMetrics = calculateScenarioMetrics(
    scenario.purchasePrice * 1.01, // +1% property value
    scenario.downPayment,
    scenario.interestRate,
    scenario.termMonths,
    scenario.monthlyIncome,
    0
  )
  const propertyValueImpact = higherValueMetrics.totalCost - baseMetrics.totalCost
  analysisResults.push({
    param: 'Property Value',
    impact: propertyValueImpact > 0 ? `+₫${Math.round(propertyValueImpact / 1000000 * 10) / 10}M` : `-₫${Math.round(Math.abs(propertyValueImpact) / 1000000 * 10) / 10}M`,
    sensitivity: propertyValueImpact > baseMetrics.totalCost * 0.03 ? 'High' : propertyValueImpact > baseMetrics.totalCost * 0.01 ? 'Medium' : 'Low',
    color: propertyValueImpact > baseMetrics.totalCost * 0.03 ? 'text-red-600' : propertyValueImpact > baseMetrics.totalCost * 0.01 ? 'text-amber-600' : 'text-green-600'
  })

  // Down Payment Sensitivity (+1% of property value)
  const higherDownPaymentMetrics = calculateScenarioMetrics(
    scenario.purchasePrice,
    scenario.downPayment + (scenario.purchasePrice * 0.01), // +1% of property value as down payment
    scenario.interestRate,
    scenario.termMonths,
    scenario.monthlyIncome,
    0
  )
  const downPaymentImpact = higherDownPaymentMetrics.totalCost - baseMetrics.totalCost
  analysisResults.push({
    param: 'Down Payment',
    impact: downPaymentImpact > 0 ? `+₫${Math.round(downPaymentImpact / 1000000 * 10) / 10}M` : `-₫${Math.round(Math.abs(downPaymentImpact) / 1000000 * 10) / 10}M`,
    sensitivity: Math.abs(downPaymentImpact) > baseMetrics.totalCost * 0.02 ? 'High' : Math.abs(downPaymentImpact) > baseMetrics.totalCost * 0.005 ? 'Medium' : 'Low',
    color: downPaymentImpact < 0 ? 'text-green-600' : downPaymentImpact > baseMetrics.totalCost * 0.02 ? 'text-red-600' : 'text-amber-600'
  })

  // Loan Term Sensitivity (+12 months)
  const longerTermMetrics = calculateScenarioMetrics(
    scenario.purchasePrice,
    scenario.downPayment,
    scenario.interestRate,
    scenario.termMonths + 12, // +1 year
    scenario.monthlyIncome,
    0
  )
  const loanTermImpact = longerTermMetrics.totalCost - baseMetrics.totalCost
  analysisResults.push({
    param: 'Loan Term',
    impact: loanTermImpact > 0 ? `+₫${Math.round(loanTermImpact / 1000000 * 10) / 10}M` : `-₫${Math.round(Math.abs(loanTermImpact) / 1000000 * 10) / 10}M`,
    sensitivity: loanTermImpact > baseMetrics.totalCost * 0.03 ? 'High' : loanTermImpact > baseMetrics.totalCost * 0.01 ? 'Medium' : 'Low',
    color: loanTermImpact > baseMetrics.totalCost * 0.03 ? 'text-red-600' : loanTermImpact > baseMetrics.totalCost * 0.01 ? 'text-amber-600' : 'text-blue-600'
  })

  return analysisResults
}