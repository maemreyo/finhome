// src/components/expenses/AdvancedFeatureTour.tsx
// Advanced feature tour using react-joyride for power users

'use client'

import { useState, useCallback } from 'react'
import Joyride, { ACTIONS, EVENTS, STATUS, Step, CallBackProps } from 'react-joyride'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Target, 
  Hash, 
  Calendar, 
  Zap,
  GraduationCap,
  X
} from 'lucide-react'

interface AdvancedFeatureTourProps {
  isOpen: boolean
  onClose: () => void
  onExampleClick: (example: string) => void
}

export function AdvancedFeatureTour({ 
  isOpen, 
  onClose, 
  onExampleClick 
}: AdvancedFeatureTourProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [run, setRun] = useState(isOpen)

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-lg">Chào mừng đến với AI Pro Mode!</h3>
          </div>
          <p className="text-sm">
            Bạn đã sử dụng AI khá thành thạo! 
            Hãy cùng khám phá các tính năng nâng cao để tối đa hóa hiệu quả.
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Mức độ: Chuyên nghiệp
            </Badge>
          </div>
        </div>
      ),
      placement: 'center'
    },
    {
      target: '[data-tour="conversational-input"]',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold">Nhập nhiều giao dịch cùng lúc</h4>
          </div>
          <p className="text-sm">
            Thay vì nhập từng giao dịch một, bạn có thể nhập tất cả cùng lúc để tiết kiệm thời gian.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 border border-dashed">
            <p className="text-sm font-mono text-gray-800">
              "ăn sáng 30k, cà phê 25k, taxi 80k"
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => onExampleClick('ăn sáng 30k, cà phê 25k, taxi 80k')}
            className="w-full"
          >
            Thử ngay
          </Button>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: '[data-tour="conversational-input"]',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold">Sử dụng hashtag để gắn thẻ</h4>
          </div>
          <p className="text-sm">
            Thêm # vào cuối câu để tự động gắn thẻ và phân loại giao dịch.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 border border-dashed">
            <p className="text-sm font-mono text-gray-800">
              "xem phim 250k #giải_trí"
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            AI sẽ tự động gắn thẻ "giải_trí" và phân loại vào danh mục phù hợp.
          </p>
          <Button 
            size="sm" 
            onClick={() => onExampleClick('xem phim 250k #giải_trí')}
            className="w-full"
          >
            Thử ngay
          </Button>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: '[data-tour="conversational-input"]',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">Ghi lại giao dịch cũ</h4>
          </div>
          <p className="text-sm">
            Sử dụng thời gian tương đối để ghi lại các giao dịch đã qua.
          </p>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-2 border border-dashed">
              <p className="text-xs font-mono text-gray-800">
                "hôm qua ăn phở 50k"
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 border border-dashed">
              <p className="text-xs font-mono text-gray-800">
                "tuần trước mua sách 150k"
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => onExampleClick('hôm qua ăn phở 50k, tuần trước mua sách 150k')}
            className="w-full"
          >
            Thử ngay
          </Button>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: '[data-tour="conversational-input"]',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            <h4 className="font-semibold">Format số tiền linh hoạt</h4>
          </div>
          <p className="text-sm">
            AI hiểu nhiều cách viết số tiền khác nhau, bạn không cần lo về format.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 border border-dashed">
              <p className="text-xs font-mono text-gray-800">"2tr5"</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 border border-dashed">
              <p className="text-xs font-mono text-gray-800">"150 nghìn"</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 border border-dashed">
              <p className="text-xs font-mono text-gray-800">"1.5 triệu"</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 border border-dashed">
              <p className="text-xs font-mono text-gray-800">"50k"</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => onExampleClick('mua laptop 2tr5, bảo hành 150 nghìn')}
            className="w-full"
          >
            Thử ngay
          </Button>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: 'body',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            <h3 className="font-bold text-lg">Chúc mừng! Bạn đã hoàn thành tour!</h3>
          </div>
          <p className="text-sm">
            Giờ đây bạn đã biết cách sử dụng tất cả các tính năng nâng cao của AI. 
            Hãy thử kết hợp chúng để tối đa hóa hiệu quả!
          </p>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-sm font-bold text-green-800 mb-2">Ví dụ tổng hợp:</p>
            <p className="text-sm font-mono text-green-700">
              "hôm qua ăn trưa 50k #công_việc, xem phim 250k #giải_trí, mua sách 150 nghìn"
            </p>
          </div>
          <Button 
            onClick={() => onExampleClick('hôm qua ăn trưa 50k #công_việc, xem phim 250k #giải_trí, mua sách 150 nghìn')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Target className="h-4 w-4 mr-2" />
            Thử ví dụ tổng hợp
          </Button>
        </div>
      ),
      placement: 'center'
    }
  ]

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, index, status, type } = data

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1)
      setStepIndex(nextStepIndex)
    } else if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Tour finished or skipped
      setRun(false)
      onClose()
    }
  }, [onClose])

  // Stop tour when isOpen changes to false
  if (!isOpen && run) {
    setRun(false)
  }

  // Start tour when isOpen changes to true
  if (isOpen && !run) {
    setRun(true)
    setStepIndex(0)
  }

  return (
    <>
      <Joyride
        callback={handleJoyrideCallback}
        continuous={true}
        run={run}
        stepIndex={stepIndex}
        steps={steps}
        showProgress={true}
        showSkipButton={true}
        styles={{
          options: {
            primaryColor: '#3b82f6',
            zIndex: 10000,
            arrowColor: '#ffffff',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
            textColor: '#374151',
            width: 350,
          },
          tooltip: {
            borderRadius: 8,
            padding: 20,
          },
          tooltipContent: {
            padding: 0,
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            borderRadius: 6,
            fontSize: 14,
            padding: '8px 16px',
          },
          buttonBack: {
            color: '#6b7280',
            fontSize: 14,
            marginRight: 'auto',
            padding: '8px 16px',
          },
          buttonSkip: {
            color: '#9ca3af',
            fontSize: 14,
            padding: '8px 16px',
          },
          buttonClose: {
            height: 20,
            width: 20,
            right: 10,
            top: 10,
          }
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn thành',
          next: 'Tiếp theo',
          open: 'Mở hộp thoại',
          skip: 'Bỏ qua tour'
        }}
        hideCloseButton={false}
        disableCloseOnEsc={false}
        disableOverlayClose={false}
      />
    </>
  )
}