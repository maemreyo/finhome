// React Error Boundary component

'use client'

import { Component, ReactNode } from 'react'
import { errorTracker } from '@/lib/monitoring/error-tracking'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorTracker.captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              We&apos;ve been notified about this error and are working to fix it.
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </Button>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}