// src/lib/export/excelExport.ts
// Excel export functionality for financial plans

import * as XLSX from 'xlsx'
import { FinancialPlan } from '@/components/financial-plans/PlansList'
import { formatCurrency } from '@/lib/utils'
import { calculateFinancialMetrics, type LoanParameters } from '@/lib/financial/calculations'

interface ExcelExportOptions {
  includeAmortizationSchedule?: boolean
  includeCashFlowProjection?: boolean
  includeScenarioComparison?: boolean
  projectionYears?: number
}

export class FinancialPlanExcelExporter {
  private workbook: XLSX.WorkBook

  constructor() {
    this.workbook = XLSX.utils.book_new()
  }

  async exportPlan(
    plan: FinancialPlan,
    options: ExcelExportOptions = {}
  ): Promise<Blob> {
    try {
      // Add summary worksheet
      this.addSummarySheet(plan)
      
      // Add detailed breakdown
      this.addBreakdownSheet(plan)
      
      if (options.includeAmortizationSchedule) {
        this.addAmortizationSchedule(plan)
      }
      
      if (options.includeCashFlowProjection) {
        this.addCashFlowProjection(plan, options.projectionYears || 20)
      }
      
      if (options.includeScenarioComparison) {
        this.addScenarioComparison(plan)
      }
      
      // Generate Excel file
      const excelBuffer = XLSX.write(this.workbook, {
        bookType: 'xlsx',
        type: 'array'
      })
      
      return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    } catch (error) {
      console.error('Error generating Excel file:', error)
      throw new Error('Failed to generate Excel export')
    }
  }

  private addSummarySheet(plan: FinancialPlan): void {
    const summaryData = [
      ['FinHome Financial Plan Summary', ''],
      ['Generated on', new Date().toLocaleDateString('vi-VN')],
      [''],
      ['PLAN INFORMATION', ''],
      ['Plan Name', plan.planName],
      ['Plan Type', this.formatPlanType(plan.planType)],
      ['Plan Status', plan.planStatus.toUpperCase()],
      ['Created Date', plan.createdAt.toLocaleDateString('vi-VN')],
      ['Last Updated', plan.updatedAt.toLocaleDateString('vi-VN')],
      [''],
      ['PROPERTY DETAILS', ''],
      ['Purchase Price', plan.purchasePrice],
      ['Down Payment', plan.downPayment],
      ['Down Payment %', (plan.downPayment / plan.purchasePrice) * 100],
      ['Loan Amount', plan.purchasePrice - plan.downPayment],
      [''],
      ['PERSONAL FINANCES', ''],
      ['Monthly Income', plan.monthlyIncome],
      ['Monthly Expenses', plan.monthlyExpenses],
      ['Current Savings', plan.currentSavings],
      ['Net Monthly Income', plan.monthlyIncome - plan.monthlyExpenses]
    ]

    if (plan.expectedRentalIncome) {
      summaryData.push(
        ['Expected Rental Income', plan.expectedRentalIncome],
        ['Gross Rental Yield %', (plan.expectedRentalIncome * 12 / plan.purchasePrice) * 100]
      )
    }

    // Calculate financial metrics
    const loanAmount = plan.purchasePrice - plan.downPayment
    const loanParams: LoanParameters = {
      principal: loanAmount,
      annualRate: 10.5,
      termMonths: 240,
      promotionalRate: 7.5,
      promotionalPeriodMonths: 24
    }

    const personalFinances = {
      monthlyIncome: plan.monthlyIncome,
      monthlyExpenses: plan.monthlyExpenses
    }

    const investmentParams = plan.expectedRentalIncome ? {
      expectedRentalIncome: plan.expectedRentalIncome,
      propertyExpenses: plan.expectedRentalIncome * 0.1,
      appreciationRate: 8,
      initialPropertyValue: plan.purchasePrice
    } : undefined

    const metrics = calculateFinancialMetrics(
      loanParams,
      personalFinances,
      investmentParams
    )

    summaryData.push(
      [''],
      ['CALCULATED METRICS', ''],
      ['Monthly Payment (Promotional)', metrics.monthlyPayment * 0.75],
      ['Monthly Payment (Regular)', metrics.monthlyPayment],
      ['Total Interest', metrics.totalInterest],
      ['Total Amount Paid', loanAmount + metrics.totalInterest],
      ['Debt-to-Income Ratio %', metrics.debtToIncomeRatio],
      ['Affordability Score (1-10)', metrics.affordabilityScore]
    )

    if (metrics.roi) {
      summaryData.push(['Expected ROI %', metrics.roi])
    }

    if (metrics.paybackPeriod) {
      summaryData.push(['Payback Period (years)', metrics.paybackPeriod])
    }

    // Net cash flow calculation
    const netCashFlow = plan.monthlyIncome - plan.monthlyExpenses - metrics.monthlyPayment + (plan.expectedRentalIncome || 0)
    summaryData.push(
      [''],
      ['CASH FLOW ANALYSIS', ''],
      ['Net Monthly Cash Flow', netCashFlow],
      ['Annual Cash Flow', netCashFlow * 12],
      ['Cash Flow Status', netCashFlow >= 0 ? 'POSITIVE' : 'NEGATIVE']
    )

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData)
    
    // Apply formatting
    this.formatSummarySheet(worksheet)
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Summary')
  }

  private addBreakdownSheet(plan: FinancialPlan): void {
    const breakdownData = [
      ['Financial Plan Detailed Breakdown', ''],
      [''],
      ['MONTHLY INCOME BREAKDOWN', ''],
      ['Primary Income', plan.monthlyIncome],
      ['Rental Income', plan.expectedRentalIncome || 0],
      ['Total Monthly Income', plan.monthlyIncome + (plan.expectedRentalIncome || 0)],
      [''],
      ['MONTHLY EXPENSE BREAKDOWN', ''],
      ['Living Expenses', plan.monthlyExpenses],
      ['Loan Payment (Promotional)', (plan.monthlyPayment || 0) * 0.75],
      ['Loan Payment (Regular)', plan.monthlyPayment || 0],
      ['Property Expenses (Est.)', (plan.expectedRentalIncome || 0) * 0.1],
      ['Total Monthly Expenses', plan.monthlyExpenses + (plan.monthlyPayment || 0)],
      [''],
      ['ONE-TIME COSTS', ''],
      ['Property Purchase Price', plan.purchasePrice],
      ['Down Payment', plan.downPayment],
      ['Transfer Tax (0.5%)', plan.purchasePrice * 0.005],
      ['Registration Fees (Est.)', 5000000],
      ['Lawyer Fees (Est.)', 3000000],
      ['Total Upfront Costs', plan.downPayment + (plan.purchasePrice * 0.005) + 5000000 + 3000000],
      [''],
      ['LOAN DETAILS', ''],
      ['Loan Principal', plan.purchasePrice - plan.downPayment],
      ['Loan Term (Years)', 20],
      ['Promotional Rate (%)', 7.5],
      ['Promotional Period (Months)', 24],
      ['Regular Rate (%)', 10.5],
      [''],
      ['INVESTMENT ANALYSIS', '']
    ]

    if (plan.planType === 'investment' && plan.expectedRentalIncome) {
      const annualRental = plan.expectedRentalIncome * 12
      const grossYield = (annualRental / plan.purchasePrice) * 100
      const netYield = ((annualRental - (annualRental * 0.1)) / plan.purchasePrice) * 100
      
      breakdownData.push(
        ['Annual Rental Income', annualRental],
        ['Gross Rental Yield (%)', grossYield],
        ['Net Rental Yield (%)', netYield],
        ['Cash-on-Cash Return (%)', ((annualRental - (plan.monthlyPayment || 0) * 12) / plan.downPayment) * 100]
      )
    }

    const worksheet = XLSX.utils.aoa_to_sheet(breakdownData)
    this.formatBreakdownSheet(worksheet)
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Detailed Breakdown')
  }

  private addAmortizationSchedule(plan: FinancialPlan): void {
    const loanAmount = plan.purchasePrice - plan.downPayment
    const schedule = this.generateAmortizationSchedule(loanAmount, 7.5, 10.5, 240, 24)
    
    const scheduleData = [
      ['Loan Amortization Schedule', '', '', '', '', ''],
      ['Payment #', 'Payment Date', 'Payment Amount', 'Principal', 'Interest', 'Balance'],
      ...schedule.map(payment => [
        payment.paymentNumber,
        payment.paymentDate,
        payment.paymentAmount,
        payment.principalPayment,
        payment.interestPayment,
        payment.remainingBalance
      ])
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(scheduleData)
    this.formatAmortizationSheet(worksheet)
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Amortization Schedule')
  }

  private addCashFlowProjection(plan: FinancialPlan, years: number): void {
    const projectionData = [
      ['Cash Flow Projection', '', '', '', '', ''],
      ['Year', 'Rental Income', 'Loan Payments', 'Property Expenses', 'Net Cash Flow', 'Cumulative Cash Flow']
    ]

    let cumulativeCashFlow = 0
    const annualRental = (plan.expectedRentalIncome || 0) * 12
    const annualLoanPayment = (plan.monthlyPayment || 0) * 12
    const annualPropertyExpenses = annualRental * 0.1

    for (let year = 1; year <= years; year++) {
      // Apply inflation to rental income (3% annually)
      const inflatedRental = annualRental * Math.pow(1.03, year - 1)
      const inflatedExpenses = annualPropertyExpenses * Math.pow(1.03, year - 1)
      
      const netCashFlow = inflatedRental - annualLoanPayment - inflatedExpenses
      cumulativeCashFlow += netCashFlow

      projectionData.push([
        year,
        inflatedRental,
        annualLoanPayment,
        inflatedExpenses,
        netCashFlow,
        cumulativeCashFlow
      ])
    }

    const worksheet = XLSX.utils.aoa_to_sheet(projectionData)
    this.formatCashFlowSheet(worksheet)
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Cash Flow Projection')
  }

  private addScenarioComparison(plan: FinancialPlan): void {
    const scenarios = [
      {
        name: 'Conservative (80% LTV, 25 years)',
        downPayment: plan.purchasePrice * 0.2,
        loanTerm: 25,
        rate: 10.5
      },
      {
        name: 'Moderate (70% LTV, 20 years)',
        downPayment: plan.purchasePrice * 0.3,
        loanTerm: 20,
        rate: 10.5
      },
      {
        name: 'Aggressive (60% LTV, 15 years)',
        downPayment: plan.purchasePrice * 0.4,
        loanTerm: 15,
        rate: 10.5
      }
    ]

    const comparisonData = [
      ['Scenario Comparison', '', '', ''],
      ['Metric', 'Conservative', 'Moderate', 'Aggressive']
    ]

    const metrics = ['Down Payment', 'Loan Amount', 'Monthly Payment', 'Total Interest', 'Total Cost']

    scenarios.forEach((scenario, index) => {
      const loanAmount = plan.purchasePrice - scenario.downPayment
      const monthlyRate = scenario.rate / 100 / 12
      const totalMonths = scenario.loanTerm * 12
      
      const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                            (Math.pow(1 + monthlyRate, totalMonths) - 1)
      const totalInterest = (monthlyPayment * totalMonths) - loanAmount
      const totalCost = scenario.downPayment + loanAmount + totalInterest

      if (index === 0) {
        comparisonData.push(
          ['Down Payment', scenario.downPayment, '', ''],
          ['Loan Amount', loanAmount, '', ''],
          ['Monthly Payment', monthlyPayment, '', ''],
          ['Total Interest', totalInterest, '', ''],
          ['Total Cost', totalCost, '', '']
        )
      } else {
        // Update existing rows with data for this scenario
        comparisonData[2][index + 1] = scenario.downPayment
        comparisonData[3][index + 1] = loanAmount
        comparisonData[4][index + 1] = monthlyPayment
        comparisonData[5][index + 1] = totalInterest
        comparisonData[6][index + 1] = totalCost
      }
    })

    const worksheet = XLSX.utils.aoa_to_sheet(comparisonData)
    this.formatScenarioSheet(worksheet)
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Scenario Comparison')
  }

  private formatSummarySheet(worksheet: XLSX.WorkSheet): void {
    // Set column widths
    worksheet['!cols'] = [
      { width: 25 },
      { width: 20 }
    ]

    // Apply currency formatting to numeric cells
    const currencyFormat = '#,##0'
    const percentFormat = '0.00%'

    // Format specific cells (this is a simplified approach)
    // In a real implementation, you'd want to be more specific about which cells to format
  }

  private formatBreakdownSheet(worksheet: XLSX.WorkSheet): void {
    worksheet['!cols'] = [
      { width: 30 },
      { width: 20 }
    ]
  }

  private formatAmortizationSheet(worksheet: XLSX.WorkSheet): void {
    worksheet['!cols'] = [
      { width: 12 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 18 }
    ]
  }

  private formatCashFlowSheet(worksheet: XLSX.WorkSheet): void {
    worksheet['!cols'] = [
      { width: 8 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 20 }
    ]
  }

  private formatScenarioSheet(worksheet: XLSX.WorkSheet): void {
    worksheet['!cols'] = [
      { width: 20 },
      { width: 18 },
      { width: 18 },
      { width: 18 }
    ]
  }

  private formatPlanType(type: string): string {
    const types = {
      home_purchase: 'Home Purchase',
      investment: 'Investment Property',
      upgrade: 'Property Upgrade',
      refinance: 'Refinancing'
    }
    return types[type as keyof typeof types] || type
  }

  private generateAmortizationSchedule(
    principal: number,
    promotionalRate: number,
    regularRate: number,
    totalMonths: number,
    promotionalMonths: number
  ): Array<{
    paymentNumber: number
    paymentDate: string
    paymentAmount: number
    principalPayment: number
    interestPayment: number
    remainingBalance: number
  }> {
    const schedule = []
    let remainingBalance = principal
    const startDate = new Date()

    // Promotional period
    const promoMonthlyRate = promotionalRate / 100 / 12
    const promoPayment = (principal * promoMonthlyRate * Math.pow(1 + promoMonthlyRate, totalMonths)) / 
                        (Math.pow(1 + promoMonthlyRate, totalMonths) - 1)

    for (let month = 1; month <= promotionalMonths && remainingBalance > 0; month++) {
      const interestPayment = remainingBalance * promoMonthlyRate
      const principalPayment = promoPayment - interestPayment
      remainingBalance -= principalPayment

      const paymentDate = new Date(startDate)
      paymentDate.setMonth(paymentDate.getMonth() + month - 1)

      schedule.push({
        paymentNumber: month,
        paymentDate: paymentDate.toLocaleDateString('vi-VN'),
        paymentAmount: promoPayment,
        principalPayment,
        interestPayment,
        remainingBalance: Math.max(0, remainingBalance)
      })
    }

    // Regular period
    const regularMonthlyRate = regularRate / 100 / 12
    const remainingMonths = totalMonths - promotionalMonths
    const regularPayment = remainingBalance > 0 ? 
      (remainingBalance * regularMonthlyRate * Math.pow(1 + regularMonthlyRate, remainingMonths)) / 
      (Math.pow(1 + regularMonthlyRate, remainingMonths) - 1) : 0

    for (let month = promotionalMonths + 1; month <= totalMonths && remainingBalance > 0; month++) {
      const interestPayment = remainingBalance * regularMonthlyRate
      const principalPayment = Math.min(regularPayment - interestPayment, remainingBalance)
      remainingBalance -= principalPayment

      const paymentDate = new Date(startDate)
      paymentDate.setMonth(paymentDate.getMonth() + month - 1)

      schedule.push({
        paymentNumber: month,
        paymentDate: paymentDate.toLocaleDateString('vi-VN'),
        paymentAmount: principalPayment + interestPayment,
        principalPayment,
        interestPayment,
        remainingBalance: Math.max(0, remainingBalance)
      })
    }

    return schedule
  }
}

// Export utility function
export async function exportFinancialPlanToExcel(
  plan: FinancialPlan,
  options: ExcelExportOptions = {}
): Promise<void> {
  try {
    const exporter = new FinancialPlanExcelExporter()
    const excelBlob = await exporter.exportPlan(plan, {
      includeAmortizationSchedule: true,
      includeCashFlowProjection: true,
      includeScenarioComparison: true,
      projectionYears: 20,
      ...options
    })
    
    // Create download link
    const url = URL.createObjectURL(excelBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${plan.planName.replace(/[^a-z0-9]/gi, '_')}_financial_analysis.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting Excel:', error)
    throw error
  }
}

// Utility function to export multiple plans comparison
export async function exportPlansComparison(
  plans: FinancialPlan[],
  fileName: string = 'financial_plans_comparison'
): Promise<void> {
  try {
    const workbook = XLSX.utils.book_new()
    
    // Create comparison sheet
    const comparisonData = [
      ['Financial Plans Comparison', ...plans.map(p => p.planName)],
      [''],
      ['Plan Type', ...plans.map(p => p.planType)],
      ['Purchase Price', ...plans.map(p => p.purchasePrice)],
      ['Down Payment', ...plans.map(p => p.downPayment)],
      ['Down Payment %', ...plans.map(p => (p.downPayment / p.purchasePrice * 100).toFixed(1) + '%')],
      ['Monthly Income', ...plans.map(p => p.monthlyIncome)],
      ['Monthly Expenses', ...plans.map(p => p.monthlyExpenses)],
      ['Expected Rental', ...plans.map(p => p.expectedRentalIncome || 0)],
      ['Monthly Payment', ...plans.map(p => p.monthlyPayment || 0)],
      ['Affordability Score', ...plans.map(p => p.affordabilityScore || 0)],
      ['Risk Level', ...plans.map(p => p.riskLevel || 'Unknown')],
      ['ROI %', ...plans.map(p => p.roi ? p.roi.toFixed(1) + '%' : 'N/A')]
    ]
    
    const worksheet = XLSX.utils.aoa_to_sheet(comparisonData)
    worksheet['!cols'] = [{ width: 20 }, ...plans.map(() => ({ width: 18 }))]
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plans Comparison')
    
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    })
    
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting plans comparison:', error)
    throw error
  }
}