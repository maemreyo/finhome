// src/app/[locale]/achievements/page.tsx
// Consolidated achievements page with i18n support

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Trophy, Star, Target, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

import AchievementSystem from '@/components/achievements/AchievementSystem'
import { AchievementGallery } from '@/components/gamification/AchievementGallery'
import { UserProgress } from '@/lib/gamification/achievements'
import { type FinancialPlanWithMetrics } from '@/lib/api/plans'
import { useAuth } from '@/hooks/useAuth'

// Mock user progress data - would be fetched from backend
const getMockUserProgress = (userId: string): UserProgress => ({
  userId,
  totalPoints: 1250,
  level: 3,
  completedAchievements: ['first_plan', 'smart_investor', 'planning_expert'],
  progressData: {
    plansCreated: 6,
    totalSavingsOptimized: 75000000,
    highestROI: 12.5,
    plansCompleted: 2,
    exportsGenerated: 8,
    streakDays: 15,
    lastActivityDate: new Date()
  }
})

// Mock plans data - would be fetched from backend
const getMockPlans = (): FinancialPlanWithMetrics[] => ([
  {
    id: '1',
    user_id: 'demo-user',
    plan_name: 'Mua nhà đầu tiên',
    description: null,
    plan_type: 'home_purchase',
    status: 'active',
    property_id: null,
    custom_property_data: null,
    target_age: null,
    current_monthly_income: null,
    monthly_income: 50000000,
    current_monthly_expenses: null,
    monthly_expenses: 30000000,
    current_savings: 600000000,
    dependents: 0,
    purchase_price: 2500000000,
    down_payment: 500000000,
    additional_costs: 0,
    other_debts: 0,
    target_property_type: null,
    target_location: null,
    target_budget: null,
    target_timeframe_months: null,
    investment_purpose: null,
    desired_features: {},
    down_payment_target: null,
    risk_tolerance: null,
    investment_horizon_months: null,
    expected_roi: null,
    preferred_banks: null,
    expected_rental_income: null,
    expected_appreciation_rate: null,
    emergency_fund_target: null,
    education_fund_target: null,
    retirement_fund_target: null,
    other_goals: {},
    feasibility_score: null,
    recommended_adjustments: {},
    is_public: false,
    view_count: 0,
    cached_calculations: null,
    calculations_last_updated: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    completed_at: null,
    calculatedMetrics: {
      monthlyPayment: 0,
      totalInterest: 0,
      debtToIncomeRatio: 0,
      affordabilityScore: 8,
      roi: 12.5
    }
  },
  {
    id: '2',
    user_id: 'demo-user',
    plan_name: 'Đầu tư căn hộ cho thuê',
    description: null,
    plan_type: 'investment',
    status: 'completed',
    property_id: null,
    custom_property_data: null,
    target_age: null,
    current_monthly_income: null,
    monthly_income: 45000000,
    current_monthly_expenses: null,
    monthly_expenses: 25000000,
    current_savings: 500000000,
    dependents: 0,
    purchase_price: 1800000000,
    down_payment: 400000000,
    additional_costs: 0,
    other_debts: 0,
    target_property_type: null,
    target_location: null,
    target_budget: null,
    target_timeframe_months: null,
    investment_purpose: null,
    desired_features: {},
    down_payment_target: null,
    risk_tolerance: null,
    investment_horizon_months: null,
    expected_roi: null,
    preferred_banks: null,
    expected_rental_income: null,
    expected_appreciation_rate: null,
    emergency_fund_target: null,
    education_fund_target: null,
    retirement_fund_target: null,
    other_goals: {},
    feasibility_score: null,
    recommended_adjustments: {},
    is_public: false,
    view_count: 0,
    cached_calculations: null,
    calculations_last_updated: null,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
    completed_at: null,
    calculatedMetrics: {
      monthlyPayment: 0,
      totalInterest: 0,
      debtToIncomeRatio: 0,
      affordabilityScore: 7,
      roi: 8.3
    }
  }
])

export default function AchievementsPage() {
  const t = useTranslations('AchievementsPage')
  const { user } = useAuth()
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [plans, setPlans] = useState<FinancialPlanWithMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'gallery' | 'system'>('system')

  useEffect(() => {
    if (user) {
      try {
        // In a real app, this would be API calls
        const progress = getMockUserProgress(user.id)
        const userPlans = getMockPlans()
        
        setUserProgress(progress)
        setPlans(userPlans)
        setViewMode('gallery') // Switch to gallery mode when authenticated
      } catch (err) {
        console.error('Error loading user progress:', err)
        setError(t('errors.loadFailed'))
      } finally {
        setLoading(false)
      }
    } else {
      // For non-authenticated users, show the system view
      setLoading(false)
      setViewMode('system')
    }
  }, [user, t])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('description')}
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
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
                {t('title')}
              </h1>
              <p className="text-gray-600 mt-2">
                {t('description')}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <Award className="w-4 h-4 mr-1" />
                {t('badges.gamification')}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Trophy className="w-4 h-4 mr-1" />
                {t('badges.rewards')}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Star className="w-4 h-4 mr-1" />
                {t('badges.ranking')}
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
          {viewMode === 'system' ? (
            <AchievementSystem />
          ) : userProgress ? (
            <AchievementGallery 
              userProgress={userProgress}
              plans={plans}
              onAchievementUnlock={(achievement) => {
                // Handle achievement unlock notification
                console.log('Achievement unlocked:', achievement)
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {t('welcome.title')}
                </CardTitle>
                <CardDescription>
                  {t('welcome.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}