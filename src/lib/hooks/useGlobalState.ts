// src/lib/hooks/useGlobalState.ts
// Global state management for cross-system integration

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  preferences: {
    currency: 'VND' | 'USD'
    language: 'vi' | 'en'
    notifications: {
      email: boolean
      push: boolean
      achievements: boolean
      marketUpdates: boolean
      paymentReminders: boolean
    }
    dashboard: {
      layout: 'grid' | 'list'
      widgets: string[]
    }
  }
  stats: {
    level: number
    experience: number
    totalPlans: number
    totalInvestments: number
    achievementsUnlocked: number
  }
}

interface AppNotification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning' | 'achievement'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionUrl?: string
}

interface GlobalState {
  // User state
  user: UserProfile | null
  isAuthenticated: boolean
  
  // App state
  isLoading: boolean
  notifications: AppNotification[]
  unreadCount: number
  
  // Financial data state
  totalPortfolioValue: number
  monthlyIncome: number
  savingsProgress: number
  
  // UI state
  sidebarOpen: boolean
  currentTheme: 'light' | 'dark'
  
  // Actions
  setUser: (user: UserProfile | null) => void
  setAuthenticated: (isAuth: boolean) => void
  setLoading: (loading: boolean) => void
  
  // Notification actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  removeNotification: (id: string) => void
  
  // Financial actions
  updatePortfolioValue: (value: number) => void
  updateSavingsProgress: (progress: number) => void
  
  // UI actions
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  
  // User preference actions
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void
  
  // Achievement actions
  unlockAchievement: (achievementName: string) => void
  addExperience: (points: number) => void
}

export const useGlobalState = create<GlobalState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      notifications: [],
      unreadCount: 0,
      totalPortfolioValue: 0,
      monthlyIncome: 0,
      savingsProgress: 0,
      sidebarOpen: false,
      currentTheme: 'light',

      // User actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),

      // Notification actions
      addNotification: (notification) => {
        const newNotification: AppNotification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          isRead: false
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only last 50
          unreadCount: state.unreadCount + 1
        }))
      },
      
      markNotificationRead: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        if (notification && !notification.isRead) {
          return {
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }
        }
        return state
      }),
      
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      })),
      
      removeNotification: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: notification && !notification.isRead 
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount
        }
      }),

      // Financial actions
      updatePortfolioValue: (totalPortfolioValue) => set({ totalPortfolioValue }),
      updateSavingsProgress: (savingsProgress) => set({ savingsProgress }),

      // UI actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (currentTheme) => set({ currentTheme }),

      // User preference actions
      updatePreferences: (preferences) => set((state) => ({
        user: state.user ? {
          ...state.user,
          preferences: { ...state.user.preferences, ...preferences }
        } : null
      })),

      // Achievement actions
      unlockAchievement: (achievementName) => {
        const state = get()
        
        // Add achievement notification
        state.addNotification({
          type: 'achievement',
          title: 'Thành tích mới! 🏆',
          message: `Bạn đã mở khóa thành tích "${achievementName}"`,
          isRead: false,
          actionUrl: '/achievements'
        })
        
        // Update user stats
        if (state.user) {
          set({
            user: {
              ...state.user,
              stats: {
                ...state.user.stats,
                achievementsUnlocked: state.user.stats.achievementsUnlocked + 1
              }
            }
          })
        }
      },
      
      addExperience: (points) => set((state) => {
        if (!state.user) return state
        
        const newExperience = state.user.stats.experience + points
        const newLevel = Math.floor(newExperience / 1000) + 1 // Level up every 1000 XP
        
        // Check if level increased
        if (newLevel > state.user.stats.level) {
          state.addNotification({
            type: 'achievement',
            title: 'Lên cấp! 🎉',
            message: `Chúc mừng! Bạn đã đạt cấp độ ${newLevel}`,
            isRead: false,
            actionUrl: '/achievements'
          })
        }
        
        return {
          user: {
            ...state.user,
            stats: {
              ...state.user.stats,
              experience: newExperience,
              level: newLevel
            }
          }
        }
      })
    }),
    {
      name: 'finhome-global-state',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentTheme: state.currentTheme,
        sidebarOpen: state.sidebarOpen,
        notifications: state.notifications.slice(0, 20) // Persist only recent notifications
      })
    }
  )
)

// Convenience hooks for specific parts of the state
export const useUser = () => useGlobalState((state) => state.user)
export const useAuth = () => useGlobalState((state) => ({ 
  isAuthenticated: state.isAuthenticated, 
  setAuthenticated: state.setAuthenticated 
}))
export const useNotifications = () => useGlobalState((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  addNotification: state.addNotification,
  markNotificationRead: state.markNotificationRead,
  markAllNotificationsRead: state.markAllNotificationsRead,
  removeNotification: state.removeNotification
}))
export const useFinancialData = () => useGlobalState((state) => ({
  totalPortfolioValue: state.totalPortfolioValue,
  monthlyIncome: state.monthlyIncome,
  savingsProgress: state.savingsProgress,
  updatePortfolioValue: state.updatePortfolioValue,
  updateSavingsProgress: state.updateSavingsProgress
}))
export const useUI = () => useGlobalState((state) => ({
  sidebarOpen: state.sidebarOpen,
  currentTheme: state.currentTheme,
  isLoading: state.isLoading,
  toggleSidebar: state.toggleSidebar,
  setTheme: state.setTheme,
  setLoading: state.setLoading
}))

export default useGlobalState