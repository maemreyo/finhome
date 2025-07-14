// src/components/onboarding/steps/CompletionStep.tsx
// Completion step for onboarding flow

'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  CheckCircle, 
  Star,
  Gift,
  ArrowRight,
  Home,
  Target,
  Sparkles
} from 'lucide-react'
import { OnboardingStep } from '@/types/onboarding'

interface CompletionStepProps {
  step: OnboardingStep
  onComplete: () => void
  isCompleted: boolean
}

const achievements = [
  {
    icon: Trophy,
    title: 'Người Lập Kế Hoạch Cẩn Trọng',
    description: 'Hoàn thành onboarding và tạo kế hoạch đầu tiên',
    points: 100,
    color: 'text-yellow-600'
  },
  {
    icon: Star,
    title: 'Khám Phá Tính Năng',
    description: 'Tìm hiểu các công cụ chính của FinHome',
    points: 50,
    color: 'text-blue-600'
  },
  {
    icon: Target,
    title: 'Sẵn Sàng Bắt Đầu',
    description: 'Thiết lập hồ sơ và mục tiêu tài chính',
    points: 50,
    color: 'text-green-600'
  }
]

const nextSteps = [
  {
    icon: Home,
    title: 'Tạo Kế Hoạch Chi Tiết',
    description: 'Bổ sung thông tin để có kế hoạch hoàn chỉnh',
    action: 'Tạo ngay'
  },
  {
    icon: Target,
    title: 'So Sánh Kịch Bản',
    description: 'Phân tích nhiều phương án để chọn lựa tối ưu',
    action: 'Khám phá'
  },
  {
    icon: Gift,
    title: 'Mời Bạn Bè',
    description: 'Chia sẻ FinHome và nhận thưởng',
    action: 'Mời ngay'
  }
]

export const CompletionStep: React.FC<CompletionStepProps> = ({
  step,
  onComplete,
  isCompleted
}) => {
  // Auto-complete after animations
  useEffect(() => {
    if (!isCompleted) {
      const timer = setTimeout(() => {
        onComplete()
      }, 5000) // Auto-complete after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isCompleted, onComplete])

  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0)

  return (
    <div className="space-y-8">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="text-center"
      >
        <div className="relative inline-block">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>
          
          {/* Sparkles animation */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="absolute"
              style={{
                top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 40}px`,
                left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 40}px`,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
          ))}
        </div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6"
        >
          🎉 Chúc Mừng!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-lg text-gray-600 dark:text-gray-400 mt-2"
        >
          Bạn đã hoàn thành onboarding và sẵn sàng bắt đầu hành trình tài chính với FinHome!
        </motion.p>
      </motion.div>

      {/* Achievements Earned */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                Thành Tích Mở Khóa
              </h3>
              <Badge className="bg-yellow-100 text-yellow-800 mt-2">
                +{totalPoints} điểm kinh nghiệm
              </Badge>
            </div>
            
            <div className="space-y-3">
              {achievements.map((achievement, index) => {
                const IconComponent = achievement.icon
                return (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.2 }}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <IconComponent className={`w-5 h-5 ${achievement.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </div>
                    </div>
                    <Badge variant="secondary">+{achievement.points}</Badge>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
          Bước Tiếp Theo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nextSteps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {step.description}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      {step.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.8 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 text-center"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          Chào Mừng Đến Với Cộng Đồng FinHome! 🏠
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Bạn hiện là thành viên của cộng đồng 10,000+ người Việt Nam tin tưởng FinHome 
          để quản lý và lập kế hoạch tài chính thông minh.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Miễn phí 30 ngày</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Không giới hạn kế hoạch</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Hỗ trợ 24/7</span>
          </div>
        </div>
      </motion.div>

      {/* Auto-completion indicator */}
      {!isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.0 }}
          className="text-center text-sm text-gray-500"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Đang hoàn thành onboarding...</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default CompletionStep