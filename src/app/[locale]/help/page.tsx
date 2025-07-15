// src/app/[locale]/help/page.tsx
// Help and support center page with i18n support

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
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import HelpSystem from '@/components/help/HelpSystem'
import OnboardingTour from '@/components/help/OnboardingTour'
import { useToast, ToastHelpers } from '@/components/notifications/ToastNotification'
import useGlobalState from '@/lib/hooks/useGlobalState'

export default function HelpPage() {
  const t = useTranslations('HelpPage')
  const router = useRouter()
  const { showToast } = useToast()
  const { addNotification, addExperience } = useGlobalState()
  const [showOnboardingTour, setShowOnboardingTour] = useState(false)

  const handleBackToDashboard = () => {
    showToast(ToastHelpers.info(t('actions.backToDashboard'), t('messages.redirecting')))
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  const handleStartTour = () => {
    setShowOnboardingTour(true)
    addNotification({
      type: 'info',
      title: t('notifications.tourStarted'),
      message: t('notifications.tourDescription'),
      isRead: false
    })
  }

  const handleTourComplete = () => {
    setShowOnboardingTour(false)
    addExperience(50)
    showToast(ToastHelpers.achievement(
      t('toasts.tourComplete'),
      t('toasts.tourCompleteDesc')
    ))
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
          >
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('actions.back')}
              </Button>
              
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <BookOpen className="w-4 h-4 mr-1" />
                {t('badges.documentation')}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Video className="w-4 h-4 mr-1" />
                {t('badges.tutorials')}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <MessageCircle className="w-4 h-4 mr-1" />
                {t('badges.support')}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Sparkles className="w-4 h-4 mr-1" />
                {t('badges.guided')}
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Play className="w-5 h-5" />
                {t('quickActions.tour.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                {t('quickActions.tour.description')}
              </p>
              <Button 
                onClick={handleStartTour}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('quickActions.tour.action')}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <MessageCircle className="w-5 h-5" />
                {t('quickActions.support.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                {t('quickActions.support.description')}
              </p>
              <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('quickActions.support.action')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Help System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <HelpSystem />
        </motion.div>
      </div>

      {/* Onboarding Tour Modal */}
      {showOnboardingTour && (
        <OnboardingTour
          onComplete={handleTourComplete}
          onSkip={() => setShowOnboardingTour(false)}
        />
      )}
    </div>
  )
}