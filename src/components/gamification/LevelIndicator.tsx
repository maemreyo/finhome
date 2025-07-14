// src/components/gamification/LevelIndicator.tsx
// Compact level indicator for header/navbar

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

import { 
  AchievementEngine, 
  UserProgress, 
  formatPoints 
} from '@/lib/gamification/achievements'

interface LevelIndicatorProps {
  userProgress: UserProgress
  compact?: boolean
  showPoints?: boolean
  className?: string
}

export const LevelIndicator: React.FC<LevelIndicatorProps> = ({
  userProgress,
  compact = false,
  showPoints = true,
  className
}) => {
  const achievementEngine = new AchievementEngine(userProgress)
  const currentLevel = achievementEngine.getCurrentLevel()
  const levelProgress = achievementEngine.getLevelProgress()

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200"
        >
          <span className="text-sm">{currentLevel.badge}</span>
          <span className="text-xs font-medium">Lv.{currentLevel.level}</span>
        </Badge>
        
        {showPoints && (
          <Badge variant="outline" className="text-xs">
            {formatPoints(userProgress.totalPoints)} pts
          </Badge>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm", className)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{currentLevel.badge}</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Level {currentLevel.level}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentLevel.title}
            </p>
          </div>
        </div>
        
        {showPoints && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-600">
              <Star className="w-4 h-4" />
              <span className="font-bold">{formatPoints(userProgress.totalPoints)}</span>
            </div>
            <p className="text-xs text-gray-500">Total Points</p>
          </div>
        )}
      </div>

      {/* Level Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Level Progress</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {levelProgress.percentage}%
          </span>
        </div>
        
        <Progress value={levelProgress.percentage} className="h-2" />
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{levelProgress.current} pts</span>
          <span>{levelProgress.total} pts</span>
        </div>
        
        {currentLevel.pointsToNext > 0 && (
          <p className="text-xs text-gray-500 text-center">
            {currentLevel.pointsToNext} points to next level
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default LevelIndicator