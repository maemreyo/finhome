// src/components/integration/SystemIntegration.tsx
// Demonstration of how all systems integrate together

'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp,
  Home,
  Calculator,
  Award,
  Bell,
  Target,
  Users
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast, ToastHelpers } from '@/components/notifications/ToastNotification'
import useGlobalState from '@/lib/hooks/useGlobalState'
import { cn } from '@/lib/utils'

interface IntegrationFlow {
  id: string
  title: string
  description: string
  steps: IntegrationStep[]
  icon: React.ComponentType<any>
  color: string
}

interface IntegrationStep {
  id: string
  title: string
  description: string
  system: string
  action: () => void
  completed: boolean
}

interface SystemIntegrationProps {
  className?: string
}

export const SystemIntegration: React.FC<SystemIntegrationProps> = ({
  className
}) => {
  const { showToast } = useToast()
  const { 
    addNotification, 
    unlockAchievement, 
    addExperience, 
    updatePortfolioValue,
    user 
  } = useGlobalState()

  // Demo integration flows
  const integrationFlows: IntegrationFlow[] = [
    {
      id: 'property-investment',
      title: 'Quy Trình Đầu Tư Bất Động Sản',
      description: 'Từ tìm kiếm đến quản lý đầu tư hoàn chỉnh',
      icon: Home,
      color: 'bg-blue-500',
      steps: [
        {
          id: 'search',
          title: 'Tìm kiếm bất động sản',
          description: 'Sử dụng hệ thống tìm kiếm thông minh',
          system: 'Property Search',
          completed: false,
          action: () => {
            showToast(ToastHelpers.success('Tìm kiếm hoàn tất', 'Đã tìm thấy 15 bất động sản phù hợp'))
            addNotification({
              type: 'info',
              title: 'Kết quả tìm kiếm',
              message: 'Tìm thấy 15 bất động sản phù hợp với tiêu chí của bạn',
              isRead: false,
              actionUrl: '/properties'
            })
          }
        },
        {
          id: 'analyze',
          title: 'Phân tích ROI và lãi suất',
          description: 'So sánh ngân hàng và tính toán ROI',
          system: 'Bank Comparison + ROI Analysis',
          completed: false,
          action: () => {
            showToast(ToastHelpers.info('Phân tích hoàn tất', 'ROI dự kiến: 12.5%, Lãi suất tốt nhất: 7.3%'))
            addExperience(50)
          }
        },
        {
          id: 'plan',
          title: 'Tạo kế hoạch tài chính',
          description: 'Lập kế hoạch chi tiết với timeline',
          system: 'Financial Planning',
          completed: false,
          action: () => {
            showToast(ToastHelpers.success('Kế hoạch đã tạo', 'Kế hoạch đầu tư 20 năm đã được lưu'))
            unlockAchievement('Người Lập Kế Hoạch')
          }
        },
        {
          id: 'invest',
          title: 'Thực hiện đầu tư',
          description: 'Thêm vào danh mục đầu tư',
          system: 'Investment Portfolio',
          completed: false,
          action: () => {
            updatePortfolioValue(3200000000)
            showToast(ToastHelpers.achievement('Đầu tư thành công!', 'Bất động sản đã được thêm vào danh mục'))
            unlockAchievement('Nhà Đầu Tư Thông Minh')
            addExperience(200)
          }
        },
        {
          id: 'track',
          title: 'Theo dõi hiệu suất',
          description: 'Giám sát ROI và dòng tiền',
          system: 'Performance Tracking',
          completed: false,
          action: () => {
            showToast(ToastHelpers.success('Theo dõi kích hoạt', 'Hệ thống sẽ thông báo các cập nhật quan trọng'))
          }
        }
      ]
    },
    {
      id: 'savings-goal',
      title: 'Đạt Mục Tiêu Tiết Kiệm',
      description: 'Gamification và theo dõi tiến độ',
      icon: Target,
      color: 'bg-green-500',
      steps: [
        {
          id: 'set-goal',
          title: 'Đặt mục tiêu tiết kiệm',
          description: 'Thiết lập mục tiêu SMART',
          system: 'Goal Setting',
          completed: false,
          action: () => {
            showToast(ToastHelpers.success('Mục tiêu đã đặt', 'Tiết kiệm 500M VND trong 12 tháng'))
            addExperience(25)
          }
        },
        {
          id: 'track-progress',
          title: 'Theo dõi tiến độ',
          description: 'Cập nhật hàng ngày/tuần',
          system: 'Progress Tracking',
          completed: false,
          action: () => {
            showToast(ToastHelpers.goalProgress(75, 'Tiết kiệm mua nhà'))
            addExperience(10)
          }
        },
        {
          id: 'milestone',
          title: 'Đạt cột mốc',
          description: 'Nhận thưởng và thành tích',
          system: 'Achievement System',
          completed: false,
          action: () => {
            unlockAchievement('Guru Tiết Kiệm')
            showToast(ToastHelpers.achievement('Cột mốc 75%!', 'Bạn đã hoàn thành 3/4 mục tiêu'))
            addExperience(100)
          }
        }
      ]
    },
    {
      id: 'community-sharing',
      title: 'Chia Sẻ Cộng Đồng',
      description: 'Học hỏi và chia sẻ kinh nghiệm',
      icon: Users,
      color: 'bg-purple-500',
      steps: [
        {
          id: 'share-plan',
          title: 'Chia sẻ kế hoạch',
          description: 'Đăng kế hoạch công khai',
          system: 'Social Sharing',
          completed: false,
          action: () => {
            showToast(ToastHelpers.success('Chia sẻ thành công', 'Kế hoạch của bạn đã được đăng'))
            addExperience(30)
          }
        },
        {
          id: 'get-feedback',
          title: 'Nhận phản hồi',
          description: 'Cộng đồng đánh giá và góp ý',
          system: 'Community Feedback',
          completed: false,
          action: () => {
            addNotification({
              type: 'info',
              title: 'Phản hồi mới',
              message: '5 người đã thích kế hoạch của bạn và có 2 góp ý',
              isRead: false
            })
            addExperience(20)
          }
        },
        {
          id: 'social-achievement',
          title: 'Đạt thành tích xã hội',
          description: 'Nhận thưởng từ cộng đồng',
          system: 'Social Achievements',
          completed: false,
          action: () => {
            unlockAchievement('Cộng Đồng Thân Thiện')
            showToast(ToastHelpers.achievement('Thành viên tích cực!', 'Cảm ơn bạn đã đóng góp cho cộng đồng'))
            addExperience(150)
          }
        }
      ]
    }
  ]

  const [completedFlows, setCompletedFlows] = React.useState<Record<string, Record<string, boolean>>>({})

  const executeStep = (flowId: string, stepId: string, action: () => void) => {
    action()
    setCompletedFlows(prev => ({
      ...prev,
      [flowId]: {
        ...prev[flowId],
        [stepId]: true
      }
    }))
  }

  const getFlowProgress = (flowId: string) => {
    const flow = integrationFlows.find(f => f.id === flowId)
    if (!flow) return 0
    
    const completed = Object.values(completedFlows[flowId] || {}).filter(Boolean).length
    return (completed / flow.steps.length) * 100
  }

  // Demo automatic notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: 'info',
        title: 'Cập nhật thị trường',
        message: 'Lãi suất vay mua nhà tại BIDV vừa giảm 0.1%',
        isRead: false,
        actionUrl: '/banks'
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [addNotification])

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Tích Hợp Hệ Thống</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá cách các hệ thống trong FinHome hoạt động cùng nhau để tạo ra trải nghiệm 
            quản lý tài chính bất động sản hoàn chỉnh
          </p>
        </motion.div>
      </div>

      {/* Integration Flows */}
      <div className="space-y-8">
        {integrationFlows.map((flow, flowIndex) => {
          const progress = getFlowProgress(flow.id)
          const IconComponent = flow.icon

          return (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: flowIndex * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-lg text-white", flow.color)}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{flow.title}</CardTitle>
                        <p className="text-gray-600 mt-1">{flow.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(progress)}%
                      </div>
                      <div className="text-sm text-gray-500">Hoàn thành</div>
                    </div>
                  </div>
                  
                  <Progress value={progress} className="mt-4" />
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4">
                    {flow.steps.map((step, stepIndex) => {
                      const isCompleted = completedFlows[flow.id]?.[step.id] || false
                      
                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: stepIndex * 0.1 }}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border transition-all",
                            isCompleted 
                              ? "bg-green-50 border-green-200" 
                              : "bg-gray-50 border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {/* Step Number/Check */}
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          )}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              stepIndex + 1
                            )}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                "font-semibold",
                                isCompleted ? "text-green-900" : "text-gray-900"
                              )}>
                                {step.title}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {step.system}
                              </Badge>
                            </div>
                            <p className={cn(
                              "text-sm",
                              isCompleted ? "text-green-700" : "text-gray-600"
                            )}>
                              {step.description}
                            </p>
                          </div>

                          {/* Action Button */}
                          {!isCompleted && (
                            <Button
                              size="sm"
                              onClick={() => executeStep(flow.id, step.id, step.action)}
                              className="whitespace-nowrap"
                            >
                              Thực hiện
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Integration Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Lợi Ích Tích Hợp Hệ Thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Tự Động Hóa</h4>
                <p className="text-sm text-gray-600">
                  Dữ liệu đồng bộ tự động giữa các hệ thống
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Thông Tin Toàn Diện</h4>
                <p className="text-sm text-gray-600">
                  Nhìn tổng quan đầy đủ về tài chính
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Gamification</h4>
                <p className="text-sm text-gray-600">
                  Động lực thông qua thành tích và phần thưởng
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold mb-2">Thông Báo Thông Minh</h4>
                <p className="text-sm text-gray-600">
                  Nhận cảnh báo và cập nhật quan trọng
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default SystemIntegration