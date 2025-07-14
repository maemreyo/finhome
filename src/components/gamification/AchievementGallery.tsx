// src/components/gamification/AchievementGallery.tsx
// Achievement gallery and progress tracking component

'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Star, Target, Users, Zap, TrendingUp, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { 
  Achievement, 
  AchievementEngine, 
  UserProgress, 
  ACHIEVEMENTS,
  getCategoryColor,
  getCategoryIcon,
  formatPoints
} from '@/lib/gamification/achievements'
import { AchievementBadge } from './AchievementBadge'
import { FinancialPlan } from '@/components/financial-plans/PlansList'

interface AchievementGalleryProps {
  userProgress: UserProgress
  plans: FinancialPlan[]
  onAchievementUnlock?: (achievement: Achievement) => void
  className?: string
}

export const AchievementGallery: React.FC<AchievementGalleryProps> = ({
  userProgress,
  plans,
  onAchievementUnlock,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all')

  const achievementEngine = useMemo(() => {
    return new AchievementEngine(userProgress)
  }, [userProgress])

  const currentLevel = achievementEngine.getCurrentLevel()
  const levelProgress = achievementEngine.getLevelProgress()
  const completedAchievements = achievementEngine.getCompletedAchievements()
  const availableAchievements = achievementEngine.getAvailableAchievements()

  // Filter achievements based on search and category
  const filteredAchievements = useMemo(() => {
    let filtered = ACHIEVEMENTS

    if (searchQuery) {
      filtered = filtered.filter(achievement => 
        achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(achievement => achievement.category === selectedCategory)
    }

    return filtered
  }, [searchQuery, selectedCategory])

  // Group achievements by completion status
  const { completed, inProgress, locked } = useMemo(() => {
    const completed = filteredAchievements.filter(a => 
      userProgress.completedAchievements.includes(a.id)
    )
    
    const remaining = filteredAchievements.filter(a => 
      !userProgress.completedAchievements.includes(a.id)
    )
    
    const inProgress = remaining.filter(a => {
      const progress = achievementEngine.getAchievementProgress(a.id)
      return progress.percentage > 0 && progress.percentage < 100
    })
    
    const locked = remaining.filter(a => {
      const progress = achievementEngine.getAchievementProgress(a.id)
      return progress.percentage === 0
    })

    return { completed, inProgress, locked }
  }, [filteredAchievements, userProgress.completedAchievements, achievementEngine])

  // Category statistics
  const categoryStats = useMemo(() => {
    const categories: Achievement['category'][] = ['planning', 'optimization', 'investment', 'milestone', 'community']
    
    return categories.map(category => {
      const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category)
      const completedCount = categoryAchievements.filter(a => 
        userProgress.completedAchievements.includes(a.id)
      ).length
      
      return {
        category,
        icon: getCategoryIcon(category),
        color: getCategoryColor(category),
        completed: completedCount,
        total: categoryAchievements.length,
        percentage: Math.round((completedCount / categoryAchievements.length) * 100)
      }
    })
  }, [userProgress.completedAchievements])

  const handleCategoryFilter = (category: Achievement['category'] | 'all') => {
    setSelectedCategory(category)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* User Level and Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Level */}
            <div className="text-center">
              <div className="text-4xl mb-2">{currentLevel.badge}</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Level {currentLevel.level}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentLevel.title}
              </p>
            </div>

            {/* Points and Level Progress */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPoints(userProgress.totalPoints)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Points
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level Progress</span>
                  <span>{levelProgress.percentage}%</span>
                </div>
                <Progress value={levelProgress.percentage} className="h-2" />
                <p className="text-xs text-gray-500 text-center">
                  {currentLevel.pointsToNext > 0 
                    ? `${currentLevel.pointsToNext} points to next level`
                    : 'Max level reached!'
                  }
                </p>
              </div>
            </div>

            {/* Achievement Summary */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedAchievements.length}/{ACHIEVEMENTS.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Achievements Unlocked
              </p>
              <div className="mt-2">
                <Progress 
                  value={(completedAchievements.length / ACHIEVEMENTS.length) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {categoryStats.map((stat) => (
              <motion.div
                key={stat.category}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  selectedCategory === stat.category
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                )}
                onClick={() => handleCategoryFilter(stat.category)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <h4 className="font-medium text-sm capitalize mb-1">
                    {stat.category}
                  </h4>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {stat.completed}/{stat.total}
                  </div>
                  <Progress value={stat.percentage} className="h-1 mt-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => handleCategoryFilter('all')}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          All Categories
        </Button>
      </div>

      {/* Achievement Gallery */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredAchievements.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({locked.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <AchievementGrid 
            achievements={filteredAchievements}
            userProgress={userProgress}
            achievementEngine={achievementEngine}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <AchievementGrid 
            achievements={completed}
            userProgress={userProgress}
            achievementEngine={achievementEngine}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <AchievementGrid 
            achievements={inProgress}
            userProgress={userProgress}
            achievementEngine={achievementEngine}
            showProgress={true}
          />
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          <AchievementGrid 
            achievements={locked}
            userProgress={userProgress}
            achievementEngine={achievementEngine}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Achievement Grid Component
const AchievementGrid: React.FC<{
  achievements: Achievement[]
  userProgress: UserProgress
  achievementEngine: AchievementEngine
  showProgress?: boolean
}> = ({ achievements, userProgress, achievementEngine, showProgress = false }) => {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          No achievements found matching your criteria
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {achievements.map((achievement) => {
          const isUnlocked = userProgress.completedAchievements.includes(achievement.id)
          const progress = achievementEngine.getAchievementProgress(achievement.id)
          
          return (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AchievementBadge
                achievement={achievement}
                isUnlocked={isUnlocked}
                progress={progress}
                showProgress={showProgress}
                size="md"
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default AchievementGallery