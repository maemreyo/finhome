// src/components/plans/PlanStatusManager.tsx
// Plan status management component with workflow transitions

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Play, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MessageSquare,
  Calendar,
  User,
  ArrowRight,
  RotateCcw,
  Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import type { PlanStatus } from '@/lib/supabase/types'

export interface PlanStatusHistory {
  id: string
  previousStatus: PlanStatus
  newStatus: PlanStatus
  changedBy: string
  changedAt: Date
  reason?: string
  notes?: string
}

export interface PlanStatusInfo {
  status: PlanStatus
  progress: number
  statusHistory: PlanStatusHistory[]
  canTransitionTo: PlanStatus[]
  estimatedCompletionDate?: Date
  actualCompletionDate?: Date
  archiveReason?: string
}

interface PlanStatusManagerProps {
  planId: string
  planName: string
  currentStatus: PlanStatus
  statusInfo: PlanStatusInfo
  onStatusChange: (newStatus: PlanStatus, reason?: string, notes?: string) => void
  className?: string
}

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: FileText,
    description: 'Plan is being created or modified'
  },
  active: {
    label: 'Active',
    color: 'bg-blue-100 text-blue-800',
    icon: Play,
    description: 'Plan is currently being executed'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Plan has been successfully completed'
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-100 text-gray-600',
    icon: Archive,
    description: 'Plan is archived for reference'
  }
}

const TRANSITION_RULES: Record<PlanStatus, PlanStatus[]> = {
  draft: ['active', 'archived'],
  active: ['completed', 'archived'],
  completed: ['archived'],
  archived: []
}

const PlanStatusManager: React.FC<PlanStatusManagerProps> = ({
  planId,
  planName,
  currentStatus,
  statusInfo,
  onStatusChange,
  className
}) => {
  const [selectedTransition, setSelectedTransition] = useState<PlanStatus | null>(null)
  const [transitionReason, setTransitionReason] = useState('')
  const [transitionNotes, setTransitionNotes] = useState('')
  const [isTransitionDialogOpen, setIsTransitionDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)

  const availableTransitions = TRANSITION_RULES[currentStatus] || []
  const currentConfig = STATUS_CONFIG[currentStatus]
  const CurrentIcon = currentConfig.icon

  const handleTransitionStart = (newStatus: PlanStatus) => {
    setSelectedTransition(newStatus)
    setTransitionReason('')
    setTransitionNotes('')
    setIsTransitionDialogOpen(true)
  }

  const handleTransitionConfirm = () => {
    if (!selectedTransition) return

    // Validate required fields based on transition
    if (selectedTransition === 'archived' && !transitionReason.trim()) {
      toast.error('Please provide a reason for archiving this plan')
      return
    }

    onStatusChange(selectedTransition, transitionReason.trim(), transitionNotes.trim())
    setIsTransitionDialogOpen(false)
    setSelectedTransition(null)
    setTransitionReason('')
    setTransitionNotes('')
    
    toast.success(`Plan status changed to ${STATUS_CONFIG[selectedTransition].label}`)
  }

  const getStatusProgress = () => {
    const progressMap = {
      draft: 0,
      active: statusInfo.progress || 50,
      completed: 100,
      archived: 100
    }
    return progressMap[currentStatus] || 0
  }

  const getTimeInStatus = () => {
    const lastStatusChange = statusInfo.statusHistory
      .filter(h => h.newStatus === currentStatus)
      .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())[0]
    
    if (!lastStatusChange) return 'Unknown'
    
    const timeDiff = Date.now() - lastStatusChange.changedAt.getTime()
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return '1 day'
    return `${days} days`
  }

  const getEstimatedCompletion = () => {
    if (currentStatus === 'completed') return 'Completed'
    if (currentStatus === 'archived') return 'Archived'
    if (!statusInfo.estimatedCompletionDate) return 'Not set'
    
    const isOverdue = statusInfo.estimatedCompletionDate < new Date()
    return (
      <span className={cn(isOverdue ? 'text-red-600' : 'text-gray-600')}>
        {statusInfo.estimatedCompletionDate.toLocaleDateString('vi-VN')}
        {isOverdue && ' (Overdue)'}
      </span>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrentIcon className="w-5 h-5" />
          Plan Status Management
        </CardTitle>
        <CardDescription>
          Track and manage the lifecycle of your financial plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm text-gray-600">Current Status</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn('text-sm', currentConfig.color)}>
                  <CurrentIcon className="w-3 h-3 mr-1" />
                  {currentConfig.label}
                </Badge>
                <span className="text-xs text-gray-500">for {getTimeInStatus()}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryDialogOpen(true)}
            >
              <Clock className="w-4 h-4 mr-2" />
              History
            </Button>
          </div>

          <div className="text-sm text-gray-600">{currentConfig.description}</div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{getStatusProgress()}%</span>
            </div>
            <Progress value={getStatusProgress()} className="h-2" />
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Estimated Completion:</span>
              <div className="font-medium">{getEstimatedCompletion()}</div>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <div className="font-medium">
                {statusInfo.statusHistory.length > 0 
                  ? statusInfo.statusHistory[0].changedAt.toLocaleDateString('vi-VN')
                  : 'Never'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Status-specific Information */}
        {currentStatus === 'archived' && statusInfo.archiveReason && (
          <Alert>
            <Archive className="h-4 w-4" />
            <AlertDescription>
              <strong>Archive Reason:</strong> {statusInfo.archiveReason}
            </AlertDescription>
          </Alert>
        )}

        {currentStatus === 'completed' && statusInfo.actualCompletionDate && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Completed on:</strong> {statusInfo.actualCompletionDate.toLocaleDateString('vi-VN')}
            </AlertDescription>
          </Alert>
        )}

        {/* Available Transitions */}
        {availableTransitions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Available Actions</h4>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((status) => {
                const config = STATUS_CONFIG[status]
                const Icon = config.icon
                
                return (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTransitionStart(status)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Transition Dialog */}
        <Dialog open={isTransitionDialogOpen} onOpenChange={setIsTransitionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Change Status to {selectedTransition ? STATUS_CONFIG[selectedTransition].label : ''}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-sm', currentConfig.color)}>
                    <CurrentIcon className="w-3 h-3 mr-1" />
                    {currentConfig.label}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  {selectedTransition && (
                    <Badge className={cn('text-sm', STATUS_CONFIG[selectedTransition].color)}>
                      {React.createElement(STATUS_CONFIG[selectedTransition].icon, { className: "w-3 h-3 mr-1" })}
                      {STATUS_CONFIG[selectedTransition].label}
                    </Badge>
                  )}
                </div>
              </div>

              {selectedTransition === 'archived' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={transitionReason}
                    onChange={(e) => setTransitionReason(e.target.value)}
                    placeholder={`Please provide a reason for ${STATUS_CONFIG[selectedTransition!].label.toLowerCase()}...`}
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="Any additional notes or comments..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTransitionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleTransitionConfirm}>
                  Confirm Change
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Status History</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {statusInfo.statusHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No status history available</p>
              ) : (
                <div className="space-y-3">
                  {statusInfo.statusHistory.map((history, index) => {
                    const oldConfig = STATUS_CONFIG[history.previousStatus]
                    const newConfig = STATUS_CONFIG[history.newStatus]
                    const OldIcon = oldConfig.icon
                    const NewIcon = newConfig.icon
                    
                    return (
                      <motion.div
                        key={history.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={cn('text-xs', oldConfig.color)}>
                              <OldIcon className="w-3 h-3 mr-1" />
                              {oldConfig.label}
                            </Badge>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <Badge className={cn('text-xs', newConfig.color)}>
                              <NewIcon className="w-3 h-3 mr-1" />
                              {newConfig.label}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {history.changedAt.toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">Changed by:</span>
                            <span className="font-medium">{history.changedBy}</span>
                          </div>
                          
                          {history.reason && (
                            <div className="flex items-start gap-2 mb-1">
                              <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5" />
                              <span className="text-gray-600">Reason:</span>
                              <span>{history.reason}</span>
                            </div>
                          )}
                          
                          {history.notes && (
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5" />
                              <span className="text-gray-600">Notes:</span>
                              <span>{history.notes}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default PlanStatusManager