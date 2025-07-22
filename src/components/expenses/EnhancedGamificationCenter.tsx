// src/components/expenses/EnhancedGamificationCenter.tsx
// Enhanced gamification center with diverse challenges, animations, and improved UX

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'
import { 
  Trophy, 
  Target, 
  Calendar, 
  Zap, 
  Star, 
  Award,
  TrendingUp,
  Shield,
  Crown,
  Gift,
  Flame,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { GamificationService, Challenge, UserChallenge } from '@/lib/services/gamificationService'
import { cn } from '@/lib/utils'

interface EnhancedGamificationCenterProps {
  userId: string
  className?: string
}

const CHALLENGE_CATEGORY_ICONS = {
  saving: Flame,
  budgeting: Shield,
  tracking: Target,
  house_goal: Crown
} as const

const CHALLENGE_TYPE_ICONS = {
  daily: Calendar,
  weekly: TrendingUp,
  monthly: Trophy,
  special: Sparkles
} as const

const DIFFICULTY_COLORS = {
  easy: 'bg-green-500/20 text-green-700 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-700 border-red-500/30',
  expert: 'bg-purple-500/20 text-purple-700 border-purple-500/30'
}

export function EnhancedGamificationCenter({ userId, className }: EnhancedGamificationCenterProps) {
  const t = useTranslations('gamification')
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([])
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([])
  const [suggestedChallenges, setSuggestedChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const gamificationService = new GamificationService()

  useEffect(() => {
    loadChallengeData()
  }, [userId])

  const loadChallengeData = async () => {
    try {
      setLoading(true)
      const [available, active, suggested] = await Promise.all([
        gamificationService.getAvailableChallenges(),
        gamificationService.getUserChallenges(userId),
        gamificationService.getSuggestedChallenges(userId)
      ])
      
      setAvailableChallenges(available)
      setUserChallenges(active)
      setSuggestedChallenges(suggested)
    } catch (error) {
      console.error('Error loading challenge data:', error)
      toast({
        title: 'Lỗi tải dữ liệu',
        description: 'Không thể tải thông tin thử thách',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const startChallenge = async (challengeId: string) => {
    try {
      const newUserChallenge = await gamificationService.startChallenge(userId, challengeId)
      setUserChallenges(prev => [...prev, newUserChallenge])
      
      toast({
        title: 'Thử thách đã bắt đầu!',
        description: 'Chúc bạn may mắn với thử thách mới',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error starting challenge:', error)
      toast({
        title: 'Lỗi bắt đầu thử thách',
        description: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
        variant: 'destructive'
      })
    }
  }

  const getChallengeProgress = (userChallenge: UserChallenge) => {
    const progress = (userChallenge.current_progress / userChallenge.target_progress) * 100
    return Math.min(progress, 100)
  }

  const getDifficultyFromXP = (xp: number): keyof typeof DIFFICULTY_COLORS => {
    if (xp < 200) return 'easy'
    if (xp < 400) return 'medium'
    if (xp < 600) return 'hard'
    return 'expert'
  }

  const filteredChallenges = availableChallenges.filter(challenge => {
    const categoryMatch = selectedCategory === 'all' || challenge.category === selectedCategory
    const typeMatch = selectedType === 'all' || challenge.challenge_type === selectedType
    const notActive = !userChallenges.some(uc => uc.challenge_id === challenge.id && !uc.is_completed && !uc.is_abandoned)
    
    return categoryMatch && typeMatch && notActive
  })

  const completedChallenges = userChallenges.filter(uc => uc.is_completed)
  const activeChallenges = userChallenges.filter(uc => !uc.is_completed && !uc.is_abandoned)
  const totalXP = completedChallenges.reduce((sum, uc) => sum + uc.challenge.experience_points, 0)

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng XP</p>
                <p className="text-2xl font-bold text-yellow-700">{totalXP.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-700">{completedChallenges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang thực hiện</p>
                <p className="text-2xl font-bold text-blue-700">{activeChallenges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gợi ý</p>
                <p className="text-2xl font-bold text-purple-700">{suggestedChallenges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Đang thực hiện
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Có sẵn
          </TabsTrigger>
          <TabsTrigger value="suggested" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Gợi ý
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Hoàn thành
          </TabsTrigger>
        </TabsList>

        {/* Active Challenges Tab */}
        <TabsContent value="active" className="space-y-4">
          <AnimatePresence>
            {activeChallenges.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có thử thách nào đang thực hiện</h3>
                <p className="text-gray-500">Hãy bắt đầu một thử thách mới để cải thiện thói quen tài chính!</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeChallenges.map((userChallenge, index) => {
                  const challenge = userChallenge.challenge
                  const CategoryIcon = CHALLENGE_CATEGORY_ICONS[challenge.category]
                  const TypeIcon = CHALLENGE_TYPE_ICONS[challenge.challenge_type]
                  const progress = getChallengeProgress(userChallenge)
                  const difficulty = getDifficultyFromXP(challenge.experience_points)
                  
                  return (
                    <motion.div
                      key={userChallenge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent" />
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-500/10 rounded-lg">
                                <CategoryIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-base font-semibold">{challenge.name_vi}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <TypeIcon className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-500 capitalize">{challenge.challenge_type}</span>
                                  <Badge className={cn("text-xs", DIFFICULTY_COLORS[difficulty])}>
                                    {challenge.experience_points} XP
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardDescription className="text-sm text-gray-600">
                            {challenge.description_vi}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span>Tiến độ</span>
                                <span className="font-medium">
                                  {userChallenge.current_progress}/{userChallenge.target_progress}
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                            
                            {userChallenge.progress_data.current_streak && (
                              <motion.div 
                                className="flex items-center gap-2 text-sm"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Flame className="h-4 w-4 text-orange-500" />
                                <span>Chuỗi hiện tại: <strong>{userChallenge.progress_data.current_streak} ngày</strong></span>
                              </motion.div>
                            )}
                            
                            <div className="text-xs text-gray-500">
                              Bắt đầu: {new Date(userChallenge.started_at).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Available Challenges Tab */}
        <TabsContent value="available" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Danh mục:</span>
              <div className="flex gap-1">
                <Button 
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Tất cả
                </Button>
                {Object.keys(CHALLENGE_CATEGORY_ICONS).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category === 'saving' ? 'Tiết kiệm' :
                     category === 'budgeting' ? 'Ngân sách' :
                     category === 'tracking' ? 'Theo dõi' : 'Mục tiêu nhà'}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Loại:</span>
              <div className="flex gap-1">
                <Button 
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('all')}
                >
                  Tất cả
                </Button>
                {Object.keys(CHALLENGE_TYPE_ICONS).map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="capitalize"
                  >
                    {type === 'daily' ? 'Hàng ngày' :
                     type === 'weekly' ? 'Hàng tuần' :
                     type === 'monthly' ? 'Hàng tháng' : 'Đặc biệt'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Challenge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredChallenges.map((challenge, index) => {
                const CategoryIcon = CHALLENGE_CATEGORY_ICONS[challenge.category]
                const TypeIcon = CHALLENGE_TYPE_ICONS[challenge.challenge_type]
                const difficulty = getDifficultyFromXP(challenge.experience_points)
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/10 to-transparent" />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                              <CategoryIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-semibold group-hover:text-indigo-700 transition-colors">
                                {challenge.name_vi}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <TypeIcon className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-500 capitalize">{challenge.challenge_type}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={cn("text-xs", DIFFICULTY_COLORS[difficulty])}>
                            {challenge.experience_points} XP
                          </Badge>
                        </div>
                        <CardDescription className="text-sm text-gray-600 line-clamp-2">
                          {challenge.description_vi}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Thời gian: {challenge.duration_days} ngày</span>
                            <span>Mục tiêu: {challenge.target_value || challenge.duration_days}</span>
                          </div>
                          
                          <Button 
                            className="w-full group-hover:bg-indigo-600 transition-colors"
                            onClick={() => startChallenge(challenge.id)}
                          >
                            Bắt đầu thử thách
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Suggested Challenges Tab */}
        <TabsContent value="suggested" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Gợi ý cho bạn</h3>
            <p className="text-sm text-gray-600">
              Dựa trên thói quen chi tiêu của bạn, đây là những thử thách phù hợp nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {suggestedChallenges.map((challenge, index) => {
                const CategoryIcon = CHALLENGE_CATEGORY_ICONS[challenge.category]
                const difficulty = getDifficultyFromXP(challenge.experience_points)
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-400/20 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-500 text-white text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Gợi ý
                        </Badge>
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <CategoryIcon className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base font-semibold">{challenge.name_vi}</CardTitle>
                            <Badge className={cn("text-xs mt-1", DIFFICULTY_COLORS[difficulty])}>
                              {challenge.experience_points} XP
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="text-sm text-gray-700">
                          {challenge.description_vi}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button 
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                          onClick={() => startChallenge(challenge.id)}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Thử ngay
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Completed Challenges Tab */}
        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa hoàn thành thử thách nào</h3>
              <p className="text-gray-500">Hãy bắt đầu một thử thách để nhận phần thưởng XP!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedChallenges.map((userChallenge, index) => {
                const challenge = userChallenge.challenge
                const CategoryIcon = CHALLENGE_CATEGORY_ICONS[challenge.category]
                
                return (
                  <motion.div
                    key={userChallenge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-400/20 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-white text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Hoàn thành
                        </Badge>
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <CategoryIcon className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold text-green-800">
                              {challenge.name_vi}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-green-600 text-white text-xs">
                                +{challenge.experience_points} XP
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-sm text-green-700">
                          {challenge.description_vi}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-xs text-green-600">
                          Hoàn thành: {userChallenge.completed_at ? 
                            new Date(userChallenge.completed_at).toLocaleDateString('vi-VN') : 
                            'Không rõ'
                          }
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}