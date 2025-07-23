// src/components/expenses/OnboardingHelper.tsx
// Onboarding helper component for first-time user experience

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  MessageCircle, 
  Brain, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  Coffee,
  Utensils,
  Target,
  X,
  Lightbulb,
  Clock,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingStep {
  id: string
  title: string
  description: string
  example: string
  icon: React.ComponentType<any>
  color: string
  completed?: boolean
}

interface OnboardingHelperProps {
  isVisible: boolean
  onClose: () => void
  onExampleClick: (example: string) => void
  userHasTransactions?: boolean
  currentMode: 'conversational' | 'traditional'
}

export function OnboardingHelper({ 
  isVisible, 
  onClose, 
  onExampleClick,
  userHasTransactions = false,
  currentMode 
}: OnboardingHelperProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Chào mừng đến với AI Transaction!',
      description: 'Chỉ cần mô tả giao dịch bằng tiếng Việt tự nhiên, AI sẽ hiểu và tạo giao dịch cho bạn.',
      example: 'ăn trưa phở 50k',
      icon: Brain,
      color: 'text-purple-600'
    },
    {
      id: 'natural_language',
      title: 'Viết như bình thường',
      description: 'Không cần format đặc biệt. Viết như bạn nhắn tin với bạn bè.',
      example: 'hôm nay mua sách 150k, uống cà phê 35k',
      icon: MessageCircle,
      color: 'text-blue-600'
    },
    {
      id: 'multiple_transactions',
      title: 'Nhiều giao dịch cùng lúc',
      description: 'AI có thể hiểu và tạo nhiều giao dịch từ một câu.',
      example: 'sáng ăn phở 45k, trưa cơm văn phòng 60k, chiều cà phê 30k',
      icon: Target,
      color: 'text-green-600'
    },
    {
      id: 'smart_suggestions',
      title: 'Gợi ý thông minh',
      description: 'AI học từ thói quen của bạn và gợi ý dựa trên thời gian trong ngày.',
      example: 'cà phê sáng 25k',
      icon: Sparkles,
      color: 'text-amber-600'
    }
  ]

  const progressPercentage = (completedSteps.size / steps.length) * 100

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 1000)
    }
  }

  const handleTryExample = (example: string) => {
    onExampleClick(example)
    handleStepComplete(steps[currentStep].id)
  }

  const handleSkipStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Auto-advance after user interactions
  useEffect(() => {
    if (completedSteps.size === steps.length) {
      setTimeout(() => onClose(), 2000)
    }
  }, [completedSteps, onClose])

  if (!isVisible) return null

  const currentStepData = steps[currentStep]
  const IconComponent = currentStepData.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-2 border-purple-200">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-100">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">First-Time Setup</h3>
                <p className="text-xs text-gray-500">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.has(step.id)
                const isCurrent = index === currentStep
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      isCompleted ? "bg-green-500" :
                      isCurrent ? "bg-purple-500" : "bg-gray-200"
                    )}
                  />
                )
              })}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-50 to-blue-50 inline-flex mb-3">
                <IconComponent className={cn("h-8 w-8", currentStepData.color)} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Interactive Example */}
            <Alert className="border-purple-200 bg-purple-50">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium text-purple-800">Thử ví dụ này:</p>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <p className="text-sm font-mono text-gray-800">
                      "{currentStepData.example}"
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTryExample(currentStepData.example)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Thử ngay
                    </Button>
                    {currentStep < steps.length - 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSkipStep}
                        className="text-purple-600 border-purple-300"
                      >
                        Bỏ qua
                      </Button>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Tips for current step */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600">
                  {currentStep === 0 && (
                    <>
                      <p className="font-medium mb-1">Mẹo:</p>
                      <ul className="space-y-1">
                        <li>• Bao gồm số tiền: "25k", "150 nghìn", "2tr"</li>
                        <li>• Mô tả hoạt động: "ăn", "mua", "nhận"</li>
                        <li>• Dùng tiếng Việt tự nhiên</li>
                      </ul>
                    </>
                  )}
                  {currentStep === 1 && (
                    <>
                      <p className="font-medium mb-1">Các cách viết được:</p>
                      <ul className="space-y-1">
                        <li>• "tiêu" thay vì "chi tiêu"</li>
                        <li>• "25k" thay vì "25.000 VND"</li>
                        <li>• "trà sữa" thay vì "beverage"</li>
                      </ul>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <p className="font-medium mb-1">Kết hợp giao dịch:</p>
                      <ul className="space-y-1">
                        <li>• Dùng dấu phay để ngăn cách</li>
                        <li>• Hoặc viết câu dài tự nhiên</li>
                        <li>• AI sẽ tách thành từng giao dịch riêng</li>
                      </ul>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <p className="font-medium mb-1">AI học và gợi ý:</p>
                      <ul className="space-y-1">
                        <li>• Sáng: cà phê, ăn sáng</li>
                        <li>• Trưa: cơm trưa, trà sữa</li>
                        <li>• Tối: ăn tối, giải trí</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          {completedSteps.size === steps.length && (
            <div className="mt-6 text-center">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">
                  Hoàn thành! Bạn đã sẵn sàng sử dụng AI Transaction.
                </p>
              </div>
              <Button onClick={onClose} className="w-full">
                Bắt đầu sử dụng
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}