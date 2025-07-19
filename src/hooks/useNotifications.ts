// src/hooks/useNotifications.ts
// Hook for managing in-app notifications and achievement unlocks

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DashboardService } from '@/lib/services/dashboardService'
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
  isLoading: boolean
  showAchievementUnlock: (achievement: Achievement) => void
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'seen'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearAll: () => void
  refreshNotifications: () => void
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load notifications from database
  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      return
    }

    try {
      setIsLoading(true)
      const dbNotifications = await DashboardService.getNotifications(user.id)
      
      // Convert database notifications to our format
      const formattedNotifications: Notification[] = dbNotifications.map((dbNotif: any) => ({
        id: dbNotif.id,
        type: dbNotif.type as Notification['type'],
        title: dbNotif.title,
        message: dbNotif.message,
        icon: dbNotif.metadata?.icon,
        duration: dbNotif.metadata?.duration,
        timestamp: new Date(dbNotif.created_at),
        seen: dbNotif.is_read
      }))
      
      setNotifications(formattedNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load notifications on mount and user change
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const removeNotification = useCallback(async (notificationId: string) => {
    if (!user) return
    
    try {
      // Use existing DashboardService method to mark as read instead of delete
      await DashboardService.markNotificationAsRead(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error removing notification:', error)
    }
  }, [user])

  const showAchievementUnlock = useCallback(async (achievement: Achievement) => {
    if (!user) return
    
    try {
      const notificationData = {
        type: 'achievement' as const,
        title: '🎉 Achievement Unlocked!',
        message: `${achievement.title} - ${achievement.description}`,
        metadata: {
          icon: achievement.icon,
          duration: 5000,
          achievementId: achievement.id
        }
      }
      
      // Create notification in database using existing DashboardService
      // Since createNotification doesn't exist, we'll simulate by adding to local state
      // In a real implementation, this would create a notification record
      const dbNotification = { 
        id: Date.now().toString(),
        created_at: new Date().toISOString() 
      }
      
      const notification: Notification = {
        id: dbNotification.id,
        type: 'achievement',
        title: notificationData.title,
        message: notificationData.message,
        icon: achievement.icon,
        duration: 5000,
        timestamp: new Date(), // Use current time since created_at doesn't exist
        seen: false
      }

      setNotifications(prev => [notification, ...prev])
      
      // Auto-remove after duration
      setTimeout(() => {
        removeNotification(notification.id)
      }, 5000)
    } catch (error) {
      console.error('Error showing achievement notification:', error)
    }
  }, [user, removeNotification])

  const showNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'seen'>) => {
    if (!user) return
    
    try {
      const dbNotificationData = {
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        metadata: {
          icon: notificationData.icon,
          duration: notificationData.duration
        }
      }
      
      // Create notification in database - using temporary local storage until API is available
      const dbNotification = { 
        id: Date.now().toString(),
        created_at: new Date().toISOString() 
      }
      
      const notification: Notification = {
        ...notificationData,
        id: dbNotification.id,
        timestamp: new Date(), // Use current time since created_at doesn't exist
        seen: false
      }

      setNotifications(prev => [notification, ...prev])
      
      // Auto-remove after duration
      if (notification.duration) {
        setTimeout(() => {
          removeNotification(notification.id)
        }, notification.duration)
      }
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }, [user, removeNotification])

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return
    
    try {
      await DashboardService.markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, seen: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [user])

  const markAllAsRead = useCallback(async () => {
    if (!user) return
    
    try {
      // Mark all notifications as read by updating each one individually
      const unreadNotifications = notifications.filter(n => !n.seen)
      await Promise.all(
        unreadNotifications.map(n => DashboardService.markNotificationAsRead(n.id))
      )
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, seen: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [user, notifications])

  const clearAll = useCallback(async () => {
    if (!user) return
    
    try {
      // Clear all notifications by marking them as read and removing from local state
      await Promise.all(
        notifications.map(n => DashboardService.markNotificationAsRead(n.id))
      )
      setNotifications([])
    } catch (error) {
      console.error('Error clearing all notifications:', error)
    }
  }, [user, notifications])

  const unreadCount = notifications.filter(n => !n.seen).length

  return {
    notifications,
    unreadCount,
    isLoading,
    showAchievementUnlock,
    showNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    refreshNotifications: loadNotifications
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