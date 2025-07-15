// src/app/settings/page.tsx
// User settings page with comprehensive preference management

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Settings, User, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import UserSettings from '@/components/settings/UserSettings'
import { useToast, ToastHelpers } from '@/components/notifications/ToastNotification'
import useGlobalState from '@/lib/hooks/useGlobalState'

export default function SettingsPage() {
  const { showToast } = useToast()
  const { user, addNotification, addExperience } = useGlobalState()

  const handleBackToDashboard = () => {
    showToast(ToastHelpers.info('Quay về dashboard', 'Đang chuyển hướng...'))
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  }

  // Welcome notification for first-time visitors
  React.useEffect(() => {
    const hasVisitedSettings = localStorage.getItem('hasVisitedSettings')
    
    if (!hasVisitedSettings) {
      addNotification({
        type: 'info',
        title: 'Chào mừng đến trang cài đặt',
        message: 'Tùy chỉnh trải nghiệm của bạn với các cài đặt cá nhân hóa',
        isRead: false
      })
      
      addExperience(10)
      localStorage.setItem('hasVisitedSettings', 'true')
    }
  }, [addNotification, addExperience])

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
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Cài Đặt Tài Khoản
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Tùy chỉnh trải nghiệm FinHome của bạn
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Cấp {user.stats?.level || 1}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {user.stats?.experience || 0} XP
                    </Badge>
                  </div>
                </div>
              )}
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
          <UserSettings />
        </motion.div>
      </div>
    </div>
  )
}