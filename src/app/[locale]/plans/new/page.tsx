// src/app/[locale]/plans/new/page.tsx
// Consolidated create new financial plan page with i18n support

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Calculator, Target, ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import FinancialPlanningWizard from '@/components/financial-planning/FinancialPlanningWizard'
import { CreatePlanForm } from '@/components/plans/CreatePlanForm'
import { useToast, ToastHelpers } from '@/components/notifications/ToastNotification'
import useGlobalState from '@/lib/hooks/useGlobalState'
import { useAuth } from '@/hooks/useAuth'

export default function NewPlanPage() {
  const t = useTranslations('NewPlanPage')
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const { addNotification, unlockAchievement, addExperience } = useGlobalState()

  const handlePlanComplete = (planData: any) => {
    // Add success notification
    addNotification({
      type: 'success',
      title: t('notifications.planCreated'),
      message: t('notifications.planSaved', { planName: planData.personalInfo?.name || planData.planName }),
      isRead: false,
      actionUrl: '/plans'
    })

    // Add experience points
    addExperience(100)

    // Check for achievements
    unlockAchievement(t('achievements.planner'))

    // Show toast notification
    showToast(ToastHelpers.achievement(
      t('toasts.planComplete'),
      t('toasts.planCompleteDesc')
    ))

    // Redirect to plans list after 2 seconds
    setTimeout(() => {
      router.push('/plans')
    }, 2000)
  }

  const handleBackToPlans = () => {
    router.push('/plans')
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
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackToPlans}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('actions.backToPlans')}
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('title')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <Zap className="w-4 h-4 mr-1" />
                {t('badges.smartWizard')}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                {t('badges.roiAnalysis')}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Calculator className="w-4 h-4 mr-1" />
                {t('badges.accurateCalculation')}
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
          {user ? (
            // Authenticated users get the database-integrated form
            <CreatePlanForm 
              userId={user.id} 
              onComplete={handlePlanComplete}
              onCancel={handleBackToPlans}
            />
          ) : (
            // Non-authenticated users get the wizard experience
            <FinancialPlanningWizard onComplete={handlePlanComplete} />
          )}
        </motion.div>
      </div>
    </div>
  )
}