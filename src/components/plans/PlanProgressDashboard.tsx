// src/components/plans/PlanProgressDashboard.tsx
// Comprehensive plan progress dashboard with status management and progress tracking

'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
import { DashboardService } from '@/lib/services/dashboardService'
import { toast } from 'sonner'

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

// PlanProgressDashboard now uses real database data instead of mock data

const PlanProgressDashboard: React.FC<PlanProgressDashboardProps> = ({
  plan,
  onStatusChange,
  onMilestoneUpdate,
  onContributionUpdate,
  className
}) => {
  const t = useTranslations('PlanProgressDashboard')
  const [statusInfo, setStatusInfo] = useState<PlanStatusInfo | null>(null)
  const [progress, setProgress] = useState<PlanProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load real data from database
  useEffect(() => {
    const loadPlanData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load plan progress data
        const progressData = await DashboardService.getPlanProgress(plan.id)
        
        if (progressData) {
          // Convert database progress to PlanProgress type
          const planProgress: PlanProgress = {
            totalProgress: progressData.totalProgress,
            financialProgress: progressData.financialProgress,
            savingsTarget: progressData.savingsTarget,
            currentSavings: progressData.currentSavings,
            monthlyContribution: progressData.monthlyContribution,
            estimatedCompletionDate: progressData.estimatedCompletionDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            milestones: progressData.milestones.map(m => ({
              id: m.id,
              title: m.title,
              description: m.description || '',
              targetDate: m.target_date ? new Date(m.target_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: m.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
              category: m.category as 'financial' | 'legal' | 'property' | 'admin' | 'personal',
              requiredAmount: m.required_amount ?? undefined,
              currentAmount: m.current_amount ?? undefined,
              priority: m.priority as 'low' | 'medium' | 'high'
            })),
            statusHistory: progressData.statusHistory.map(h => ({
              status: h.status as 'draft' | 'active' | 'completed' | 'archived',
              date: new Date(h.created_at),
              note: h.note || ''
            }))
          }
          setProgress(planProgress)

          // Create status info from plan and progress data
          const planStatusInfo: PlanStatusInfo = {
            status: plan.planStatus,
            progress: progressData.totalProgress,
            statusHistory: progressData.statusHistory.map((h, index) => ({
              id: `status-${h.id}`,
              previousStatus: index < progressData.statusHistory.length - 1 ? 
                progressData.statusHistory[index + 1].status as PlanStatus : 'draft',
              newStatus: h.status as PlanStatus,
              changedBy: 'User', // TODO: Add user tracking to database
              changedAt: new Date(h.created_at),
              reason: h.note || 'Status updated',
              notes: h.note || ''
            })),
            canTransitionTo: plan.planStatus === 'draft' ? ['active'] :
                           plan.planStatus === 'active' ? ['archived', 'completed'] :
                           plan.planStatus === 'archived' ? ['active'] : [],
            estimatedCompletionDate: progressData.estimatedCompletionDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            archiveReason: undefined,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt
          }
          setStatusInfo(planStatusInfo)
        } else {
          // Create default data if no progress data exists
          const defaultProgress: PlanProgress = {
            totalProgress: 0,
            financialProgress: 0,
            savingsTarget: plan.downPayment || 0,
            currentSavings: plan.currentSavings || 0,
            monthlyContribution: 0,
            estimatedCompletionDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            milestones: [],
            statusHistory: [
              {
                status: 'draft',
                date: plan.createdAt,
                note: 'Plan created'
              }
            ]
          }
          setProgress(defaultProgress)

          const defaultStatusInfo: PlanStatusInfo = {
            status: plan.planStatus,
            progress: 0,
            statusHistory: [
              {
                id: 'status-initial',
                previousStatus: 'draft',
                newStatus: plan.planStatus,
                changedBy: 'User',
                changedAt: plan.createdAt,
                reason: 'Plan created',
                notes: ''
              }
            ],
            canTransitionTo: plan.planStatus === 'draft' ? ['active'] :
                           plan.planStatus === 'active' ? ['archived', 'completed'] :
                           plan.planStatus === 'archived' ? ['active'] : [],
            estimatedCompletionDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            archiveReason: undefined,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt
          }
          setStatusInfo(defaultStatusInfo)
        }
      } catch (err) {
        console.error('Error loading plan data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load plan data')
        toast.error('Failed to load plan progress data')
      } finally {
        setIsLoading(false)
      }
    }

    loadPlanData()
  }, [plan.id, plan.planStatus, plan.downPayment, plan.currentSavings, plan.createdAt, plan.updatedAt])

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    if (!progress) {
      return {
        savingsProgress: 0,
        monthsToTarget: 0,
        milestoneProgress: 0,
        completedMilestones: 0,
        totalMilestones: 0,
        overdueMilestones: 0
      }
    }

    const savingsProgress = progress.savingsTarget > 0 ? (progress.currentSavings / progress.savingsTarget) * 100 : 0
    const monthsToTarget = progress.monthlyContribution > 0 ? 
      Math.ceil((progress.savingsTarget - progress.currentSavings) / progress.monthlyContribution) : 0
    
    const completedMilestones = progress.milestones.filter(m => m.status === 'completed').length
    const totalMilestones = progress.milestones.length
    const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
    
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

  const handleStatusChange = async (newStatus: PlanStatus, reason?: string, notes?: string) => {
    if (!statusInfo) return
    
    try {
      // Call the parent handler to update the database
      await onStatusChange(newStatus, reason, notes)
      
      // Update local status info
      const newStatusHistory = {
        id: `status-${Date.now()}`,
        previousStatus: statusInfo.status,
        newStatus,
        changedBy: 'User',
        changedAt: new Date(),
        reason,
        notes
      }
      
      setStatusInfo(prev => prev ? ({
        ...prev,
        status: newStatus,
        statusHistory: [newStatusHistory, ...prev.statusHistory],
        archiveReason: newStatus === 'archived' ? reason : undefined,
        actualCompletionDate: newStatus === 'completed' ? new Date() : undefined
      }) : null)
      
      toast.success(`Plan status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update plan status')
    }
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
    if (!statusInfo) return 0
    
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

  // Handle loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Progress Data</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle case where data is still loading or unavailable
  if (!statusInfo || !progress) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Progress Data Available</h3>
            <p className="text-gray-500 mb-4">Plan progress data is not available yet</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                  {progress.estimatedCompletionDate?.toLocaleDateString('vi-VN') || 'N/A'}
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