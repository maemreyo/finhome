// src/hooks/useErrorHandler.ts
// Comprehensive error handling hook for the application

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface AppError {
  code: string
  message: string
  details?: any
  retry?: () => void
  timestamp: Date
}

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  retryable?: boolean
  retryAction?: () => void
}

const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  
  // Authentication errors
  AUTH_REQUIRED: 'Please sign in to continue.',
  AUTH_EXPIRED: 'Your session has expired. Please sign in again.',
  AUTH_FORBIDDEN: 'You do not have permission to perform this action.',
  
  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_FORMAT: 'Invalid format. Please check your input.',
  
  // Financial planning errors
  PLAN_NOT_FOUND: 'Financial plan not found.',
  PLAN_SAVE_ERROR: 'Failed to save financial plan. Please try again.',
  PLAN_DELETE_ERROR: 'Failed to delete financial plan. Please try again.',
  
  // Bank rates errors
  RATES_FETCH_ERROR: 'Failed to fetch bank rates. Using cached data.',
  RATES_OUTDATED: 'Bank rates may be outdated. Please refresh.',
  
  // Property search errors
  PROPERTY_SEARCH_ERROR: 'Failed to search properties. Please try again.',
  PROPERTY_NOT_FOUND: 'Property not found.',
  
  // Scenario generation errors
  SCENARIO_GENERATION_ERROR: 'Failed to generate scenarios. Please try again.',
  INSUFFICIENT_DATA: 'Insufficient data to generate scenarios.',
  
  // Progress tracking errors
  PROGRESS_SAVE_ERROR: 'Failed to save progress. Please try again.',
  MILESTONE_UPDATE_ERROR: 'Failed to update milestone. Please try again.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  MAINTENANCE_MODE: 'The system is currently under maintenance. Please try again later.'
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<AppError[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleError = useCallback((
    error: any,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      retryable = false,
      retryAction
    } = options

    let appError: AppError

    // Parse different types of errors
    if (error?.response) {
      // HTTP error response
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          appError = {
            code: 'VALIDATION_ERROR',
            message: data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
            details: data,
            timestamp: new Date()
          }
          break
        case 401:
          appError = {
            code: 'AUTH_REQUIRED',
            message: ERROR_MESSAGES.AUTH_REQUIRED,
            timestamp: new Date()
          }
          break
        case 403:
          appError = {
            code: 'AUTH_FORBIDDEN',
            message: ERROR_MESSAGES.AUTH_FORBIDDEN,
            timestamp: new Date()
          }
          break
        case 404:
          appError = {
            code: 'NOT_FOUND',
            message: data?.message || 'Resource not found',
            timestamp: new Date()
          }
          break
        case 408:
          appError = {
            code: 'TIMEOUT_ERROR',
            message: ERROR_MESSAGES.TIMEOUT_ERROR,
            retry: retryAction,
            timestamp: new Date()
          }
          break
        case 500:
        case 502:
        case 503:
          appError = {
            code: 'SERVER_ERROR',
            message: ERROR_MESSAGES.SERVER_ERROR,
            retry: retryAction,
            timestamp: new Date()
          }
          break
        default:
          appError = {
            code: 'UNKNOWN_ERROR',
            message: data?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
            details: data,
            timestamp: new Date()
          }
      }
    } else if (error?.code) {
      // Network or custom errors
      switch (error.code) {
        case 'NETWORK_ERROR':
        case 'ERR_NETWORK':
          appError = {
            code: 'NETWORK_ERROR',
            message: ERROR_MESSAGES.NETWORK_ERROR,
            retry: retryAction,
            timestamp: new Date()
          }
          break
        default:
          appError = {
            code: error.code,
            message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
            details: error,
            retry: retryAction,
            timestamp: new Date()
          }
      }
    } else if (error instanceof Error) {
      // JavaScript errors
      appError = {
        code: 'JS_ERROR',
        message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        details: error.stack,
        timestamp: new Date()
      }
    } else if (typeof error === 'string') {
      // String errors
      appError = {
        code: 'STRING_ERROR',
        message: ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] || error,
        timestamp: new Date()
      }
    } else {
      // Unknown error type
      appError = {
        code: 'UNKNOWN_ERROR',
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
        details: error,
        timestamp: new Date()
      }
    }

    // Add retry action if provided
    if (retryable && retryAction) {
      appError.retry = retryAction
    }

    // Log error if enabled
    if (logError) {
      console.error('Error handled:', appError)
    }

    // Show toast notification if enabled
    if (showToast) {
      toast.error(appError.message, {
        action: appError.retry ? {
          label: 'Retry',
          onClick: appError.retry
        } : undefined
      })
    }

    // Add to errors list
    setErrors(prev => [appError, ...prev.slice(0, 9)]) // Keep last 10 errors

    return appError
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const clearError = useCallback((code: string) => {
    setErrors(prev => prev.filter(error => error.code !== code))
  }, [])

  const hasError = useCallback((code?: string) => {
    if (code) {
      return errors.some(error => error.code === code)
    }
    return errors.length > 0
  }, [errors])

  const getError = useCallback((code: string) => {
    return errors.find(error => error.code === code)
  }, [errors])

  // Async wrapper with error handling
  const withErrorHandling = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    setIsLoading(true)
    try {
      const result = await asyncFn()
      setIsLoading(false)
      return result
    } catch (error) {
      setIsLoading(false)
      handleError(error, options)
      return null
    }
  }, [handleError])

  // Specific error handlers for common scenarios
  const handleNetworkError = useCallback((retryAction?: () => void) => {
    return handleError('NETWORK_ERROR', {
      retryable: true,
      retryAction
    })
  }, [handleError])

  const handleAuthError = useCallback(() => {
    return handleError('AUTH_REQUIRED', {
      showToast: true
    })
  }, [handleError])

  const handleValidationError = useCallback((details?: any) => {
    return handleError({
      code: 'VALIDATION_ERROR',
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      details
    })
  }, [handleError])

  const handlePlanError = useCallback((operation: 'save' | 'delete' | 'fetch', retryAction?: () => void) => {
    const errorCode = operation === 'save' ? 'PLAN_SAVE_ERROR' : 
                     operation === 'delete' ? 'PLAN_DELETE_ERROR' : 
                     'PLAN_FETCH_ERROR'
    
    return handleError(errorCode, {
      retryable: !!retryAction,
      retryAction
    })
  }, [handleError])

  const handleRatesError = useCallback((retryAction?: () => void) => {
    return handleError('RATES_FETCH_ERROR', {
      retryable: true,
      retryAction
    })
  }, [handleError])

  const handlePropertyError = useCallback((retryAction?: () => void) => {
    return handleError('PROPERTY_SEARCH_ERROR', {
      retryable: true,
      retryAction
    })
  }, [handleError])

  const handleScenarioError = useCallback((retryAction?: () => void) => {
    return handleError('SCENARIO_GENERATION_ERROR', {
      retryable: true,
      retryAction
    })
  }, [handleError])

  const handleProgressError = useCallback((operation: 'save' | 'milestone', retryAction?: () => void) => {
    const errorCode = operation === 'save' ? 'PROGRESS_SAVE_ERROR' : 'MILESTONE_UPDATE_ERROR'
    
    return handleError(errorCode, {
      retryable: !!retryAction,
      retryAction
    })
  }, [handleError])

  return {
    errors,
    isLoading,
    handleError,
    clearErrors,
    clearError,
    hasError,
    getError,
    withErrorHandling,
    // Specific handlers
    handleNetworkError,
    handleAuthError,
    handleValidationError,
    handlePlanError,
    handleRatesError,
    handlePropertyError,
    handleScenarioError,
    handleProgressError
  }
}

export default useErrorHandler