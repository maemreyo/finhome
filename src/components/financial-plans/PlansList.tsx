// src/components/financial-plans/PlansList.tsx
// Component for displaying and managing financial plans list

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Star,
  StarOff,
  TrendingUp,
  TrendingDown,
  Minus,
  Home,
  Building,
  DollarSign,
  Calendar,
  Target,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

// Import export functions
import { exportFinancialPlanToPDF } from '@/lib/export/pdfExport'
import { exportFinancialPlanToExcel, exportPlansComparison } from '@/lib/export/excelExport'

// Import database types
import { type FinancialPlanWithMetrics } from '@/lib/api/plans'

interface PlansListProps {
  plans: FinancialPlanWithMetrics[]
  onCreateNew: () => void
  onViewPlan: (planId: string) => void
  onEditPlan: (planId: string) => void
  onDeletePlan: (planId: string) => void
  onDuplicatePlan: (planId: string) => void
  onToggleFavorite: (planId: string) => void
  isLoading?: boolean
  className?: string
}

const getPlanTypeIcon = (type: string) => {
  const icons = {
    home_purchase: Home,
    investment: Building,
    upgrade: TrendingUp,
    refinance: DollarSign
  }
  return icons[type as keyof typeof icons] || Home
}

const getPlanTypeLabel = (type: string) => {
  const labels = {
    home_purchase: 'Mua nhà ở',
    investment: 'Đầu tư',
    upgrade: 'Nâng cấp',
    refinance: 'Đảo nợ'
  }
  return labels[type as keyof typeof labels] || 'Khác'
}

const getPlanStatusColor = (status: string) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800 border-gray-300',
    active: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    archived: 'bg-gray-100 text-gray-600 border-gray-200'
  }
  return colors[status as keyof typeof colors] || colors.draft
}

const getRiskLevelColor = (riskLevel?: string) => {
  if (!riskLevel) return 'bg-gray-100 text-gray-600'
  
  const colors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700'
  }
  return colors[riskLevel as keyof typeof colors]
}

const PlanCard: React.FC<{
  plan: FinancialPlanWithMetrics
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleFavorite: () => void
}> = ({ plan, onView, onEdit, onDelete, onDuplicate, onToggleFavorite }) => {
  const IconComponent = getPlanTypeIcon(plan.plan_type)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExporting(true)
    try {
      await exportFinancialPlanToPDF(plan, {
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

  const handleExportExcel = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExporting(true)
    try {
      await exportFinancialPlanToExcel(plan, {
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
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <CardTitle 
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-blue-600"
                  onClick={onView}
                >
                  {plan.plan_name}
                </CardTitle>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getPlanTypeLabel(plan.plan_type)}
                  </Badge>
                  
                  <Badge className={cn("text-xs", getPlanStatusColor(plan.status))}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </Badge>
                  
                  {plan.risk_tolerance && (
                    <Badge className={cn("text-xs", getRiskLevelColor(plan.risk_tolerance))}>
                      {plan.risk_tolerance.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onToggleFavorite}
              >
                {/* TODO: Implement favorites functionality in database */}
                <StarOff className="w-4 h-4 text-gray-400" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isExporting}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onView}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export PDF'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export Excel'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Price</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(plan.purchase_price || 0)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Down Payment</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(plan.down_payment || 0)}
                <span className="text-xs text-gray-500 ml-1">
                  ({plan.purchase_price && plan.down_payment ? ((plan.down_payment / plan.purchase_price) * 100).toFixed(0) : 0}%)
                </span>
              </p>
            </div>
          </div>
          
          {/* Monthly Metrics */}
          {plan.calculatedMetrics?.monthlyPayment && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Payment</p>
                <p className="font-semibold text-blue-600">
                  {formatCurrency(plan.calculatedMetrics.monthlyPayment)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Affordability</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((plan.calculatedMetrics?.affordabilityScore || 0) * 10, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {plan.calculatedMetrics?.affordabilityScore || 0}/10
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* ROI for Investment Properties */}
          {plan.plan_type === 'investment' && plan.calculatedMetrics?.roi && (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Expected ROI
                </span>
              </div>
              <span className="font-bold text-green-600">
                {plan.calculatedMetrics.roi.toFixed(1)}%
              </span>
            </div>
          )}
          
          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Created {new Date(plan.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            
            {plan.is_public && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const EmptyState: React.FC<{ onCreateNew: () => void }> = ({ onCreateNew }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
      <Target className="w-12 h-12 text-gray-400" />
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      No Financial Plans Yet
    </h3>
    
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Create your first financial plan to start analyzing your real estate investment opportunities
    </p>
    
    <Button onClick={onCreateNew} className="mx-auto">
      <Plus className="w-4 h-4 mr-2" />
      Create Your First Plan
    </Button>
  </div>
)

const PlansListSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export const PlansList: React.FC<PlansListProps> = ({
  plans,
  onCreateNew,
  onViewPlan,
  onEditPlan,
  onDeletePlan,
  onDuplicatePlan,
  onToggleFavorite,
  isLoading = false,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'price'>('updated')
  const [isExportingComparison, setIsExportingComparison] = useState(false)

  const handleExportComparison = async () => {
    if (filteredAndSortedPlans.length === 0) {
      toast.error('No plans to export')
      return
    }
    
    setIsExportingComparison(true)
    try {
      await exportPlansComparison(filteredAndSortedPlans, 'financial_plans_comparison')
      toast.success('Plans comparison exported successfully!')
    } catch (error) {
      toast.error('Failed to export comparison. Please try again.')
    } finally {
      setIsExportingComparison(false)
    }
  }
  
  // Filter and sort plans
  const filteredAndSortedPlans = React.useMemo(() => {
    const filtered = plans.filter(plan => {
      const matchesSearch = plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || plan.status === filterStatus
      return matchesSearch && matchesStatus
    })
    
    // Sort plans
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.plan_name.localeCompare(b.plan_name)
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'price':
          return (b.purchase_price || 0) - (a.purchase_price || 0)
        default:
          return 0
      }
    })
    
    // TODO: Implement favorites functionality in database
    return filtered
  }, [plans, searchQuery, filterStatus, sortBy])
  
  if (isLoading) {
    return (
      <div className={className}>
        <PlansListSkeleton />
      </div>
    )
  }
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Financial Plans
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {plans.length} {plans.length === 1 ? 'plan' : 'plans'} total
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {plans.length > 1 && (
            <Button 
              variant="outline" 
              onClick={handleExportComparison}
              disabled={isExportingComparison}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExportingComparison ? 'Exporting...' : 'Export Comparison'}
            </Button>
          )}
          
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Plan
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      {plans.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Plans Grid */}
      {filteredAndSortedPlans.length === 0 ? (
        plans.length === 0 ? (
          <EmptyState onCreateNew={onCreateNew} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No plans match your current filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('')
                setFilterStatus('all')
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredAndSortedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onView={() => onViewPlan(plan.id)}
                onEdit={() => onEditPlan(plan.id)}
                onDelete={() => onDeletePlan(plan.id)}
                onDuplicate={() => onDuplicatePlan(plan.id)}
                onToggleFavorite={() => onToggleFavorite(plan.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export default PlansList