// src/components/financial-plans/PlanStatusManager.tsx
// Component for managing plan status transitions and progress tracking

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Archive, 
  ArrowRight, 
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { type FinancialPlanWithMetrics } from '@/lib/api/plans'

type PlanStatus = 'draft' | 'active' | 'completed' | 'archived'

interface PlanStatusManagerProps {
  plan: FinancialPlanWithMetrics
  onStatusChange: (planId: string, newStatus: PlanStatus) => Promise<void>
  className?: string
}

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: Circle,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    description: 'Plan is being created and refined',
    progress: 25
  },
  active: {
    label: 'Active',
    icon: Clock,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    description: 'Plan is being executed',
    progress: 75
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    description: 'Plan has been successfully completed',
    progress: 100
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    description: 'Plan has been archived',
    progress: 100
  }
}

const statusTransitions: Record<PlanStatus, PlanStatus[]> = {
  draft: ['active', 'archived'],
  active: ['completed', 'archived'],
  completed: ['archived'],
  archived: ['draft'] // Can reactivate archived plans
}

export function PlanStatusManager({ plan, onStatusChange, className }: PlanStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const currentStatus = plan.status as PlanStatus
  const config = statusConfig[currentStatus]
  const Icon = config.icon
  const availableTransitions = statusTransitions[currentStatus]

  const handleStatusChange = async (newStatus: PlanStatus) => {
    setIsUpdating(true)
    try {
      await onStatusChange(plan.id, newStatus)
      toast.success(`Plan status updated to ${statusConfig[newStatus].label}`)
    } catch (error) {
      console.error('Error updating plan status:', error)
      toast.error('Failed to update plan status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusActionLabel = (status: PlanStatus): string => {
    switch (status) {
      case 'active':
        return 'Activate Plan'
      case 'completed':
        return 'Mark Complete'
      case 'archived':
        return 'Archive Plan'
      case 'draft':
        return 'Reactivate Plan'
      default:
        return `Change to ${status}`
    }
  }

  const calculatePlanProgress = (): number => {
    // Calculate progress based on plan metrics and status
    const baseProgress = config.progress
    
    if (currentStatus === 'active' && plan.calculatedMetrics) {
      // Add progress based on affordability score and other metrics
      const metricsBonus = (plan.calculatedMetrics.affordabilityScore || 0) * 2
      return Math.min(95, baseProgress + metricsBonus) // Cap at 95% for active plans
    }
    
    return baseProgress
  }

  const actualProgress = calculatePlanProgress()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${currentStatus === 'completed' ? 'text-green-600' : 'text-gray-600'}`} />
          Plan Progress
        </CardTitle>
        <CardDescription>
          Track your financial plan status and milestones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={config.color}>
              {config.label}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {config.description}
            </span>
          </div>
          {plan.completed_at && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              Completed {new Date(plan.completed_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">{actualProgress}%</span>
          </div>
          <Progress value={actualProgress} className="h-2" />
        </div>

        {/* Plan Metrics Summary */}
        {plan.calculatedMetrics && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {plan.calculatedMetrics.affordabilityScore || 0}/10
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Affordability Score
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {plan.calculatedMetrics.debtToIncomeRatio?.toFixed(1) || 0}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Debt-to-Income
              </div>
            </div>
          </div>
        )}

        {/* Status Transition Actions */}
        {availableTransitions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Available Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating}
                  className="flex items-center gap-1"
                >
                  {statusConfig[status].icon && 
                    React.createElement(statusConfig[status].icon, { className: "w-3 h-3" })
                  }
                  {getStatusActionLabel(status)}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Milestones */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <Target className="w-4 h-4" />
            Milestones
          </h4>
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: currentStatus !== 'draft' ? 1 : 0.5 }}
              className="flex items-center gap-2 text-sm"
            >
              {currentStatus !== 'draft' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
              Plan Created & Activated
            </motion.div>
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: currentStatus === 'completed' ? 1 : 0.5 }}
              className="flex items-center gap-2 text-sm"
            >
              {currentStatus === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
              Financial Goals Achieved
            </motion.div>
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: plan.calculatedMetrics?.affordabilityScore && plan.calculatedMetrics.affordabilityScore >= 7 ? 1 : 0.5 }}
              className="flex items-center gap-2 text-sm"
            >
              {plan.calculatedMetrics?.affordabilityScore && plan.calculatedMetrics.affordabilityScore >= 7 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
              Good Affordability Score (7+)
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}