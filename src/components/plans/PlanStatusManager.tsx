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
import { useTranslations } from 'next-intl'
import type { 
  PlanStatus, 
  PlanStatusHistory, 
  PlanStatusInfo 
} from '@/types/plans'

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
    color: 'bg-gray-100 text-gray-800',
    icon: FileText
  },
  active: {
    color: 'bg-blue-100 text-blue-800',
    icon: Play
  },
  completed: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  archived: {
    color: 'bg-gray-100 text-gray-600',
    icon: Archive
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
  const t = useTranslations('PlanStatusManager')

  const getStatusLabel = (status: PlanStatus) => {
    switch (status) {
      case 'draft': return t('status.draft')
      case 'active': return t('status.active')
      case 'completed': return t('status.completed')
      case 'archived': return t('status.archived')
      default: return t('status.unknown')
    }
  }

  const getStatusDescription = (status: PlanStatus) => {
    switch (status) {
      case 'draft': return t('description.draft')
      case 'active': return t('description.active')
      case 'completed': return t('description.completed')
      case 'archived': return t('description.archived')
      default: return t('description.unknown')
    }
  }

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
      toast.error(t('validation.archiveReasonRequired'))
      return
    }

    onStatusChange(selectedTransition, transitionReason.trim(), transitionNotes.trim())
    setIsTransitionDialogOpen(false)
    setSelectedTransition(null)
    setTransitionReason('')
    setTransitionNotes('')
    
    toast.success(t('messages.statusChanged', { status: getStatusLabel(selectedTransition) }))
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
    
    if (days === 0) return t('time.today')
    if (days === 1) return t('time.oneDay')
    return t('time.days', { count: days })
  }

  const getEstimatedCompletion = () => {
    if (currentStatus === 'completed') return t('status.completed')
    if (currentStatus === 'archived') return t('status.archived')
    if (!statusInfo.estimatedCompletionDate) return t('completion.notSet')
    
    const isOverdue = statusInfo.estimatedCompletionDate < new Date()
    return (
      <span className={cn(isOverdue ? 'text-red-600' : 'text-gray-600')}>
        {statusInfo.estimatedCompletionDate.toLocaleDateString('vi-VN')}
        {isOverdue && ` (${t('completion.overdue')})`}
      </span>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrentIcon className="w-5 h-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm text-gray-600">{t('currentStatus')}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn('text-sm', currentConfig.color)}>
                  <CurrentIcon className="w-3 h-3 mr-1" />
                  {getStatusLabel(currentStatus)}
                </Badge>
                <span className="text-xs text-gray-500">{t('time.for')} {getTimeInStatus()}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryDialogOpen(true)}
            >
              <Clock className="w-4 h-4 mr-2" />
              {t('history.title')}
            </Button>
          </div>

          <div className="text-sm text-gray-600">{getStatusDescription(currentStatus)}</div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('progress')}</span>
              <span className="font-medium">{getStatusProgress()}%</span>
            </div>
            <Progress value={getStatusProgress()} className="h-2" />
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t('estimatedCompletion')}:</span>
              <div className="font-medium">{getEstimatedCompletion()}</div>
            </div>
            <div>
              <span className="text-gray-600">{t('lastUpdated')}:</span>
              <div className="font-medium">
                {statusInfo.statusHistory.length > 0 
                  ? statusInfo.statusHistory[0].changedAt.toLocaleDateString('vi-VN')
                  : t('never')
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
              <strong>{t('archiveReason')}:</strong> {statusInfo.archiveReason}
            </AlertDescription>
          </Alert>
        )}

        {currentStatus === 'completed' && statusInfo.actualCompletionDate && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{t('completedOn')}:</strong> {statusInfo.actualCompletionDate.toLocaleDateString('vi-VN')}
            </AlertDescription>
          </Alert>
        )}

        {/* Available Transitions */}
        {availableTransitions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">{t('availableActions')}</h4>
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
                    {getStatusLabel(status)}
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
                {t('dialog.changeStatusTo')} {selectedTransition ? getStatusLabel(selectedTransition) : ''}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-sm', currentConfig.color)}>
                    <CurrentIcon className="w-3 h-3 mr-1" />
                    {getStatusLabel(currentStatus)}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  {selectedTransition && (
                    <Badge className={cn('text-sm', STATUS_CONFIG[selectedTransition].color)}>
                      {React.createElement(STATUS_CONFIG[selectedTransition].icon, { className: "w-3 h-3 mr-1" })}
                      {getStatusLabel(selectedTransition)}
                    </Badge>
                  )}
                </div>
              </div>

              {selectedTransition === 'archived' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('dialog.reason')} <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={transitionReason}
                    onChange={(e) => setTransitionReason(e.target.value)}
                    placeholder={t('dialog.reasonPlaceholder', { status: getStatusLabel(selectedTransition!).toLowerCase() })}
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('dialog.additionalNotes')}</label>
                <Textarea
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder={t('dialog.notesPlaceholder')}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTransitionDialogOpen(false)}
                >
                  {t('dialog.cancel')}
                </Button>
                <Button onClick={handleTransitionConfirm}>
                  {t('dialog.confirm')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('history.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {statusInfo.statusHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('history.empty')}</p>
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
                              {getStatusLabel(history.previousStatus)}
                            </Badge>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <Badge className={cn('text-xs', newConfig.color)}>
                              <NewIcon className="w-3 h-3 mr-1" />
                              {getStatusLabel(history.newStatus)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {history.changedAt.toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{t('history.changedBy')}:</span>
                            <span className="font-medium">{history.changedBy}</span>
                          </div>
                          
                          {history.reason && (
                            <div className="flex items-start gap-2 mb-1">
                              <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5" />
                              <span className="text-gray-600">{t('history.reason')}:</span>
                              <span>{history.reason}</span>
                            </div>
                          )}
                          
                          {history.notes && (
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5" />
                              <span className="text-gray-600">{t('history.notes')}:</span>
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