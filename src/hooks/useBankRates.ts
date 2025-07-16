// src/hooks/useBankRates.ts
// React hook for managing bank interest rates

import { useState, useEffect, useCallback } from 'react'
import { bankRatesAPI, type BankRate, type BankRateFilters, type OptimalRateRequest, type OptimalRateResponse } from '@/lib/api/bankRates'

export interface UseBankRatesReturn {
  rates: BankRate[]
  isLoading: boolean
  error: string | null
  getRates: (filters?: BankRateFilters) => Promise<void>
  getOptimalRates: (request: OptimalRateRequest) => Promise<OptimalRateResponse | null>
  refreshRates: () => Promise<void>
}

export function useBankRates(initialFilters?: BankRateFilters): UseBankRatesReturn {
  const [rates, setRates] = useState<BankRate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRates = useCallback(async (filters?: BankRateFilters) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const fetchedRates = await bankRatesAPI.getBankRates(filters)
      setRates(fetchedRates)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bank rates'
      setError(errorMessage)
      console.error('Error fetching bank rates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getOptimalRates = useCallback(async (request: OptimalRateRequest): Promise<OptimalRateResponse | null> => {
    try {
      return await bankRatesAPI.getOptimalRates(request)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get optimal rates'
      setError(errorMessage)
      console.error('Error getting optimal rates:', err)
      return null
    }
  }, [])

  const refreshRates = useCallback(async () => {
    await getRates(initialFilters)
  }, [getRates, initialFilters])

  // Load initial rates
  useEffect(() => {
    getRates(initialFilters)
  }, [getRates, initialFilters])

  return {
    rates,
    isLoading,
    error,
    getRates,
    getOptimalRates,
    refreshRates
  }
}

/**
 * Hook specifically for getting optimal rates for a loan scenario
 */
export function useOptimalRates() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOptimalRates = useCallback(async (request: OptimalRateRequest): Promise<OptimalRateResponse | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await bankRatesAPI.getOptimalRates(request)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get optimal rates'
      setError(errorMessage)
      console.error('Error getting optimal rates:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    getOptimalRates,
    isLoading,
    error
  }
}