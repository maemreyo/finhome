// src/components/subscription/FeatureGate.tsx
// Component for feature gating and upgrade prompts

'use client'

import React, { useEffect } from 'react'
import { useFeatureAccess } from '@/hooks/useSubscription'
import { FeatureKey } from '@/types/subscription'
import { UpgradePrompt } from './UpgradePrompt'
import { useTranslations } from 'next-intl'

interface FeatureGateProps {
  featureKey: FeatureKey
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  promptStyle?: 'modal' | 'banner' | 'inline' | 'tooltip'
  trackUsage?: boolean
  disabled?: boolean
  className?: string
}

/**
 * FeatureGate component that conditionally renders content based on subscription access
 * 
 * @param featureKey - The feature to check access for
 * @param children - Content to render when user has access
 * @param fallback - Content to render when user doesn't have access (optional)
 * @param showUpgradePrompt - Whether to show upgrade prompt when access is denied
 * @param promptStyle - Style of the upgrade prompt
 * @param trackUsage - Whether to track feature usage when accessed
 * @param disabled - Override to disable the feature entirely
 */
export function FeatureGate({
  featureKey,
  children,
  fallback,
  showUpgradePrompt = true,
  promptStyle = 'inline',
  trackUsage = true,
  disabled = false,
  className
}: FeatureGateProps) {
  const { hasAccess, access, isLoading, trackUsage: track } = useFeatureAccess(featureKey)
  const t = useTranslations('SubscriptionCommon')

  // Track usage when feature is accessed
  useEffect(() => {
    if (hasAccess && trackUsage && !isLoading) {
      track()
    }
  }, [hasAccess, trackUsage, track, isLoading])

  // Show loading state
  if (isLoading) {
    return (
      <div className={`feature-gate-loading ${className || ''}`}>
        <div className="animate-pulse bg-gray-200 rounded h-8 w-full"></div>
      </div>
    )
  }

  // Feature is disabled
  if (disabled) {
    return fallback || (
      <div className={`feature-gate-disabled ${className || ''}`}>
        <p className="text-gray-500 text-sm">{t('feature_temporarily_disabled')}</p>
      </div>
    )
  }

  // User has access - render children
  if (hasAccess) {
    return <div className={`feature-gate-allowed ${className || ''}`}>{children}</div>
  }

  // User doesn't have access
  if (showUpgradePrompt && access) {
    return (
      <div className={`feature-gate-denied ${className || ''}`}>
        <UpgradePrompt 
          featureKey={featureKey}
          access={access}
          style={promptStyle}
        />
        {fallback}
      </div>
    )
  }

  // Show fallback or nothing
  return fallback || null
}

interface UseFeatureGateProps {
  featureKey: FeatureKey
  autoTrack?: boolean
}

/**
 * Hook version of FeatureGate for programmatic access checks
 */
export function useFeatureGate({ featureKey, autoTrack = true }: UseFeatureGateProps) {
  const { hasAccess, access, isLoading, trackUsage } = useFeatureAccess(featureKey)

  const checkAndTrack = async () => {
    if (hasAccess && autoTrack) {
      await trackUsage()
    }
    return hasAccess
  }

  return {
    hasAccess,
    access,
    isLoading,
    checkAndTrack,
    trackUsage
  }
}

interface ConditionalFeatureProps {
  featureKey: FeatureKey
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Simple conditional rendering based on feature access (no upgrade prompts)
 */
export function ConditionalFeature({ featureKey, children, fallback }: ConditionalFeatureProps) {
  const { hasAccess, isLoading } = useFeatureAccess(featureKey)

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-4 w-full"></div>
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

interface FeatureWrapperProps {
  featureKey: FeatureKey
  children: (props: { hasAccess: boolean; access: any; isLoading: boolean }) => React.ReactNode
}

/**
 * Render props pattern for flexible feature access handling
 */
export function FeatureWrapper({ featureKey, children }: FeatureWrapperProps) {
  const { hasAccess, access, isLoading } = useFeatureAccess(featureKey)

  return <>{children({ hasAccess, access, isLoading })}</>
}