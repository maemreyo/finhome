// Error tracking and monitoring

interface ErrorInfo {
  message: string
  stack?: string
  userId?: string
  url?: string
  userAgent?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  tags?: Record<string, string>
}

class ErrorTracker {
  private isEnabled: boolean

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production'
  }

  // Capture and report errors
  captureError(error: Error, context?: Record<string, any>) {
    if (!this.isEnabled) {
      console.error('Error:', error, context)
      return
    }

    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      severity: this.determineSeverity(error),
      tags: context,
    }

    // Send to error tracking service
    this.sendToErrorService(errorInfo)
  }

  // Capture user feedback
  captureUserFeedback(message: string, email?: string) {
    if (!this.isEnabled) return

    const feedback = {
      message,
      email,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }

    // Send to feedback service
    this.sendFeedback(feedback)
  }

  // Determine error severity
  private determineSeverity(error: Error): ErrorInfo['severity'] {
    if (error.message.includes('Payment') || error.message.includes('Billing')) {
      return 'critical'
    }
    if (error.message.includes('Auth') || error.message.includes('Login')) {
      return 'high'
    }
    if (error.message.includes('Network') || error.message.includes('Fetch')) {
      return 'medium'
    }
    return 'low'
  }

  // Send to error tracking service (e.g., Sentry)
  private async sendToErrorService(errorInfo: ErrorInfo) {
    try {
      // If using Sentry
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(new Error(errorInfo.message), {
          tags: errorInfo.tags,
          level: errorInfo.severity,
        })
      }

      // Store in database
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo),
      })
    } catch (err) {
      console.error('Failed to send error to tracking service:', err)
    }
  }

  // Send feedback
  private async sendFeedback(feedback: Record<string, unknown>) {
    try {
      await fetch('/api/monitoring/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      })
    } catch (err) {
      console.error('Failed to send feedback:', err)
    }
  }
}

export const errorTracker = new ErrorTracker()

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorTracker.captureError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.captureError(new Error(event.reason), {
      type: 'unhandledrejection',
    })
  })
}