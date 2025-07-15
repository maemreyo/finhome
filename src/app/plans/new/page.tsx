// src/app/plans/new/page.tsx
// Create new financial plan page with comprehensive wizard

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Calculator, Target } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import FinancialPlanningWizard from '@/components/financial-planning/FinancialPlanningWizard'
import { useToast, ToastHelpers } from '@/components/notifications/ToastNotification'
import useGlobalState from '@/lib/hooks/useGlobalState'

export default function NewPlanPage() {
  const { showToast } = useToast()
  const { addNotification, unlockAchievement, addExperience } = useGlobalState()

  const handlePlanComplete = (planData: any) => {
    // Add success notification
    addNotification({
      type: 'success',
      title: 'Kế hoạch tài chính đã tạo',
      message: `Kế hoạch "${planData.personalInfo.name}" đã được lưu thành công`,
      isRead: false,
      actionUrl: '/plans'
    })

    // Add experience points
    addExperience(100)

    // Check for achievements
    unlockAchievement('Người Lập Kế Hoạch')

    // Show toast notification
    showToast(ToastHelpers.achievement(
      'Kế hoạch hoàn thành!',
      'Bạn đã tạo kế hoạch tài chính chi tiết'
    ))

    // Redirect to plans list after 2 seconds
    setTimeout(() => {
      window.location.href = '/plans'
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tạo Kế Hoạch Tài Chính Mới
              </h1>
              <p className="text-gray-600 mt-2">
                Wizard thông minh giúp bạn tạo kế hoạch tài chính bất động sản chi tiết
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <Zap className="w-4 h-4 mr-1" />
                Wizard thông minh
              </Badge>
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Phân tích ROI
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Calculator className="w-4 h-4 mr-1" />
                Tính toán chính xác
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <FinancialPlanningWizard onComplete={handlePlanComplete} />
        </motion.div>
      </div>
    </div>
  )
}