// src/lib/financial-utils.ts
/**
 * Production-ready financial calculation utilities
 * All calculations use Vietnamese banking standards and market practices
 */

export interface LoanDetails {
  loanAmount: number;
  interestRate: number; // Annual interest rate as percentage
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}

export interface AffordabilityAnalysis {
  score: 'excellent' | 'good' | 'acceptable' | 'risky' | 'unaffordable';
  debtToIncomeRatio: number;
  monthlyLeftover: number;
  maxAffordablePrice: number;
  recommendations: string[];
  warnings: string[];
}

export interface FinancialHealthIndicators {
  emergencyFundMonths: number;
  savingsRate: number;
  debtToAssetRatio: number;
  liquidityRatio: number;
  investmentCapacity: number;
}

/**
 * Calculate monthly loan payment using Vietnamese banking formulas
 * @param principal Loan amount in VND
 * @param termYears Loan term in years
 * @param annualRate Annual interest rate as percentage (e.g., 8.5 for 8.5%)
 */
export function calculateMonthlyPayment(
  principal: number,
  termYears: number,
  annualRate: number
): number {
  if (principal <= 0 || termYears <= 0 || annualRate <= 0) return 0;
  
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;
  
  if (monthlyRate === 0) return principal / totalPayments;
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
  return Math.round(monthlyPayment);
}

/**
 * Calculate comprehensive loan details
 */
export function calculateLoanDetails(
  purchasePrice: number,
  downPayment: number,
  interestRate: number = 8.5, // Default Vietnamese mortgage rate
  termYears: number = 20 // Standard Vietnamese mortgage term
): LoanDetails {
  const loanAmount = purchasePrice - downPayment;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, termYears, interestRate);
  const totalAmount = monthlyPayment * termYears * 12;
  const totalInterest = totalAmount - loanAmount;
  
  return {
    loanAmount,
    interestRate,
    termYears,
    monthlyPayment,
    totalInterest,
    totalAmount
  };
}

/**
 * Analyze affordability based on Vietnamese banking standards
 * Vietnamese banks typically use 30-40% debt-to-income ratio
 */
export function analyzeAffordability(
  monthlyIncome: number,
  monthlyExpenses: number,
  monthlyPayment: number,
  currentSavings: number,
  otherDebts: number = 0
): AffordabilityAnalysis {
  const totalMonthlyDebt = monthlyPayment + otherDebts;
  const debtToIncomeRatio = totalMonthlyDebt / monthlyIncome;
  const monthlyLeftover = monthlyIncome - monthlyExpenses - totalMonthlyDebt;
  
  // Calculate maximum affordable price (conservative 30% DTI)
  const maxMonthlyPayment = monthlyIncome * 0.30 - otherDebts;
  const maxLoanAmount = maxMonthlyPayment > 0 ? 
    calculateLoanAmount(maxMonthlyPayment, 20, 8.5) : 0;
  const maxAffordablePrice = maxLoanAmount + currentSavings * 0.8; // Keep 20% as emergency fund
  
  let score: AffordabilityAnalysis['score'];
  const recommendations: string[] = [];
  const warnings: string[] = [];
  
  if (debtToIncomeRatio <= 0.28) {
    score = 'excellent';
    recommendations.push('Excellent financial position for this purchase');
    recommendations.push('Consider investing surplus income for better returns');
  } else if (debtToIncomeRatio <= 0.33) {
    score = 'good';
    recommendations.push('Good financial position with manageable payments');
    recommendations.push('Maintain emergency fund of 3-6 months expenses');
  } else if (debtToIncomeRatio <= 0.40) {
    score = 'acceptable';
    recommendations.push('Acceptable but tight budget - monitor expenses carefully');
    warnings.push('Consider increasing income or reducing other debts');
  } else if (debtToIncomeRatio <= 0.50) {
    score = 'risky';
    warnings.push('High debt-to-income ratio - consider lower purchase price');
    warnings.push('Banks may require additional documentation or higher down payment');
  } else {
    score = 'unaffordable';
    warnings.push('This purchase exceeds safe borrowing limits');
    warnings.push(`Maximum recommended price: ${formatVietnameseCurrency(maxAffordablePrice)}`);
  }
  
  // Additional recommendations based on leftover income
  if (monthlyLeftover < monthlyExpenses * 0.1) {
    warnings.push('Very little buffer for unexpected expenses');
  }
  
  if (currentSavings < monthlyExpenses * 3) {
    recommendations.push('Build emergency fund before purchase');
  }
  
  return {
    score,
    debtToIncomeRatio,
    monthlyLeftover,
    maxAffordablePrice,
    recommendations,
    warnings
  };
}

/**
 * Calculate loan amount from monthly payment (reverse calculation)
 */
function calculateLoanAmount(
  monthlyPayment: number,
  termYears: number,
  annualRate: number
): number {
  if (monthlyPayment <= 0 || termYears <= 0 || annualRate <= 0) return 0;
  
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;
  
  if (monthlyRate === 0) return monthlyPayment * totalPayments;
  
  const loanAmount = monthlyPayment * 
    (Math.pow(1 + monthlyRate, totalPayments) - 1) /
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments));
    
  return Math.round(loanAmount);
}

/**
 * Calculate comprehensive financial health indicators
 */
export function calculateFinancialHealth(
  monthlyIncome: number,
  monthlyExpenses: number,
  currentSavings: number,
  otherDebts: number,
  assets: number = 0
): FinancialHealthIndicators {
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0;
  const emergencyFundMonths = currentSavings / Math.max(monthlyExpenses, 1);
  const debtToAssetRatio = (currentSavings + assets) > 0 ? 
    otherDebts / (currentSavings + assets) : 1;
  const liquidityRatio = currentSavings / Math.max(monthlyExpenses, 1);
  const investmentCapacity = Math.max(0, monthlySavings - monthlyExpenses * 0.1); // Keep 10% buffer
  
  return {
    emergencyFundMonths,
    savingsRate,
    debtToAssetRatio,
    liquidityRatio,
    investmentCapacity
  };
}

/**
 * Format currency in Vietnamese style
 * @param amount Amount in VND
 * @param useShortForm Use abbreviated form (e.g., "2.5 tỷ" instead of full number)
 */
export function formatVietnameseCurrency(amount: number, useShortForm: boolean = false): string {
  if (!amount || amount === 0) return '0 ₫';
  
  if (useShortForm) {
    if (amount >= 1_000_000_000) {
      const billions = amount / 1_000_000_000;
      return `${billions.toFixed(billions >= 10 ? 0 : 1)} tỷ ₫`;
    } else if (amount >= 1_000_000) {
      const millions = amount / 1_000_000;
      return `${millions.toFixed(millions >= 10 ? 0 : 1)} triệu ₫`;
    } else if (amount >= 1_000) {
      const thousands = amount / 1_000;
      return `${thousands.toFixed(0)} nghìn ₫`;
    }
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse Vietnamese currency input
 */
export function parseVietnameseCurrency(input: string): number {
  if (!input) return 0;
  
  // Remove currency symbols and normalize
  let cleaned = input
    .replace(/[₫,.\s]/g, '')
    .replace(/tỷ/g, '000000000')
    .replace(/triệu/g, '000000')
    .replace(/nghìn/g, '000')
    .toLowerCase();
    
  // Handle decimal places for abbreviations
  if (input.includes('tỷ')) {
    const match = input.match(/([\d.,]+)\s*tỷ/);
    if (match) {
      const number = parseFloat(match[1].replace(/,/g, '.'));
      return Math.round(number * 1_000_000_000);
    }
  }
  
  if (input.includes('triệu')) {
    const match = input.match(/([\d.,]+)\s*triệu/);
    if (match) {
      const number = parseFloat(match[1].replace(/,/g, '.'));
      return Math.round(number * 1_000_000);
    }
  }
  
  return parseInt(cleaned) || 0;
}

/**
 * Get smart suggestions based on input context
 */
export function getSmartSuggestions(
  field: string,
  currentValue: number,
  context: {
    purchasePrice?: number;
    monthlyIncome?: number;
    planType?: string;
    location?: string;
  }
): string[] {
  const suggestions: string[] = [];
  
  switch (field) {
    case 'downPayment':
      if (context.purchasePrice) {
        const percentage = (currentValue / context.purchasePrice) * 100;
        if (percentage < 20) {
          suggestions.push(`Consider 20% (${formatVietnameseCurrency(context.purchasePrice * 0.2, true)}) to avoid PMI`);
        }
        if (percentage > 50) {
          suggestions.push('High down payment - consider investment opportunities for excess cash');
        }
        suggestions.push(`Current: ${percentage.toFixed(1)}% of purchase price`);
      }
      break;
      
    case 'additionalCosts':
      if (context.purchasePrice) {
        const recommended = context.purchasePrice * 0.07; // 7% average
        suggestions.push(`Typical range: 5-10% of purchase price`);
        suggestions.push(`Recommended: ${formatVietnameseCurrency(recommended, true)}`);
      }
      break;
      
    case 'expectedRentalIncome':
      if (context.purchasePrice && context.planType === 'investment') {
        const yieldRate = 0.06; // 6% gross rental yield typical in Vietnam
        const estimated = context.purchasePrice * yieldRate / 12;
        suggestions.push(`Market average: ${formatVietnameseCurrency(estimated, true)}/month`);
        suggestions.push('Gross yield: 5-8% annually typical in major cities');
      }
      break;
      
    case 'monthlyExpenses':
      if (context.monthlyIncome) {
        const recommended = context.monthlyIncome * 0.5; // 50% for living expenses
        suggestions.push(`Recommended: 40-60% of income`);
        suggestions.push(`Target: ${formatVietnameseCurrency(recommended, true)}/month`);
      }
      break;
  }
  
  return suggestions;
}

/**
 * Calculate property appreciation over time
 */
export function calculateAppreciation(
  initialValue: number,
  annualRate: number,
  years: number
): number {
  return initialValue * Math.pow(1 + annualRate / 100, years);
}

/**
 * Calculate total return on investment for property
 */
export function calculatePropertyROI(
  purchasePrice: number,
  downPayment: number,
  monthlyRent: number,
  monthlyExpenses: number,
  appreciationRate: number,
  years: number
): {
  totalCashFlow: number;
  capitalGains: number;
  totalReturn: number;
  annualizedROI: number;
} {
  const annualCashFlow = (monthlyRent - monthlyExpenses) * 12;
  const totalCashFlow = annualCashFlow * years;
  
  const futureValue = calculateAppreciation(purchasePrice, appreciationRate, years);
  const capitalGains = futureValue - purchasePrice;
  
  const totalReturn = totalCashFlow + capitalGains;
  const annualizedROI = Math.pow(1 + totalReturn / downPayment, 1 / years) - 1;
  
  return {
    totalCashFlow,
    capitalGains,
    totalReturn,
    annualizedROI
  };
}

/**
 * Get current market interest rates (would integrate with real API)
 */
export function getCurrentInterestRates(): {
  mortgageRates: { bank: string; rate: number; }[];
  averageRate: number;
} {
  // In production, this would fetch from banking APIs
  const mortgageRates = [
    { bank: 'Vietcombank', rate: 8.5 },
    { bank: 'BIDV', rate: 8.7 },
    { bank: 'Techcombank', rate: 8.3 },
    { bank: 'VietinBank', rate: 8.6 },
    { bank: 'ACB', rate: 8.4 },
    { bank: 'MB Bank', rate: 8.8 }
  ];
  
  const averageRate = mortgageRates.reduce((sum, r) => sum + r.rate, 0) / mortgageRates.length;
  
  return { mortgageRates, averageRate };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}