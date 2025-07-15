// src/hooks/useContextualHelp.ts
// Hook for managing contextual help system

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  ContextualHelpItem, 
  UserHelpState, 
  UI_HELP_ITEMS 
} from '@/types/help'

interface UseContextualHelpReturn {
  helpState: UserHelpState | null
  helpItems: Map<string, ContextualHelpItem>
  activeHelp: string | null
  showHelp: (elementId: string) => void
  hideHelp: (elementId: string) => void
  dismissHelp: (elementId: string) => void
  toggleGlobalHelp: () => void
  isHelpVisible: (elementId: string) => boolean
  shouldShowHelp: (elementId: string) => boolean
  updateHelpPreference: (key: keyof UserHelpState, value: any) => void
  registerHelpItem: (item: ContextualHelpItem) => void
  unregisterHelpItem: (elementId: string) => void
  resetAllHelp: () => void
  getHelpItem: (elementId: string) => ContextualHelpItem | undefined
}

// Generate unique session ID
const generateSessionId = () => {
  return `help_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get user help state from localStorage
const getUserHelpState = (userId: string): UserHelpState => {
  const stored = localStorage.getItem(`help_state_${userId}`)
  
  if (stored) {
    const parsed = JSON.parse(stored)
    return {
      ...parsed,
      lastHelpInteraction: new Date(parsed.lastHelpInteraction),
      helpSessionId: generateSessionId() // Always generate new session ID
    }
  }

  // Default state for new users
  return {
    userId,
    showContextualHelp: true,
    helpLevel: 'guided',
    dismissedHelp: [],
    seenTooltips: [],
    preferredHelpType: 'tooltip',
    lastHelpInteraction: new Date(),
    helpSessionId: generateSessionId()
  }
}

// Save user help state to localStorage
const saveUserHelpState = (state: UserHelpState) => {
  localStorage.setItem(`help_state_${state.userId}`, JSON.stringify(state))
}

export function useContextualHelp(): UseContextualHelpReturn {
  const { user } = useAuth()
  const [helpState, setHelpState] = useState<UserHelpState | null>(null)
  const [helpItems, setHelpItems] = useState<Map<string, ContextualHelpItem>>(new Map())
  const [activeHelp, setActiveHelp] = useState<string | null>(null)
  const timeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Initialize help state
  useEffect(() => {
    if (user) {
      const state = getUserHelpState(user.id)
      setHelpState(state)
      
      // Register default help items
      const itemsMap = new Map<string, ContextualHelpItem>()
      UI_HELP_ITEMS.forEach(item => {
        itemsMap.set(item.elementId, item)
      })
      setHelpItems(itemsMap)
    }
  }, [user])

  // Update help state and persist
  const updateHelpState = useCallback((updates: Partial<UserHelpState>) => {
    if (!helpState) return

    const newState = {
      ...helpState,
      ...updates,
      lastHelpInteraction: new Date()
    }
    
    setHelpState(newState)
    saveUserHelpState(newState)
  }, [helpState])

  // Check if help should be shown based on conditions
  const shouldShowHelp = useCallback((elementId: string): boolean => {
    if (!helpState || !helpState.showContextualHelp) return false

    const helpItem = helpItems.get(elementId)
    if (!helpItem) return false

    // Check if already dismissed
    if (helpState.dismissedHelp.includes(helpItem.id)) return false

    // Check show conditions
    if (helpItem.showCondition) {
      const condition = helpItem.showCondition

      // Check user type (would need to get from profile)
      if (condition.userType && !condition.userType.includes('first_time_buyer')) {
        // In real app, this would check actual user type
      }

      // Check subscription tier (would need to get from subscription)
      if (condition.subscriptionTier && !condition.subscriptionTier.includes('free')) {
        // In real app, this would check actual subscription
      }

      // Check if user completed onboarding
      if (condition.completedOnboarding !== undefined) {
        // In real app, this would check onboarding status
      }

      // Check if user has plans
      if (condition.hasPlans !== undefined) {
        // In real app, this would check if user has financial plans
      }
    }

    return true
  }, [helpState, helpItems])

  // Show help for specific element
  const showHelp = useCallback((elementId: string) => {
    if (!shouldShowHelp(elementId)) return

    const helpItem = helpItems.get(elementId)
    if (!helpItem) return

    // Clear any existing timeout for this element
    const existingTimeout = timeoutRef.current.get(elementId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Apply delay if specified
    if (helpItem.delay && helpItem.delay > 0) {
      const timeout = setTimeout(() => {
        setActiveHelp(elementId)
        timeoutRef.current.delete(elementId)
      }, helpItem.delay)
      
      timeoutRef.current.set(elementId, timeout)
    } else {
      setActiveHelp(elementId)
    }

    // Mark as seen
    if (helpState && !helpState.seenTooltips.includes(helpItem.id)) {
      updateHelpState({
        seenTooltips: [...helpState.seenTooltips, helpItem.id]
      })
    }
  }, [shouldShowHelp, helpItems, helpState, updateHelpState])

  // Hide help for specific element
  const hideHelp = useCallback((elementId: string) => {
    // Clear timeout if exists
    const timeout = timeoutRef.current.get(elementId)
    if (timeout) {
      clearTimeout(timeout)
      timeoutRef.current.delete(elementId)
    }

    if (activeHelp === elementId) {
      setActiveHelp(null)
    }
  }, [activeHelp])

  // Dismiss help permanently
  const dismissHelp = useCallback((elementId: string) => {
    const helpItem = helpItems.get(elementId)
    if (!helpItem || !helpState) return

    hideHelp(elementId)
    
    // Add to dismissed list
    updateHelpState({
      dismissedHelp: [...helpState.dismissedHelp, helpItem.id]
    })
  }, [helpItems, helpState, hideHelp, updateHelpState])

  // Toggle global help on/off
  const toggleGlobalHelp = useCallback(() => {
    if (!helpState) return

    updateHelpState({
      showContextualHelp: !helpState.showContextualHelp
    })

    // Hide all active help when disabling
    if (helpState.showContextualHelp) {
      setActiveHelp(null)
      timeoutRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutRef.current.clear()
    }
  }, [helpState, updateHelpState])

  // Check if help is currently visible
  const isHelpVisible = useCallback((elementId: string): boolean => {
    return activeHelp === elementId
  }, [activeHelp])

  // Update help preferences
  const updateHelpPreference = useCallback((key: keyof UserHelpState, value: any) => {
    updateHelpState({ [key]: value })
  }, [updateHelpState])

  // Register new help item
  const registerHelpItem = useCallback((item: ContextualHelpItem) => {
    setHelpItems(prev => new Map(prev).set(item.elementId, item))
  }, [])

  // Unregister help item
  const unregisterHelpItem = useCallback((elementId: string) => {
    setHelpItems(prev => {
      const newMap = new Map(prev)
      newMap.delete(elementId)
      return newMap
    })
    
    // Hide if currently active
    if (activeHelp === elementId) {
      setActiveHelp(null)
    }
  }, [activeHelp])

  // Reset all help (for development/testing)
  const resetAllHelp = useCallback(() => {
    if (!helpState) return

    updateHelpState({
      dismissedHelp: [],
      seenTooltips: [],
      helpSessionId: generateSessionId()
    })
    
    setActiveHelp(null)
    timeoutRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutRef.current.clear()
  }, [helpState, updateHelpState])

  // Get specific help item
  const getHelpItem = useCallback((elementId: string): ContextualHelpItem | undefined => {
    return helpItems.get(elementId)
  }, [helpItems])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      const timeouts = timeoutRef.current
      timeouts.forEach(timeout => clearTimeout(timeout))
      timeouts.clear()
    }
  }, [])

  return {
    helpState,
    helpItems,
    activeHelp,
    showHelp,
    hideHelp,
    dismissHelp,
    toggleGlobalHelp,
    isHelpVisible,
    shouldShowHelp,
    updateHelpPreference,
    registerHelpItem,
    unregisterHelpItem,
    resetAllHelp,
    getHelpItem
  }
}

// Hook for easy tooltip integration
export function useHelpTooltip(elementId: string) {
  const { showHelp, hideHelp, isHelpVisible, shouldShowHelp, getHelpItem } = useContextualHelp()
  
  const helpItem = getHelpItem(elementId)
  const isVisible = isHelpVisible(elementId)
  const canShow = shouldShowHelp(elementId)
  
  const handleMouseEnter = useCallback(() => {
    if (helpItem?.trigger === 'hover' && canShow) {
      showHelp(elementId)
    }
  }, [helpItem, canShow, showHelp, elementId])
  
  const handleMouseLeave = useCallback(() => {
    if (helpItem?.trigger === 'hover') {
      hideHelp(elementId)
    }
  }, [helpItem, hideHelp, elementId])
  
  const handleClick = useCallback(() => {
    if (helpItem?.trigger === 'click' && canShow) {
      if (isVisible) {
        hideHelp(elementId)
      } else {
        showHelp(elementId)
      }
    }
  }, [helpItem, canShow, isVisible, showHelp, hideHelp, elementId])
  
  const handleFocus = useCallback(() => {
    if (helpItem?.trigger === 'focus' && canShow) {
      showHelp(elementId)
    }
  }, [helpItem, canShow, showHelp, elementId])
  
  const handleBlur = useCallback(() => {
    if (helpItem?.trigger === 'focus') {
      hideHelp(elementId)
    }
  }, [helpItem, hideHelp, elementId])
  
  return {
    helpItem,
    isVisible,
    canShow,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onClick: handleClick,
      onFocus: handleFocus,
      onBlur: handleBlur
    }
  }
}