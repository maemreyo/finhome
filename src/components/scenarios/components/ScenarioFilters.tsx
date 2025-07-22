// src/components/scenarios/components/ScenarioFilters.tsx

'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScenarioFiltersProps {
  filterRiskLevel: 'all' | 'low' | 'medium' | 'high'
  filterType: 'all' | 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'
  onFilterRiskLevelChange: (level: 'all' | 'low' | 'medium' | 'high') => void
  onFilterTypeChange: (type: 'all' | 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test') => void
  onClearFilters: () => void
}

const ScenarioFilters: React.FC<ScenarioFiltersProps> = ({
  filterRiskLevel,
  filterType,
  onFilterRiskLevelChange,
  onFilterTypeChange,
  onClearFilters
}) => {
  const t = useTranslations('ScenarioFilters')
  const [isExpanded, setIsExpanded] = useState(false)

  const riskLevels = ['all', 'low', 'medium', 'high'] as const
  const scenarioTypes = ['all', 'baseline', 'optimistic', 'pessimistic', 'alternative', 'stress_test'] as const

  // Check if any filters are active
  const hasActiveFilters = filterRiskLevel !== 'all' || filterType !== 'all'

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center justify-between">
          <button 
            className="flex items-center gap-2 hover:bg-gray-50 -ml-2 p-2 rounded-lg transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className={cn(
              "p-1.5 sm:p-2 rounded-lg transition-colors",
              hasActiveFilters ? "bg-blue-100" : "bg-gray-100"
            )}>
              <Filter className={cn(
                "w-3 h-3 sm:w-4 sm:h-4 transition-colors",
                hasActiveFilters ? "text-blue-600" : "text-gray-600"
              )} />
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-900">
              {t('title')} {hasActiveFilters && <span className="text-blue-600">({
                [filterRiskLevel !== 'all' ? 1 : 0, filterType !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)
              })</span>}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            {t('clearAll')}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {/* Collapsible Content */}
      {isExpanded && (
        <CardContent className="pt-0 space-y-3 sm:space-y-4">
          {/* Risk Level Filters */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium text-gray-700">{t('riskLevel')}</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {riskLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => onFilterRiskLevelChange(level)}
                  className={cn(
                    'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all',
                    filterRiskLevel === level
                      ? 'bg-blue-100 text-blue-700 border-blue-300 border-2'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  )}
                >
                  {t(level)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Scenario Type Filters */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium text-gray-700">{t('type')}</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {scenarioTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => onFilterTypeChange(type)}
                  className={cn(
                    'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all',
                    filterType === type
                      ? 'bg-purple-100 text-purple-700 border-purple-300 border-2'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  )}
                >
                  {type === 'stress_test' ? t('stressTest') : t(type)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      )}
      
      {/* Compact view when collapsed */}
      {!isExpanded && hasActiveFilters && (
        <CardContent className="pt-0 pb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Active filters:</span>
            {filterRiskLevel !== 'all' && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {t(filterRiskLevel)} risk
              </span>
            )}
            {filterType !== 'all' && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {filterType === 'stress_test' ? t('stressTest') : t(filterType)}
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default ScenarioFilters