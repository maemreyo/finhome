// Dashboard achievements page with locale support - UPDATED: 2024-01-18 - Integrated with real database

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  Star, 
  Award, 
  Medal, 
  Crown,
  Zap,
  CheckCircle,
  Home,
  BarChart3
} from 'lucide-react'
import { DashboardService } from '@/lib/services/dashboardService'

export default function AchievementsPage() {
  const t = useTranslations('Dashboard.Achievements')
  const { user, isAuthenticated } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [userAchievements, setUserAchievements] = useState<any[]>([])
  const [availableAchievements, setAvailableAchievements] = useState<any[]>([])
  const [userExperience, setUserExperience] = useState<any>(null)

  const categories = [
    { value: 'all', label: t('categories.all') },
    { value: 'planning', label: t('categories.planning') },
    { value: 'investment', label: t('categories.investment') },
    { value: 'savings', label: t('categories.savings') },
    { value: 'milestones', label: t('categories.milestones') },
  ]

  // Load achievements data
  useEffect(() => {
    const loadAchievementsData = async () => {
      try {
        setIsLoading(true)
        if (isAuthenticated && user) {
          const [userAchievementsData, availableAchievementsData, userExperienceData] = await Promise.all([
            DashboardService.getUserAchievements(user.id),
            DashboardService.getAvailableAchievements(),
            DashboardService.getUserExperience(user.id)
          ])
          
          setUserAchievements(userAchievementsData)
          setAvailableAchievements(availableAchievementsData)
          setUserExperience(userExperienceData)
        }
      } catch (error) {
        console.error('Error loading achievements data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAchievementsData()
  }, [isAuthenticated, user])

  const achievements = [
    {
      id: 1,
      title: t('achievements.newInvestor.title'),
      description: t('achievements.newInvestor.description'),
      icon: Home,
      category: 'planning',
      status: 'completed',
      completedAt: '2024-01-15',
      xp: 100,
      rarity: 'common'
    },
    {
      id: 2,
      title: t('achievements.strategist.title'),
      description: t('achievements.strategist.description'),
      icon: Target,
      category: 'planning',
      status: 'completed',
      completedAt: '2024-02-28',
      xp: 250,
      rarity: 'uncommon'
    },
    {
      id: 3,
      title: t('achievements.futureMillionaire.title'),
      description: t('achievements.futureMillionaire.description'),
      icon: Crown,
      category: 'savings',
      status: 'in_progress',
      progress: 75,
      target: 1000000000,
      current: 750000000,
      xp: 500,
      rarity: 'rare'
    },
    {
      id: 4,
      title: t('achievements.analysisExpert.title'),
      description: t('achievements.analysisExpert.description'),
      icon: BarChart3,
      category: 'investment',
      status: 'in_progress',
      progress: 60,
      target: 10,
      current: 6,
      xp: 300,
      rarity: 'uncommon'
    },
    {
      id: 5,
      title: t('achievements.investmentMaster.title'),
      description: t('achievements.investmentMaster.description'),
      icon: Trophy,
      category: 'investment',
      status: 'locked',
      progress: 0,
      target: 3,
      current: 0,
      xp: 1000,
      rarity: 'legendary'
    },
    {
      id: 6,
      title: t('achievements.persistent.title'),
      description: t('achievements.persistent.description'),
      icon: Zap,
      category: 'milestones',
      status: 'in_progress',
      progress: 80,
      target: 30,
      current: 24,
      xp: 200,
      rarity: 'common'
    }
  ]

  const rarityColors = {
    common: 'bg-gray-100 text-gray-800',
    uncommon: 'bg-green-100 text-green-800',
    rare: 'bg-blue-100 text-blue-800',
    epic: 'bg-purple-100 text-purple-800',
    legendary: 'bg-yellow-100 text-yellow-800'
  }

  const statusColors = {
    completed: 'text-green-600',
    in_progress: 'text-blue-600',
    locked: 'text-gray-400'
  }

  // Merge database achievements with available achievements
  const mergedAchievements = availableAchievements.map(achievement => {
    const userAchievement = userAchievements.find(ua => ua.achievements?.id === achievement.id)
    const isCompleted = !!userAchievement
    
    return {
      id: achievement.id,
      title: achievement.name,
      description: achievement.description,
      icon: achievement.category === 'planning' ? Home : 
            achievement.category === 'investment' ? BarChart3 :
            achievement.category === 'savings' ? Crown :
            achievement.category === 'milestones' ? Zap : Trophy,
      category: achievement.category,
      status: isCompleted ? 'completed' : 'locked',
      completedAt: userAchievement?.unlocked_at,
      progress: userAchievement?.progress_data?.progress || 0,
      xp: achievement.points,
      rarity: achievement.rarity || 'common'
    }
  })

  // Use mock data as fallback if no database data
  const displayAchievements = mergedAchievements.length > 0 ? mergedAchievements : achievements

  const filteredAchievements = selectedCategory === 'all' 
    ? displayAchievements 
    : displayAchievements.filter(a => a.category === selectedCategory)

  const completedCount = displayAchievements.filter(a => a.status === 'completed').length
  const totalXP = displayAchievements.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.xp, 0)

  return (
    <DashboardShell 
      title={t('title')} 
      description={t('description')}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thành Tích Đạt Được</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : completedCount}
              </div>
              <p className="text-xs text-muted-foreground">
                / {displayAchievements.length} tổng cộng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm Kinh Nghiệm</CardTitle>
              <Star className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : (userExperience?.total_experience || totalXP).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                XP tích lũy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cấp Độ Hiện Tại</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : `Level ${userExperience?.current_level || Math.floor(totalXP / 500) + 1}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {userExperience?.experience_to_next_level 
                  ? `Còn ${userExperience.experience_to_next_level} XP để lên cấp ${userExperience.current_level + 1}`
                  : 'Nhà đầu tư có kinh nghiệm'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <Card key={achievement.id} className={`relative ${achievement.status === 'locked' ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${achievement.status === 'completed' ? 'bg-green-100' : achievement.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <achievement.icon className={`h-4 w-4 ${statusColors[achievement.status as keyof typeof statusColors]}`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{achievement.title}</CardTitle>
                      <Badge variant="secondary" className={`text-xs ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                  {achievement.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                
                {achievement.status === 'in_progress' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Tiến độ</span>
                      <span>{(achievement as any).current || 0}/{(achievement as any).target || 0}</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                )}
                
                {achievement.status === 'completed' && (
                  <p className="text-xs text-green-600">
                    Hoàn thành vào {new Date(achievement.completedAt || '').toLocaleDateString('vi-VN')}
                  </p>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    +{achievement.xp} XP
                  </span>
                  {achievement.status === 'locked' && (
                    <span className="text-xs text-muted-foreground">
                      Chưa mở khóa
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tiến Độ Tổng Quan</CardTitle>
            <CardDescription>
              Xem tiến độ hoàn thành thành tích của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Hoàn thành thành tích</span>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{achievements.length} ({Math.round(completedCount / achievements.length * 100)}%)
                </span>
              </div>
              <Progress value={completedCount / achievements.length * 100} className="h-2" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {categories.slice(1).map((category) => {
                  const categoryAchievements = achievements.filter(a => a.category === category.value)
                  const categoryCompleted = categoryAchievements.filter(a => a.status === 'completed').length
                  const categoryProgress = categoryAchievements.length > 0 ? categoryCompleted / categoryAchievements.length * 100 : 0
                  
                  return (
                    <div key={category.value} className="text-center">
                      <p className="text-sm font-medium">{category.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryCompleted}/{categoryAchievements.length}
                      </p>
                      <Progress value={categoryProgress} className="h-1 mt-1" />
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}