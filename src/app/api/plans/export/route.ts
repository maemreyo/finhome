// src/app/api/plans/export/route.ts
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const exportPlanSchema = z.object({
  planId: z.string().uuid(),
  format: z.enum(['pdf', 'excel', 'csv']),
  includeCharts: z.boolean().optional().default(true),
  includeCalculations: z.boolean().optional().default(true),
  includeLoanDetails: z.boolean().optional().default(true),
  includeTimeline: z.boolean().optional().default(true),
  includePersonalInfo: z.boolean().optional().default(false),
  language: z.enum(['vi', 'en']).optional().default('vi'),
  template: z.enum(['detailed', 'summary', 'presentation']).optional().default('detailed')
})

// POST /api/plans/export - Export plan to various formats
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const exportOptions = exportPlanSchema.parse(body)

    const supabase = await createClient()

    // Get plan details
    const { data: plan, error: fetchError } = await supabase
      .from('financial_plans')
      .select(`
        *,
        user_profiles!inner(
          full_name,
          email,
          monthly_income,
          monthly_expenses
        )
      `)
      .eq('id', exportOptions.planId)
      .single()

    if (fetchError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user owns the plan or plan is public
    if (plan.user_id !== user.id && !plan.is_public) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate export data based on options
    const exportData = generateExportData(plan, exportOptions)

    // For demonstration, we'll return a mock file
    // In a real implementation, you would generate actual PDF/Excel/CSV files
    const mockFileContent = generateMockFile(exportData, exportOptions)

    const filename = `${plan.plan_name}_${exportOptions.format}_${Date.now()}.${exportOptions.format}`
    const mimeType = getMimeType(exportOptions.format)

    return new NextResponse(mockFileContent, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': mockFileContent.length.toString()
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Unexpected error in POST /api/plans/export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateExportData(plan: any, options: any) {
  const data: any = {
    planInfo: {
      name: plan.plan_name,
      description: plan.description,
      type: plan.plan_type,
      status: plan.status,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at
    },
    financial: {
      purchasePrice: plan.purchase_price,
      downPayment: plan.down_payment,
      monthlyIncome: plan.monthly_income,
      monthlyExpenses: plan.monthly_expenses,
      currentSavings: plan.current_savings,
      additionalCosts: plan.additional_costs,
      otherDebts: plan.other_debts
    }
  }

  if (options.includeCalculations) {
    const loanAmount = (plan.purchase_price || 0) - (plan.down_payment || 0)
    const interestRate = 8.5 / 100 / 12 // Monthly interest rate
    const loanTermMonths = 240 // 20 years
    const monthlyPayment = loanAmount > 0 ? 
      loanAmount * (interestRate * Math.pow(1 + interestRate, loanTermMonths)) / 
      (Math.pow(1 + interestRate, loanTermMonths) - 1) : 0

    data.calculations = {
      loanAmount,
      monthlyPayment,
      totalInterest: (monthlyPayment * loanTermMonths) - loanAmount,
      netCashFlow: (plan.monthly_income || 0) - (plan.monthly_expenses || 0) - monthlyPayment + (plan.expected_rental_income || 0)
    }
  }

  if (options.includeLoanDetails) {
    data.loanDetails = {
      interestRate: 8.5,
      loanTermYears: 20,
      loanTermMonths: 240,
      preferredBanks: plan.preferred_banks || []
    }
  }

  if (options.includePersonalInfo && plan.user_profiles) {
    data.personalInfo = {
      fullName: plan.user_profiles.full_name,
      email: plan.user_profiles.email
    }
  }

  return data
}

function generateMockFile(data: any, options: any): Buffer {
  let content = ''

  if (options.format === 'csv') {
    content = generateCSV(data)
  } else if (options.format === 'excel') {
    content = generateExcelMock(data)
  } else {
    content = generatePDFMock(data)
  }

  return Buffer.from(content, 'utf-8')
}

function generateCSV(data: any): string {
  const lines = []
  
  // Plan Information
  lines.push('Plan Information')
  lines.push(`Name,${data.planInfo.name}`)
  lines.push(`Description,${data.planInfo.description || ''}`)
  lines.push(`Type,${data.planInfo.type}`)
  lines.push(`Status,${data.planInfo.status}`)
  lines.push('')

  // Financial Information
  lines.push('Financial Information')
  lines.push(`Purchase Price,${data.financial.purchasePrice || 0}`)
  lines.push(`Down Payment,${data.financial.downPayment || 0}`)
  lines.push(`Monthly Income,${data.financial.monthlyIncome || 0}`)
  lines.push(`Monthly Expenses,${data.financial.monthlyExpenses || 0}`)
  lines.push(`Current Savings,${data.financial.currentSavings || 0}`)
  lines.push('')

  // Calculations
  if (data.calculations) {
    lines.push('Calculations')
    lines.push(`Loan Amount,${data.calculations.loanAmount || 0}`)
    lines.push(`Monthly Payment,${data.calculations.monthlyPayment || 0}`)
    lines.push(`Total Interest,${data.calculations.totalInterest || 0}`)
    lines.push(`Net Cash Flow,${data.calculations.netCashFlow || 0}`)
  }

  return lines.join('\n')
}

function generateExcelMock(data: any): string {
  // This would normally generate an actual Excel file
  // For demo purposes, we'll return a simple format
  return `EXCEL FORMAT - ${data.planInfo.name}\n\n${generateCSV(data)}`
}

function generatePDFMock(data: any): string {
  // This would normally generate an actual PDF file
  // For demo purposes, we'll return a simple text format
  return `PDF FORMAT - Financial Plan Report\n\n${generateCSV(data)}`
}

function getMimeType(format: string): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf'
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'csv':
      return 'text/csv'
    default:
      return 'text/plain'
  }
}