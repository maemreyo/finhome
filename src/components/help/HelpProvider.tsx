// src/components/help/HelpProvider.tsx
// Context provider for managing global help state

'use client'

import React, { createContext, useContext } from 'react'
import { useContextualHelp } from '@/hooks/useContextualHelp'
import { HelpContextValue } from '@/types/help'

const HelpContext = createContext<HelpContextValue | null>(null)

interface HelpProviderProps {
  children: React.ReactNode
}

export function HelpProvider({ children }: HelpProviderProps) {
  const helpHook = useContextualHelp()

  const value: HelpContextValue = {
    helpState: helpHook.helpState,
    helpContent: helpHook.helpItems,
    showHelp: helpHook.showHelp,
    hideHelp: helpHook.hideHelp,
    dismissHelp: helpHook.dismissHelp,
    toggleGlobalHelp: helpHook.toggleGlobalHelp,
    isHelpVisible: helpHook.isHelpVisible,
    shouldShowHelp: helpHook.shouldShowHelp,
    updateHelpPreference: helpHook.updateHelpPreference,
    registerHelpItem: helpHook.registerHelpItem,
    unregisterHelpItem: helpHook.unregisterHelpItem
  }

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  )
}

export function useHelp() {
  const context = useContext(HelpContext)
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider')
  }
  return context
}