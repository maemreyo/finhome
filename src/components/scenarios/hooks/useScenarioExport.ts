// src/components/scenarios/hooks/useScenarioExport.ts

import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useFeatureGate } from '@/components/subscription/FeatureGate'
import { getPlanByTier } from '@/config/subscriptionPlans'
import type { TimelineScenario } from '@/types/scenario'

export interface UseScenarioExportReturn {
  handleExportScenarios: (scenarios: TimelineScenario[], selectedScenarioIds: string[], format?: 'csv' | 'pdf' | 'excel' | 'json') => Promise<void>
  exportToPDF: (scenarios: TimelineScenario[], selectedScenarioIds: string[]) => Promise<void>
  exportToExcel: (scenarios: TimelineScenario[], selectedScenarioIds: string[]) => Promise<void>
  exportToJSON: (scenarios: TimelineScenario[], selectedScenarioIds: string[]) => Promise<void>
}

export const useScenarioExport = (): UseScenarioExportReturn => {
  const { user } = useAuth()
  const advancedExportGate = useFeatureGate({ featureKey: 'advanced_export' })

  // Get user's subscription limits
  const userPlan = user?.user_metadata?.subscription_tier ? getPlanByTier(user.user_metadata.subscription_tier) : getPlanByTier('free')

  const exportToPDF = async (scenarios: TimelineScenario[], selectedScenarioIds: string[]) => {
    if (selectedScenarioIds.length === 0) {
      toast.error('Please select at least one scenario to export')
      return
    }

    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default

      const selectedScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id))
      
      // Create PDF document
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(18)
      doc.text('Financial Scenario Analysis Report', 20, 20)
      
      // Add generation date
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)
      
      let yPosition = 50

      // Add scenario details
      selectedScenarios.forEach((scenario, index) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(14)
        doc.text(`${index + 1}. ${scenario.plan_name}`, 20, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.text(`Type: ${scenario.scenarioType} | Risk: ${scenario.riskLevel}`, 20, yPosition)
        yPosition += 8

        if (scenario.description) {
          const splitDescription = doc.splitTextToSize(scenario.description, 170)
          doc.text(splitDescription, 20, yPosition)
          yPosition += splitDescription.length * 5 + 5
        }

        // Financial metrics table
        const tableData = [
          ['Purchase Price', `${(scenario.purchase_price || 0).toLocaleString()} VND`],
          ['Down Payment', `${(scenario.down_payment || 0).toLocaleString()} VND`],
          ['Monthly Income', `${(scenario.monthly_income || 0).toLocaleString()} VND`],
          ['Monthly Expenses', `${(scenario.monthly_expenses || 0).toLocaleString()} VND`],
          ['Interest Rate', `${(scenario.expected_roi || 0).toFixed(2)}%`],
          ['Loan Term', `${Math.round((scenario.target_timeframe_months || 240) / 12)} years`]
        ]

        if (scenario.calculatedMetrics) {
          tableData.push(
            ['Monthly Payment', `${Math.round(scenario.calculatedMetrics.monthlyPayment).toLocaleString()} VND`],
            ['Total Cost', `${Math.round(scenario.calculatedMetrics.totalCost).toLocaleString()} VND`],
            ['DTI Ratio', `${scenario.calculatedMetrics.dtiRatio.toFixed(2)}%`]
          )
        }

        autoTable(doc, {
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 8 },
          margin: { left: 20 }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      })

      // Save PDF
      doc.save(`scenario-analysis-${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('PDF report generated successfully')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to generate PDF. Please try again.')
    }
  }

  const exportToExcel = async (scenarios: TimelineScenario[], selectedScenarioIds: string[]) => {
    if (selectedScenarioIds.length === 0) {
      toast.error('Please select at least one scenario to export')
      return
    }

    try {
      // Import XLSX dynamically
      const XLSX = await import('xlsx')
      
      const selectedScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id))
      
      // Prepare data for Excel
      const excelData = selectedScenarios.map(scenario => ({
        'Scenario Name': scenario.plan_name,
        'Type': scenario.scenarioType,
        'Risk Level': scenario.riskLevel,
        'Description': scenario.description || '',
        'Purchase Price (VND)': scenario.purchase_price || 0,
        'Down Payment (VND)': scenario.down_payment || 0,
        'Loan Amount (VND)': (scenario.purchase_price || 0) - (scenario.down_payment || 0),
        'Interest Rate (%)': scenario.expected_roi || 0,
        'Loan Term (Years)': Math.round((scenario.target_timeframe_months || 240) / 12),
        'Monthly Income (VND)': scenario.monthly_income || 0,
        'Monthly Expenses (VND)': scenario.monthly_expenses || 0,
        'Monthly Payment (VND)': scenario.calculatedMetrics?.monthlyPayment || 0,
        'Total Interest (VND)': scenario.calculatedMetrics?.totalInterest || 0,
        'Total Cost (VND)': scenario.calculatedMetrics?.totalCost || 0,
        'DTI Ratio (%)': scenario.calculatedMetrics?.dtiRatio || 0,
        'LTV Ratio (%)': scenario.calculatedMetrics?.ltvRatio || 0,
        'Affordability Score': scenario.calculatedMetrics?.affordabilityScore || 0,
        'Monthly Savings (VND)': scenario.calculatedMetrics?.monthlySavings || 0,
        'Created Date': scenario.created_at ? new Date(scenario.created_at).toLocaleDateString() : 'N/A',
        'Updated Date': scenario.updated_at ? new Date(scenario.updated_at).toLocaleDateString() : 'N/A'
      }))

      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new()
      
      // Main data sheet
      const ws = XLSX.utils.json_to_sheet(excelData)
      XLSX.utils.book_append_sheet(wb, ws, 'Scenario Analysis')

      // Summary sheet
      const summaryData = [
        { Metric: 'Total Scenarios', Value: selectedScenarios.length },
        { Metric: 'Average Purchase Price', Value: Math.round(selectedScenarios.reduce((sum, s) => sum + (s.purchase_price || 0), 0) / selectedScenarios.length) },
        { Metric: 'Average Monthly Payment', Value: Math.round(selectedScenarios.reduce((sum, s) => sum + (s.calculatedMetrics?.monthlyPayment || 0), 0) / selectedScenarios.length) },
        { Metric: 'Report Generated', Value: new Date().toLocaleString() }
      ]
      const summaryWs = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

      // Export file
      XLSX.writeFile(wb, `scenario-analysis-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Excel workbook generated successfully')
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Failed to generate Excel file. Please try again.')
    }
  }

  const exportToJSON = async (scenarios: TimelineScenario[], selectedScenarioIds: string[]) => {
    if (selectedScenarioIds.length === 0) {
      toast.error('Please select at least one scenario to export')
      return
    }

    try {
      const selectedScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id))
      
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalScenarios: selectedScenarios.length,
          exportedBy: 'FinHome Application'
        },
        scenarios: selectedScenarios.map(scenario => ({
          id: scenario.id,
          name: scenario.plan_name,
          type: scenario.scenarioType,
          riskLevel: scenario.riskLevel,
          description: scenario.description,
          financial: {
            purchasePrice: scenario.purchase_price,
            downPayment: scenario.down_payment,
            loanAmount: (scenario.purchase_price || 0) - (scenario.down_payment || 0),
            interestRate: scenario.expected_roi,
            loanTermMonths: scenario.target_timeframe_months,
            monthlyIncome: scenario.monthly_income,
            monthlyExpenses: scenario.monthly_expenses
          },
          calculatedMetrics: scenario.calculatedMetrics,
          timestamps: {
            created: scenario.created_at,
            updated: scenario.updated_at
          }
        }))
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scenario-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('JSON data exported successfully')
    } catch (error) {
      console.error('JSON export error:', error)
      toast.error('Failed to export JSON data. Please try again.')
    }
  }

  const handleExportScenarios = async (scenarios: TimelineScenario[], selectedScenarioIds: string[], format: 'csv' | 'pdf' | 'excel' | 'json' = 'csv') => {
    if (selectedScenarioIds.length === 0) {
      toast.error('Please select at least one scenario to export')
      return
    }

    // Check available export formats based on subscription
    const availableFormats = userPlan?.limits.exportCapabilities || ['csv']
    const hasAdvancedExport = advancedExportGate.hasAccess

    // Check if user has access to requested format
    if (format !== 'csv' && !hasAdvancedExport) {
      toast.error(`${format.toUpperCase()} export requires a Premium subscription`)
      return
    }

    try {
      // Track usage for advanced export features
      if (hasAdvancedExport && format !== 'csv') {
        await advancedExportGate.trackUsage()
      }

      // Route to appropriate export method
      switch (format) {
        case 'pdf':
          await exportToPDF(scenarios, selectedScenarioIds)
          break
        case 'excel':
          await exportToExcel(scenarios, selectedScenarioIds)
          break
        case 'json':
          await exportToJSON(scenarios, selectedScenarioIds)
          break
        case 'csv':
        default:
          await exportToCSV(scenarios, selectedScenarioIds)
          break
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export scenarios. Please try again.')
    }
  }

  const exportToCSV = async (scenarios: TimelineScenario[], selectedScenarioIds: string[]) => {
    const selectedScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id))
      
    // Prepare comprehensive data for export
    const exportData = selectedScenarios.map(scenario => ({
      // Basic Info
      name: scenario.plan_name,
      type: scenario.scenarioType,
      riskLevel: scenario.riskLevel,
      description: scenario.description || '',
      
      // Financial Parameters
      purchasePrice: scenario.purchase_price || 0,
      downPayment: scenario.down_payment || 0,
      loanAmount: (scenario.purchase_price || 0) - (scenario.down_payment || 0),
      interestRate: scenario.expected_roi || 0,
      loanTermMonths: scenario.target_timeframe_months || 240,
      
      // Income & Expenses
      monthlyIncome: scenario.monthly_income || 0,
      monthlyExpenses: scenario.monthly_expenses || 0,
      
      // Calculated Metrics
      monthlyPayment: scenario.calculatedMetrics?.monthlyPayment || 0,
      totalInterest: scenario.calculatedMetrics?.totalInterest || 0,
      totalCost: scenario.calculatedMetrics?.totalCost || 0,
      dtiRatio: scenario.calculatedMetrics?.dtiRatio || 0,
      ltvRatio: scenario.calculatedMetrics?.ltvRatio || 0,
      affordabilityScore: scenario.calculatedMetrics?.affordabilityScore || 0,
      monthlySavings: scenario.calculatedMetrics?.monthlySavings || 0,
      
      // Metadata
      createdAt: scenario.created_at,
      updatedAt: scenario.updated_at
    }))

    // Enhanced CSV Export with proper formatting
    const csvHeaders = [
        'Scenario Name', 'Type', 'Risk Level', 'Description',
        'Purchase Price (VND)', 'Down Payment (VND)', 'Loan Amount (VND)', 
        'Interest Rate (%)', 'Loan Term (Months)',
        'Monthly Income (VND)', 'Monthly Expenses (VND)',
        'Monthly Payment (VND)', 'Total Interest (VND)', 'Total Cost (VND)',
        'DTI Ratio (%)', 'LTV Ratio (%)', 'Affordability Score', 'Monthly Savings (VND)',
        'Created Date', 'Updated Date'
      ]
      
    const csvRows = exportData.map(row => [
        row.name,
        row.type,
        row.riskLevel,
        `"${row.description.replace(/"/g, '""')}"`, // Escape quotes
        row.purchasePrice.toLocaleString(),
        row.downPayment.toLocaleString(),
        row.loanAmount.toLocaleString(),
        row.interestRate.toFixed(2),
        row.loanTermMonths,
        row.monthlyIncome.toLocaleString(),
        row.monthlyExpenses.toLocaleString(),
        Math.round(row.monthlyPayment).toLocaleString(),
        Math.round(row.totalInterest).toLocaleString(),
        Math.round(row.totalCost).toLocaleString(),
        row.dtiRatio.toFixed(2),
        row.ltvRatio.toFixed(2),
        row.affordabilityScore,
        Math.round(row.monthlySavings).toLocaleString(),
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A',
        row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A'
    ])

    const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Add BOM for proper UTF-8 encoding in Excel
    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], { 
      type: 'text/csv;charset=utf-8' 
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scenario-comparison-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Successfully exported ${selectedScenarios.length} scenarios to CSV`)
  }

  return {
    handleExportScenarios,
    exportToPDF,
    exportToExcel,
    exportToJSON
  }
}