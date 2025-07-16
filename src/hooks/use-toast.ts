// src/hooks/use-toast.ts
// Simple toast hook for admin feedback

'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((newToast: Toast) => {
    console.log('Toast:', newToast)
    // For now, just log to console
    // In a real implementation, you'd add to state and show UI
  }, [])

  return { toast, toasts }
}