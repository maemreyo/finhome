// src/components/tutorial/TutorialProvider.tsx
// Tutorial provider component that manages all interactive tutorials

'use client'

import React, { createContext, useContext } from 'react'
import { useInteractiveTutorial } from '@/hooks/useInteractiveTutorial'
import { TutorialOverlay, TutorialPauseOverlay } from './TutorialOverlay'
import { InteractiveTutorial } from '@/types/onboarding'

interface TutorialContextValue {
  activeTutorial: InteractiveTutorial | null
  isActive: boolean
  isPaused: boolean
  startTutorial: (tutorialId: string) => void
  exitTutorial: () => void
  pauseTutorial: () => void
  resumeTutorial: () => void
  shouldShowTutorial: (tutorialId: string) => boolean
  getCompletedTutorials: () => string[]
}

const TutorialContext = createContext<TutorialContextValue | null>(null)

interface TutorialProviderProps {
  children: React.ReactNode
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const tutorialHook = useInteractiveTutorial()

  const value: TutorialContextValue = {
    activeTutorial: tutorialHook.activeTutorial,
    isActive: tutorialHook.isActive,
    isPaused: tutorialHook.isPaused,
    startTutorial: tutorialHook.startTutorial,
    exitTutorial: tutorialHook.exitTutorial,
    pauseTutorial: tutorialHook.pauseTutorial,
    resumeTutorial: tutorialHook.resumeTutorial,
    shouldShowTutorial: tutorialHook.shouldShowTutorial,
    getCompletedTutorials: tutorialHook.getCompletedTutorials
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
      
      {/* Tutorial overlay when active */}
      {tutorialHook.isActive && !tutorialHook.isPaused && (
        <TutorialOverlay />
      )}
      
      {/* Pause overlay when paused */}
      {tutorialHook.isActive && tutorialHook.isPaused && tutorialHook.activeTutorial && (
        <TutorialPauseOverlay
          tutorialName={tutorialHook.activeTutorial.name}
          onResume={tutorialHook.resumeTutorial}
          onExit={tutorialHook.exitTutorial}
        />
      )}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
}

export default TutorialProvider