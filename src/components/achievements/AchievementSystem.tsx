// src/components/achievements/AchievementSystem.tsx
// Achievement and gamification system for user engagement

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Award, 
  Star, 
  Target, 
  TrendingUp, 
  Home, 
  Calculator, 
  Users, 
  Clock,
  Gift,
  Crown,
  Zap,
  Trophy,
  Medal,
  Shield,
  Diamond
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

interface Achievement {
  id: string
  name: string
  description: string
  category: 'investment' | 'planning' | 'savings' | 'learning' | 'social' | 'milestone'
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  points: number
  isUnlocked: boolean
  unlockedAt?: Date
  progress?: {
    current: number
    target: number
  }
  icon: React.ComponentType<any>
  requirements: string[]
  rewards?: {
    title: string
    description: string
    type: 'feature' | 'discount' | 'badge' | 'title'
  }[]
}

interface UserStats {
  totalPoints: number
  level: number
  experiencePoints: number
  experienceToNextLevel: number
  achievementsUnlocked: number
  totalAchievements: number
  currentStreak: number
  longestStreak: number
  rank: string
  joinedDate: Date
}

interface AchievementSystemProps {
  userId?: string
  className?: string
  compact?: boolean
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  userId,
  className,
  compact = false
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all')

  // Mock data - in real app, this would fetch from API
  useEffect(() => {
    const loadAchievements = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'Bước Đầu Tiên',
          description: 'Tạo kế hoạch tài chính đầu tiên',
          category: 'planning',
          difficulty: 'bronze',
          points: 100,
          isUnlocked: true,
          unlockedAt: new Date('2024-01-15'),
          icon: Target,
          requirements: ['Tạo 1 kế hoạch tài chính'],
          rewards: [
            {
              title: 'Mở khóa tính năng nâng cao',
              description: 'Truy cập phân tích chi tiết cho kế hoạch',
              type: 'feature'
            }
          ]
        },
        {
          id: '2',
          name: 'Nhà Đầu Tư Thông Minh',
          description: 'Hoàn thành 3 khoản đầu tư thành công',
          category: 'investment',
          difficulty: 'silver',
          points: 300,
          isUnlocked: true,
          unlockedAt: new Date('2024-02-01'),
          icon: TrendingUp,
          requirements: [
            'Hoàn thành 3 khoản đầu tư',
            'ROI trung bình trên 8%',
            'Không có khoản đầu tư thua lỗ'
          ],
          rewards: [
            {
              title: 'Danh hiệu "Nhà Đầu Tư Thông Minh"',
              description: 'Hiển thị trên hồ sơ của bạn',
              type: 'title'
            }
          ]
        },
        {
          id: '3',
          name: 'Chuyên Gia Phân Tích',
          description: 'So sánh lãi suất từ 10 ngân hàng khác nhau',
          category: 'learning',
          difficulty: 'bronze',
          points: 150,
          isUnlocked: true,
          unlockedAt: new Date('2024-01-28'),
          icon: Calculator,
          requirements: ['So sánh lãi suất từ 10 ngân hàng'],
          rewards: [
            {
              title: 'Giảm giá 20% phí tư vấn',
              description: 'Áp dụng cho dịch vụ tư vấn tài chính',
              type: 'discount'
            }
          ]
        },
        {
          id: '4',
          name: 'Triệu Phú Đầu Tiên',
          description: 'Đạt tổng giá trị tài sản 1 tỷ VND',
          category: 'milestone',
          difficulty: 'gold',
          points: 500,
          isUnlocked: false,
          progress: {
            current: 850000000,
            target: 1000000000
          },
          icon: Crown,
          requirements: [
            'Tổng giá trị tài sản đạt 1 tỷ VND',
            'Bao gồm ít nhất 2 loại tài sản khác nhau'
          ],
          rewards: [
            {
              title: 'Truy cập Portfolio Premium',
              description: 'Phân tích chuyên sâu và báo cáo tùy chỉnh',
              type: 'feature'
            }
          ]
        },
        {
          id: '5',
          name: 'Guru Tiết Kiệm',
          description: 'Duy trì thói quen tiết kiệm 100 ngày liên tục',
          category: 'savings',
          difficulty: 'silver',
          points: 400,
          isUnlocked: false,
          progress: {
            current: 67,
            target: 100
          },
          icon: Star,
          requirements: [
            'Tiết kiệm hàng ngày trong 100 ngày',
            'Không bỏ lỡ quá 3 ngày',
            'Đạt mục tiêu tiết kiệm hàng tháng'
          ]
        },
        {
          id: '6',
          name: 'Vua Bất Động Sản',
          description: 'Sở hữu 5 bất động sản có lợi nhuận',
          category: 'investment',
          difficulty: 'platinum',
          points: 1000,
          isUnlocked: false,
          progress: {
            current: 2,
            target: 5
          },
          icon: Home,
          requirements: [
            'Sở hữu 5 bất động sản',
            'Tất cả đều có lợi nhuận dương',
            'ROI trung bình trên 10%'
          ],
          rewards: [
            {
              title: 'Danh hiệu "Vua Bất Động Sản"',
              description: 'Danh hiệu đặc biệt với hiệu ứng vàng',
              type: 'title'
            },
            {
              title: 'Tư vấn VIP miễn phí',
              description: 'Buổi tư vấn 1-1 với chuyên gia',
              type: 'feature'
            }
          ]
        },
        {
          id: '7',
          name: 'Cộng Đồng Thân Thiện',
          description: 'Chia sẻ kế hoạch và nhận 50 lượt thích',
          category: 'social',
          difficulty: 'bronze',
          points: 200,
          isUnlocked: false,
          progress: {
            current: 23,
            target: 50
          },
          icon: Users,
          requirements: [
            'Chia sẻ ít nhất 3 kế hoạch công khai',
            'Nhận tổng cộng 50 lượt thích',
            'Tương tác với 10 người dùng khác'
          ]
        },
        {
          id: '8',
          name: 'Tốc Độ Ánh Sáng',
          description: 'Hoàn thành đánh giá tài chính trong 5 phút',
          category: 'planning',
          difficulty: 'bronze',
          points: 100,
          isUnlocked: false,
          icon: Zap,
          requirements: ['Hoàn thành đánh giá tài chính dưới 5 phút']
        }
      ]

      const mockUserStats: UserStats = {
        totalPoints: 950,
        level: 8,
        experiencePoints: 2750,
        experienceToNextLevel: 1250,
        achievementsUnlocked: 3,
        totalAchievements: 8,
        currentStreak: 15,
        longestStreak: 45,
        rank: 'Nhà Đầu Tư Thông Minh',
        joinedDate: new Date('2024-01-10')
      }
      
      setAchievements(mockAchievements)
      setUserStats(mockUserStats)
      setIsLoading(false)
    }

    loadAchievements()
  }, [userId])

  const getDifficultyColor = (difficulty: Achievement['difficulty']) => {
    switch (difficulty) {
      case 'bronze':
        return 'text-orange-600 bg-orange-100'
      case 'silver':
        return 'text-gray-600 bg-gray-100'
      case 'gold':
        return 'text-yellow-600 bg-yellow-100'
      case 'platinum':
        return 'text-purple-600 bg-purple-100'
      case 'diamond':
        return 'text-blue-600 bg-blue-100'
    }
  }

  const getDifficultyIcon = (difficulty: Achievement['difficulty']) => {
    switch (difficulty) {
      case 'bronze':
        return Medal
      case 'silver':
        return Award
      case 'gold':
        return Trophy
      case 'platinum':
        return Crown
      case 'diamond':
        return Diamond
    }
  }

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'investment':
        return TrendingUp
      case 'planning':
        return Target
      case 'savings':
        return Star
      case 'learning':
        return Calculator
      case 'social':
        return Users
      case 'milestone':
        return Crown
    }
  }

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  )

  const unlockedAchievements = filteredAchievements.filter(a => a.isUnlocked)
  const lockedAchievements = filteredAchievements.filter(a => !a.isUnlocked)

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (compact && userStats) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold">Cấp độ {userStats.level}</div>
                <div className="text-sm text-gray-600">{userStats.totalPoints} điểm</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Thành tích</div>
              <div className="font-semibold">{userStats.achievementsUnlocked}/{userStats.totalAchievements}</div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Kinh nghiệm</span>
              <span>{userStats.experiencePoints}/{userStats.experiencePoints + userStats.experienceToNextLevel}</span>
            </div>
            <Progress 
              value={(userStats.experiencePoints / (userStats.experiencePoints + userStats.experienceToNextLevel)) * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* User Stats Overview */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Cấp độ</p>
                  <p className="text-2xl font-bold text-purple-900">{userStats.level}</p>
                  <div className="text-xs text-purple-700">{userStats.rank}</div>
                </div>
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng điểm</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.totalPoints.toLocaleString()}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Thành tích</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats.achievementsUnlocked}/{userStats.totalAchievements}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chuỗi ngày</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.currentStreak}</p>
                  <div className="text-xs text-gray-500">Cao nhất: {userStats.longestStreak}</div>
                </div>
                <Zap className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Experience Progress */}
      {userStats && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Tiến độ cấp độ</div>
              <div className="text-sm text-gray-600">
                {userStats.experiencePoints}/{userStats.experiencePoints + userStats.experienceToNextLevel} EXP
              </div>
            </div>
            <Progress 
              value={(userStats.experiencePoints / (userStats.experiencePoints + userStats.experienceToNextLevel)) * 100} 
              className="h-3" 
            />
            <div className="text-sm text-gray-600 mt-1">
              Còn {userStats.experienceToNextLevel} EXP để đạt cấp độ {userStats.level + 1}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Categories */}
      <Tabs value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="investment">Đầu tư</TabsTrigger>
          <TabsTrigger value="planning">Kế hoạch</TabsTrigger>
          <TabsTrigger value="savings">Tiết kiệm</TabsTrigger>
          <TabsTrigger value="learning">Học tập</TabsTrigger>
          <TabsTrigger value="social">Cộng đồng</TabsTrigger>
          <TabsTrigger value="milestone">Cột mốc</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Đã mở khóa ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement, index) => {
                  const IconComponent = achievement.icon
                  const DifficultyIcon = getDifficultyIcon(achievement.difficulty)

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="p-3 bg-green-200 rounded-lg">
                              <IconComponent className="w-6 h-6 text-green-700" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getDifficultyColor(achievement.difficulty)}>
                                <DifficultyIcon className="w-3 h-3 mr-1" />
                                {achievement.difficulty}
                              </Badge>
                              <Badge variant="secondary">+{achievement.points}</Badge>
                            </div>
                          </div>
                          
                          <h4 className="font-semibold text-green-900 mb-2">{achievement.name}</h4>
                          <p className="text-sm text-green-700 mb-3">{achievement.description}</p>
                          
                          {achievement.unlockedAt && (
                            <div className="text-xs text-green-600">
                              Mở khóa: {achievement.unlockedAt.toLocaleDateString('vi-VN')}
                            </div>
                          )}

                          {achievement.rewards && achievement.rewards.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <div className="text-xs font-medium text-green-800 mb-1">Phần thưởng:</div>
                              {achievement.rewards.map((reward, idx) => (
                                <div key={idx} className="text-xs text-green-700">
                                  • {reward.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600" />
                Chưa mở khóa ({lockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement, index) => {
                  const IconComponent = achievement.icon
                  const DifficultyIcon = getDifficultyIcon(achievement.difficulty)
                  const progressPercentage = achievement.progress 
                    ? (achievement.progress.current / achievement.progress.target) * 100
                    : 0

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="opacity-75 hover:opacity-100 transition-opacity">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="p-3 bg-gray-100 rounded-lg">
                              <IconComponent className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getDifficultyColor(achievement.difficulty)}>
                                <DifficultyIcon className="w-3 h-3 mr-1" />
                                {achievement.difficulty}
                              </Badge>
                              <Badge variant="outline">+{achievement.points}</Badge>
                            </div>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-2">{achievement.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                          
                          {achievement.progress && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Tiến độ</span>
                                <span>{achievement.progress.current}/{achievement.progress.target}</span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            <div className="font-medium mb-1">Yêu cầu:</div>
                            {achievement.requirements.map((req, idx) => (
                              <div key={idx}>• {req}</div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có thành tích nào</h3>
              <p className="text-gray-500">Danh mục này chưa có thành tích nào</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AchievementSystem