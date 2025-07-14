// src/components/onboarding/OnboardingWizard.tsx
// Main onboarding wizard component with step-by-step flow

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  X,
  Star,
  Target,
  Trophy,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnboarding } from '@/hooks/useOnboarding'
import { OnboardingStep } from '@/types/onboarding'

// Step components
import { WelcomeStep } from './steps/WelcomeStep'
import { ProfileSetupStep } from './steps/ProfileSetupStep'
import { FirstPlanStep } from './steps/FirstPlanStep'
import { ExploreFeaturesStep } from './steps/ExploreFeaturesStep'
import { CompletionStep } from './steps/CompletionStep'

interface OnboardingWizardProps {
  flowId: string
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  className?: string
}

const stepComponents: Record<string, React.ComponentType<any>> = {
  welcome: WelcomeStep,
  profile_setup: ProfileSetupStep,
  first_plan: FirstPlanStep,
  explore_features: ExploreFeaturesStep,
  completion: CompletionStep
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  flowId,
  isOpen,
  onClose,
  onComplete,
  className
}) => {
  const {
    currentFlow,
    currentStep,
    progress,
    isOnboardingActive,
    isOnboardingCompleted,
    currentStepIndex,
    totalSteps,
    progressPercentage,
    nextStep,
    previousStep,
    skipStep,
    completeStep,
    skipOnboarding,
    loading,
    error
  } = useOnboarding(flowId)

  const [isStepCompleted, setIsStepCompleted] = useState(false)

  // Check if current step is completed
  useEffect(() => {
    if (currentStep && progress) {
      setIsStepCompleted(progress.completedSteps.includes(currentStep.id))
    }
  }, [currentStep, progress])

  // Handle step completion
  const handleStepComplete = (stepId: string) => {
    completeStep(stepId)
    setIsStepCompleted(true)
  }

  // Handle next step
  const handleNext = () => {
    if (currentStep && !isStepCompleted) {
      handleStepComplete(currentStep.id)
    }
    
    if (currentStepIndex === totalSteps - 1) {
      // Last step, complete onboarding
      onComplete()
    } else {
      nextStep()
      setIsStepCompleted(false)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    previousStep()
    setIsStepCompleted(false)
  }

  // Handle skip
  const handleSkip = () => {
    if (currentStep?.isOptional) {
      skipStep()
      setIsStepCompleted(false)
    } else {
      skipOnboarding()
      onClose()
    }
  }

  // Handle wizard close
  const handleClose = () => {
    skipOnboarding()
    onClose()
  }

  // Get step component
  const StepComponent = currentStep ? stepComponents[currentStep.id] : null

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lỗi Khởi Tạo</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!currentFlow || !currentStep || isOnboardingCompleted) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn("max-w-4xl max-h-[90vh] overflow-hidden", className)}>
        {/* Header */}
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                {currentFlow.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {currentFlow.description}
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentFlow.estimatedDuration} phút
              </Badge>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Bước {currentStepIndex + 1} / {totalSteps}
            </span>
            <span className="text-sm text-gray-600">
              {progressPercentage}% hoàn thành
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4">
            {currentFlow.steps.map((step, index) => {
              const isCompleted = progress?.completedSteps.includes(step.id)
              const isCurrent = step.id === currentStep.id
              const isPast = index < currentStepIndex
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    isCompleted && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                    isCurrent && !isCompleted && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                    !isCurrent && !isCompleted && !isPast && "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : isCurrent ? (
                    <Target className="w-3 h-3" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-current" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Step Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {currentStep.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {currentStep.description}
                </p>
                
                {currentStep.duration && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    Ước tính: {currentStep.duration} phút
                  </div>
                )}
              </div>

              {/* Step Component */}
              {StepComponent && (
                <StepComponent
                  step={currentStep}
                  onComplete={() => handleStepComplete(currentStep.id)}
                  isCompleted={isStepCompleted}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep.isOptional && (
                <Button variant="ghost" onClick={handleSkip}>
                  Bỏ qua
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Trước
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                disabled={!isStepCompleted && !currentStep.isOptional}
                className="flex items-center gap-2"
              >
                {currentStepIndex === totalSteps - 1 ? (
                  <>
                    <Trophy className="w-4 h-4" />
                    Hoàn Thành
                  </>
                ) : (
                  <>
                    Tiếp Theo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OnboardingWizard