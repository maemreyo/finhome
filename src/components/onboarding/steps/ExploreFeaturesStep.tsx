// src/components/onboarding/steps/ExploreFeaturesStep.tsx
// Feature exploration step for onboarding

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  TrendingUp, 
  FileText,
  Trophy,
  Beaker,
  BarChart3,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react'
import { OnboardingStep } from '@/types/onboarding'

interface ExploreFeaturesStepProps {
  step: OnboardingStep
  onComplete: () => void
  isCompleted: boolean
}

const features = [
  {
    id: 'scenarios',
    icon: Calculator,
    title: 'So Sánh Kịch Bản',
    description: 'So sánh nhiều phương án vay khác nhau để tìm lựa chọn tối ưu',
    benefits: ['Phân tích rủi ro', 'Tối ưu chi phí', 'Quyết định thông minh'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    demo: 'Xem cách so sánh 3 gói vay với lãi suất khác nhau'
  },
  {
    id: 'laboratory',
    icon: Beaker,
    title: 'Phòng Thí Nghiệm Tài Chính',
    description: 'Mô phỏng "Điều gì sẽ xảy ra nếu?" với các tình huống khác nhau',
    benefits: ['Trả nợ sớm', 'Tái cơ cấu', 'Kiểm tra stress'],
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900',
    demo: 'Xem tiết kiệm được bao nhiều khi trả thêm 2 triệu/tháng'
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Phân Tích Chi Tiết',
    description: 'Báo cáo và biểu đồ chi tiết về kế hoạch tài chính của bạn',
    benefits: ['Timeline trực quan', 'Dòng tiền', 'Dự báo tài sản'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
    demo: 'Xem timeline 20 năm với các mốc quan trọng'
  },
  {
    id: 'achievements',
    icon: Trophy,
    title: 'Hệ Thống Thành Tích',
    description: 'Theo dõi tiến độ và mở khóa thành tích trong hành trình tài chính',
    benefits: ['Động lực học tập', 'Theo dõi tiến độ', 'Cộng đồng'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
    demo: 'Mở khóa thành tích "Người Lập Kế Hoạch Cẩn Trọng"'
  },
  {
    id: 'export',
    icon: FileText,
    title: 'Xuất Báo Cáo',
    description: 'Xuất kế hoạch tài chính dưới dạng PDF hoặc Excel chuyên nghiệp',
    benefits: ['Báo cáo PDF', 'File Excel', 'Chia sẻ dễ dàng'],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900',
    demo: 'Tạo báo cáo PDF 15 trang với biểu đồ và phân tích'
  }
]

export const ExploreFeaturesStep: React.FC<ExploreFeaturesStepProps> = ({
  step,
  onComplete,
  isCompleted
}) => {
  const [exploredFeatures, setExploredFeatures] = useState<string[]>([])
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  const handleExploreFeature = (featureId: string) => {
    if (!exploredFeatures.includes(featureId)) {
      setExploredFeatures(prev => [...prev, featureId])
    }
    setSelectedFeature(featureId)
    
    // Auto-mark as explored after 2 seconds
    setTimeout(() => {
      setSelectedFeature(null)
    }, 2000)
  }

  const canComplete = exploredFeatures.length >= 2 // User needs to explore at least 2 features

  const handleComplete = () => {
    localStorage.setItem('onboarding_explored_features', JSON.stringify(exploredFeatures))
    onComplete()
  }

  const selectedFeatureData = features.find(f => f.id === selectedFeature)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg mb-4"
        >
          <Star className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Khám Phá Tính Năng FinHome
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tìm hiểu các công cụ mạnh mẽ giúp bạn quản lý tài chính hiệu quả
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge variant="outline">
            Đã khám phá: {exploredFeatures.length}/5
          </Badge>
          {canComplete && (
            <Badge className="bg-green-100 text-green-800">
              Đủ điều kiện hoàn thành
            </Badge>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => {
          const IconComponent = feature.icon
          const isExplored = exploredFeatures.includes(feature.id)
          const isSelected = selectedFeature === feature.id
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card className={`h-full cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
              } ${isExplored ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    {isExplored && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lợi ích chính:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {feature.benefits.map((benefit) => (
                          <Badge key={benefit} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        onClick={() => handleExploreFeature(feature.id)}
                        variant={isExplored ? "outline" : "default"}
                        size="sm"
                        className="w-full flex items-center gap-2"
                        disabled={isSelected}
                      >
                        {isSelected ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Đang khám phá...
                          </>
                        ) : isExplored ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Đã khám phá
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4" />
                            Khám phá ngay
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Feature Demo Modal */}
      {selectedFeatureData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-4 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <Card className="relative max-w-lg w-full mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <selectedFeatureData.icon className={`w-5 h-5 ${selectedFeatureData.color}`} />
                {selectedFeatureData.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-lg font-medium">Demo: {selectedFeatureData.demo}</div>
                <div className="animate-pulse text-blue-600">
                  🎯 Đang mô phỏng tính năng...
                </div>
                <div className="text-sm text-gray-600">
                  Trong ứng dụng thực tế, bạn sẽ thấy giao diện tương tác đầy đủ
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Progress Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Tiến Độ Khám Phá
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {features.map((feature) => {
            const isExplored = exploredFeatures.includes(feature.id)
            return (
              <div
                key={feature.id}
                className={`h-2 rounded-full transition-colors ${
                  isExplored ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )
          })}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {exploredFeatures.length < 2 
            ? `Khám phá thêm ${2 - exploredFeatures.length} tính năng để tiếp tục`
            : 'Tuyệt vời! Bạn đã sẵn sàng để hoàn thành onboarding'
          }
        </div>
      </div>

      {/* Completion Button */}
      {canComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Tuyệt vời! Bạn đã khám phá đủ tính năng</span>
          </div>
          
          <Button 
            onClick={handleComplete}
            size="lg"
            className="flex items-center gap-2"
          >
            Tiếp Tục
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <div className="text-sm text-gray-500">
            Bạn có thể khám phá thêm các tính năng khác sau khi hoàn thành onboarding
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ExploreFeaturesStep