// src/lib/export/pdfExport.ts
// PDF export functionality for financial plans

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { type FinancialPlanWithMetrics } from '@/lib/api/plans'
import { formatCurrency } from '@/lib/utils'
import { calculateFinancialMetrics, type LoanParameters } from '@/lib/financial/calculations'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface PDFExportOptions {
  includeTimeline?: boolean
  includeAnalysis?: boolean
  includeRecommendations?: boolean
  logoUrl?: string
}

export class FinancialPlanWithMetricsPDFExporter {
  private doc: jsPDF
  private currentY: number = 20
  private pageWidth: number
  private pageHeight: number
  private margin: number = 20

  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.width
    this.pageHeight = this.doc.internal.pageSize.height
  }

  async exportPlan(
    plan: FinancialPlanWithMetrics, 
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    try {
      // Reset document
      this.currentY = 20
      
      // Add header
      this.addHeader(plan, options.logoUrl)
      
      // Add plan overview
      this.addPlanOverview(plan)
      
      // Add financial summary
      this.addFinancialSummary(plan)
      
      // Add detailed breakdown
      this.addDetailedBreakdown(plan)
      
      if (options.includeAnalysis) {
        this.addRiskAnalysis(plan)
      }
      
      if (options.includeTimeline) {
        this.addTimelineSection(plan)
      }
      
      if (options.includeRecommendations) {
        this.addRecommendations(plan)
      }
      
      // Add footer
      this.addFooter()
      
      return new Blob([this.doc.output('blob')], { type: 'application/pdf' })
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate PDF export')
    }
  }

  private addHeader(plan: FinancialPlanWithMetrics, logoUrl?: string): void {
    // Company logo if provided
    if (logoUrl) {
      // this.doc.addImage(logoUrl, 'PNG', this.margin, 10, 30, 15)
    }
    
    // Main title
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Financial Plan Report', this.pageWidth / 2, 25, { align: 'center' })
    
    // Plan name
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(plan.plan_name, this.pageWidth / 2, 35, { align: 'center' })
    
    // Generation date
    this.doc.setFontSize(10)
    this.doc.setTextColor(128, 128, 128)
    this.doc.text(
      `Generated on ${new Date().toLocaleDateString('vi-VN')}`,
      this.pageWidth / 2,
      42,
      { align: 'center' }
    )
    
    // Reset text color
    this.doc.setTextColor(0, 0, 0)
    this.currentY = 55
  }

  private addPlanOverview(plan: FinancialPlanWithMetrics): void {
    this.addSectionTitle('Plan Overview')
    
    const overviewData = [
      ['Plan Type', this.formatPlanType(plan.plan_type)],
      ['Property Price', formatCurrency(plan.purchase_price || 0)],
      ['Down Payment', `${formatCurrency(plan.down_payment || 0)} (${(((plan.down_payment || 0) / (plan.purchase_price || 1)) * 100).toFixed(1)}%)`],
      ['Loan Amount', formatCurrency((plan.purchase_price || 0) - (plan.down_payment || 0))],
      ['Monthly Income', formatCurrency(plan.monthly_income || 0)],
      ['Monthly Expenses', formatCurrency(plan.monthly_expenses || 0)],
      ['Current Savings', formatCurrency(plan.current_savings || 0)],
      ['Plan Status', plan.status.toUpperCase()],
      ['Created Date', new Date(plan.created_at).toLocaleDateString('vi-VN')]
    ]

    if (plan.expected_rental_income) {
      overviewData.splice(6, 0, ['Expected Rental Income', formatCurrency(plan.expected_rental_income)])
    }

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Property', 'Value']],
      body: overviewData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246], // Blue
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15
  }

  private addFinancialSummary(plan: FinancialPlanWithMetrics): void {
    this.checkPageBreak(60)
    this.addSectionTitle('Financial Summary')
    
    // Calculate metrics
    const loanAmount = (plan.purchase_price || 0) - (plan.down_payment || 0)
    const loanParams: LoanParameters = {
      principal: loanAmount,
      annualRate: 10.5,
      termMonths: 240,
      promotionalRate: 7.5,
      promotionalPeriodMonths: 24
    }

    const personalFinances = {
      monthlyIncome: plan.monthly_income || 0,
      monthlyExpenses: plan.monthly_expenses || 0
    }

    const investmentParams = plan.expected_rental_income ? {
      expectedRentalIncome: plan.expected_rental_income,
      propertyExpenses: plan.expected_rental_income * 0.1,
      appreciationRate: 8,
      initialPropertyValue: plan.purchase_price || 0
    } : undefined

    const metrics = calculateFinancialMetrics(
      loanParams,
      personalFinances,
      investmentParams
    )

    const summaryData = [
      ['Monthly Payment (Promotional)', formatCurrency(metrics.monthlyPayment * 0.75)],
      ['Monthly Payment (Regular)', formatCurrency(metrics.monthlyPayment)],
      ['Total Interest', formatCurrency(metrics.totalInterest)],
      ['Debt-to-Income Ratio', `${metrics.debtToIncomeRatio.toFixed(1)}%`],
      ['Affordability Score', `${metrics.affordabilityScore}/10`],
      ['Net Monthly Cash Flow', formatCurrency((plan.monthly_income || 0) - (plan.monthly_expenses || 0) - metrics.monthlyPayment + (plan.expected_rental_income || 0))]
    ]

    if (metrics.roi) {
      summaryData.push(['Expected ROI', `${metrics.roi.toFixed(1)}%`])
    }

    if (metrics.paybackPeriod) {
      summaryData.push(['Payback Period', `${metrics.paybackPeriod.toFixed(1)} years`])
    }

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Financial Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: {
        fillColor: [16, 185, 129], // Green
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15
  }

  private addDetailedBreakdown(plan: FinancialPlanWithMetrics): void {
    this.checkPageBreak(80)
    this.addSectionTitle('Detailed Financial Breakdown')
    
    // Monthly cash flow breakdown
    const monthlyPayment = (plan.cached_calculations as any)?.monthlyPayment || 0
    const rentalIncome = plan.expected_rental_income || 0
    const netIncome = (plan.monthly_income || 0) - (plan.monthly_expenses || 0)
    const netCashFlow = netIncome - monthlyPayment + rentalIncome

    const breakdownData = [
      ['INCOME', '', ''],
      ['Monthly Salary', formatCurrency(plan.monthly_income || 0), ''],
      ['Rental Income', formatCurrency(rentalIncome), ''],
      ['Total Monthly Income', formatCurrency((plan.monthly_income || 0) + rentalIncome), ''],
      ['', '', ''],
      ['EXPENSES', '', ''],
      ['Living Expenses', formatCurrency(plan.monthly_expenses || 0), ''],
      ['Loan Payment', formatCurrency(monthlyPayment), ''],
      ['Total Monthly Expenses', formatCurrency((plan.monthly_expenses || 0) + monthlyPayment), ''],
      ['', '', ''],
      ['NET CASH FLOW', formatCurrency(netCashFlow), netCashFlow >= 0 ? 'POSITIVE' : 'NEGATIVE']
    ]

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Category', 'Amount (VNĐ)', 'Status']],
      body: breakdownData,
      theme: 'striped',
      headStyles: {
        fillColor: [139, 92, 246], // Purple
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
        1: { cellWidth: 60 },
        2: { cellWidth: 'auto' }
      },
      didParseCell: (data: any) => {
        // Style category headers
        if (data.cell.text[0] === 'INCOME' || data.cell.text[0] === 'EXPENSES') {
          data.cell.styles.fillColor = [75, 85, 99] // Gray
          data.cell.styles.textColor = 255
          data.cell.styles.fontStyle = 'bold'
        }
        // Style net cash flow
        if (data.cell.text[0] === 'NET CASH FLOW') {
          const isPositive = netCashFlow >= 0
          data.cell.styles.fillColor = isPositive ? [16, 185, 129] : [239, 68, 68] // Green or Red
          data.cell.styles.textColor = 255
          data.cell.styles.fontStyle = 'bold'
        }
      },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15
  }

  private addRiskAnalysis(plan: FinancialPlanWithMetrics): void {
    this.checkPageBreak(60)
    this.addSectionTitle('Risk Analysis')
    
    const risks = this.analyzeRisks(plan)
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Risk Factor', 'Level', 'Description']],
      body: risks.map(risk => [risk.factor, risk.level, risk.description]),
      theme: 'striped',
      headStyles: {
        fillColor: [245, 158, 11], // Amber
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 'auto' }
      },
      didParseCell: (data: any) => {
        const level = data.cell.text[0]
        if (data.column.index === 1) { // Risk level column
          if (level === 'HIGH') {
            data.cell.styles.fillColor = [239, 68, 68] // Red
            data.cell.styles.textColor = 255
          } else if (level === 'MEDIUM') {
            data.cell.styles.fillColor = [245, 158, 11] // Amber
            data.cell.styles.textColor = 255
          } else if (level === 'LOW') {
            data.cell.styles.fillColor = [16, 185, 129] // Green
            data.cell.styles.textColor = 255
          }
        }
      },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15
  }

  private addTimelineSection(plan: FinancialPlanWithMetrics): void {
    this.checkPageBreak(40)
    this.addSectionTitle('Key Milestones Timeline')
    
    const milestones = [
      { event: 'Contract Signing', date: 'Month 0', amount: formatCurrency(plan.down_payment || 0) },
      { event: 'Property Handover', date: 'Month 1', amount: 'Keys received' },
      { event: 'Promotional Rate Ends', date: 'Month 24', amount: 'Payment increases' },
      { event: 'Break-even Point', date: 'Month 60', amount: 'Investment neutral' },
      { event: 'Loan Completion', date: 'Month 240', amount: 'Property fully owned' }
    ]

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Milestone', 'Timeline', 'Description']],
      body: milestones.map(m => [m.event, m.date, m.amount]),
      theme: 'striped',
      headStyles: {
        fillColor: [99, 102, 241], // Indigo
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15
  }

  private addRecommendations(plan: FinancialPlanWithMetrics): void {
    this.checkPageBreak(60)
    this.addSectionTitle('Recommendations')
    
    const recommendations = this.generateRecommendations(plan)
    
    recommendations.forEach((rec, index) => {
      this.checkPageBreak(20)
      
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`${index + 1}. ${rec.title}`, this.margin, this.currentY)
      this.currentY += 8
      
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      const splitText = this.doc.splitTextToSize(rec.description, this.pageWidth - 2 * this.margin)
      this.doc.text(splitText, this.margin, this.currentY)
      this.currentY += splitText.length * 5 + 5
    })
  }

  private addFooter(): void {
    const pageCount = this.doc.internal.pages.length - 1
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      
      // Add page number
      this.doc.setFontSize(8)
      this.doc.setTextColor(128, 128, 128)
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      )
      
      // Add disclaimer
      this.doc.text(
        'This report is for informational purposes only and does not constitute financial advice.',
        this.pageWidth / 2,
        this.pageHeight - 5,
        { align: 'center' }
      )
    }
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak(25)
    
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(59, 130, 246) // Blue
    this.doc.text(title, this.margin, this.currentY)
    
    // Add underline
    this.doc.setDrawColor(59, 130, 246)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY + 2, this.margin + 80, this.currentY + 2)
    
    this.doc.setTextColor(0, 0, 0) // Reset to black
    this.currentY += 12
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage()
      this.currentY = 20
    }
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

  private analyzeRisks(plan: FinancialPlanWithMetrics): Array<{factor: string, level: string, description: string}> {
    const risks = []
    
    // Debt-to-income ratio risk
    const monthlyPayment = (plan.cached_calculations as any)?.monthlyPayment || 0
    const debtRatio = (monthlyPayment / (plan.monthly_income || 1)) * 100
    
    if (debtRatio > 40) {
      risks.push({
        factor: 'High Debt Ratio',
        level: 'HIGH',
        description: `Debt-to-income ratio of ${debtRatio.toFixed(1)}% exceeds recommended 40%`
      })
    } else if (debtRatio > 30) {
      risks.push({
        factor: 'Moderate Debt Ratio',
        level: 'MEDIUM',
        description: `Debt-to-income ratio of ${debtRatio.toFixed(1)}% is above 30%`
      })
    }
    
    // Down payment risk
    const downPaymentRatio = ((plan.down_payment || 0) / (plan.purchase_price || 1)) * 100
    if (downPaymentRatio < 20) {
      risks.push({
        factor: 'Low Down Payment',
        level: 'MEDIUM',
        description: `Down payment of ${downPaymentRatio.toFixed(1)}% below recommended 20%`
      })
    }
    
    // Affordability risk
    const affordabilityScore = (plan.cached_calculations as any)?.affordabilityScore
    if (affordabilityScore && affordabilityScore < 5) {
      risks.push({
        factor: 'Poor Affordability',
        level: 'HIGH',
        description: `Affordability score of ${affordabilityScore}/10 indicates high financial stress`
      })
    }
    
    // Interest rate risk
    risks.push({
      factor: 'Interest Rate Changes',
      level: 'MEDIUM',
      description: 'Rising interest rates could increase monthly payments significantly'
    })
    
    if (risks.length === 0) {
      risks.push({
        factor: 'Overall Risk',
        level: 'LOW',
        description: 'Financial plan shows good risk profile within acceptable parameters'
      })
    }
    
    return risks
  }

  private generateRecommendations(plan: FinancialPlanWithMetrics): Array<{title: string, description: string}> {
    const recommendations = []
    const affordabilityScore = (plan.cached_calculations as any)?.affordabilityScore
    
    // Affordability recommendations
    if (affordabilityScore && affordabilityScore >= 8) {
      recommendations.push({
        title: 'Consider Early Payments',
        description: 'Your excellent affordability score suggests you could make additional principal payments to save on interest and pay off the loan earlier.'
      })
    }
    
    // Cash flow recommendations
    const monthlyPayment = (plan.cached_calculations as any)?.monthlyPayment || 0
    const netFlow = (plan.monthly_income || 0) - (plan.monthly_expenses || 0) - monthlyPayment + (plan.expected_rental_income || 0)
    
    if (netFlow < 0) {
      recommendations.push({
        title: 'Improve Cash Flow',
        description: 'Consider increasing rental income, reducing expenses, or extending loan term to improve monthly cash flow position.'
      })
    }
    
    // Investment recommendations
    const roi = (plan.cached_calculations as any)?.roi
    if (plan.plan_type === 'investment' && roi && roi < 8) {
      recommendations.push({
        title: 'Review Investment Strategy',
        description: 'Current ROI projections are below market average. Consider alternative investment opportunities or ways to increase rental income.'
      })
    }
    
    // Emergency fund recommendation
    const emergencyFund = (plan.current_savings || 0) - (plan.down_payment || 0)
    const monthlyExpenses = plan.monthly_expenses || 0
    if (emergencyFund < monthlyExpenses * 6) {
      recommendations.push({
        title: 'Build Emergency Fund',
        description: 'Maintain 6-12 months of expenses as emergency fund after property purchase to handle unexpected situations.'
      })
    }
    
    // General recommendations
    recommendations.push({
      title: 'Monitor Market Conditions',
      description: 'Keep track of interest rate changes and refinancing opportunities to optimize your loan terms over time.'
    })
    
    recommendations.push({
      title: 'Regular Plan Review',
      description: 'Review and update your financial plan annually or when significant life changes occur to ensure it remains aligned with your goals.'
    })
    
    return recommendations
  }
}

// Export utility function
export async function exportFinancialPlanToPDF(
  plan: FinancialPlanWithMetrics,
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    const exporter = new FinancialPlanWithMetricsPDFExporter()
    const pdfBlob = await exporter.exportPlan(plan, {
      includeTimeline: true,
      includeAnalysis: true,
      includeRecommendations: true,
      ...options
    })
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${plan.plan_name.replace(/[^a-z0-9]/gi, '_')}_financial_plan.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting PDF:', error)
    throw error
  }
}