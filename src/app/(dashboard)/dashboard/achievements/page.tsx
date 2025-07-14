// src/app/(dashboard)/dashboard/achievements/page.tsx
// Achievements page displaying user progress and unlocked achievements

'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { AchievementGallery } from '@/components/gamification/AchievementGallery'
import { UserProgress } from '@/lib/gamification/achievements'
import { FinancialPlan } from '@/components/financial-plans/PlansList'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Trophy } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
const getMockPlans = (): FinancialPlan[] => ([
  {
    id: '1',
    planName: 'Mua nhà đầu tiên',
    planType: 'home_purchase',
    purchasePrice: 2500000000,
    downPayment: 500000000,
    monthlyIncome: 50000000,
    monthlyExpenses: 30000000,
    currentSavings: 600000000,
    isPublic: false,
    planStatus: 'active',
    roi: 12.5,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    planName: 'Đầu tư căn hộ cho thuê',
    planType: 'investment',
    purchasePrice: 1800000000,
    downPayment: 400000000,
    monthlyIncome: 45000000,
    monthlyExpenses: 25000000,
    currentSavings: 500000000,
    isPublic: false,
    planStatus: 'completed',
    roi: 8.3,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15')
  }
])

export default function AchievementsPage() {
  const { user } = useAuth()
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [plans, setPlans] = useState<FinancialPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      try {
        // In a real app, this would be API calls
        const progress = getMockUserProgress(user.id)
        const userPlans = getMockPlans()
        
        setUserProgress(progress)
        setPlans(userPlans)
      } catch (err) {
        console.error('Error loading user progress:', err)
        setError('Failed to load achievements data')
      } finally {
        setLoading(false)
      }
    }
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <Header 
          title="Achievements" 
          description="Track your progress and unlock new achievements"
        />
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </CardContent>
          </Card>
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
      <div className="space-y-6">
        <Header 
          title="Achievements" 
          description="Track your progress and unlock new achievements"
        />
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!userProgress) {
    return (
      <div className="space-y-6">
        <Header 
          title="Achievements" 
          description="Track your progress and unlock new achievements"
        />
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Welcome to Achievements!
              </CardTitle>
              <CardDescription>
                Start creating financial plans to begin earning achievements and tracking your progress.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header 
        title="Achievements" 
        description="Track your progress and unlock new achievements"
        userProgress={userProgress}
      />
      
      <div className="p-6">
        <AchievementGallery 
          userProgress={userProgress}
          plans={plans}
          onAchievementUnlock={(achievement) => {
            // Handle achievement unlock notification
            console.log('Achievement unlocked:', achievement)
          }}
        />
      </div>
    </div>
  )
}