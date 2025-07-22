// src/components/scenarios/components/ScenarioTabs.tsx

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calculator, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  AlertTriangle
} from 'lucide-react'
import { FeatureGate } from '@/components/subscription/FeatureGate'
import { FeatureBadge } from '@/components/subscription/SubscriptionBadge'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import PremiumUpgradeCard from './PremiumUpgradeCard'
import ScenarioComparisonTable from '@/components/scenarios/ScenarioComparisonTable'
import ScenarioChart from '@/components/scenarios/ScenarioChart'
import AdvancedScenarioCharts from '@/components/scenarios/AdvancedScenarioCharts'
import InteractiveParameterSliders from '@/components/scenarios/InteractiveParameterSliders'
import MonteCarloAnalysis from './MonteCarloAnalysis'
import SmartRecommendations from './SmartRecommendations'
import type { TimelineScenario, FinancialScenario, ScenarioParameters } from '@/types/scenario'

interface ScenarioTabsProps {
  scenarios: TimelineScenario[]
  chartScenarios: FinancialScenario[]
  selectedScenarioIds: string[]
  chartType: 'bar' | 'line' | 'pie' | 'area'
  onScenarioSelect: (scenarioId: string) => void
  onChartTypeChange: (type: 'bar' | 'line' | 'pie' | 'area') => void
  onParametersChange: (parameters: ScenarioParameters) => void
  onScenarioUpdate: (scenario: FinancialScenario) => void
}

const ScenarioTabs: React.FC<ScenarioTabsProps> = ({
  scenarios,
  chartScenarios,
  selectedScenarioIds,
  chartType,
  onScenarioSelect,
  onChartTypeChange,
  onParametersChange,
  onScenarioUpdate
}) => {
  const t = useTranslations('ScenarioTabs')

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <Tabs defaultValue="comparison" className="p-6">
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-gray-100 p-1">
          <TabsTrigger 
            value="comparison" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {t('comparisonTable')}
          </TabsTrigger>
          <TabsTrigger 
            value="charts"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {t('visualCharts')}
          </TabsTrigger>
          <TabsTrigger 
            value="advanced"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {t('advancedCharts')}
            <FeatureBadge featureKey="advanced_analytics" />
          </TabsTrigger>
          <TabsTrigger 
            value="interactive"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('interactiveSliders')}
            <FeatureBadge featureKey="advanced_analytics" />
          </TabsTrigger>
          <TabsTrigger 
            value="analysis"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {t('analysis')}
            <FeatureBadge featureKey="monte_carlo_analysis" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <ErrorBoundary>
            <ScenarioComparisonTable
              scenarios={scenarios}
              selectedScenarioIds={selectedScenarioIds}
              onScenarioSelect={onScenarioSelect}
            />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <ErrorBoundary>
            <ScenarioChart
              scenarios={scenarios}
              selectedScenarioIds={selectedScenarioIds}
              chartType={chartType}
              onChartTypeChange={onChartTypeChange}
            />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <FeatureGate 
            featureKey="advanced_analytics" 
            fallback={
              <PremiumUpgradeCard 
                feature="advanced_analytics"
                size="lg"
                className="max-w-2xl mx-auto"
              />
            }
          >
            <ErrorBoundary>
              {chartScenarios.length > 0 ? (
                <AdvancedScenarioCharts
                  scenarios={chartScenarios.filter(s => selectedScenarioIds.includes(s.id))}
                  selectedMetrics={['monthlyPayment', 'totalCost', 'dtiRatio', 'affordabilityScore']}
                />
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-gray-500">{t('selectScenariosForAdvancedCharts')}</p>
                  </CardContent>
                </Card>
              )}
            </ErrorBoundary>
          </FeatureGate>
        </TabsContent>

        <TabsContent value="interactive" className="space-y-6">
          <FeatureGate 
            featureKey="advanced_analytics"
            fallback={
              <PremiumUpgradeCard 
                feature="advanced_analytics"
                title="Interactive Analysis"
                description="Real-time parameter sliders and sensitivity analysis"
                size="lg"
                className="max-w-2xl mx-auto"
              />
            }
          >
            <ErrorBoundary>
              {chartScenarios.length > 0 && selectedScenarioIds.length > 0 ? (
                <InteractiveParameterSliders
                  baseScenario={chartScenarios.find(s => selectedScenarioIds.includes(s.id)) || chartScenarios[0]}
                  onParametersChange={onParametersChange}
                  onScenarioUpdate={onScenarioUpdate}
                  realTimeMode={true}
                />
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-gray-500">{t('selectScenariosForInteractiveSliders')}</p>
                  </CardContent>
                </Card>
              )}
            </ErrorBoundary>
          </FeatureGate>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <FeatureGate 
            featureKey="monte_carlo_analysis"
            fallback={
              <PremiumUpgradeCard 
                feature="monte_carlo_analysis"
                size="lg"
                className="max-w-2xl mx-auto"
              />
            }
          >
            <div className="space-y-6">
              <MonteCarloAnalysis
                scenarios={scenarios.filter(s => selectedScenarioIds.includes(s.id))}
              />
              <SmartRecommendations
                scenarios={scenarios}
                selectedScenarioIds={selectedScenarioIds}
              />
            </div>
          </FeatureGate>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ScenarioTabs