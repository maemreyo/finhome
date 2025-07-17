// src/lib/gamification/achievements.ts
// Achievement system for FinHome gamification

import { type FinancialPlanWithMetrics } from '@/lib/api/plans'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  badgeColor: string
  category: 'planning' | 'optimization' | 'investment' | 'milestone' | 'community'
  points: number
  requirement: {
    type: 'plan_created' | 'savings_amount' | 'roi_achieved' | 'early_payoff' | 'export_count' | 'plan_completion' | 'streak_days'
    value: number
    comparison?: 'gte' | 'lte' | 'eq'
  }
  isHidden?: boolean
  unlockedAt?: Date
}

export interface UserProgress {
  userId: string
  totalPoints: number
  level: number
  completedAchievements: string[]
  progressData: {
    plansCreated: number
    totalSavingsOptimized: number
    highestROI: number
    plansCompleted: number
    exportsGenerated: number
    streakDays: number
    lastActivityDate: Date
  }
}

// Achievement definitions based on the documentation
export const ACHIEVEMENTS: Achievement[] = [
  // Planning Category
  {
    id: 'first_plan',
    title: 'Người Lập Kế Hoạch Cẩn Trọng',
    description: 'Tạo kế hoạch tài chính đầu tiên của bạn',
    icon: '🎯',
    badgeColor: 'bg-blue-100 text-blue-800',
    category: 'planning',
    points: 100,
    requirement: {
      type: 'plan_created',
      value: 1,
      comparison: 'gte'
    }
  },
  {
    id: 'planning_expert',
    title: 'Chuyên Gia Lập Kế Hoạch',
    description: 'Tạo thành công 5 kế hoạch tài chính',
    icon: '📋',
    badgeColor: 'bg-green-100 text-green-800',
    category: 'planning',
    points: 300,
    requirement: {
      type: 'plan_created',
      value: 5,
      comparison: 'gte'
    }
  },
  {
    id: 'master_planner',
    title: 'Bậc Thầy Kế Hoạch',
    description: 'Tạo và quản lý 10 kế hoạch tài chính',
    icon: '🏆',
    badgeColor: 'bg-purple-100 text-purple-800',
    category: 'planning',
    points: 500,
    requirement: {
      type: 'plan_created',
      value: 10,
      comparison: 'gte'
    }
  },

  // Optimization Category
  {
    id: 'optimizer',
    title: 'Bậc Thầy Tối Ưu',
    description: 'Tiết kiệm được hơn 100 triệu VNĐ thông qua tối ưu hóa',
    icon: '🔬',
    badgeColor: 'bg-amber-100 text-amber-800',
    category: 'optimization',
    points: 750,
    requirement: {
      type: 'savings_amount',
      value: 100000000,
      comparison: 'gte'
    }
  },
  {
    id: 'mega_optimizer',
    title: 'Siêu Tối Ưu',
    description: 'Tiết kiệm được hơn 500 triệu VNĐ thông qua tối ưu hóa',
    icon: '💎',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    category: 'optimization',
    points: 1500,
    requirement: {
      type: 'savings_amount',
      value: 500000000,
      comparison: 'gte'
    }
  },

  // Investment Category
  {
    id: 'smart_investor',
    title: 'Nhà Đầu Tư Thông Thái',
    description: 'Đạt được ROI dương trong kế hoạch đầu tư',
    icon: '🏆',
    badgeColor: 'bg-green-100 text-green-800',
    category: 'investment',
    points: 400,
    requirement: {
      type: 'roi_achieved',
      value: 0,
      comparison: 'gte'
    }
  },
  {
    id: 'high_roi_master',
    title: 'Bậc Thầy ROI Cao',
    description: 'Đạt được ROI trên 15% trong kế hoạch đầu tư',
    icon: '📈',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    category: 'investment',
    points: 800,
    requirement: {
      type: 'roi_achieved',
      value: 15,
      comparison: 'gte'
    }
  },

  // Milestone Category
  {
    id: 'debt_destroyer',
    title: 'Kẻ Hủy Diệt Nợ',
    description: 'Mô phỏng trả nợ sớm dưới 5 năm',
    icon: '⚡',
    badgeColor: 'bg-red-100 text-red-800',
    category: 'milestone',
    points: 600,
    requirement: {
      type: 'early_payoff',
      value: 5,
      comparison: 'lte'
    }
  },
  {
    id: 'completion_champion',
    title: 'Nhà Vô Địch Hoàn Thành',
    description: 'Hoàn thành 3 kế hoạch tài chính',
    icon: '🎉',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    category: 'milestone',
    points: 900,
    requirement: {
      type: 'plan_completion',
      value: 3,
      comparison: 'gte'
    }
  },

  // Community Category
  {
    id: 'sharing_master',
    title: 'Bậc Thầy Chia Sẻ',
    description: 'Xuất 10 báo cáo tài chính để chia sẻ',
    icon: '📤',
    badgeColor: 'bg-cyan-100 text-cyan-800',
    category: 'community',
    points: 300,
    requirement: {
      type: 'export_count',
      value: 10,
      comparison: 'gte'
    }
  },
  {
    id: 'consistent_user',
    title: 'Người Dùng Nhất Quán',
    description: 'Sử dụng ứng dụng 30 ngày liên tục',
    icon: '🔥',
    badgeColor: 'bg-orange-100 text-orange-800',
    category: 'community',
    points: 500,
    requirement: {
      type: 'streak_days',
      value: 30,
      comparison: 'gte'
    }
  }
]

// Level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, points: 0, title: 'Người Mới Bắt Đầu', badge: '🌱' },
  { level: 2, points: 500, title: 'Học Viên', badge: '📚' },
  { level: 3, points: 1000, title: 'Người Lập Kế Hoạch', badge: '📊' },
  { level: 4, points: 2000, title: 'Chuyên Gia Tài Chính', badge: '💼' },
  { level: 5, points: 4000, title: 'Bậc Thầy Đầu Tư', badge: '🏆' },
  { level: 6, points: 7000, title: 'Guru Tài Chính', badge: '🎯' },
  { level: 7, points: 10000, title: 'Huyền Thoại', badge: '👑' }
]

export class AchievementEngine {
  private userProgress: UserProgress

  constructor(userProgress: UserProgress) {
    this.userProgress = userProgress
  }

  // Check if user has unlocked any new achievements
  checkAchievements(plans: FinancialPlanWithMetrics[]): Achievement[] {
    const newAchievements: Achievement[] = []
    
    // Update progress data based on current plans
    this.updateProgressData(plans)

    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      if (this.userProgress.completedAchievements.includes(achievement.id)) {
        continue // Already unlocked
      }

      if (this.isAchievementUnlocked(achievement)) {
        newAchievements.push(achievement)
        this.userProgress.completedAchievements.push(achievement.id)
        this.userProgress.totalPoints += achievement.points
      }
    }

    return newAchievements
  }

  private updateProgressData(plans: FinancialPlanWithMetrics[]): void {
    this.userProgress.progressData.plansCreated = plans.length
    this.userProgress.progressData.plansCompleted = plans.filter(p => p.status === 'completed').length
    
    // Calculate highest ROI
    const rois = plans.filter(p => (p.cached_calculations as any)?.roi).map(p => (p.cached_calculations as any).roi!)
    this.userProgress.progressData.highestROI = rois.length > 0 ? Math.max(...rois) : 0
    
    // This would be updated from actual user activity tracking
    // this.userProgress.progressData.exportsGenerated = ...
    // this.userProgress.progressData.totalSavingsOptimized = ...
    // this.userProgress.progressData.streakDays = ...
  }

  private isAchievementUnlocked(achievement: Achievement): boolean {
    const { requirement } = achievement
    const progressData = this.userProgress.progressData
    
    let currentValue: number
    
    switch (requirement.type) {
      case 'plan_created':
        currentValue = progressData.plansCreated
        break
      case 'savings_amount':
        currentValue = progressData.totalSavingsOptimized
        break
      case 'roi_achieved':
        currentValue = progressData.highestROI
        break
      case 'early_payoff':
        // This would need additional logic to calculate early payoff scenarios
        currentValue = 0 // Placeholder
        break
      case 'export_count':
        currentValue = progressData.exportsGenerated
        break
      case 'plan_completion':
        currentValue = progressData.plansCompleted
        break
      case 'streak_days':
        currentValue = progressData.streakDays
        break
      default:
        return false
    }

    const comparison = requirement.comparison || 'gte'
    
    switch (comparison) {
      case 'gte':
        return currentValue >= requirement.value
      case 'lte':
        return currentValue <= requirement.value
      case 'eq':
        return currentValue === requirement.value
      default:
        return false
    }
  }

  // Get current user level
  getCurrentLevel(): { level: number; title: string; badge: string; pointsToNext: number } {
    const currentPoints = this.userProgress.totalPoints
    let currentLevel = LEVEL_THRESHOLDS[0]
    let nextLevel = LEVEL_THRESHOLDS[1]

    for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
      if (currentPoints >= LEVEL_THRESHOLDS[i].points && currentPoints < LEVEL_THRESHOLDS[i + 1].points) {
        currentLevel = LEVEL_THRESHOLDS[i]
        nextLevel = LEVEL_THRESHOLDS[i + 1]
        break
      }
    }

    // If user has reached max level
    if (currentPoints >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].points) {
      currentLevel = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
      nextLevel = currentLevel // No next level
    }

    return {
      level: currentLevel.level,
      title: currentLevel.title,
      badge: currentLevel.badge,
      pointsToNext: nextLevel.points - currentPoints
    }
  }

  // Get progress towards next level
  getLevelProgress(): { current: number; total: number; percentage: number } {
    const currentLevel = this.getCurrentLevel()
    const currentPoints = this.userProgress.totalPoints
    
    // Find current level threshold
    const levelThreshold = LEVEL_THRESHOLDS.find(l => l.level === currentLevel.level)
    const nextLevelThreshold = LEVEL_THRESHOLDS.find(l => l.level === currentLevel.level + 1)
    
    if (!levelThreshold || !nextLevelThreshold) {
      return { current: 0, total: 1, percentage: 100 }
    }

    const pointsInCurrentLevel = currentPoints - levelThreshold.points
    const pointsNeededForNextLevel = nextLevelThreshold.points - levelThreshold.points
    
    return {
      current: pointsInCurrentLevel,
      total: pointsNeededForNextLevel,
      percentage: Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100)
    }
  }

  // Get achievements by category
  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.category === category)
  }

  // Get completed achievements
  getCompletedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(a => this.userProgress.completedAchievements.includes(a.id))
  }

  // Get available achievements (not completed)
  getAvailableAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(a => !this.userProgress.completedAchievements.includes(a.id) && !a.isHidden)
  }

  // Get achievement progress
  getAchievementProgress(achievementId: string): { current: number; total: number; percentage: number } {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) {
      return { current: 0, total: 1, percentage: 0 }
    }

    const requirement = achievement.requirement
    const progressData = this.userProgress.progressData
    
    let currentValue: number
    
    switch (requirement.type) {
      case 'plan_created':
        currentValue = progressData.plansCreated
        break
      case 'savings_amount':
        currentValue = progressData.totalSavingsOptimized
        break
      case 'roi_achieved':
        currentValue = progressData.highestROI
        break
      case 'export_count':
        currentValue = progressData.exportsGenerated
        break
      case 'plan_completion':
        currentValue = progressData.plansCompleted
        break
      case 'streak_days':
        currentValue = progressData.streakDays
        break
      default:
        currentValue = 0
    }

    const percentage = Math.min((currentValue / requirement.value) * 100, 100)
    
    return {
      current: currentValue,
      total: requirement.value,
      percentage: Math.round(percentage)
    }
  }
}

// Utility functions
export function formatPoints(points: number): string {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`
  }
  return points.toString()
}

export function getCategoryColor(category: Achievement['category']): string {
  const colors = {
    planning: 'text-blue-600',
    optimization: 'text-amber-600',
    investment: 'text-green-600',
    milestone: 'text-purple-600',
    community: 'text-cyan-600'
  }
  return colors[category] || 'text-gray-600'
}

export function getCategoryIcon(category: Achievement['category']): string {
  const icons = {
    planning: '📋',
    optimization: '⚡',
    investment: '💰',
    milestone: '🎯',
    community: '👥'
  }
  return icons[category] || '📊'
}