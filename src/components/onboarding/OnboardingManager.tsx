// src/components/onboarding/OnboardingManager.tsx
// Manager component for automatic onboarding tour activation

'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { OnboardingTour } from './OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useUser } from '@/components/providers/SupabaseProvider'
import { OnboardingService } from '@/lib/services/onboardingService'

interface OnboardingManagerProps {
  children: React.ReactNode
}

export function OnboardingManager({ children }: OnboardingManagerProps) {
  const user = useUser()
  const pathname = usePathname()
  const [activeTour, setActiveTour] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)
  
  const { 
    startOnboarding, 
    skipOnboarding, 
    isOnboardingCompleted,
    currentStep,
    isOnboardingActive 
  } = useOnboarding(activeTour || undefined)

  useEffect(() => {
    const checkAndStartOnboarding = async () => {
      // Prevent multiple simultaneous checks
      if (!user?.id || isInitialized || isChecking || activeTour) return

      setIsChecking(true)
      
      try {
        // Check if user needs onboarding
        const needsOnboarding = await OnboardingService.checkIfUserNeedsOnboarding(user.id)
        
        if (!needsOnboarding) {
          setIsInitialized(true)
          setIsChecking(false)
          return
        }

        // Get recommended tour based on current page and user state
        const recommendedTour = await OnboardingService.getRecommendedTour(user.id, pathname)
        
        if (recommendedTour && !activeTour) {
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          
          // Small delay to ensure page is fully loaded and prevent race conditions
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current && !activeTour) {
              setActiveTour(recommendedTour)
              startOnboarding(recommendedTour)
              setIsInitialized(true)
              setIsChecking(false)
            }
          }, 1500)
        } else {
          setIsInitialized(true)
          setIsChecking(false)
        }
      } catch (error) {
        console.error('[OnboardingManager] Error checking onboarding status:', error)
        setIsInitialized(true)
        setIsChecking(false)
      }
    }

    checkAndStartOnboarding()
  }, [user?.id, isInitialized, isChecking, activeTour, startOnboarding])

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Handle tour completion
  const handleTourComplete = async (tourId: string) => {
    try {
      skipOnboarding() // Mark as completed/skipped
      setActiveTour(null)
      
      // Record completion in database
      if (user?.id) {
        await OnboardingService.recordTourCompletion(user.id, tourId)
      }
      
      // Prevent future automatic tours for this session
      setIsInitialized(true)
    } catch (error) {
      console.error('[OnboardingManager] Error completing tour:', error)
    }
  }

  // Handle tour skip
  const handleTourSkip = async (tourId: string) => {
    try {
      skipOnboarding()
      setActiveTour(null)
      
      // Record skip event
      if (user?.id) {
        await OnboardingService.recordTourSkip(user.id, tourId)
      }
      
      // Prevent future automatic tours for this session
      setIsInitialized(true)
    } catch (error) {
      console.error('[OnboardingManager] Error skipping tour:', error)
    }
  }

  // Debug logging (less frequent)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && activeTour) {
      console.log('[OnboardingManager] Active tour state:', {
        userId: user?.id?.slice(0, 8) + '...',
        pathname,
        activeTour,
        isOnboardingActive,
        isInitialized,
        isChecking
      })
    }
  }, [activeTour, isOnboardingActive])

  return (
    <>
      {children}
      {/* {activeTour && isOnboardingActive && !isChecking && (
        <OnboardingTour
          tourId={activeTour}
          onComplete={() => handleTourComplete(activeTour)}
          onSkip={() => handleTourSkip(activeTour)}
        />
      )} */}
    </>
  )
}