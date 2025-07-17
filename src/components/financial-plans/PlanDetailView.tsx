// src/components/financial-plans/PlanDetailView.tsx
// Detailed view component for financial plans

'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Edit,
  Share2,
  Download,
  MoreHorizontal,
  Calculator,
  TrendingUp,
  DollarSign,
  Home,
  Building,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  PieChart,
  BarChart3,
  Calendar
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

// Import our components
import { TimelineVisualization, TimelineScenario } from '@/components/timeline/TimelineVisualization'
import { FinancialScenario } from '@/types/scenario'
import PlanProgressTracker, { PlanProgress, PlanMilestone } from '@/components/plans/PlanProgressTracker'
import { UIFinancialPlan } from '@/lib/adapters/planAdapter'
import type { PlanStatus } from '@/lib/supabase/types'

// Import export functions
import { exportFinancialPlanToPDF } from '@/lib/export/pdfExport'
import { exportFinancialPlanToExcel } from '@/lib/export/excelExport'

interface PlanDetailViewProps {
  plan: FinancialScenario
  scenarios: TimelineScenario[]
  onBack: () => void
  onEdit: () => void
  onShare: () => void
  onDownload: () => void
  className?: string
}

const MetricCard: React.FC<{
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<any>
  color?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}> = ({ title, value, subtitle, icon: Icon, color = 'text-blue-600', trend, trendValue }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className={cn("text-2xl font-bold", color)}>
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <Icon className={cn("w-8 h-8", color)} />
          
          {trend && trendValue && (
            <div className={cn(
              "flex items-center text-xs",
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            )}>
              <TrendingUp className={cn(
                "w-3 h-3 mr-1",
                trend === 'down' && 'rotate-180'
              )} />
              {trendValue}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

const RiskAssessment: React.FC<{
  plan: FinancialScenario
}> = ({ plan }) => {
  const riskFactors = useMemo(() => {
    const factors = []
    
    if (plan.calculatedMetrics?.affordabilityScore && plan.calculatedMetrics.affordabilityScore < 5) {
      factors.push({
        type: 'high',
        message: 'Low affordability score indicates high payment burden',
        icon: AlertTriangle
      })
    }
    
    const debtRatio = plan.calculatedMetrics?.monthlyPayment ? 
      (plan.calculatedMetrics.monthlyPayment / (plan.monthly_income || 1)) * 100 : 0
    
    if (debtRatio > 40) {
      factors.push({
        type: 'high',
        message: 'Debt-to-income ratio exceeds recommended 40%',
        icon: AlertTriangle
      })
    } else if (debtRatio > 30) {
      factors.push({
        type: 'medium',
        message: 'Debt-to-income ratio is above 30%',
        icon: Info
      })
    }
    
    const downPaymentRatio = ((plan.down_payment || 0) / (plan.purchase_price || 1)) * 100
    if (downPaymentRatio < 20) {
      factors.push({
        type: 'medium',
        message: 'Down payment below 20% increases loan risk',
        icon: Info
      })
    }
    
    if (factors.length === 0) {
      factors.push({
        type: 'low',
        message: 'Financial plan shows good risk profile',
        icon: CheckCircle
      })
    }
    
    return factors
  }, [plan])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {riskFactors.map((factor, index) => {
          const IconComponent = factor.icon
          const colorClasses = {
            low: 'text-green-600 bg-green-50',
            medium: 'text-amber-600 bg-amber-50',
            high: 'text-red-600 bg-red-50'
          }
          
          return (
            <div
              key={index}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg",
                colorClasses[factor.type as keyof typeof colorClasses]
              )}
            >
              <IconComponent className="w-5 h-5 mt-0.5" />
              <p className="text-sm font-medium">{factor.message}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

const CashFlowBreakdown: React.FC<{
  plan: FinancialScenario
}> = ({ plan }) => {
  const breakdown = useMemo(() => {
    const monthlyPayment = plan.calculatedMetrics?.monthlyPayment || 0
    const rentalIncome = plan.expected_rental_income || 0
    const netIncome = (plan.monthly_income || 0) - (plan.monthly_expenses || 0)
    const netCashFlow = netIncome - monthlyPayment + rentalIncome
    
    return {
      income: {
        salary: plan.monthly_income || 0,
        rental: rentalIncome,
        total: (plan.monthly_income || 0) + rentalIncome
      },
      expenses: {
        living: plan.monthly_expenses || 0,
        loanPayment: monthlyPayment,
        total: (plan.monthly_expenses || 0) + monthlyPayment
      },
      netCashFlow,
      surplus: netCashFlow > 0 ? netCashFlow : 0,
      shortfall: netCashFlow < 0 ? Math.abs(netCashFlow) : 0
    }
  }, [plan])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Monthly Cash Flow Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Income Section */}
        <div>
          <h4 className="font-medium text-green-700 mb-3">Income</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Salary</span>
              <span className="font-medium">{formatCurrency(breakdown.income.salary)}</span>
            </div>
            {breakdown.income.rental > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rental Income</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(breakdown.income.rental)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span>Total Income</span>
              <span className="text-green-600">
                {formatCurrency(breakdown.income.total)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Expenses Section */}
        <div>
          <h4 className="font-medium text-red-700 mb-3">Expenses</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Living Expenses</span>
              <span className="font-medium">{formatCurrency(breakdown.expenses.living)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Loan Payment</span>
              <span className="font-medium">{formatCurrency(breakdown.expenses.loanPayment)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span>Total Expenses</span>
              <span className="text-red-600">
                {formatCurrency(breakdown.expenses.total)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Net Cash Flow */}
        <div className={cn(
          "p-4 rounded-lg",
          breakdown.netCashFlow >= 0 ? "bg-green-50" : "bg-red-50"
        )}>
          <div className="flex justify-between items-center">
            <span className="font-medium">Net Monthly Cash Flow</span>
            <span className={cn(
              "text-lg font-bold",
              breakdown.netCashFlow >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {breakdown.netCashFlow >= 0 ? '+' : ''}
              {formatCurrency(breakdown.netCashFlow)}
            </span>
          </div>
          
          {breakdown.surplus > 0 && (
            <p className="text-sm text-green-700 mt-2">
              Great! You have a monthly surplus for savings or investments.
            </p>
          )}
          
          {breakdown.shortfall > 0 && (
            <p className="text-sm text-red-700 mt-2">
              Warning: Monthly shortfall requires attention to budget or income.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const InvestmentMetrics: React.FC<{
  plan: FinancialScenario
}> = ({ plan }) => {
  const metrics = useMemo(() => {
    if (plan.plan_type !== 'investment' || !plan.expected_rental_income) {
      return null
    }
    
    const annualRental = plan.expected_rental_income! * 12
    const purchasePrice = plan.purchase_price || 0
    const grossYield = (annualRental / purchasePrice) * 100
    
    // Estimate property expenses (10% of rental income)
    const annualExpenses = annualRental * 0.1
    const netAnnualIncome = annualRental - annualExpenses
    const netYield = (netAnnualIncome / purchasePrice) * 100
    
    // Cash-on-cash return (return on actual cash invested)
    const cashInvested = plan.down_payment || 0
    const annualCashFlow = netAnnualIncome - (plan.calculatedMetrics?.monthlyPayment || 0) * 12
    const cashOnCashReturn = (annualCashFlow / cashInvested) * 100
    
    return {
      grossYield,
      netYield,
      cashOnCashReturn,
      annualCashFlow,
      breakEvenRent: ((plan.calculatedMetrics?.monthlyPayment || 0) + (annualExpenses / 12))
    }
  }, [plan])
  
  if (!metrics) {
    return null
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Investment Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Gross Yield</p>
            <p className="text-lg font-bold text-blue-600">
              {metrics.grossYield.toFixed(1)}%
            </p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Net Yield</p>
            <p className="text-lg font-bold text-green-600">
              {metrics.netYield.toFixed(1)}%
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Cash-on-Cash Return</p>
            <p className={cn(
              "text-lg font-bold",
              metrics.cashOnCashReturn > 0 ? "text-purple-600" : "text-red-600"
            )}>
              {metrics.cashOnCashReturn.toFixed(1)}%
            </p>
          </div>
          
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-gray-600">Break-Even Rent</p>
            <p className="text-lg font-bold text-amber-600">
              {formatCurrency(metrics.breakEvenRent)}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "p-3 rounded-lg",
          metrics.annualCashFlow > 0 ? "bg-green-50" : "bg-red-50"
        )}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Annual Cash Flow</span>
            <span className={cn(
              "font-bold",
              metrics.annualCashFlow > 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(metrics.annualCashFlow)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const PlanDetailView: React.FC<PlanDetailViewProps> = ({
  plan,
  scenarios,
  onBack,
  onEdit,
  onShare,
  onDownload,
  className
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    scenarios.find(s => s.scenarioType === 'baseline')?.id || scenarios[0]?.id || ''
  )
  const [isExporting, setIsExporting] = useState(false)

  // Convert FinancialPlan to UIFinancialPlan for the progress tracker
  const uiPlan: UIFinancialPlan = {
    id: plan.id,
    planName: plan.plan_name,
    planDescription: plan.description || '',
    planType: plan.plan_type,
    purchasePrice: plan.purchase_price || 0,
    downPayment: plan.down_payment || 0,
    monthlyIncome: plan.monthly_income || 0,
    monthlyExpenses: plan.monthly_expenses || 0,
    currentSavings: plan.current_savings || 0,
    planStatus: 'active', // Default status since not in schema
    isPublic: plan.is_public,
    isFavorite: false, // Default value since not in schema
    createdAt: new Date(plan.created_at),
    updatedAt: new Date(plan.updated_at),
    monthlyPayment: plan.calculatedMetrics?.monthlyPayment,
    totalInterest: plan.calculatedMetrics?.totalInterest,
    affordabilityScore: plan.calculatedMetrics?.affordabilityScore,
    riskLevel: plan.riskLevel,
    roi: undefined, // ROI not in schema
    expectedRentalIncome: plan.expected_rental_income || undefined
  }

  // Mock progress data - in a real app, this would come from an API
  const mockProgress: PlanProgress = {
    totalProgress: 65,
    financialProgress: 75,
    savingsTarget: plan.down_payment || 0,
    currentSavings: plan.current_savings || 0,
    monthlyContribution: 5000000, // 5M VND per month
    estimatedCompletionDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    milestones: [
      {
        id: 'financial-1',
        title: 'Complete down payment savings',
        description: 'Accumulate full down payment amount',
        targetDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        category: 'financial',
        requiredAmount: plan.down_payment || 0,
        currentAmount: plan.current_savings || 0,
        priority: 'high'
      },
      {
        id: 'legal-1',
        title: 'Property legal verification',
        description: 'Verify property ownership and legal status',
        targetDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        status: 'pending',
        category: 'legal',
        priority: 'high'
      },
      {
        id: 'financial-2',
        title: 'Secure bank loan approval',
        description: 'Get pre-approval from chosen bank',
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: 'pending',
        category: 'financial',
        priority: 'high'
      },
      {
        id: 'property-1',
        title: 'Property inspection',
        description: 'Professional property condition assessment',
        targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        status: 'pending',
        category: 'property',
        priority: 'medium'
      },
      {
        id: 'admin-1',
        title: 'Insurance setup',
        description: 'Property and mortgage insurance arrangement',
        targetDate: new Date(Date.now() + 190 * 24 * 60 * 60 * 1000),
        status: 'pending',
        category: 'admin',
        priority: 'medium'
      }
    ],
    statusHistory: [
      {
        status: 'draft',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        note: 'Plan created'
      },
      {
        status: 'active',
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        note: 'Plan activated by user'
      }
    ]
  }

  const handleStatusChange = (status: PlanStatus, note?: string) => {
    // In a real app, this would call an API to update the plan status
    console.log('Status change:', status, note)
    toast.success(`Plan status updated to ${status}`)
  }

  const handleMilestoneUpdate = (milestoneId: string, updates: Partial<PlanMilestone>) => {
    // In a real app, this would call an API to update the milestone
    console.log('Milestone update:', milestoneId, updates)
    toast.success('Milestone updated successfully')
  }

  const handleContributionUpdate = (amount: number) => {
    // In a real app, this would call an API to update the monthly contribution
    console.log('Contribution update:', amount)
    toast.success(`Monthly contribution updated to ${formatCurrency(amount)}`)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      await exportFinancialPlanToPDF(uiPlan, {
        includeTimeline: true,
        includeAnalysis: true,
        includeRecommendations: true
      })
      toast.success('PDF exported successfully!')
    } catch (error) {
      toast.error('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      await exportFinancialPlanToExcel(uiPlan, {
        includeAmortizationSchedule: true,
        includeCashFlowProjection: true,
        includeScenarioComparison: true,
        projectionYears: 20
      })
      toast.success('Excel file exported successfully!')
    } catch (error) {
      toast.error('Failed to export Excel. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }
  
  const getPlanTypeIcon = () => {
    const icons = {
      home_purchase: Home,
      investment: Building,
      upgrade: TrendingUp,
      refinance: DollarSign
    }
    return icons[plan.plan_type] || Home
  }
  
  const IconComponent = getPlanTypeIcon()
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {plan.plan_name}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">
                  {plan.plan_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Badge>
                <Badge className={cn(
                  plan.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                  plan.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                )}>
                  {plan.riskLevel?.toUpperCase() || 'CALCULATING'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export PDF Report'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Excel Analysis'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Purchase Price"
          value={plan.purchase_price || 0}
          icon={Home}
          color="text-blue-600"
        />
        
        <MetricCard
          title="Monthly Payment"
          value={plan.calculatedMetrics?.monthlyPayment || 0}
          subtitle="Estimated"
          icon={Calculator}
          color="text-green-600"
        />
        
        <MetricCard
          title="Affordability Score"
          value={`${plan.calculatedMetrics?.affordabilityScore || 0}/10`}
          icon={Target}
          color="text-purple-600"
        />
        
        {/* ROI not available in new schema */}
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CashFlowBreakdown plan={plan} />
            <RiskAssessment plan={plan} />
            {plan.plan_type === 'investment' && <InvestmentMetrics plan={plan} />}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <PlanProgressTracker
            plan={uiPlan}
            progress={mockProgress}
            onStatusChange={handleStatusChange}
            onMilestoneUpdate={handleMilestoneUpdate}
            onContributionUpdate={handleContributionUpdate}
          />
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Financial Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scenarios.length > 0 ? (
                <TimelineVisualization
                  scenarios={scenarios}
                  currentScenarioId={selectedScenarioId}
                  onScenarioChange={setSelectedScenarioId}
                  interactionMode="view"
                  showGhostTimeline={true}
                  enableWhatIfMode={false}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No timeline data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan details, sensitivity analysis, etc. */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">{new Date(plan.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{new Date(plan.updated_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Down Payment</p>
                    <p className="font-medium">
                      {formatCurrency(plan.down_payment || 0)} 
                      ({(((plan.down_payment || 0) / (plan.purchase_price || 1)) * 100).toFixed(1)}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Current Savings</p>
                    <p className="font-medium">{formatCurrency(plan.current_savings || 0)}</p>
                  </div>
                </div>
                
                {plan.description && (
                  <div>
                    <p className="text-gray-500 text-sm">Description</p>
                    <p className="mt-1">{plan.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.calculatedMetrics?.affordabilityScore && plan.calculatedMetrics.affordabilityScore >= 8 && (
                    <div className="flex items-start space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4 mt-1" />
                      <p className="text-sm">Excellent affordability - consider prepayments to save on interest</p>
                    </div>
                  )}
                  
                  {plan.calculatedMetrics?.monthlyPayment && (plan.calculatedMetrics.monthlyPayment / (plan.monthly_income || 1)) > 0.3 && (
                    <div className="flex items-start space-x-2 text-amber-600">
                      <Info className="w-4 h-4 mt-1" />
                      <p className="text-sm">Consider increasing down payment to reduce monthly burden</p>
                    </div>
                  )}
                  
                  {plan.plan_type === 'investment' && false && ( // ROI not available in new schema
                    <div className="flex items-start space-x-2 text-red-600">
                      <AlertTriangle className="w-4 h-4 mt-1" />
                      <p className="text-sm">Low ROI - consider alternative investment strategies</p>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-2 text-blue-600">
                    <Info className="w-4 h-4 mt-1" />
                    <p className="text-sm">Monitor interest rate changes for refinancing opportunities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {scenarios.length > 0 ? (
                <div className="space-y-4">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-colors",
                        selectedScenarioId === scenario.id 
                          ? "border-blue-500 bg-blue-50" 
                          : "hover:border-gray-400"
                      )}
                      onClick={() => setSelectedScenarioId(scenario.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{scenario.plan_name}</h4>
                          <p className="text-sm text-gray-600">
                            {scenario.calculatedMetrics?.payoffTimeMonths || 0} months • {formatCurrency(scenario.calculatedMetrics?.totalInterest || 0)} interest
                          </p>
                        </div>
                        
                        <Badge className={cn(
                          scenario.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          scenario.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {scenario.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No scenarios available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PlanDetailView