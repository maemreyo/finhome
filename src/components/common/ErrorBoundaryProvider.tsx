// src/components/common/ErrorBoundaryProvider.tsx
// Comprehensive error boundary provider with context and global error handling

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { toast } from 'sonner'

interface ErrorInfo {
  id: string
  error: Error
  errorInfo: React.ErrorInfo
  timestamp: Date
  component?: string
  userId?: string
  sessionId?: string
}

interface ErrorContextType {
  errors: ErrorInfo[]
  reportError: (error: Error, errorInfo?: React.ErrorInfo, component?: string) => void
  clearError: (id: string) => void
  clearAllErrors: () => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export const useErrorReporting = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useErrorReporting must be used within an ErrorBoundaryProvider')
  }
  return context
}

interface ErrorBoundaryProviderProps {
  children: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  fallback?: ReactNode
}

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
  onError,
  fallback
}) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([])

  const reportError = useCallback((error: Error, errorInfo?: React.ErrorInfo, component?: string) => {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const errorInfo_: ErrorInfo = {
      id: errorId,
      error,
      errorInfo: errorInfo || { componentStack: '' },
      timestamp: new Date(),
      component,
      userId: 'current-user', // Would get from auth context
      sessionId: 'current-session' // Would get from session
    }

    setErrors(prev => [...prev, errorInfo_])

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', errorInfo_)
    }

    // Send to external error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // Sentry.captureException(error, { extra: errorInfo_ })
    }

    // Show user-friendly toast
    toast.error('Something went wrong. Our team has been notified.')

    // Call custom error handler if provided
    if (onError && errorInfo) {
      onError(error, errorInfo)
    }
  }, [onError])

  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors([])
  }, [])

  const contextValue: ErrorContextType = {
    errors,
    reportError,
    clearError,
    clearAllErrors
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      <ErrorBoundary
        onError={reportError}
        fallback={fallback}
      >
        {children}
      </ErrorBoundary>
    </ErrorContext.Provider>
  )
}

// HOC for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: {
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for manual error reporting
export const useErrorHandler = () => {
  const { reportError } = useErrorReporting()

  return useCallback((error: Error, component?: string) => {
    reportError(error, undefined, component)
  }, [reportError])
}

// Async error handler for promises
export const handleAsyncError = (error: unknown, component?: string) => {
  if (error instanceof Error) {
    // Use global error reporting if available
    if (typeof window !== 'undefined' && (window as any).errorReporting) {
      (window as any).errorReporting.reportError(error, undefined, component)
    } else {
      console.error('Async error:', error)
      toast.error('An unexpected error occurred')
    }
  }
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    handleAsyncError(event.reason, 'unhandled-promise')
  })

  // Make error reporting available globally
  ;(window as any).errorReporting = {
    reportError: (error: Error, errorInfo?: React.ErrorInfo, component?: string) => {
      console.error('Global error:', error)
      toast.error('Something went wrong')
    }
  }
}

export default ErrorBoundaryProvider