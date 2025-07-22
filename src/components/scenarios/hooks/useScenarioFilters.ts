// src/components/scenarios/hooks/useScenarioFilters.ts

import { useState, useMemo } from 'react'
import type { TimelineScenario } from '@/types/scenario'

export interface UseScenarioFiltersReturn {
  filterRiskLevel: 'all' | 'low' | 'medium' | 'high'
  filterType: 'all' | 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'
  filteredScenarios: TimelineScenario[]
  setFilterRiskLevel: React.Dispatch<React.SetStateAction<'all' | 'low' | 'medium' | 'high'>>
  setFilterType: React.Dispatch<React.SetStateAction<'all' | 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'>>
  clearFilters: () => void
}

export const useScenarioFilters = (scenarios: TimelineScenario[]): UseScenarioFiltersReturn => {
  const [filterRiskLevel, setFilterRiskLevel] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [filterType, setFilterType] = useState<'all' | 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'>('all')

  // Filtered scenarios based on filters
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(scenario => {
      const matchesRisk = filterRiskLevel === 'all' || scenario.riskLevel === filterRiskLevel
      const matchesType = filterType === 'all' || scenario.scenarioType === filterType
      return matchesRisk && matchesType
    })
  }, [scenarios, filterRiskLevel, filterType])

  const clearFilters = () => {
    setFilterRiskLevel('all')
    setFilterType('all')
  }

  return {
    filterRiskLevel,
    filterType,
    filteredScenarios,
    setFilterRiskLevel,
    setFilterType,
    clearFilters
  }
}