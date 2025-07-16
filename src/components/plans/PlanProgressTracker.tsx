// src/components/plans/PlanProgressTracker.tsx
// Component for tracking financial plan progress with milestones and status updates

'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  DollarSign,
  Home,
  FileText,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { UIFinancialPlan } from '@/lib/adapters/planAdapter'

export type PlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'

export interface PlanMilestone {
  id: string
  title: string
  description: string
  targetDate: Date
  completedDate?: Date
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  category: 'financial' | 'legal' | 'property' | 'admin'
  requiredAmount?: number
  currentAmount?: number
  documents?: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface PlanProgress {
  totalProgress: number // 0-100
  financialProgress: number // 0-100
  savingsTarget: number
  currentSavings: number
  monthlyContribution: number
  estimatedCompletionDate: Date
  milestones: PlanMilestone[]
  statusHistory: Array<{
    status: PlanStatus
    date: Date
    note?: string
  }>
}

interface PlanProgressTrackerProps {
  plan: UIFinancialPlan
  progress: PlanProgress
  onStatusChange: (status: PlanStatus, note?: string) => void
  onMilestoneUpdate: (milestoneId: string, updates: Partial<PlanMilestone>) => void
  onContributionUpdate: (amount: number) => void
  className?: string
}

export const PlanProgressTracker: React.FC<PlanProgressTrackerProps> = ({
  plan,
  progress,
  onStatusChange,
  onMilestoneUpdate,
  onContributionUpdate,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview')

  // Group milestones by category
  const milestonesByCategory = useMemo(() => {
    return progress.milestones.reduce((acc, milestone) => {
      if (!acc[milestone.category]) {
        acc[milestone.category] = []
      }
      acc[milestone.category].push(milestone)
      return acc
    }, {} as Record<string, PlanMilestone[]>)
  }, [progress.milestones])

  // Calculate category progress
  const categoryProgress = useMemo(() => {
    const categories = ['financial', 'legal', 'property', 'admin'] as const
    return categories.reduce((acc, category) => {
      const milestones = milestonesByCategory[category] || []
      const completed = milestones.filter(m => m.status === 'completed').length
      acc[category] = milestones.length > 0 ? (completed / milestones.length) * 100 : 0
      return acc
    }, {} as Record<string, number>)
  }, [milestonesByCategory])

  const getStatusConfig = (status: PlanStatus) => {
    switch (status) {
      case 'draft':
        return { 
          icon: FileText, 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          label: 'Nháp'
        }
      case 'active':
        return { 
          icon: Play, 
          color: 'bg-green-100 text-green-800 border-green-300',
          label: 'Đang thực hiện'
        }
      case 'paused':
        return { 
          icon: Pause, 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          label: 'Tạm dừng'
        }
      case 'completed':
        return { 
          icon: CheckCircle, 
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          label: 'Hoàn thành'
        }
      case 'archived':
        return { 
          icon: RotateCcw, 
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          label: 'Lưu trữ'
        }
    }
  }

  const getMilestoneStatusIcon = (status: PlanMilestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return DollarSign
      case 'legal':
        return FileText
      case 'property':
        return Home
      case 'admin':
        return Settings
      default:
        return Target
    }
  }

  const statusConfig = getStatusConfig(plan.planStatus)
  const StatusIcon = statusConfig.icon

  // Calculate days until target completion
  const daysToCompletion = Math.ceil(
    (progress.estimatedCompletionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  // Calculate monthly progress rate
  const monthlyProgressRate = progress.monthlyContribution / progress.savingsTarget * 100

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                {plan.planName} - Progress Tracker
              </CardTitle>
              <CardDescription>
                Track milestones and monitor your financial plan progress
              </CardDescription>
            </div>
            <Badge variant="outline" className={cn("flex items-center gap-1", statusConfig.color)}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress.totalProgress)}%</span>
            </div>
            <Progress value={progress.totalProgress} className="w-full" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(progress.currentSavings)}
                </div>
                <div className="text-xs text-muted-foreground">Current Savings</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(progress.savingsTarget)}
                </div>
                <div className="text-xs text-muted-foreground">Target Amount</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(progress.monthlyContribution)}
                </div>
                <div className="text-xs text-muted-foreground">Monthly Contribution</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {daysToCompletion > 0 ? daysToCompletion : 0}
                </div>
                <div className="text-xs text-muted-foreground">Days to Target</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categoryProgress).map(([category, percentage]) => {
                  const Icon = getCategoryIcon(category)
                  const categoryName = {
                    financial: 'Tài chính',
                    legal: 'Pháp lý',
                    property: 'Bất động sản',
                    admin: 'Thủ tục'
                  }[category]
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{categoryName}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => onStatusChange('active', 'Plan activated by user')}
                  disabled={plan.planStatus === 'active'}
                  className="w-full justify-start"
                  variant={plan.planStatus === 'active' ? 'secondary' : 'default'}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {plan.planStatus === 'active' ? 'Plan is Active' : 'Start Plan'}
                </Button>
                
                <Button
                  onClick={() => onStatusChange('paused', 'Plan paused by user')}
                  disabled={plan.planStatus !== 'active'}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Plan
                </Button>
                
                <Button
                  onClick={() => onContributionUpdate(progress.monthlyContribution + 1000000)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Increase Monthly Contribution
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progress.milestones
                  .sort((a, b) => b.targetDate.getTime() - a.targetDate.getTime())
                  .slice(0, 5)
                  .map((milestone) => (
                    <div 
                      key={milestone.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getMilestoneStatusIcon(milestone.status)}
                        <div>
                          <div className="font-medium text-sm">{milestone.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Target: {milestone.targetDate.toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {milestone.priority}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          {Object.entries(milestonesByCategory).map(([category, milestones]) => {
            const Icon = getCategoryIcon(category)
            const categoryName = {
              financial: 'Tài chính',
              legal: 'Pháp lý', 
              property: 'Bất động sản',
              admin: 'Thủ tục'
            }[category]

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {categoryName}
                    <Badge variant="secondary" className="ml-auto">
                      {milestones.filter(m => m.status === 'completed').length}/{milestones.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {milestones.map((milestone) => (
                      <motion.div 
                        key={milestone.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getMilestoneStatusIcon(milestone.status)}
                            <div>
                              <div className="font-medium">{milestone.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {milestone.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {milestone.targetDate.toLocaleDateString('vi-VN')}
                            </div>
                            {milestone.status === 'overdue' && (
                              <Badge variant="destructive">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>

                        {milestone.requiredAmount && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                {formatCurrency(milestone.currentAmount || 0)} / {formatCurrency(milestone.requiredAmount)}
                              </span>
                            </div>
                            <Progress 
                              value={((milestone.currentAmount || 0) / milestone.requiredAmount) * 100}
                              className="h-2"
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onMilestoneUpdate(milestone.id, { 
                              status: milestone.status === 'completed' ? 'pending' : 'completed',
                              completedDate: milestone.status === 'completed' ? undefined : new Date()
                            })}
                          >
                            {milestone.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                          </Button>
                          
                          {milestone.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onMilestoneUpdate(milestone.id, { 
                                status: 'in_progress'
                              })}
                            >
                              Start Working
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Savings Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round((progress.currentSavings / progress.savingsTarget) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(progress.currentSavings)} of {formatCurrency(progress.savingsTarget)}
                  </div>
                </div>
                
                <Progress 
                  value={(progress.currentSavings / progress.savingsTarget) * 100}
                  className="w-full"
                />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly contribution:</span>
                    <span className="font-medium">{formatCurrency(progress.monthlyContribution)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining amount:</span>
                    <span className="font-medium">{formatCurrency(progress.savingsTarget - progress.currentSavings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated completion:</span>
                    <span className="font-medium">{progress.estimatedCompletionDate.toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Progress Rate</span>
                    <div className="flex items-center gap-1">
                      {monthlyProgressRate > 2 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{monthlyProgressRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plan Affordability Score</span>
                    <Badge variant={plan.affordabilityScore && plan.affordabilityScore >= 7 ? "default" : "secondary"}>
                      {plan.affordabilityScore || 'N/A'}/10
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Level</span>
                    <Badge variant={plan.riskLevel === 'low' ? "default" : plan.riskLevel === 'medium' ? "secondary" : "destructive"}>
                      {plan.riskLevel || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progress.statusHistory
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((entry, index) => {
                    const config = getStatusConfig(entry.status)
                    const Icon = config.icon
                    
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Icon className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{config.label}</div>
                          {entry.note && (
                            <div className="text-xs text-muted-foreground">{entry.note}</div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.date.toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PlanProgressTracker