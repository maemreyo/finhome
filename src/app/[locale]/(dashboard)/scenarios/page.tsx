// src/app/[locale]/(dashboard)/scenarios/page.tsx
// UPDATED: 2025-01-16 - Refactored large component into smaller, manageable components

'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import LoadingStates from '@/components/common/LoadingStates'
import { useAuth } from '@/hooks/useAuth'
import type { TimelineScenario, ScenarioParameters, FinancialScenario } from '@/types/scenario'

// Import our new modular components
import ScenarioPageHeader from '@/components/scenarios/components/ScenarioPageHeader'
import ScenarioFilters from '@/components/scenarios/components/ScenarioFilters'
import ScenarioGrid from '@/components/scenarios/components/ScenarioGrid'
import ScenarioTabs from '@/components/scenarios/components/ScenarioTabs'
import AIAnalysisModal from '@/components/scenarios/components/AIAnalysisModal'

// Import custom hooks
import { useScenarioManagement } from '@/components/scenarios/hooks/useScenarioManagement'
import { useScenarioFilters } from '@/components/scenarios/hooks/useScenarioFilters'
import { useScenarioExport } from '@/components/scenarios/hooks/useScenarioExport'

const EnhancedScenariosPage: React.FC = () => {
  const t = useTranslations('Dashboard.enhancedScenarios')
  const { user } = useAuth()
  
  // State for UI components
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingScenario, setEditingScenario] = useState<TimelineScenario | null>(null)

  // Custom hooks for business logic
  const {
    scenarios,
    selectedScenarioIds,
    isLoading,
    isLoadingDb,
    smartScenariosLoading,
    scenarioLimitReached,
    maxScenarios,
    chartScenarios,
    aiAnalysis,
    isAIAnalysisModalOpen,
    handleScenarioSelect,
    handleSaveScenario,
    handleDeleteScenario,
    handleGenerateSmartScenarios,
    setSelectedScenarioIds,
    setScenarios,
    setIsAIAnalysisModalOpen
  } = useScenarioManagement(t)

  const {
    filterRiskLevel,
    filterType,
    filteredScenarios,
    setFilterRiskLevel,
    setFilterType,
    clearFilters
  } = useScenarioFilters(scenarios)

  const { handleExportScenarios } = useScenarioExport()

  // Event handlers
  const handleParametersChange = (parameters: ScenarioParameters) => {
    // Update base scenario with new parameters
    console.log('Parameters changed:', parameters)
  }

  const handleScenarioUpdate = (scenario: FinancialScenario) => {
    // Update the scenario in our list
    const updatedScenarios = scenarios.map(s => 
      s.id === scenario.id ? { ...s, ...scenario } : s
    )
    setScenarios(updatedScenarios)
  }

  const handleScenarioChange = (scenario: TimelineScenario) => {
    // This is called during editing - we could show a live preview here
  }

  const handleSaveScenarioWrapper = (scenario: TimelineScenario) => {
    const isEditing = !!editingScenario
    handleSaveScenario(scenario, isEditing)
    setIsCreateDialogOpen(false)
    setEditingScenario(null)
  }

  const handleEditScenario = (scenario: TimelineScenario) => {
    setEditingScenario(scenario)
    setIsCreateDialogOpen(true)
  }

  const handleCreateScenario = () => {
    setEditingScenario(null)
    setIsCreateDialogOpen(true)
  }

  const handleExport = () => {
    handleExportScenarios(scenarios, selectedScenarioIds)
  }

  if (isLoading) {
    return <LoadingStates.Content title={t('loadingScenarios')} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Compact Header Section */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/60">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <ScenarioPageHeader
            filteredScenariosCount={filteredScenarios.length}
            selectedScenarioIds={selectedScenarioIds}
            maxScenarios={maxScenarios}
            userSubscriptionTier={user?.user_metadata?.subscription_tier}
            scenarioLimitReached={scenarioLimitReached}
            smartScenariosLoading={smartScenariosLoading}
            isCreateDialogOpen={isCreateDialogOpen}
            editingScenario={editingScenario}
            scenarios={scenarios}
            onGenerateSmartScenarios={handleGenerateSmartScenarios}
            onCreateDialogChange={setIsCreateDialogOpen}
            onScenarioChange={handleScenarioChange}
            onSaveScenario={handleSaveScenarioWrapper}
            onDeleteScenario={editingScenario ? handleDeleteScenario : undefined}
          />
        </div>
      </div>

      {/* Main Content - Improved Layout */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Filters at Top - Always visible and collapsible */}
        <div className="w-full">
          <ScenarioFilters
            filterRiskLevel={filterRiskLevel}
            filterType={filterType}
            onFilterRiskLevelChange={setFilterRiskLevel}
            onFilterTypeChange={setFilterType}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Main Content Area */}
        <div className="w-full space-y-4 sm:space-y-6">
            {/* Scenario Grid - Streamlined */}
            <Card className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Scenarios</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                    {selectedScenarioIds.length > 0 && (
                      <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                        {selectedScenarioIds.length} selected
                      </div>
                    )}
                  </div>
                </div>
                <ScenarioGrid
                  scenarios={filteredScenarios}
                  selectedScenarioIds={selectedScenarioIds}
                  onScenarioSelect={handleScenarioSelect}
                  onEditScenario={handleEditScenario}
                  onDeleteScenario={handleDeleteScenario}
                  onCreateScenario={handleCreateScenario}
                />
              </CardContent>
            </Card>

            {/* Analysis Tabs - Only show if scenarios exist */}
            {scenarios.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border-0 overflow-hidden">
                <ScenarioTabs
                  scenarios={scenarios}
                  chartScenarios={chartScenarios}
                  selectedScenarioIds={selectedScenarioIds}
                  chartType={chartType}
                  onScenarioSelect={handleScenarioSelect}
                  onChartTypeChange={setChartType}
                  onParametersChange={handleParametersChange}
                  onScenarioUpdate={handleScenarioUpdate}
                />
              </div>
            )}
        </div>

        {/* AI Analysis Modal */}
        {aiAnalysis && (
          <AIAnalysisModal
            isOpen={isAIAnalysisModalOpen}
            onClose={() => setIsAIAnalysisModalOpen(false)}
            analysis={aiAnalysis}
            scenarioCount={scenarios.filter(s => s.id.startsWith('ai-scenario')).length}
          />
        )}
      </div>
    </div>
  )
}

export default EnhancedScenariosPage