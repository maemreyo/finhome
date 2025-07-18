// src/components/plans/PlanProgressDashboard.tsx
// Comprehensive plan progress dashboard with status management and progress tracking

'use client'

import React, { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

// Import our components
import PlanStatusManager from './PlanStatusManager'
import { PlanProgressTracker } from './PlanProgressTracker'
import { UIFinancialPlan } from '@/lib/adapters/planAdapter'
import type { 
  PlanStatus, 
  PlanProgress, 
  PlanMilestone, 
  PlanStatusInfo 
} from '@/types/plans'

interface PlanProgressDashboardProps {
  plan: UIFinancialPlan
  onStatusChange: (newStatus: PlanStatus, reason?: string, notes?: string) => void
  onMilestoneUpdate: (milestoneId: string, updates: Partial<PlanMilestone>) => void
  onContributionUpdate: (amount: number) => void
  className?: string
}

// Mock data for status info
const mockStatusInfo: PlanStatusInfo = {
  status: 'active',
  progress: 65,
  statusHistory: [
    {
      id: 'status-1',
      previousStatus: 'draft',
      newStatus: 'active',
      changedBy: 'User',
      changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      reason: 'Plan approved and ready to execute',
      notes: 'All documents verified and finances confirmed'
    },
    {
      id: 'status-2',
      previousStatus: 'active',
      newStatus: 'archived',
      changedBy: 'User',
      changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      reason: 'Archived for review',
      notes: 'Plan needs updates before reactivation'
    },
    {
      id: 'status-3',
      previousStatus: 'archived',
      newStatus: 'active',
      changedBy: 'User',
      changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reason: 'Loan approved, resuming execution',
      notes: 'All requirements met, proceeding with property purchase'
    }
  ],
  canTransitionTo: ['archived', 'completed'],
  estimatedCompletionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  archiveReason: undefined,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
}

// Mock progress data
const mockProgress: PlanProgress = {
  totalProgress: 65,
  financialProgress: 75,
  savingsTarget: 600000000, // 600M VND
  currentSavings: 450000000, // 450M VND
  monthlyContribution: 25000000, // 25M VND
  estimatedCompletionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  milestones: [
    {
      id: 'milestone-1',
      title: 'Complete down payment savings',
      description: 'Accumulate 600M VND for down payment',
      targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      status: 'in_progress',
      category: 'financial',
      requiredAmount: 600000000,
      currentAmount: 450000000,
      priority: 'high'
    },
    {
      id: 'milestone-2',
      title: 'Secure loan pre-approval',
      description: 'Get pre-approved for mortgage loan',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'completed',
      category: 'financial',
      priority: 'high'
    },
    {
      id: 'milestone-3',
      title: 'Property legal verification',
      description: 'Complete legal due diligence',
      targetDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'legal',
      priority: 'high'
    },
    {
      id: 'milestone-4',
      title: 'Property insurance',
      description: 'Secure comprehensive property insurance',
      targetDate: new Date(Date.now() + 160 * 24 * 60 * 60 * 1000),
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
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      note: 'Plan activated and execution started'
    }
  ]
}

const PlanProgressDashboard: React.FC<PlanProgressDashboardProps> = ({
  plan,
  onStatusChange,
  onMilestoneUpdate,
  onContributionUpdate,
  className
}) => {
  const t = useTranslations('PlanProgressDashboard')
  const [statusInfo, setStatusInfo] = useState<PlanStatusInfo>(mockStatusInfo)
  const [progress, setProgress] = useState<PlanProgress>(mockProgress)

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const savingsProgress = (progress.currentSavings / progress.savingsTarget) * 100
    const monthsToTarget = Math.ceil((progress.savingsTarget - progress.currentSavings) / progress.monthlyContribution)
    
    const completedMilestones = progress.milestones.filter(m => m.status === 'completed').length
    const totalMilestones = progress.milestones.length
    const milestoneProgress = (completedMilestones / totalMilestones) * 100
    
    const overdueMilestones = progress.milestones.filter(m => 
      m.status !== 'completed' && m.targetDate < new Date()
    ).length
    
    return {
      savingsProgress,
      monthsToTarget,
      milestoneProgress,
      completedMilestones,
      totalMilestones,
      overdueMilestones
    }
  }, [progress])

  const handleStatusChange = (newStatus: PlanStatus, reason?: string, notes?: string) => {
    // Update status info
    const newStatusHistory = {
      id: `status-${Date.now()}`,
      previousStatus: statusInfo.status,
      newStatus,
      changedBy: 'User',
      changedAt: new Date(),
      reason,
      notes
    }
    
    setStatusInfo(prev => ({
      ...prev,
      status: newStatus,
      statusHistory: [newStatusHistory, ...prev.statusHistory],
      archiveReason: newStatus === 'archived' ? reason : undefined,
      actualCompletionDate: newStatus === 'completed' ? new Date() : undefined
    }))
    
    onStatusChange(newStatus, reason, notes)
  }

  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthScore = () => {
    let score = 100
    
    // Deduct points for overdue milestones
    score -= keyMetrics.overdueMilestones * 15
    
    // Deduct points for low savings progress
    if (keyMetrics.savingsProgress < 50) score -= 10
    
    // Deduct points for archived status
    if (statusInfo.status === 'archived') score -= 15
    
    return Math.max(0, Math.min(100, score))
  }

  const healthScore = getHealthScore()
  const healthColor = healthScore >= 80 ? 'text-green-600' : 
                     healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('overallProgress')}</p>
                <div className="text-2xl font-bold">{progress.totalProgress}%</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={progress.totalProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('savingsProgress')}</p>
                <div className="text-2xl font-bold">{keyMetrics.savingsProgress.toFixed(1)}%</div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={keyMetrics.savingsProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('milestones')}</p>
                <div className="text-2xl font-bold">
                  {keyMetrics.completedMilestones}/{keyMetrics.totalMilestones}
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={keyMetrics.milestoneProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('healthScore')}</p>
                <div className={cn('text-2xl font-bold', healthColor)}>
                  {healthScore}
                </div>
              </div>
              <div className={cn(
                'p-3 rounded-full',
                healthScore >= 80 ? 'bg-green-100' :
                healthScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              )}>
                {healthScore >= 80 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : healthScore >= 60 ? (
                  <Clock className="w-6 h-6 text-yellow-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <Progress value={healthScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('currentStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge className={cn('text-sm', getStatusColor(statusInfo.status))}>
                  {statusInfo.status.charAt(0).toUpperCase() + statusInfo.status.slice(1)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {t('lastUpdated')}: {statusInfo.statusHistory[0]?.changedAt.toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {t('plan')}: {plan.planName}
              </div>
            </div>
            
            <div className="space-y-3">
              {keyMetrics.overdueMilestones > 0 && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">
                    {keyMetrics.overdueMilestones} {t('milestonesOverdue', { count: keyMetrics.overdueMilestones })}
                  </span>
                </div>
              )}
              
              {keyMetrics.savingsProgress < 50 && (
                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {t('savingsBehindSchedule')}
                  </span>
                </div>
              )}
              
              {keyMetrics.savingsProgress >= 90 && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">
                    {t('excellentProgress')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('keyDates')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('estimatedCompletion')}</span>
                <span className="text-sm font-medium">
                  {progress.estimatedCompletionDate.toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('monthsToTarget')}</span>
                <span className="text-sm font-medium">{keyMetrics.monthsToTarget}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('nextMilestone')}</span>
                <span className="text-sm font-medium">
                  {progress.milestones
                    .filter(m => m.status === 'pending')
                    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())[0]
                    ?.targetDate.toLocaleDateString('vi-VN') || t('none')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">{t('statusManagement')}</TabsTrigger>
          <TabsTrigger value="progress">{t('progressTracking')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <PlanStatusManager
            planId={plan.id}
            planName={plan.planName}
            currentStatus={statusInfo.status}
            statusInfo={statusInfo}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        <TabsContent value="progress">
          <PlanProgressTracker
            plan={plan}
            progress={progress}
            onStatusChange={handleStatusChange}
            onMilestoneUpdate={onMilestoneUpdate}
            onContributionUpdate={onContributionUpdate}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {t('progressAnalytics')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('financialProgress')}</span>
                    <span className="text-sm font-medium">{progress.financialProgress}%</span>
                  </div>
                  <Progress value={progress.financialProgress} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('milestoneCompletion')}</span>
                    <span className="text-sm font-medium">{keyMetrics.milestoneProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={keyMetrics.milestoneProgress} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('overallHealth')}</span>
                    <span className={cn('text-sm font-medium', healthColor)}>{healthScore}%</span>
                  </div>
                  <Progress value={healthScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  {t('financialBreakdown')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('currentSavings')}</span>
                    <span className="text-sm font-medium">{formatCurrency(progress.currentSavings)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('targetAmount')}</span>
                    <span className="text-sm font-medium">{formatCurrency(progress.savingsTarget)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('monthlyContribution')}</span>
                    <span className="text-sm font-medium">{formatCurrency(progress.monthlyContribution)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('remaining')}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(progress.savingsTarget - progress.currentSavings)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PlanProgressDashboard