// src/components/expenses/GamificationCenter.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Trophy, 
  Star, 
  Target, 
  Calendar,
  Flame,
  Award,
  Crown,
  Gift,
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  Sparkles,
  Home,
  PiggyBank,
  Zap,
  Medal,
  Lock,
  ChevronRight,
  Play,
  RotateCcw
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { format, differenceInDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Achievement {
  id: string
  name_en: string
  name_vi: string
  description_en: string
  description_vi: string
  category: 'first_time' | 'streak' | 'savings' | 'budgeting' | 'house_purchase'
  requirement_type: string
  requirement_value: number
  experience_points: number
  badge_icon: string
  badge_color: string
  triggers_funnel_action: boolean
  is_active: boolean
}

interface UserAchievement {
  id: string
  achievement_id: string
  achievement: Achievement
  current_progress: number
  required_progress: number
  progress_percentage: number
  is_unlocked: boolean
  unlocked_at?: string
}

interface Challenge {
  id: string
  name_en: string
  name_vi: string
  description_en: string
  description_vi: string
  challenge_type: 'daily' | 'weekly' | 'monthly' | 'special'
  category: 'budgeting' | 'saving' | 'tracking' | 'house_goal'
  target_value?: number
  duration_days: number
  experience_points: number
  completion_badge?: string
  is_active: boolean
  start_date?: string
  end_date?: string
}

interface UserChallenge {
  id: string
  challenge_id: string
  challenge: Challenge
  started_at: string
  completed_at?: string
  current_progress: number
  target_progress: number
  is_completed: boolean
  is_abandoned: boolean
  progress_data: Record<string, any>
}

interface UserLevel {
  current_level: number
  total_experience: number
  experience_in_level: number
  experience_to_next_level: number
  current_login_streak: number
  longest_login_streak: number
  achievements_unlocked: number
}

interface GamificationCenterProps {
  userLevel: UserLevel
  achievements: UserAchievement[]
  challenges: UserChallenge[]
  availableChallenges: Challenge[]
  onStartChallenge?: (challengeId: string) => void
  onCompleteChallenge?: (challengeId: string) => void
  className?: string
}

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7250, 9250, // Levels 1-11
  11500, 14000, 16750, 19750, 23000, 26500, 30250, 34250, 38500, 43000, // Levels 12-21
  48000, 53500, 59500, 66000, 73000, 80500, 88500, 97000, 106000, 115500 // Levels 22-30
]

const ACHIEVEMENT_CATEGORIES = {
  'first_time': { label: 'Lần đầu', icon: Star, color: '#F59E0B' },
  'streak': { label: 'Liên tiếp', icon: Flame, color: '#EF4444' },
  'savings': { label: 'Tiết kiệm', icon: PiggyBank, color: '#10B981' },
  'budgeting': { label: 'Ngân sách', icon: Target, color: '#3B82F6' },
  'house_purchase': { label: 'Mua nhà', icon: Home, color: '#8B5CF6' },
}

const CHALLENGE_CATEGORIES = {
  'budgeting': { label: 'Ngân sách', icon: Target, color: '#3B82F6' },
  'saving': { label: 'Tiết kiệm', icon: PiggyBank, color: '#10B981' },
  'tracking': { label: 'Theo dõi', icon: CheckCircle, color: '#F59E0B' },
  'house_goal': { label: 'Mục tiêu nhà', icon: Home, color: '#8B5CF6' },
}

export function GamificationCenter({
  userLevel,
  achievements,
  challenges,
  availableChallenges,
  onStartChallenge,
  onCompleteChallenge,
  className
}: GamificationCenterProps) {
  const t = useTranslations('GamificationCenter')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getCurrentLevelInfo = () => {
    const currentLevelThreshold = LEVEL_THRESHOLDS[userLevel.current_level - 1] || 0
    const nextLevelThreshold = LEVEL_THRESHOLDS[userLevel.current_level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    
    return {
      current: currentLevelThreshold,
      next: nextLevelThreshold,
      progress: ((userLevel.total_experience - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100
    }
  }

  const levelInfo = getCurrentLevelInfo()

  // Filter achievements by category
  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.achievement.category === selectedCategory
  )

  // Group achievements
  const unlockedAchievements = filteredAchievements.filter(a => a.is_unlocked)
  const inProgressAchievements = filteredAchievements.filter(a => !a.is_unlocked && a.current_progress > 0)
  const lockedAchievements = filteredAchievements.filter(a => !a.is_unlocked && a.current_progress === 0)

  // Filter challenges
  const activeChallenges = challenges.filter(c => !c.is_completed && !c.is_abandoned)
  const completedChallenges = challenges.filter(c => c.is_completed)
  const todaysChallenges = availableChallenges.filter(c => c.challenge_type === 'daily' && c.is_active)
  const weeklyChallenges = availableChallenges.filter(c => c.challenge_type === 'weekly' && c.is_active)

  const handleStartChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('/api/expenses/challenges/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challenge_id: challengeId }),
      })

      if (!response.ok) {
        throw new Error('Failed to start challenge')
      }

      onStartChallenge?.(challengeId)
      toast.success(t('challengeStarted'))

    } catch (error) {
      console.error('Error starting challenge:', error)
      toast.error(t('errorStartingChallenge'))
    }
  }

  const getChallengeProgress = (userChallenge: UserChallenge) => {
    return (userChallenge.current_progress / userChallenge.target_progress) * 100
  }

  const getChallengeTimeRemaining = (userChallenge: UserChallenge) => {
    const endDate = new Date(userChallenge.started_at)
    endDate.setDate(endDate.getDate() + userChallenge.challenge.duration_days)
    
    const daysLeft = differenceInDays(endDate, new Date())
    
    if (daysLeft < 0) return t('overdue')
    if (daysLeft === 0) return t('today')
    if (daysLeft === 1) return t('oneDay')
    return t('daysLeft', { count: daysLeft })
  }

  const getLevelTitle = (level: number) => {
    if (level <= 5) return t('levelTitle.beginner')
    if (level <= 10) return t('levelTitle.tracker')
    if (level <= 15) return t('levelTitle.saver')
    if (level <= 20) return t('levelTitle.financialExpert')
    if (level <= 25) return t('levelTitle.investmentMaster')
    return t('levelTitle.financialLegend')
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Crown className="h-4 w-4 mr-1" />
            {t('level')} {userLevel.current_level}
          </Badge>
        </div>
      </div>

      {/* Level Progress Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                {t('level')} {userLevel.current_level} - {getLevelTitle(userLevel.current_level)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(userLevel.total_experience)} {t('experiencePoints')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {userLevel.experience_to_next_level > 0 ? userLevel.experience_to_next_level : t('max')}
              </div>
              <p className="text-xs text-muted-foreground">
                {userLevel.experience_to_next_level > 0 ? t('toNextLevel') : t('maxLevel')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('levelProgress')}</span>
              <span>{Math.round(levelInfo.progress)}%</span>
            </div>
            <Progress value={Math.min(levelInfo.progress, 100)} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-lg">{userLevel.current_login_streak}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('streakDays')}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-bold text-lg">{userLevel.achievements_unlocked}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('achievements')}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-bold text-lg">{activeChallenges.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('challenges')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="achievements">{t('achievements')}</TabsTrigger>
          <TabsTrigger value="challenges">{t('challenges')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t('activeChallengesTitle')} ({activeChallenges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeChallenges.slice(0, 4).map((userChallenge) => {
                    const categoryInfo = CHALLENGE_CATEGORIES[userChallenge.challenge.category as keyof typeof CHALLENGE_CATEGORIES]
                    const Icon = categoryInfo.icon
                    const progress = getChallengeProgress(userChallenge)
                    const timeLeft = getChallengeTimeRemaining(userChallenge)

                    return (
                      <div key={userChallenge.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" style={{ color: categoryInfo.color }} />
                            <h4 className="font-medium text-sm">{userChallenge.challenge.name_vi}</h4>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {timeLeft}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mb-3">
                          {userChallenge.challenge.description_vi}
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>{t('progress')}</span>
                            <span>{userChallenge.current_progress}/{userChallenge.target_progress}</span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">{Math.round(progress)}%</span>
                            <span className="text-primary font-medium">
                              +{userChallenge.challenge.experience_points} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Achievements */}
          {unlockedAchievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {t('recentAchievements')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {unlockedAchievements
                    .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
                    .slice(0, 6)
                    .map((achievement) => {
                      const categoryInfo = ACHIEVEMENT_CATEGORIES[achievement.achievement.category as keyof typeof ACHIEVEMENT_CATEGORIES]

                      return (
                        <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            "bg-gradient-to-br from-yellow-400 to-yellow-600"
                          )}>
                            <Trophy className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{achievement.achievement.name_vi}</h4>
                            <p className="text-xs text-muted-foreground">
                              +{achievement.achievement.experience_points} XP
                            </p>
                            {achievement.unlocked_at && (
                              <p className="text-xs text-green-600">
                                {t('unlocked')}: {format(new Date(achievement.unlocked_at), 'dd/MM/yyyy', { locale: vi })}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Start Challenges */}
          {todaysChallenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t('todayChallenges')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {todaysChallenges.slice(0, 4).map((challenge) => {
                    const categoryInfo = CHALLENGE_CATEGORIES[challenge.category as keyof typeof CHALLENGE_CATEGORIES]
                    const Icon = categoryInfo.icon
                    const isActive = activeChallenges.some(ac => ac.challenge_id === challenge.id)

                    return (
                      <div key={challenge.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" style={{ color: categoryInfo.color }} />
                            <h4 className="font-medium text-sm">{challenge.name_vi}</h4>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {t('today')}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mb-3">
                          {challenge.description_vi}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-primary font-medium">
                            +{challenge.experience_points} XP
                          </span>
                          <Button
                            size="sm"
                            variant={isActive ? "outline" : "default"}
                            onClick={() => !isActive && handleStartChallenge(challenge.id)}
                            disabled={isActive}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('inProgress')}
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                {t('start')}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              {t('all')} ({achievements.length})
            </Button>
            {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, info]) => {
              const count = achievements.filter(a => a.achievement.category === key).length
              const Icon = info.icon
              
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {info.label} ({count})
                </Button>
              )
            })}
          </div>

          {/* Achievements Grid */}
          <div className="space-y-6">
            {/* Unlocked */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {t('unlockedAchievements')} ({unlockedAchievements.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {unlockedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      status="unlocked"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* In Progress */}
            {inProgressAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  {t('inProgressAchievements')} ({inProgressAchievements.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      status="progress"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            {lockedAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gray-500" />
                  {t('lockedAchievements')} ({lockedAchievements.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lockedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      status="locked"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="space-y-6">
            {/* Active Challenges */}
            {activeChallenges.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  {t('activeChallengesTitle')} ({activeChallenges.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeChallenges.map((userChallenge) => (
                    <ChallengeCard
                      key={userChallenge.id}
                      userChallenge={userChallenge}
                      status="active"
                      onComplete={onCompleteChallenge}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available Daily Challenges */}
            {todaysChallenges.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  {t('dailyChallenges')}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {todaysChallenges.map((challenge) => (
                    <AvailableChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onStart={handleStartChallenge}
                      isActive={activeChallenges.some(ac => ac.challenge_id === challenge.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available Weekly Challenges */}
            {weeklyChallenges.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  {t('weeklyChallenges')}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {weeklyChallenges.map((challenge) => (
                    <AvailableChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onStart={handleStartChallenge}
                      isActive={activeChallenges.some(ac => ac.challenge_id === challenge.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {t('completedChallenges')} ({completedChallenges.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedChallenges.slice(0, 6).map((userChallenge) => (
                    <ChallengeCard
                      key={userChallenge.id}
                      userChallenge={userChallenge}
                      status="completed"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Achievement Card Component
function AchievementCard({ 
  achievement, 
  status 
}: { 
  achievement: UserAchievement
  status: 'unlocked' | 'progress' | 'locked' 
}) {
  const t = useTranslations('GamificationCenter')
  const categoryInfo = ACHIEVEMENT_CATEGORIES[achievement.achievement.category as keyof typeof ACHIEVEMENT_CATEGORIES]

  return (
    <Card className={cn(
      "relative transition-all duration-300",
      status === 'unlocked' && "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30",
      status === 'progress' && "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
      status === 'locked' && "border-gray-200 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
            status === 'unlocked' && "bg-gradient-to-br from-yellow-400 to-yellow-600",
            status === 'progress' && "bg-gradient-to-br from-blue-400 to-blue-600",
            status === 'locked' && "bg-gray-300 dark:bg-gray-700"
          )}>
            {status === 'locked' ? (
              <Lock className="h-5 w-5 text-gray-500" />
            ) : (
              <Trophy className="h-5 w-5 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-medium text-sm mb-1",
              status === 'locked' && "text-gray-500"
            )}>
              {achievement.achievement.name_vi}
            </h4>
            <p className={cn(
              "text-xs mb-2",
              status === 'locked' ? "text-gray-400" : "text-muted-foreground"
            )}>
              {achievement.achievement.description_vi}
            </p>

            {status === 'progress' && (
              <div className="space-y-1 mb-2">
                <div className="flex justify-between text-xs">
                  <span>{t('progress')}</span>
                  <span>{achievement.current_progress}/{achievement.required_progress}</span>
                </div>
                <Progress value={achievement.progress_percentage} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                <categoryInfo.icon className="h-3 w-3 mr-1" />
                {categoryInfo.label}
              </Badge>
              <span className={cn(
                "text-xs font-medium",
                status === 'locked' ? "text-gray-400" : "text-primary"
              )}>
                +{achievement.achievement.experience_points} XP
              </span>
            </div>

            {status === 'unlocked' && achievement.unlocked_at && (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {t('unlocked')}: {format(new Date(achievement.unlocked_at), 'dd/MM/yyyy', { locale: vi })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Challenge Card Component
function ChallengeCard({ 
  userChallenge, 
  status,
  onComplete 
}: { 
  userChallenge: UserChallenge
  status: 'active' | 'completed'
  onComplete?: (challengeId: string) => void
}) {
  const t = useTranslations('GamificationCenter')
  const categoryInfo = CHALLENGE_CATEGORIES[userChallenge.challenge.category as keyof typeof CHALLENGE_CATEGORIES]
  const Icon = categoryInfo.icon
  const progress = (userChallenge.current_progress / userChallenge.target_progress) * 100

  return (
    <Card className={cn(
      status === 'completed' && "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: categoryInfo.color }} />
            <h4 className="font-medium text-sm">{userChallenge.challenge.name_vi}</h4>
          </div>
          <Badge variant={status === 'completed' ? 'default' : 'outline'} className="text-xs">
            {status === 'completed' ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('completed')}
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                {t('inProgress')}
              </>
            )}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          {userChallenge.challenge.description_vi}
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>{t('progress')}</span>
            <span>{userChallenge.current_progress}/{userChallenge.target_progress}</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
            <span className="text-primary font-medium">
              +{userChallenge.challenge.experience_points} XP
            </span>
          </div>
        </div>

        {status === 'completed' && userChallenge.completed_at && (
          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {t('completed')}: {format(new Date(userChallenge.completed_at), 'dd/MM/yyyy', { locale: vi })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Available Challenge Card Component
function AvailableChallengeCard({ 
  challenge, 
  onStart,
  isActive 
}: { 
  challenge: Challenge
  onStart: (challengeId: string) => void
  isActive: boolean 
}) {
  const t = useTranslations('GamificationCenter')
  const categoryInfo = CHALLENGE_CATEGORIES[challenge.category as keyof typeof CHALLENGE_CATEGORIES]
  const Icon = categoryInfo.icon

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: categoryInfo.color }} />
            <h4 className="font-medium text-sm">{challenge.name_vi}</h4>
          </div>
          <Badge variant="outline" className="text-xs">
            {challenge.challenge_type === 'daily' ? t('daily') :
             challenge.challenge_type === 'weekly' ? t('weekly') :
             challenge.challenge_type === 'monthly' ? t('monthly') : t('special')}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          {challenge.description_vi}
        </p>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              {t('time')}: {challenge.duration_days} {t('days')}
            </div>
            <div className="text-xs text-primary font-medium">
              +{challenge.experience_points} XP
            </div>
          </div>
          
          <Button
            size="sm"
            variant={isActive ? "outline" : "default"}
            onClick={() => !isActive && onStart(challenge.id)}
            disabled={isActive}
          >
            {isActive ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('inProgress')}
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                {t('start')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}