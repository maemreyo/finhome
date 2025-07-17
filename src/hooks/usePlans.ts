// src/hooks/usePlans.ts
// Custom hook for managing financial plans with comprehensive error handling

'use client'

import { useState, useEffect, useCallback } from 'react'
import { plansAPI, type FinancialPlanWithMetrics, type CreatePlanRequest, type PlanFilters } from '@/lib/api/plans'
import { useErrorHandler } from './useErrorHandler'

interface UsePlansReturn {
  plans: FinancialPlanWithMetrics[]
  isLoading: boolean
  error: string | null
  totalCount: number
  createPlan: (planData: CreatePlanRequest) => Promise<FinancialPlanWithMetrics>
  updatePlan: (planId: string, updates: Partial<CreatePlanRequest>) => Promise<FinancialPlanWithMetrics>
  updatePlanStatus: (planId: string, status: 'draft' | 'active' | 'completed' | 'archived') => Promise<FinancialPlanWithMetrics>
  deletePlan: (planId: string) => Promise<void>
  refreshPlans: () => Promise<void>
  loadMore: () => Promise<void>
  hasMore: boolean
}

export function usePlans(filters?: PlanFilters): UsePlansReturn {
  const [plans, setPlans] = useState<FinancialPlanWithMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = filters?.limit || 20
  
  const { handlePlanError, withErrorHandling } = useErrorHandler()

  const loadPlans = useCallback(async (resetOffset = false) => {
    try {
      setError(null)
      if (resetOffset) {
        setIsLoading(true)
        setOffset(0)
      }
      
      const currentOffset = resetOffset ? 0 : offset
      const response = await plansAPI.getPlans({
        ...filters,
        limit,
        offset: currentOffset
      })

      if (resetOffset) {
        setPlans(response.data)
      } else {
        setPlans(prev => [...prev, ...response.data])
      }
      
      setTotalCount(response.pagination.total)
      setOffset(currentOffset + response.data.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load plans'
      setError(errorMessage)
      handlePlanError('fetch', () => loadPlans(resetOffset))
    } finally {
      setIsLoading(false)
    }
  }, [filters, limit, offset, handlePlanError])

  const refreshPlans = useCallback(async () => {
    await loadPlans(true)
  }, [loadPlans])

  const loadMore = useCallback(async () => {
    if (plans.length < totalCount) {
      await loadPlans(false)
    }
  }, [loadPlans, plans.length, totalCount])

  const createPlan = useCallback(async (planData: CreatePlanRequest): Promise<FinancialPlanWithMetrics> => {
    const result = await withErrorHandling(async () => {
      const newPlan = await plansAPI.createPlan(planData)
      setPlans(prev => [newPlan, ...prev])
      setTotalCount(prev => prev + 1)
      return newPlan
    }, {
      retryable: true,
      retryAction: () => createPlan(planData)
    })
    
    if (!result) {
      handlePlanError('save')
      throw new Error('Failed to create plan')
    }
    
    return result
  }, [withErrorHandling, handlePlanError])

  const updatePlan = useCallback(async (planId: string, updates: Partial<CreatePlanRequest>): Promise<FinancialPlanWithMetrics> => {
    try {
      setError(null)
      const updatedPlan = await plansAPI.updatePlan(planId, updates)
      setPlans(prev => prev.map(plan => 
        plan.id === planId ? updatedPlan : plan
      ))
      return updatedPlan
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update plan'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updatePlanStatus = useCallback(async (planId: string, status: 'draft' | 'active' | 'completed' | 'archived'): Promise<FinancialPlanWithMetrics> => {
    try {
      setError(null)
      const updatedPlan = await plansAPI.updatePlanStatus(planId, status)
      setPlans(prev => prev.map(plan => 
        plan.id === planId ? updatedPlan : plan
      ))
      return updatedPlan
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update plan status'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deletePlan = useCallback(async (planId: string): Promise<void> => {
    const result = await withErrorHandling(async () => {
      await plansAPI.deletePlan(planId)
      setPlans(prev => prev.filter(plan => plan.id !== planId))
      setTotalCount(prev => prev - 1)
    }, {
      retryAction: () => deletePlan(planId)
    })
    
    if (result === null) {
      handlePlanError('delete')
      throw new Error('Failed to delete plan')
    }
  }, [withErrorHandling, handlePlanError])

  useEffect(() => {
    loadPlans(true)
  }, [loadPlans, filters?.status, filters?.planType, filters?.isPublic, filters?.search])

  const hasMore = plans.length < totalCount

  return {
    plans,
    isLoading,
    error,
    totalCount,
    createPlan,
    updatePlan,
    updatePlanStatus,
    deletePlan,
    refreshPlans,
    loadMore,
    hasMore
  }
}