// src/components/common/EnhancedLoadingStates.tsx
// Enhanced loading states with better UX and more comprehensive skeleton components

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Enhanced skeleton components with better animations
export const AnimatedSkeleton: React.FC<{
  className?: string
  variant?: 'default' | 'shimmer' | 'pulse'
}> = ({ className, variant = 'shimmer' }) => {
  const baseClasses = "bg-gray-200 rounded-md"
  
  switch (variant) {
    case 'shimmer':
      return (
        <div className={cn(baseClasses, "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer", className)} />
      )
    case 'pulse':
      return (
        <div className={cn(baseClasses, "animate-pulse", className)} />
      )
    default:
      return (
        <Skeleton className={className} />
      )
  }
}

// Enhanced plans loading with better structure
export const EnhancedPlansLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <AnimatedSkeleton className="h-8 w-64 mb-2" />
          <AnimatedSkeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <AnimatedSkeleton className="h-10 w-24" />
          <AnimatedSkeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <AnimatedSkeleton className="h-10 w-32" />
            <AnimatedSkeleton className="h-10 w-32" />
            <AnimatedSkeleton className="h-10 w-48" />
            <AnimatedSkeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Plans grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AnimatedSkeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <AnimatedSkeleton className="h-4 w-32 mb-1" />
                      <AnimatedSkeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <AnimatedSkeleton className="w-12 h-6 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <AnimatedSkeleton className="h-3 w-16 mb-1" />
                    <AnimatedSkeleton className="h-4 w-20" />
                  </div>
                  <div>
                    <AnimatedSkeleton className="h-3 w-16 mb-1" />
                    <AnimatedSkeleton className="h-4 w-20" />
                  </div>
                </div>
                <div>
                  <AnimatedSkeleton className="h-3 w-20 mb-2" />
                  <AnimatedSkeleton className="h-2 w-full" />
                </div>
                <div className="flex gap-2">
                  <AnimatedSkeleton className="h-8 flex-1" />
                  <AnimatedSkeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Enhanced scenario comparison loading
export const EnhancedScenarioLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <AnimatedSkeleton className="h-8 w-80 mb-2" />
          <AnimatedSkeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <AnimatedSkeleton className="h-10 w-32" />
          <AnimatedSkeleton className="h-10 w-24" />
          <AnimatedSkeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['Comparison', 'Charts', 'Analysis'].map((tab, i) => (
          <AnimatedSkeleton key={i} className="h-8 w-24 rounded-md" />
        ))}
      </div>

      {/* Content skeleton */}
      <Card>
        <CardHeader>
          <AnimatedSkeleton className="h-6 w-48" />
          <AnimatedSkeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          {/* Table skeleton */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <AnimatedSkeleton key={i} className="h-12 w-full" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <AnimatedSkeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced property search loading
export const EnhancedPropertySearchLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Search filters skeleton */}
      <Card>
        <CardHeader>
          <AnimatedSkeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <AnimatedSkeleton className="h-4 w-16 mb-2" />
              <AnimatedSkeleton className="h-10 w-full" />
            </div>
            <div>
              <AnimatedSkeleton className="h-4 w-16 mb-2" />
              <AnimatedSkeleton className="h-10 w-full" />
            </div>
            <div>
              <AnimatedSkeleton className="h-4 w-16 mb-2" />
              <AnimatedSkeleton className="h-10 w-full" />
            </div>
            <div>
              <AnimatedSkeleton className="h-4 w-16 mb-2" />
              <AnimatedSkeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map skeleton */}
      <Card>
        <CardContent className="p-0">
          <AnimatedSkeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Results skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="relative">
                <AnimatedSkeleton className="h-48 w-full" />
                <div className="absolute top-2 right-2">
                  <AnimatedSkeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <AnimatedSkeleton className="h-5 w-3/4" />
                  <AnimatedSkeleton className="h-4 w-1/2" />
                  
                  <div className="flex justify-between items-center">
                    <AnimatedSkeleton className="h-4 w-16" />
                    <AnimatedSkeleton className="h-4 w-12" />
                  </div>
                  
                  <div className="flex gap-2">
                    <AnimatedSkeleton className="h-6 w-12" />
                    <AnimatedSkeleton className="h-6 w-12" />
                    <AnimatedSkeleton className="h-6 w-12" />
                  </div>
                  
                  <AnimatedSkeleton className="h-6 w-24" />
                  
                  <div className="flex gap-2">
                    <AnimatedSkeleton className="h-9 flex-1" />
                    <AnimatedSkeleton className="h-9 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Enhanced dashboard loading
export const EnhancedDashboardLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <AnimatedSkeleton className="h-8 w-48 mb-2" />
          <AnimatedSkeleton className="h-4 w-72" />
        </div>
        <AnimatedSkeleton className="h-10 w-32" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <AnimatedSkeleton className="h-4 w-20" />
                  <AnimatedSkeleton className="h-8 w-16" />
                </div>
                <AnimatedSkeleton className="w-12 h-12 rounded-full" />
              </div>
              <div className="mt-4">
                <AnimatedSkeleton className="h-2 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <AnimatedSkeleton className="h-6 w-32" />
            <AnimatedSkeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <AnimatedSkeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <AnimatedSkeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <AnimatedSkeleton className="h-4 w-24" />
                <AnimatedSkeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Progress tracking loading
export const EnhancedProgressTrackingLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Progress overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <AnimatedSkeleton className="h-6 w-48 mb-2" />
              <AnimatedSkeleton className="h-4 w-72" />
            </div>
            <AnimatedSkeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <AnimatedSkeleton className="h-4 w-32" />
              <AnimatedSkeleton className="h-4 w-12" />
            </div>
            <AnimatedSkeleton className="h-3 w-full" />
            
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <AnimatedSkeleton className="h-8 w-full mb-1" />
                  <AnimatedSkeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <AnimatedSkeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <AnimatedSkeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <AnimatedSkeleton className="h-4 w-48 mb-1" />
                  <AnimatedSkeleton className="h-3 w-32" />
                </div>
                <AnimatedSkeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Smart loading with progressive enhancement
export const SmartLoadingState: React.FC<{
  type: 'plans' | 'scenarios' | 'properties' | 'dashboard' | 'progress'
  itemCount?: number
}> = ({ type, itemCount = 6 }) => {
  const LoadingComponent = {
    plans: EnhancedPlansLoading,
    scenarios: EnhancedScenarioLoading,
    properties: EnhancedPropertySearchLoading,
    dashboard: EnhancedDashboardLoading,
    progress: EnhancedProgressTrackingLoading
  }[type]

  return (
    <div className="animate-in fade-in-50 duration-300">
      <LoadingComponent />
    </div>
  )
}

// Loading overlay with blur effect
export const LoadingOverlay: React.FC<{
  isVisible: boolean
  message?: string
  progress?: number
  children: React.ReactNode
}> = ({ isVisible, message = 'Loading...', progress, children }) => {
  return (
    <div className="relative">
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 text-center max-w-xs">
            <div className="mb-4">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <motion.div
                  className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
            <p className="text-gray-700 font-medium mb-2">{message}</p>
            {progress !== undefined && (
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Export all enhanced loading states
const EnhancedLoadingStates = {
  Skeleton: AnimatedSkeleton,
  Plans: EnhancedPlansLoading,
  Scenarios: EnhancedScenarioLoading,
  Properties: EnhancedPropertySearchLoading,
  Dashboard: EnhancedDashboardLoading,
  Progress: EnhancedProgressTrackingLoading,
  Smart: SmartLoadingState,
  Overlay: LoadingOverlay
}

export default EnhancedLoadingStates