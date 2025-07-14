// src/components/help/HelpCallout.tsx
// Callout component for overlay help messages and announcements

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle,
  Sparkles,
  ArrowRight 
} from 'lucide-react'
import { HelpCalloutProps } from '@/types/help'
import { cn } from '@/lib/utils'

const calloutVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 }
}

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const HelpCallout: React.FC<HelpCalloutProps> = ({
  id,
  title,
  content,
  type = 'info',
  position = 'top',
  dismissible = true,
  onDismiss,
  actions = [],
  className
}) => {
  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'success':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'tip':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          icon: 'text-yellow-600',
          text: 'text-yellow-900',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        }
      case 'warning':
        return {
          border: 'border-orange-200',
          bg: 'bg-orange-50',
          icon: 'text-orange-600',
          text: 'text-orange-900',
          badge: 'bg-orange-100 text-orange-800 border-orange-300'
        }
      case 'success':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          icon: 'text-green-600',
          text: 'text-green-900',
          badge: 'bg-green-100 text-green-800 border-green-300'
        }
      default:
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          icon: 'text-blue-600',
          text: 'text-blue-900',
          badge: 'bg-blue-100 text-blue-800 border-blue-300'
        }
    }
  }

  const styles = getTypeStyles()

  const calloutContent = (
    <Card className={cn(
      "border shadow-lg",
      styles.border,
      styles.bg,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-1 rounded-md", styles.bg)}>
            <div className={styles.icon}>
              {getIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h3 className={cn("font-semibold text-sm", styles.text)}>
                  {title}
                </h3>
                <Badge variant="outline" className={cn("text-xs", styles.badge)}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Tip
                </Badge>
              </div>
              
              {dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-white/50"
                  onClick={onDismiss}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            <div className={cn("text-sm leading-relaxed mb-3", styles.text)}>
              {typeof content === 'string' ? (
                <p>{content}</p>
              ) : (
                content
              )}
            </div>
            
            {actions.length > 0 && (
              <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant === 'primary' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={action.action}
                  >
                    {action.label}
                    {action.variant === 'primary' && (
                      <ArrowRight className="w-3 h-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (position === 'overlay') {
    return (
      <motion.div
        variants={overlayVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
        onClick={onDismiss}
      >
        <motion.div
          variants={calloutVariants}
          className="max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {calloutContent}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={calloutVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "fixed z-40 left-1/2 transform -translate-x-1/2 max-w-md w-full mx-4",
        position === 'top' ? 'top-4' : 'bottom-4'
      )}
    >
      {calloutContent}
    </motion.div>
  )
}

// Specialized callout for feature announcements
interface FeatureAnnouncementCalloutProps {
  title: string
  description: string
  featureName: string
  onTryIt?: () => void
  onLearnMore?: () => void
  onDismiss?: () => void
  isNew?: boolean
  className?: string
}

export const FeatureAnnouncementCallout: React.FC<FeatureAnnouncementCalloutProps> = ({
  title,
  description,
  featureName,
  onTryIt,
  onLearnMore,
  onDismiss,
  isNew = true,
  className
}) => {
  const actions = [
    ...(onTryIt ? [{
      label: 'Thử ngay',
      action: onTryIt,
      variant: 'primary' as const
    }] : []),
    ...(onLearnMore ? [{
      label: 'Tìm hiểu thêm',
      action: onLearnMore,
      variant: 'secondary' as const
    }] : [])
  ]

  const content = (
    <div>
      <p className="mb-2">{description}</p>
      {isNew && (
        <div className="flex items-center gap-1 text-xs">
          <Sparkles className="w-3 h-3 text-yellow-500" />
          <span className="font-medium">Tính năng mới trong phiên bản này!</span>
        </div>
      )}
    </div>
  )

  return (
    <HelpCallout
      id={`feature-announcement-${featureName}`}
      title={title}
      content={content}
      type="tip"
      position="top"
      dismissible={true}
      onDismiss={onDismiss}
      actions={actions}
      className={className}
    />
  )
}

// Tutorial step callout
interface TutorialStepCalloutProps {
  step: number
  totalSteps: number
  title: string
  description: string
  onNext?: () => void
  onSkip?: () => void
  onPrevious?: () => void
  showProgress?: boolean
  className?: string
}

export const TutorialStepCallout: React.FC<TutorialStepCalloutProps> = ({
  step,
  totalSteps,
  title,
  description,
  onNext,
  onSkip,
  onPrevious,
  showProgress = true,
  className
}) => {
  const actions = [
    ...(onPrevious && step > 1 ? [{
      label: 'Quay lại',
      action: onPrevious,
      variant: 'secondary' as const
    }] : []),
    ...(onNext ? [{
      label: step === totalSteps ? 'Hoàn thành' : 'Tiếp theo',
      action: onNext,
      variant: 'primary' as const
    }] : []),
    ...(onSkip && step < totalSteps ? [{
      label: 'Bỏ qua',
      action: onSkip,
      variant: 'secondary' as const
    }] : [])
  ]

  const content = (
    <div>
      {showProgress && (
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            Bước {step}/{totalSteps}
          </Badge>
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}
      <p>{description}</p>
    </div>
  )

  return (
    <HelpCallout
      id={`tutorial-step-${step}`}
      title={title}
      content={content}
      type="info"
      position="top"
      dismissible={false}
      actions={actions}
      className={className}
    />
  )
}

// Achievement unlock callout
interface AchievementCalloutProps {
  achievementTitle: string
  achievementDescription: string
  xpEarned: number
  onViewAchievements?: () => void
  onContinue?: () => void
  className?: string
}

export const AchievementCallout: React.FC<AchievementCalloutProps> = ({
  achievementTitle,
  achievementDescription,
  xpEarned,
  onViewAchievements,
  onContinue,
  className
}) => {
  const actions = [
    ...(onViewAchievements ? [{
      label: 'Xem thành tích',
      action: onViewAchievements,
      variant: 'secondary' as const
    }] : []),
    ...(onContinue ? [{
      label: 'Tiếp tục',
      action: onContinue,
      variant: 'primary' as const
    }] : [])
  ]

  const content = (
    <div>
      <p className="mb-2">{achievementDescription}</p>
      <div className="flex items-center gap-2">
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          +{xpEarned} XP
        </Badge>
        <span className="text-xs text-muted-foreground">Kinh nghiệm đã tăng!</span>
      </div>
    </div>
  )

  return (
    <HelpCallout
      id="achievement-unlock"
      title={`🏆 Mở khóa: ${achievementTitle}`}
      content={content}
      type="success"
      position="top"
      dismissible={true}
      actions={actions}
      className={className}
    />
  )
}

export default HelpCallout