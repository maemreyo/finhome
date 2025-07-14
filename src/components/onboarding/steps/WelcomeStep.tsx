// src/components/onboarding/steps/WelcomeStep.tsx
// Welcome step for onboarding flow

'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Calculator, 
  TrendingUp, 
  Target, 
  Shield,
  Sparkles,
  Users,
  Award
} from 'lucide-react'
import { OnboardingStep } from '@/types/onboarding'

interface WelcomeStepProps {
  step: OnboardingStep
  onComplete: () => void
  isCompleted: boolean
}

const features = [
  {
    icon: Calculator,
    title: 'Tính Toán Thông Minh',
    description: 'Công cụ tính toán tài chính chính xác với dữ liệu thị trường thực tế',
    color: 'text-blue-600'
  },
  {
    icon: TrendingUp,
    title: 'Phân Tích Kịch Bản',
    description: 'So sánh nhiều phương án đầu tư để đưa ra quyết định tối ưu',
    color: 'text-green-600'
  },
  {
    icon: Target,
    title: 'Mục Tiêu Cá Nhân Hóa',
    description: 'Lập kế hoạch phù hợp với tình hình tài chính và mục tiêu của bạn',
    color: 'text-purple-600'
  },
  {
    icon: Shield,
    title: 'An Toàn & Bảo Mật',
    description: 'Thông tin của bạn được bảo vệ với công nghệ mã hóa hàng đầu',
    color: 'text-orange-600'
  }
]

const benefits = [
  'Tiết kiệm thời gian nghiên cứu thị trường',
  'Tránh rủi ro đầu tư thiếu thông tin',
  'Tối ưu hóa khả năng tài chính cá nhân',
  'Đạt mục tiêu sở hữu nhà nhanh hơn'
]

const userTypes = [
  {
    icon: Home,
    title: 'Người Mua Nhà Lần Đầu',
    description: 'Bạn đang tìm hiểu về việc mua nhà đầu tiên',
    badge: 'Phổ biến nhất'
  },
  {
    icon: TrendingUp,
    title: 'Nhà Đầu Tư Cá Nhân',
    description: 'Bạn muốn đầu tư bất động sản để tăng thu nhập',
    badge: 'Chuyên nghiệp'
  },
  {
    icon: Users,
    title: 'Gia Đình Nâng Cấp',
    description: 'Bạn cần nâng cấp chỗ ở phù hợp với gia đình',
    badge: 'Ưu tiên gia đình'
  }
]

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  step,
  onComplete,
  isCompleted
}) => {
  // Auto-complete this step after a short delay
  useEffect(() => {
    if (!isCompleted) {
      const timer = setTimeout(() => {
        onComplete()
      }, 3000) // Auto-complete after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [isCompleted, onComplete])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6"
          >
            <Home className="w-10 h-10 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 dark:text-gray-100"
        >
          Chào Mừng Đến Với <span className="text-blue-600">FinHome</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Trợ lý tài chính AI hàng đầu Việt Nam, giúp bạn tự tin làm chủ hành trình 
          an cư và đầu tư bất động sản một cách thông minh.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-sm text-gray-500"
        >
          <Award className="w-4 h-4" />
          <span>Được tin tưởng bởi hơn 10,000+ người dùng Việt Nam</span>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {features.map((feature, index) => {
          const IconComponent = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${feature.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          Với FinHome, bạn có thể:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + index * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* User Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
          FinHome phù hợp cho tất cả mọi người:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userTypes.map((type, index) => {
            const IconComponent = type.icon
            return (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + index * 0.1 }}
              >
                <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {type.badge}
                      </Badge>
                    </div>
                    <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {type.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Auto-completion indicator */}
      {!isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="text-center text-sm text-gray-500"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Chuẩn bị bước tiếp theo...</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default WelcomeStep