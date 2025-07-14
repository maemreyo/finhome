// src/components/gamification/AchievementBadge.tsx
// Individual achievement badge component

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Achievement, getCategoryColor, formatPoints } from '@/lib/gamification/achievements'

interface AchievementBadgeProps {
  achievement: Achievement
  isUnlocked: boolean
  progress?: {
    current: number
    total: number
    percentage: number
  }
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  isUnlocked,
  progress,
  showProgress = true,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative border rounded-xl transition-all duration-200",
        sizeClasses[size],
        isUnlocked
          ? "bg-white dark:bg-gray-800 border-green-200 dark:border-green-800 shadow-md hover:shadow-lg"
          : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60",
        className
      )}
    >
      {/* Achievement Icon */}
      <div className="text-center mb-3">
        <div className={cn(
          "inline-flex items-center justify-center w-16 h-16 rounded-full mb-2",
          isUnlocked ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"
        )}>
          <span className={cn(iconSizes[size], "filter", !isUnlocked && "grayscale")}>
            {achievement.icon}
          </span>
        </div>
        
        {/* Unlocked indicator */}
        {isUnlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </div>

      {/* Achievement Details */}
      <div className="text-center space-y-2">
        <h3 className={cn(
          "font-semibold text-gray-900 dark:text-gray-100",
          titleSizes[size]
        )}>
          {achievement.title}
        </h3>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          {achievement.description}
        </p>

        {/* Category and Points */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge 
            variant="outline" 
            className={cn("text-xs", getCategoryColor(achievement.category))}
          >
            {achievement.category}
          </Badge>
          
          <Badge variant="secondary" className="text-xs">
            {formatPoints(achievement.points)} pts
          </Badge>
        </div>

        {/* Progress Bar */}
        {showProgress && progress && !isUnlocked && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>{progress.current}</span>
              <span>{progress.total}</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            <p className="text-xs text-gray-500">
              {progress.percentage}% complete
            </p>
          </div>
        )}

        {/* Unlocked date */}
        {isUnlocked && achievement.unlockedAt && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            Unlocked {achievement.unlockedAt.toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default AchievementBadge