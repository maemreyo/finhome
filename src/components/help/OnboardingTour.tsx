// src/components/help/OnboardingTour.tsx
// Interactive onboarding tour for new users

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Star,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { cn } from '@/lib/utils'
import { useToast, ToastHelpers } from '@/components/notifications/ToastNotification'
import useGlobalState from '@/lib/hooks/useGlobalState'

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: string
  highlight?: boolean
  optional?: boolean
}

interface OnboardingTourProps {
  isVisible: boolean
  onComplete: () => void
  onSkip: () => void
  className?: string
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isVisible,
  onComplete,
  onSkip,
  className
}) => {
  const { showToast } = useToast()
  const { addNotification, unlockAchievement, addExperience } = useGlobalState()

  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Chào mừng đến với FinHome! 🎉',
      description: 'Hệ thống quản lý tài chính bất động sản thông minh dành cho người Việt. Chúng tôi sẽ hướng dẫn bạn sử dụng các tính năng chính.',
      target: 'hero-section',
      position: 'center',
      highlight: true
    },
    {
      id: 'navigation',
      title: 'Menu điều hướng',
      description: 'Thanh menu chính giúp bạn truy cập nhanh đến các tính năng: Dashboard, Tìm kiếm BĐS, Máy tính vay, Danh mục đầu tư.',
      target: 'main-navigation',
      position: 'bottom',
      action: 'hover-navigation'
    },
    {
      id: 'property-search',
      title: 'Tìm kiếm bất động sản',
      description: 'Tìm kiếm và so sánh hàng nghìn bất động sản với bộ lọc thông minh. Phân tích ROI và tiềm năng sinh lời cho từng tài sản.',
      target: 'property-search-section',
      position: 'top',
      action: 'demo-search'
    },
    {
      id: 'loan-calculator',
      title: 'Máy tính vay mua nhà',
      description: 'Tính toán chính xác khoản vay, so sánh lãi suất từ các ngân hàng Việt Nam. Xem biểu đồ trả nợ và các chỉ số tài chính.',
      target: 'loan-calculator-section',
      position: 'top',
      action: 'demo-calculator'
    },
    {
      id: 'portfolio',
      title: 'Quản lý danh mục đầu tư',
      description: 'Theo dõi hiệu suất các khoản đầu tư, phân tích ROI, dòng tiền và tăng trưởng tài sản theo thời gian.',
      target: 'portfolio-section',
      position: 'top',
      action: 'demo-portfolio'
    },
    {
      id: 'notifications',
      title: 'Thông báo thông minh',
      description: 'Nhận cảnh báo về thay đổi lãi suất, cơ hội đầu tư mới và nhắc nhở thanh toán quan trọng.',
      target: 'notification-center',
      position: 'left',
      action: 'show-notifications'
    },
    {
      id: 'achievements',
      title: 'Hệ thống thành tích',
      description: 'Kiếm điểm kinh nghiệm, mở khóa thành tích và theo dõi tiến độ học tập về tài chính bất động sản.',
      target: 'achievement-section',
      position: 'right',
      optional: true
    },
    {
      id: 'complete',
      title: 'Hoàn thành hướng dẫn! 🎊',
      description: 'Bạn đã sẵn sàng khám phá FinHome. Hãy bắt đầu hành trình quản lý tài chính thông minh của mình!',
      target: 'completion-section',
      position: 'center',
      highlight: true
    }
  ]

  // Auto-play tour
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying && currentStep < tourSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1)
      }, 4000) // 4 seconds per step
    }
    
    return () => clearInterval(interval)
  }, [isPlaying, currentStep, tourSteps.length])

  // Mark step as completed
  useEffect(() => {
    const stepId = tourSteps[currentStep]?.id
    if (stepId && !completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId])
      
      // Award experience for completing steps
      if (stepId !== 'welcome' && stepId !== 'complete') {
        addExperience(15)
      }
    }
  }, [currentStep, tourSteps, completedSteps, addExperience])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkipTour = () => {
    showToast(ToastHelpers.info('Đã bỏ qua hướng dẫn', 'Bạn có thể xem lại sau trong menu Trợ giúp'))
    onSkip()
  }

  const handleComplete = () => {
    // Award completion achievement
    unlockAchievement('Người Mới Bắt Đầu')
    addExperience(50)
    
    addNotification({
      type: 'achievement',
      title: 'Hoàn thành hướng dẫn!',
      message: 'Chúc mừng bạn đã hoàn thành tour giới thiệu FinHome',
      isRead: false
    })

    showToast(ToastHelpers.achievement(
      'Chào mừng đến với FinHome!',
      'Bạn đã sẵn sàng bắt đầu hành trình quản lý tài chính'
    ))

    onComplete()
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setCompletedSteps([])
    setIsPlaying(false)
    showToast(ToastHelpers.info('Khởi động lại tour', 'Bắt đầu từ bước đầu tiên'))
  }

  const progress = ((currentStep + 1) / tourSteps.length) * 100
  const currentStepData = tourSteps[currentStep]

  if (!isVisible || !currentStepData) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        {/* Tour Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {currentStepData.highlight && (
            <motion.div
              className="absolute inset-0 border-4 border-blue-500 rounded-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </div>

        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "absolute pointer-events-auto",
            currentStepData.position === 'center' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            currentStepData.position === 'top' && "top-20 left-1/2 -translate-x-1/2",
            currentStepData.position === 'bottom' && "bottom-20 left-1/2 -translate-x-1/2",
            currentStepData.position === 'left' && "top-1/2 left-8 -translate-y-1/2",
            currentStepData.position === 'right' && "top-1/2 right-8 -translate-y-1/2"
          )}
        >
          <Card className="max-w-md shadow-2xl border-blue-200">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {currentStep + 1}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-blue-600">
                    {currentStep + 1} / {tourSteps.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipTour}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {Math.round(progress)}% hoàn thành
                </p>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {currentStepData.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {currentStepData.description}
                </p>

                {/* Special features for certain steps */}
                {currentStepData.id === 'welcome' && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Star className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Tour này sẽ mất khoảng 2-3 phút
                    </span>
                  </div>
                )}

                {currentStepData.id === 'complete' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700">
                        +50 XP • Thành tích &quot;Người Mới Bắt Đầu&quot;
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-gray-50 rounded">
                        <Zap className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                        <div>Tính năng</div>
                        <div className="font-bold">20+</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <Target className="w-4 h-4 mx-auto mb-1 text-green-600" />
                        <div>Mục tiêu</div>
                        <div className="font-bold">Đạt được</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <TrendingUp className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                        <div>ROI</div>
                        <div className="font-bold">Tối ưu</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={currentStep >= tourSteps.length - 1}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestart}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Trước
                  </Button>
                  
                  {currentStep < tourSteps.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={handleNext}
                    >
                      Tiếp
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleComplete}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Hoàn thành
                      <CheckCircle className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Optional step indicator */}
              {currentStepData.optional && (
                <div className="mt-3 text-center">
                  <Badge variant="outline" className="text-xs text-gray-500">
                    Bước tùy chọn - có thể bỏ qua
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Step indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {tourSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                index === currentStep 
                  ? "bg-blue-600 scale-125" 
                  : completedSteps.includes(step.id)
                    ? "bg-green-600"
                    : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    </AnimatePresence>
  )
}

export default OnboardingTour