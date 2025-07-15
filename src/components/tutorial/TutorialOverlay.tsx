// src/components/tutorial/TutorialOverlay.tsx
// Interactive tutorial overlay with spotlight and guided instructions

'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Pause, 
  SkipForward,
  BookOpen,
  Target,
  CheckCircle
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useInteractiveTutorial } from '@/hooks/useInteractiveTutorial'
import { TutorialStep } from '@/types/onboarding'

interface TutorialOverlayProps {
  className?: string
}

interface SpotlightProps {
  targetElement: Element
  step: TutorialStep
}

// Calculate element position and dimensions
const getElementBounds = (element: Element) => {
  const rect = element.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2
  }
}

// Spotlight component that highlights the target element
const Spotlight: React.FC<SpotlightProps> = ({ targetElement, step }) => {
  const bounds = getElementBounds(targetElement)
  const padding = 8 // Padding around the highlighted element
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        background: `
          radial-gradient(
            circle at ${bounds.centerX}px ${bounds.centerY}px,
            transparent ${Math.max(bounds.width, bounds.height) / 2 + padding}px,
            rgba(0, 0, 0, 0.7) ${Math.max(bounds.width, bounds.height) / 2 + padding + 20}px
          )
        `
      }}
    >
      {/* Highlighted area border */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="absolute border-2 border-blue-400 rounded-lg shadow-lg"
        style={{
          top: bounds.top - padding,
          left: bounds.left - padding,
          width: bounds.width + padding * 2,
          height: bounds.height + padding * 2,
        }}
      >
        {/* Pulsing effect */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 border-2 border-blue-300 rounded-lg opacity-50"
        />
      </motion.div>
      
      {/* Target indicator */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="absolute"
        style={{
          top: bounds.centerY - 12,
          left: bounds.centerX - 12
        }}
      >
        <Target className="w-6 h-6 text-blue-400 drop-shadow-lg" />
      </motion.div>
    </motion.div>
  )
}

// Tutorial instruction panel
interface InstructionPanelProps {
  step: TutorialStep
  stepIndex: number
  totalSteps: number
  canProceed: boolean
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  onPause: () => void
  onExit: () => void
  targetElement: Element
}

const InstructionPanel: React.FC<InstructionPanelProps> = ({
  step,
  stepIndex,
  totalSteps,
  canProceed,
  onNext,
  onPrevious,
  onSkip,
  onPause,
  onExit,
  targetElement
}) => {
  const bounds = getElementBounds(targetElement)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  
  // Calculate optimal position for instruction panel
  useEffect(() => {
    const panelWidth = 380
    const panelHeight = 200
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 20
    
    let top = bounds.top
    let left = bounds.left + bounds.width + margin
    
    // Position based on step.position preference
    switch (step.position) {
      case 'top':
        top = bounds.top - panelHeight - margin
        left = bounds.left + (bounds.width - panelWidth) / 2
        break
        
      case 'bottom':
        top = bounds.top + bounds.height + margin
        left = bounds.left + (bounds.width - panelWidth) / 2
        break
        
      case 'left':
        top = bounds.top + (bounds.height - panelHeight) / 2
        left = bounds.left - panelWidth - margin
        break
        
      case 'right':
        top = bounds.top + (bounds.height - panelHeight) / 2
        left = bounds.left + bounds.width + margin
        break
        
      case 'center':
        top = viewportHeight / 2 - panelHeight / 2
        left = viewportWidth / 2 - panelWidth / 2
        break
    }
    
    // Ensure panel stays within viewport
    if (left < margin) left = margin
    if (left + panelWidth > viewportWidth - margin) {
      left = viewportWidth - panelWidth - margin
    }
    if (top < margin) top = margin
    if (top + panelHeight > viewportHeight - margin) {
      top = viewportHeight - panelHeight - margin
    }
    
    setPosition({ top, left })
  }, [bounds, step.position])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed z-50 pointer-events-auto"
      style={{ top: position.top, left: position.left }}
    >
      <Card className="w-96 shadow-2xl border-2 border-blue-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-50 rounded-md">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">
                  {step.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Bước {stepIndex + 1}/{totalSteps}
                  </Badge>
                  {step.showProgress && (
                    <div className="flex-1 max-w-20">
                      <Progress 
                        value={((stepIndex + 1) / totalSteps) * 100} 
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onPause}
              >
                <Pause className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onExit}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {step.content}
          </p>
          
          {/* Action hint */}
          {step.action && (
            <div className="mb-4 p-2 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-xs text-blue-800">
                {step.action.type === 'click' && '👆 Nhấn vào phần tử được làm nổi bật'}
                {step.action.type === 'input' && '⌨️ Nhập dữ liệu vào trường được làm nổi bật'}
                {step.action.type === 'wait' && '⏳ Chờ một chút...'}
                {step.action.type === 'navigate' && '🧭 Di chuyển đến trang mới'}
              </p>
            </div>
          )}
          
          {/* Validation status */}
          {step.validation && !canProceed && (
            <div className="mb-4 p-2 bg-amber-50 rounded-md border border-amber-200">
              <p className="text-xs text-amber-800 flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Hoàn thành hành động để tiếp tục...
              </p>
            </div>
          )}
          
          {step.validation && canProceed && (
            <div className="mb-4 p-2 bg-green-50 rounded-md border border-green-200">
              <p className="text-xs text-green-800 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Tốt! Bạn có thể tiếp tục bước tiếp theo.
              </p>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevious}
                  className="h-8"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Quay lại
                </Button>
              )}
              
              {step.showSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="h-8 text-gray-600"
                >
                  <SkipForward className="w-3 h-3 mr-1" />
                  Bỏ qua
                </Button>
              )}
            </div>
            
            <Button
              size="sm"
              onClick={onNext}
              disabled={step.validation && !canProceed}
              className="h-8"
            >
              {stepIndex === totalSteps - 1 ? 'Hoàn thành' : 'Tiếp theo'}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ className }) => {
  const {
    activeTutorial,
    currentStep,
    currentStepIndex,
    isActive,
    isPaused,
    canProceed,
    nextStep,
    previousStep,
    skipStep,
    pauseTutorial,
    resumeTutorial,
    exitTutorial
  } = useInteractiveTutorial()
  
  const [targetElement, setTargetElement] = useState<Element | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Mount component
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Find target element for current step
  useEffect(() => {
    if (!isActive || !currentStep || isPaused) {
      setTargetElement(null)
      return
    }
    
    const findElement = () => {
      const element = document.querySelector(currentStep.target)
      if (element) {
        setTargetElement(element)
        
        // Scroll element into view
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      } else {
        // Retry finding element after a delay
        setTimeout(findElement, 500)
      }
    }
    
    findElement()
  }, [isActive, currentStep, currentStepIndex, isPaused])
  
  // Handle automatic actions
  useEffect(() => {
    if (!currentStep?.action || !targetElement || !isActive || isPaused) return
    
    const { type, element: actionElement, value, timeout = 1000 } = currentStep.action
    
    const performAction = () => {
      if (type === 'wait') {
        setTimeout(() => {
          if (canProceed) nextStep()
        }, timeout)
      }
      
      // For click and input actions, we let the user perform them manually
      // but could add auto-execution here if needed
    }
    
    setTimeout(performAction, 500)
  }, [currentStep, targetElement, isActive, isPaused, canProceed, nextStep])
  
  // Don't render on server
  if (!mounted) return null
  
  // Only render if tutorial is active and we have all required data
  if (!isActive || !activeTutorial || !currentStep || !targetElement || isPaused) {
    return null
  }
  
  return createPortal(
    <AnimatePresence>
      <div className={cn("tutorial-overlay", className)}>
        {/* Spotlight overlay */}
        <Spotlight targetElement={targetElement} step={currentStep} />
        
        {/* Instruction panel */}
        <InstructionPanel
          step={currentStep}
          stepIndex={currentStepIndex}
          totalSteps={activeTutorial.steps.length}
          canProceed={canProceed}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipStep}
          onPause={pauseTutorial}
          onExit={exitTutorial}
          targetElement={targetElement}
        />
      </div>
    </AnimatePresence>,
    document.body
  )
}

// Tutorial pause overlay for when tutorial is paused
interface TutorialPauseOverlayProps {
  tutorialName: string
  onResume: () => void
  onExit: () => void
}

export const TutorialPauseOverlay: React.FC<TutorialPauseOverlayProps> = ({
  tutorialName,
  onResume,
  onExit
}) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <Card className="w-96 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pause className="w-5 h-5 text-orange-500" />
              Hướng Dẫn Đã Tạm Dừng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              &quot;{tutorialName}&quot; đã được tạm dừng. Bạn muốn tiếp tục hay thoát khỏi hướng dẫn?
            </p>
            <div className="flex gap-3">
              <Button onClick={onResume} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Tiếp tục
              </Button>
              <Button variant="outline" onClick={onExit}>
                Thoát
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>,
    document.body
  )
}

export default TutorialOverlay