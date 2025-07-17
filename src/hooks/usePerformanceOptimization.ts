// src/hooks/usePerformanceOptimization.ts
// UPDATED: 2025-07-16 - Updated property references to use new FinancialScenario interface with calculatedMetrics
// React hooks for performance optimization in financial planning components

import { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { 
  optimizedFinancialCalculations, 
  calculationCache, 
  dataCache,
  performanceMonitor
} from '@/lib/performance/optimization'
import type { TimelineScenario } from '@/components/timeline/TimelineVisualization'
import type { FinancialPlan } from '@/components/financial-plans/PlansList'

// Optimized financial calculations hook
export function useOptimizedFinancialCalculations(
  principal: number,
  rate: number,
  termMonths: number,
  monthlyIncome: number,
  monthlyExpenses: number
) {
  const calculations = useMemo(() => {
    const cacheKey = `financial_calc_${principal}_${rate}_${termMonths}_${monthlyIncome}_${monthlyExpenses}`
    
    // Check cache first
    const cached = calculationCache.get(cacheKey)
    if (cached) return cached

    performanceMonitor.markStart('financial-calculations')
    
    const monthlyPayment = optimizedFinancialCalculations.monthlyPayment(principal, rate, termMonths)
    const totalInterest = optimizedFinancialCalculations.totalInterest(principal, rate, termMonths)
    const affordabilityScore = optimizedFinancialCalculations.affordabilityScore(monthlyPayment, monthlyIncome, monthlyExpenses)
    
    const totalCost = principal + totalInterest
    const dtiRatio = (monthlyPayment / monthlyIncome) * 100
    const ltvRatio = (principal / (principal + (principal * 0.25))) * 100 // Assuming 25% down payment
    
    const result = {
      monthlyPayment,
      totalInterest,
      totalCost,
      affordabilityScore,
      dtiRatio,
      ltvRatio
    }
    
    // Cache the result
    calculationCache.set(cacheKey, result)
    
    performanceMonitor.markEnd('financial-calculations')
    
    return result
  }, [principal, rate, termMonths, monthlyIncome, monthlyExpenses])

  return calculations
}

// Optimized scenario comparison hook
export function useOptimizedScenarioComparison(scenarios: TimelineScenario[]) {
  const comparison = useMemo(() => {
    if (scenarios.length === 0) return null

    performanceMonitor.markStart('scenario-comparison')
    
    const sortedByTotalCost = [...scenarios].sort((a, b) => (a.calculatedMetrics?.totalCost || 0) - (b.calculatedMetrics?.totalCost || 0))
    const sortedByMonthlyPayment = [...scenarios].sort((a, b) => (a.calculatedMetrics?.monthlyPayment || 0) - (b.calculatedMetrics?.monthlyPayment || 0))
    const sortedByDuration = [...scenarios].sort((a, b) => (a.calculatedMetrics?.payoffTimeMonths || 0) - (b.calculatedMetrics?.payoffTimeMonths || 0))
    
    const bestScenario = sortedByTotalCost[0]
    const worstScenario = sortedByTotalCost[sortedByTotalCost.length - 1]
    
    const averageMetrics = {
      totalCost: scenarios.reduce((sum, s) => sum + (s.calculatedMetrics?.totalCost || 0), 0) / scenarios.length,
      monthlyPayment: scenarios.reduce((sum, s) => sum + (s.calculatedMetrics?.monthlyPayment || 0), 0) / scenarios.length,
      totalDuration: scenarios.reduce((sum, s) => sum + (s.calculatedMetrics?.payoffTimeMonths || 0), 0) / scenarios.length,
      totalInterest: scenarios.reduce((sum, s) => sum + (s.calculatedMetrics?.totalInterest || 0), 0) / scenarios.length
    }
    
    const riskDistribution = scenarios.reduce((acc, scenario) => {
      acc[scenario.riskLevel] = (acc[scenario.riskLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const result = {
      bestScenario,
      worstScenario,
      averageMetrics,
      riskDistribution,
      sortedByTotalCost,
      sortedByMonthlyPayment,
      sortedByDuration
    }
    
    performanceMonitor.markEnd('scenario-comparison')
    
    return result
  }, [scenarios])

  return comparison
}

// Optimized plan filtering hook
export function useOptimizedPlanFiltering(
  plans: FinancialPlan[],
  filters: {
    search?: string
    status?: string
    planType?: string
    minAmount?: number
    maxAmount?: number
  }
) {
  const filteredPlans = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) return plans

    const cacheKey = `filtered_plans_${JSON.stringify(filters)}`
    const cached = dataCache.get(cacheKey)
    if (cached) return cached

    performanceMonitor.markStart('plan-filtering')
    
    let filtered = plans
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(plan => 
        plan.planName.toLowerCase().includes(searchLower) ||
        plan.planDescription?.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters.status) {
      filtered = filtered.filter(plan => plan.planStatus === filters.status)
    }
    
    if (filters.planType) {
      filtered = filtered.filter(plan => plan.planType === filters.planType)
    }
    
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(plan => plan.purchasePrice >= filters.minAmount!)
    }
    
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(plan => plan.purchasePrice <= filters.maxAmount!)
    }
    
    dataCache.set(cacheKey, filtered)
    
    performanceMonitor.markEnd('plan-filtering')
    
    return filtered
  }, [plans, filters])

  return filteredPlans
}

// Optimized data fetching hook with caching
export function useOptimizedDataFetching<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  dependencies: React.DependencyList = [],
  ttl: number = 5 * 60 * 1000 // 5 minutes default TTL
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = dataCache.get(cacheKey)
    if (cached) {
      setData(cached)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      performanceMonitor.markStart(`data-fetch-${cacheKey}`)
      const result = await fetchFn()
      
      setData(result)
      dataCache.set(cacheKey, result, ttl)
      
      performanceMonitor.markEnd(`data-fetch-${cacheKey}`)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, cacheKey, ttl])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  const refetch = useCallback(() => {
    dataCache.delete(cacheKey)
    fetchData()
  }, [cacheKey, fetchData])

  return { data, loading, error, refetch }
}

// Optimized form validation hook
export function useOptimizedFormValidation<T>(
  values: T,
  validationRules: Record<keyof T, (value: any) => string | null>,
  debounceMs: number = 300
) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isValid, setIsValid] = useState(false)
  const validationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const validateField = useCallback((field: keyof T, value: any) => {
    const rule = validationRules[field]
    if (!rule) return null
    
    return rule(value)
  }, [validationRules])

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let formIsValid = true

    for (const field in values) {
      const error = validateField(field, values[field])
      if (error) {
        newErrors[field] = error
        formIsValid = false
      }
    }

    setErrors(newErrors)
    setIsValid(formIsValid)
    
    return formIsValid
  }, [values, validateField])

  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }

    validationTimeoutRef.current = setTimeout(() => {
      validateForm()
    }, debounceMs)

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [values, validateForm, debounceMs])

  return { errors, isValid, validateForm }
}

// Optimized list rendering hook with virtualization
export function useOptimizedListRendering<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    )
    
    const visibleStartIndex = Math.max(0, startIndex - overscan)
    
    return {
      items: items.slice(visibleStartIndex, endIndex),
      startIndex: visibleStartIndex,
      totalHeight: items.length * itemHeight,
      offsetY: visibleStartIndex * itemHeight
    }
  }, [items, itemHeight, containerHeight, overscan, scrollTop])

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight,
    offsetY: visibleItems.offsetY
  }
}

// Performance metrics hook
export function usePerformanceMetrics(componentName: string) {
  const renderCount = useRef(0)
  const mountTime = useRef(Date.now())
  const lastRenderTime = useRef(Date.now())
  
  useEffect(() => {
    renderCount.current += 1
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime.current
    lastRenderTime.current = now
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - Render #${renderCount.current}, Time since last: ${timeSinceLastRender}ms`)
    }
  })

  const getMetrics = useCallback(() => ({
    renderCount: renderCount.current,
    mountTime: mountTime.current,
    timeSinceMount: Date.now() - mountTime.current,
    averageRenderTime: (Date.now() - mountTime.current) / renderCount.current
  }), [])

  return { getMetrics }
}

// Cache management hook
export function useCacheManagement() {
  const clearAllCaches = useCallback(() => {
    calculationCache.clear()
    dataCache.clear()
  }, [])

  const clearCalculationCache = useCallback(() => {
    calculationCache.clear()
  }, [])

  const clearDataCache = useCallback(() => {
    dataCache.clear()
  }, [])

  const getCacheStats = useCallback(() => ({
    calculationCacheSize: calculationCache.size(),
    dataCacheSize: dataCache.size()
  }), [])

  return {
    clearAllCaches,
    clearCalculationCache,
    clearDataCache,
    getCacheStats
  }
}

const performanceOptimizationHooks = {
  useOptimizedFinancialCalculations,
  useOptimizedScenarioComparison,
  useOptimizedPlanFiltering,
  useOptimizedDataFetching,
  useOptimizedFormValidation,
  useOptimizedListRendering,
  usePerformanceMetrics,
  useCacheManagement
}

export default performanceOptimizationHooks