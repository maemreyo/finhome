// src/lib/performance/optimization.ts
// Performance optimization utilities including memoization, caching, and React optimizations

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'

// Simple in-memory cache implementation
class SimpleCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; ttl: number }>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  set(key: string, value: T, ttl = 5 * 60 * 1000): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  size(): number {
    return this.cache.size
  }
}

// Global cache instances
export const calculationCache = new SimpleCache<any>(50)
export const dataCache = new SimpleCache<any>(200)

// Memoization decorator for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Debounce hook for expensive operations
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for frequent operations
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef<number>(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

// Memoized calculation hook
export function useMemoizedCalculation<T>(
  calculationFn: () => T,
  dependencies: React.DependencyList,
  cacheKey?: string
): T {
  return useMemo(() => {
    if (cacheKey) {
      const cached = calculationCache.get(cacheKey)
      if (cached) return cached
    }

    const result = calculationFn()
    
    if (cacheKey) {
      calculationCache.set(cacheKey, result)
    }

    return result
  }, dependencies)
}

// Optimized event handler hook
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies)
}

// Virtual scrolling utilities
export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const [scrollTop, setScrollTop] = useState(0)
  const { itemHeight, containerHeight, overscan = 5 } = options

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    )

    return {
      start: Math.max(0, start - overscan),
      end
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  const virtualItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight

  return {
    virtualItems,
    totalHeight,
    setScrollTop,
    scrollTop
  }
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry)
    }, options)

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return entry
}

// Performance monitoring hook
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number | undefined>(undefined)
  const measurements = useRef<number[]>([])

  const start = useCallback(() => {
    startTime.current = performance.now()
  }, [])

  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current
      measurements.current.push(duration)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${name}: ${duration.toFixed(2)}ms`)
      }
    }
  }, [name])

  const getAverageTime = useCallback(() => {
    if (measurements.current.length === 0) return 0
    const sum = measurements.current.reduce((a, b) => a + b, 0)
    return sum / measurements.current.length
  }, [])

  const reset = useCallback(() => {
    measurements.current = []
  }, [])

  return { start, end, getAverageTime, reset }
}

// Optimized financial calculations with caching
export const optimizedFinancialCalculations = {
  // Memoized monthly payment calculation
  monthlyPayment: memoize(
    (principal: number, rate: number, termMonths: number) => {
      const monthlyRate = rate / 100 / 12
      const factor = Math.pow(1 + monthlyRate, termMonths)
      return (principal * monthlyRate * factor) / (factor - 1)
    },
    (principal, rate, termMonths) => `monthly_${principal}_${rate}_${termMonths}`
  ),

  // Memoized total interest calculation
  totalInterest: memoize(
    (principal: number, rate: number, termMonths: number) => {
      const monthlyPayment = optimizedFinancialCalculations.monthlyPayment(principal, rate, termMonths)
      return (monthlyPayment * termMonths) - principal
    },
    (principal, rate, termMonths) => `interest_${principal}_${rate}_${termMonths}`
  ),

  // Memoized affordability score calculation
  affordabilityScore: memoize(
    (monthlyPayment: number, monthlyIncome: number, monthlyExpenses: number) => {
      const dtiRatio = monthlyPayment / monthlyIncome
      const availableIncome = monthlyIncome - monthlyExpenses
      const paymentRatio = monthlyPayment / availableIncome
      
      let score = 10
      if (dtiRatio > 0.28) score -= 3
      if (dtiRatio > 0.36) score -= 2
      if (paymentRatio > 0.5) score -= 3
      if (paymentRatio > 0.7) score -= 2
      
      return Math.max(0, Math.min(10, score))
    },
    (monthlyPayment, monthlyIncome, monthlyExpenses) => 
      `affordability_${monthlyPayment}_${monthlyIncome}_${monthlyExpenses}`
  )
}

// React.memo wrapper with custom comparison
export function createMemoizedComponent<T extends React.ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: Readonly<React.ComponentProps<T>>, nextProps: Readonly<React.ComponentProps<T>>) => boolean
) {
  return React.memo(Component, areEqual)
}

// Shallow comparison for React.memo
export function shallowEqual<T extends Record<string, any>>(obj1: T, obj2: T): boolean {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}

// Bundle size optimization utilities
export const dynamicImport = {
  // Lazy load components
  lazy: <T extends React.ComponentType<any>>(importFn: () => Promise<{ default: T }>) => {
    return React.lazy(importFn)
  },

  // Preload components
  preload: <T extends React.ComponentType<any>>(importFn: () => Promise<{ default: T }>) => {
    return importFn()
  }
}

// Web Worker utilities for heavy computations
export class WorkerManager {
  private workers: Map<string, Worker> = new Map()

  createWorker(name: string, workerScript: string): Worker {
    if (this.workers.has(name)) {
      return this.workers.get(name)!
    }

    const worker = new Worker(workerScript)
    this.workers.set(name, worker)
    return worker
  }

  terminateWorker(name: string): void {
    const worker = this.workers.get(name)
    if (worker) {
      worker.terminate()
      this.workers.delete(name)
    }
  }

  terminateAllWorkers(): void {
    this.workers.forEach((worker, name) => {
      worker.terminate()
    })
    this.workers.clear()
  }
}

export const workerManager = new WorkerManager()

// Performance best practices
export const performanceTips = {
  // Use these patterns for better performance
  patterns: {
    // Use keys for dynamic lists
    keyedList: (items: any[]) => items.map((item, index) => ({ ...item, key: item.id || index }))
  },

  // Common anti-patterns to avoid
  antiPatterns: {
    // Don't do this: () => { /* function */ }
    // Don't do this: { prop: value }
    // Don't do this: array.map without keys
  }
}

// Export performance monitoring functions
export const performanceMonitor = {
  markStart: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`)
    }
  },

  markEnd: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }
  },

  getEntries: () => {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      return performance.getEntriesByType('measure')
    }
    return []
  }
}

