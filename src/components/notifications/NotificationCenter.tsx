// src/components/notifications/NotificationCenter.tsx
// Notification system for achievements, updates, and important alerts

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  X,
  Settings,
  Check,
  Filter,
  Star,
  Target,
  DollarSign,
  Calendar,
  Home
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

interface Notification {
  id: string
  type: 'achievement' | 'market_update' | 'payment_reminder' | 'goal_progress' | 'property_alert' | 'system_update'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
  actionLabel?: string
  metadata?: {
    amount?: number
    propertyName?: string
    achievementName?: string
    progressPercentage?: number
  }
}

interface NotificationCenterProps {
  userId?: string
  className?: string
  trigger?: React.ReactNode
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  className,
  trigger
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'achievement' | 'market' | 'reminder'>('all')
  const [isOpen, setIsOpen] = useState(false)

  // Type-safe filter handler
  const handleFilterChange = (value: string) => {
    if (['all', 'unread', 'achievement', 'market', 'reminder'].includes(value)) {
      setFilter(value as 'all' | 'unread' | 'achievement' | 'market' | 'reminder')
    }
  }

  // Mock data - in real app, this would fetch from API
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'achievement',
          title: 'Thành tích mới đạt được! 🏆',
          message: 'Bạn đã mở khóa thành tích "Nhà Đầu Tư Thông Minh" với 3 khoản đầu tư thành công',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          isRead: false,
          priority: 'medium',
          actionUrl: '/achievements',
          actionLabel: 'Xem thành tích',
          metadata: {
            achievementName: 'Nhà Đầu Tư Thông Minh'
          }
        },
        {
          id: '2',
          type: 'market_update',
          title: 'Cập nhật thị trường',
          message: 'Lãi suất vay mua nhà tại BIDV giảm 0.2% xuống còn 7.3%/năm',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isRead: false,
          priority: 'high',
          actionUrl: '/banks',
          actionLabel: 'So sánh lãi suất'
        },
        {
          id: '3',
          type: 'payment_reminder',
          title: 'Nhắc nhở thanh toán',
          message: 'Khoản vay căn hộ Vinhomes Central Park có kỳ thanh toán vào ngày 15/12',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          isRead: true,
          priority: 'high',
          actionUrl: '/plans',
          actionLabel: 'Xem kế hoạch',
          metadata: {
            amount: 15200000,
            propertyName: 'Căn hộ Vinhomes Central Park'
          }
        },
        {
          id: '4',
          type: 'goal_progress',
          title: 'Tiến độ mục tiêu',
          message: 'Bạn đã hoàn thành 75% mục tiêu tiết kiệm tháng này! Còn 150M để đạt mục tiêu',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          isRead: true,
          priority: 'medium',
          actionUrl: '/goals',
          actionLabel: 'Xem mục tiêu',
          metadata: {
            progressPercentage: 75,
            amount: 150000000
          }
        },
        {
          id: '5',
          type: 'property_alert',
          title: 'Bất động sản quan tâm',
          message: 'Giá căn hộ tại Thảo Điền đã tăng 3.2% trong tháng qua',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          isRead: true,
          priority: 'low',
          actionUrl: '/properties',
          actionLabel: 'Xem bất động sản',
          metadata: {
            propertyName: 'Thảo Điền, Quận 2'
          }
        },
        {
          id: '6',
          type: 'system_update',
          title: 'Cập nhật hệ thống',
          message: 'FinHome vừa ra mắt tính năng phân tích ROI chi tiết cho danh mục đầu tư',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          isRead: false,
          priority: 'low',
          actionUrl: '/investments',
          actionLabel: 'Khám phá tính năng'
        }
      ]
      
      setNotifications(mockNotifications)
      setIsLoading(false)
    }

    loadNotifications()
  }, [userId])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-5 h-5" />
      case 'market_update':
        return <TrendingUp className="w-5 h-5" />
      case 'payment_reminder':
        return <Calendar className="w-5 h-5" />
      case 'goal_progress':
        return <Target className="w-5 h-5" />
      case 'property_alert':
        return <Home className="w-5 h-5" />
      case 'system_update':
        return <Info className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') {
      return 'bg-red-100 text-red-600 border-red-200'
    }
    
    switch (type) {
      case 'achievement':
        return 'bg-purple-100 text-purple-600 border-purple-200'
      case 'market_update':
        return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'payment_reminder':
        return 'bg-orange-100 text-orange-600 border-orange-200'
      case 'goal_progress':
        return 'bg-green-100 text-green-600 border-green-200'
      case 'property_alert':
        return 'bg-indigo-100 text-indigo-600 border-indigo-200'
      case 'system_update':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Quan trọng</Badge>
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Trung bình</Badge>
      case 'low':
        return <Badge variant="outline" className="text-xs">Thấp</Badge>
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

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead
      case 'achievement':
        return notification.type === 'achievement'
      case 'market':
        return notification.type === 'market_update'
      case 'reminder':
        return notification.type === 'payment_reminder'
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="relative">
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 flex items-center justify-center text-xs"
          variant="destructive"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  )

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {trigger || defaultTrigger}
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Thông Báo
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <div className="px-6 pb-3">
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ({notifications.length})</SelectItem>
                  <SelectItem value="unread">Chưa đọc ({unreadCount})</SelectItem>
                  <SelectItem value="achievement">Thành tích</SelectItem>
                  <SelectItem value="market">Thị trường</SelectItem>
                  <SelectItem value="reminder">Nhắc nhở</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-2">
                  <AnimatePresence>
                    {filteredNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "p-4 rounded-lg border transition-all hover:shadow-sm",
                          !notification.isRead && "bg-blue-50/50 border-blue-200",
                          notification.isRead && "bg-gray-50/50 border-gray-200"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={cn(
                            "p-2 rounded-lg flex-shrink-0 border",
                            getNotificationColor(notification.type, notification.priority)
                          )}>
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className={cn(
                                  "font-medium text-sm leading-tight",
                                  !notification.isRead && "text-gray-900",
                                  notification.isRead && "text-gray-700"
                                )}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {getPriorityBadge(notification.priority)}
                                  <span className="text-xs text-gray-500">
                                    {formatTimeAgo(notification.timestamp)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 ml-2">
                                {!notification.isRead && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                              {notification.message}
                            </p>

                            {/* Metadata */}
                            {notification.metadata && (
                              <div className="mb-3 text-xs">
                                {notification.metadata.amount && (
                                  <Badge variant="outline" className="mr-2">
                                    {formatCurrency(notification.metadata.amount)}
                                  </Badge>
                                )}
                                {notification.metadata.progressPercentage && (
                                  <Badge variant="outline" className="mr-2">
                                    {notification.metadata.progressPercentage}% hoàn thành
                                  </Badge>
                                )}
                                {notification.metadata.achievementName && (
                                  <Badge className="bg-purple-100 text-purple-800 border-purple-300 mr-2">
                                    🏆 {notification.metadata.achievementName}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Action Button */}
                            {notification.actionUrl && notification.actionLabel && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => {
                                  window.location.href = notification.actionUrl!
                                  markAsRead(notification.id)
                                  setIsOpen(false)
                                }}
                              >
                                {notification.actionLabel}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredNotifications.length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Không có thông báo</h3>
                      <p className="text-gray-500">
                        {filter === 'unread' 
                          ? 'Bạn đã đọc hết tất cả thông báo' 
                          : 'Chưa có thông báo nào trong danh mục này'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {notifications.length > 0 && (
                <div className="p-4 border-t">
                  <Button variant="ghost" size="sm" className="w-full">
                    Xem Tất Cả Thông Báo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default NotificationCenter