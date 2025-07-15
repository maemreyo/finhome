// src/components/notifications/ToastNotification.tsx
// Toast notification system for real-time updates and alerts

'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Award,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ToastData {
  id: string
  type: 'success' | 'error' | 'info' | 'warning' | 'achievement'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
  defaultDuration?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  defaultDuration = 5000
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration
    }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      return updated.slice(0, maxToasts)
    })

    // Auto remove toast after duration (unless persistent)
    if (!toast.persistent && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAll = () => {
    setToasts([])
  }

  return (
    <ToastContext.Provider value={{ showToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastProps {
  toast: ToastData
  onRemove: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false)

  const getToastStyles = (type: ToastData['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'achievement':
        return 'bg-purple-50 border-purple-200 text-purple-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  const getIcon = (type: ToastData['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      case 'achievement':
        return <Award className="w-5 h-5 text-purple-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "min-w-80 max-w-md p-4 rounded-lg border shadow-lg backdrop-blur-sm",
        getToastStyles(toast.type)
      )}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(toast.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm leading-tight">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-sm mt-1 leading-relaxed opacity-90">
                    {toast.message}
                  </p>
                )}
              </div>
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(toast.id)}
                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Button */}
            {toast.action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.action!.onClick()
                    onRemove(toast.id)
                  }}
                  className="text-xs h-7"
                >
                  {toast.action.label}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar (for non-persistent toasts) */}
        {!toast.persistent && toast.duration && toast.duration > 0 && !isHovered && (
          <motion.div
            className="mt-3 h-1 bg-black/10 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full bg-current rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ 
                duration: toast.duration / 1000,
                ease: 'linear'
              }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Predefined toast types for common use cases
export const ToastHelpers = {
  success: (title: string, message?: string, action?: ToastData['action']) => ({
    type: 'success' as const,
    title,
    message,
    action
  }),

  error: (title: string, message?: string, action?: ToastData['action']) => ({
    type: 'error' as const,
    title,
    message,
    action,
    duration: 8000 // Longer duration for errors
  }),

  info: (title: string, message?: string, action?: ToastData['action']) => ({
    type: 'info' as const,
    title,
    message,
    action
  }),

  warning: (title: string, message?: string, action?: ToastData['action']) => ({
    type: 'warning' as const,
    title,
    message,
    action,
    duration: 7000
  }),

  achievement: (title: string, message?: string, action?: ToastData['action']) => ({
    type: 'achievement' as const,
    title,
    message,
    action,
    duration: 8000 // Longer duration for achievements
  }),

  // Financial-specific helpers
  paymentReminder: (amount: number, propertyName: string) => ({
    type: 'warning' as const,
    title: 'Nhắc nhở thanh toán',
    message: `Khoản vay ${propertyName} có kỳ thanh toán ${amount.toLocaleString('vi-VN')} VND sắp đến hạn`,
    action: {
      label: 'Xem chi tiết',
      onClick: () => window.location.href = '/plans'
    },
    duration: 10000
  }),

  marketUpdate: (message: string) => ({
    type: 'info' as const,
    title: 'Cập nhật thị trường',
    message,
    action: {
      label: 'Xem thêm',
      onClick: () => window.location.href = '/banks'
    }
  }),

  goalProgress: (percentage: number, goalName: string) => ({
    type: 'success' as const,
    title: 'Tiến độ mục tiêu',
    message: `Bạn đã hoàn thành ${percentage}% mục tiêu "${goalName}"`,
    action: {
      label: 'Xem mục tiêu',
      onClick: () => window.location.href = '/goals'
    }
  }),

  newAchievement: (achievementName: string) => ({
    type: 'achievement' as const,
    title: 'Thành tích mới! 🏆',
    message: `Bạn đã mở khóa thành tích "${achievementName}"`,
    action: {
      label: 'Xem thành tích',
      onClick: () => window.location.href = '/achievements'
    },
    duration: 10000
  }),

  propertyAlert: (propertyName: string, changePercent: number) => ({
    type: 'info' as const,
    title: 'Cảnh báo bất động sản',
    message: `Giá ${propertyName} đã ${changePercent > 0 ? 'tăng' : 'giảm'} ${Math.abs(changePercent)}%`,
    action: {
      label: 'Xem chi tiết',
      onClick: () => window.location.href = '/properties'
    }
  })
}

export default ToastNotification