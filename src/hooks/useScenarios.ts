// src/hooks/useScenarios.ts
// React hooks for scenario management

import { useState, useEffect, useCallback } from 'react'
import { scenarioService, type ScenarioFilters, type ScenarioStats } from '@/lib/services/scenarioService'
import type {
  FinancialScenario,
  ScenarioParameters,
  ScenarioComparison,
  ScenarioAnalysisResult,
  CreateScenarioRequest
} from '@/types/scenario'
import { toast } from 'sonner'

export interface UseScenarios {
  scenarios: FinancialScenario[]
  loading: boolean
  error: string | null
  refreshScenarios: () => Promise<void>
  createScenario: (request: CreateScenarioRequest) => Promise<FinancialScenario>
  updateScenario: (id: string, parameters: Partial<ScenarioParameters>) => Promise<FinancialScenario>
  deleteScenario: (id: string) => Promise<void>
  generatePredefinedScenarios: (baseScenarioId: string) => Promise<FinancialScenario[]>
}

export interface UseScenarioComparison {
  comparison: ScenarioComparison | null
  loading: boolean
  error: string | null
  compareScenarios: (scenarioIds: string[]) => Promise<void>
  clearComparison: () => void
}

export interface UseScenarioAnalysis {
  analysis: ScenarioAnalysisResult | null
  loading: boolean
  error: string | null
  analyzeScenario: (scenarioId: string) => Promise<void>
  clearAnalysis: () => void
}

export interface UseScenarioStats {
  stats: ScenarioStats | null
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
}

/**
 * Hook for managing user scenarios
 */
export function useScenarios(userId: string, filters?: ScenarioFilters): UseScenarios {
  const [scenarios, setScenarios] = useState<FinancialScenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshScenarios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await scenarioService.getUserScenarios(userId, filters)
      setScenarios(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scenarios'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [userId, filters])

  const createScenario = useCallback(async (request: CreateScenarioRequest): Promise<FinancialScenario> => {
    try {
      setError(null)
      const result = await scenarioService.createScenario(request)
      await refreshScenarios()
      toast.success('Scenario created successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create scenario'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [refreshScenarios])

  const updateScenario = useCallback(async (id: string, parameters: Partial<ScenarioParameters>): Promise<FinancialScenario> => {
    try {
      setError(null)
      const result = await scenarioService.updateScenario(id, parameters)
      await refreshScenarios()
      toast.success('Scenario updated successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update scenario'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [refreshScenarios])

  const deleteScenario = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await scenarioService.deleteScenario(id)
      await refreshScenarios()
      toast.success('Scenario deleted successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete scenario'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [refreshScenarios])

  const generatePredefinedScenarios = useCallback(async (baseScenarioId: string): Promise<FinancialScenario[]> => {
    try {
      setError(null)
      const result = await scenarioService.generatePredefinedScenarios(baseScenarioId, userId)
      await refreshScenarios()
      toast.success(`Generated ${result.length} scenarios successfully`)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate scenarios'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [userId, refreshScenarios])

  useEffect(() => {
    if (userId) {
      refreshScenarios()
    }
  }, [userId, refreshScenarios])

  return {
    scenarios,
    loading,
    error,
    refreshScenarios,
    createScenario,
    updateScenario,
    deleteScenario,
    generatePredefinedScenarios
  }
}

/**
 * Hook for scenario comparison
 */
export function useScenarioComparison(): UseScenarioComparison {
  const [comparison, setComparison] = useState<ScenarioComparison | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const compareScenarios = useCallback(async (scenarioIds: string[]) => {
    try {
      setLoading(true)
      setError(null)
      const result = await scenarioService.compareScenarios(scenarioIds)
      setComparison(result)
      toast.success('Scenarios compared successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compare scenarios'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearComparison = useCallback(() => {
    setComparison(null)
    setError(null)
  }, [])

  return {
    comparison,
    loading,
    error,
    compareScenarios,
    clearComparison
  }
}

/**
 * Hook for scenario analysis
 */
export function useScenarioAnalysis(): UseScenarioAnalysis {
  const [analysis, setAnalysis] = useState<ScenarioAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeScenario = useCallback(async (scenarioId: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await scenarioService.analyzeScenario(scenarioId)
      setAnalysis(result)
      toast.success('Scenario analysis completed')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze scenario'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearAnalysis = useCallback(() => {
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    analysis,
    loading,
    error,
    analyzeScenario,
    clearAnalysis
  }
}

/**
 * Hook for scenario statistics
 */
export function useScenarioStats(userId: string): UseScenarioStats {
  const [stats, setStats] = useState<ScenarioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await scenarioService.getScenarioStats(userId)
      setStats(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scenario statistics'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      refreshStats()
    }
  }, [userId, refreshStats])

  return {
    stats,
    loading,
    error,
    refreshStats
  }
}

/**
 * Hook for getting a single scenario by ID
 */
export function useScenario(scenarioId: string | null) {
  const [scenario, setScenario] = useState<FinancialScenario | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!scenarioId) {
      setScenario(null)
      return
    }

    const fetchScenario = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await scenarioService.getScenarioById(scenarioId)
        setScenario(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load scenario'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchScenario()
  }, [scenarioId])

  return { scenario, loading, error }
}