// src/hooks/useNotifications.ts
// Hook for managing in-app notifications and achievement unlocks

import { useState, useCallback } from 'react'
import { Achievement } from '@/lib/gamification/achievements'

interface Notification {
  id: string
  type: 'achievement' | 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  icon?: string
  duration?: number
  timestamp: Date
  seen: boolean
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  showAchievementUnlock: (achievement: Achievement) => void
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'seen'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearAll: () => void
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  const showAchievementUnlock = useCallback((achievement: Achievement) => {
    const notification: Notification = {
      id: `achievement-${achievement.id}-${Date.now()}`,
      type: 'achievement',
      title: '🎉 Achievement Unlocked!',
      message: `${achievement.title} - ${achievement.description}`,
      icon: achievement.icon,
      duration: 5000,
      timestamp: new Date(),
      seen: false
    }

    setNotifications(prev => [notification, ...prev])
    
    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
    }
  }, [removeNotification])

  const showNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'seen'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}`,
      timestamp: new Date(),
      seen: false
    }

    setNotifications(prev => [notification, ...prev])
    
    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
    }
  }, [removeNotification])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, seen: true }
          : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, seen: true }))
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.seen).length

  return {
    notifications,
    unreadCount,
    showAchievementUnlock,
    showNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  }
}

// Helper function to create a notification toast component
export function createNotificationToast(notification: Notification) {
  return {
    title: notification.title,
    description: notification.message,
    duration: notification.duration || 4000,
    variant: notification.type === 'error' ? 'destructive' as const : 'default' as const
  }
}