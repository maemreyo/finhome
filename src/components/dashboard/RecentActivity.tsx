// src/components/dashboard/RecentActivity.tsx
// Recent activity and notifications widget

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Home, 
  Calculator, 
  TrendingUp, 
  Star, 
  Award,
  Bell,
  Eye,
  Plus,
  ArrowRight
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'plan_created' | 'property_viewed' | 'achievement_unlocked' | 'rate_comparison' | 'goal_reached'
  title: string
  description: string
  timestamp: Date
  metadata?: {
    amount?: number
    propertyName?: string
    achievementName?: string
    planName?: string
  }
  isNew?: boolean
}

interface RecentActivityProps {
  userId?: string
  limit?: number
  className?: string
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  userId,
  limit = 5,
  className
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - in real app, this would fetch from API
  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'achievement_unlocked',
          title: 'Thành tích mới đạt được!',
          description: 'Bạn đã mở khóa "Nhà Đầu Tư Thông Minh"',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          metadata: {
            achievementName: 'Nhà Đầu Tư Thông Minh'
          },
          isNew: true
        },
        {
          id: '2',
          type: 'plan_created',
          title: 'Kế hoạch mới được tạo',
          description: 'Căn hộ Vinhomes Central Park',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          metadata: {
            planName: 'Căn hộ Vinhomes Central Park',
            amount: 3200000000
          }
        },
        {
          id: '3',
          type: 'rate_comparison',
          title: 'So sánh lãi suất hoàn thành',
          description: 'Tìm thấy gói vay ưu đãi từ BIDV với lãi suất 7.3%',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        },
        {
          id: '4',
          type: 'property_viewed',
          title: 'Bất động sản mới xem',
          description: 'Nhà phố Thảo Điền, Quận 2',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          metadata: {
            propertyName: 'Nhà phố Thảo Điền, Quận 2',
            amount: 5800000000
          }
        },
        {
          id: '5',
          type: 'goal_reached',
          title: 'Mục tiêu đạt được',
          description: 'Hoàn thành 75% mục tiêu tiết kiệm tháng này',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        }
      ]
      
      setActivities(mockActivities.slice(0, limit))
      setIsLoading(false)
    }

    loadActivities()
  }, [userId, limit])

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'plan_created':
        return <Calculator className="w-4 h-4" />
      case 'property_viewed':
        return <Home className="w-4 h-4" />
      case 'achievement_unlocked':
        return <Award className="w-4 h-4" />
      case 'rate_comparison':
        return <TrendingUp className="w-4 h-4" />
      case 'goal_reached':
        return <Star className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'plan_created':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
      case 'property_viewed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
      case 'achievement_unlocked':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
      case 'rate_comparison':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
      case 'goal_reached':
        return 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} giờ trước`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} ngày trước`
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Hoạt Động Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Hoạt Động Gần Đây
          </CardTitle>
          {activities.some(a => a.isNew) && (
            <Badge variant="destructive" className="text-xs">
              {activities.filter(a => a.isNew).length} mới
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
                activity.isNew && "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              )}
            >
              {/* Activity Icon */}
              <div className={cn(
                "p-2 rounded-full flex-shrink-0",
                getActivityColor(activity.type)
              )}>
                {getActivityIcon(activity.type)}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">
                      {activity.title}
                      {activity.isNew && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Mới
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    
                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="mt-2 text-xs">
                        {activity.metadata.amount && (
                          <Badge variant="outline" className="text-xs mr-2">
                            {formatCurrency(activity.metadata.amount)}
                          </Badge>
                        )}
                        {activity.metadata.achievementName && (
                          <Badge className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700 text-xs">
                            🏆 {activity.metadata.achievementName}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có hoạt động nào</h3>
              <p className="text-muted-foreground mb-4">
                Bắt đầu tạo kế hoạch tài chính để theo dõi hoạt động
              </p>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tạo Kế Hoạch Đầu Tiên
              </Button>
            </div>
          )}

          {activities.length > 0 && (
            <div className="pt-4 border-t">
              <Button variant="ghost" size="sm" className="w-full justify-center">
                Xem Tất Cả Hoạt Động
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentActivity