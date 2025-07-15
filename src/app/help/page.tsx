// src/app/help/page.tsx
// Comprehensive help and support center page

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HelpCircle, 
  Play, 
  ArrowLeft,
  Sparkles,
  BookOpen,
  MessageCircle,
  Video
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import HelpSystem from '@/components/help/HelpSystem'
import OnboardingTour from '@/components/help/OnboardingTour'
import { useToast, ToastHelpers } from '@/components/notifications/ToastNotification'
import useGlobalState from '@/lib/hooks/useGlobalState'

export default function HelpPage() {
  const { showToast } = useToast()
  const { addNotification, addExperience } = useGlobalState()
  const [showOnboardingTour, setShowOnboardingTour] = useState(false)

  const handleBackToDashboard = () => {
    showToast(ToastHelpers.info('Quay về dashboard', 'Đang chuyển hướng...'))
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  }

  const handleStartTour = () => {
    setShowOnboardingTour(true)
    addNotification({
      type: 'info',
      title: 'Bắt đầu tour hướng dẫn',
      message: 'Tour giới thiệu các tính năng chính của FinHome đã được khởi động',
      isRead: false
    })
  }

  const handleTourComplete = () => {
    setShowOnboardingTour(false)
    showToast(ToastHelpers.success('Tour hoàn thành', 'Bạn đã nắm được các tính năng cơ bản của FinHome'))
  }

  const handleTourSkip = () => {
    setShowOnboardingTour(false)
    addExperience(10)
  }

  // Welcome message for first-time visitors
  React.useEffect(() => {
    const hasVisitedHelp = localStorage.getItem('hasVisitedHelp')
    
    if (!hasVisitedHelp) {
      addNotification({
        type: 'info',
        title: 'Chào mừng đến trung tâm trợ giúp',
        message: 'Tìm kiếm hướng dẫn, FAQ và hỗ trợ kỹ thuật tại đây',
        isRead: false
      })
      
      localStorage.setItem('hasVisitedHelp', 'true')
    }
  }, [addNotification])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding Tour */}
      <OnboardingTour
        isVisible={showOnboardingTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay về
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Trung Tâm Trợ Giúp
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Hướng dẫn, FAQ và hỗ trợ cho FinHome
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleStartTour}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Tour hướng dẫn
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Tour hướng dẫn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-3">
                Hướng dẫn tương tác từng bước
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={handleStartTour}
              >
                Bắt đầu
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-green-600" />
                Hướng dẫn chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-3">
                Tài liệu và bài viết hướng dẫn
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Xem thêm
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Video className="w-4 h-4 text-purple-600" />
                Video hướng dẫn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-3">
                Các video tutorial chi tiết
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Xem video
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4 text-orange-600" />
                Hỗ trợ trực tiếp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-3">
                Chat với đội ngũ hỗ trợ
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Bắt đầu chat
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Help System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <HelpSystem />
        </motion.div>
      </div>
    </div>
  )
}