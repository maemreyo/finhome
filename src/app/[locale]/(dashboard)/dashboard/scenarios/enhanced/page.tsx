// src/app/[locale]/dashboard/scenarios/enhanced/page.tsx
// Enhanced scenario comparison dashboard with new components

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Download,
  Filter,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

// Import our new components
import ScenarioComparisonTable from '@/components/scenarios/ScenarioComparisonTable'
import ScenarioChart from '@/components/scenarios/ScenarioChart'
import ScenarioParameterEditor from '@/components/scenarios/ScenarioParameterEditor'
import AdvancedScenarioCharts from '@/components/scenarios/AdvancedScenarioCharts'
import InteractiveParameterSliders from '@/components/scenarios/InteractiveParameterSliders'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import LoadingStates from '@/components/common/LoadingStates'
import type { TimelineScenario } from '@/components/timeline/TimelineVisualization'
import { DashboardService } from '@/lib/services/dashboardService'
import { useAuth } from '@/hooks/useAuth'
import type { FinancialScenario, ScenarioParameters } from '@/types/scenario'

// Create a helper function to generate mock scenarios
const createMockScenario = (
  id: string,
  name: string,
  type: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test',
  description: string,
  monthlyPayment: number,
  totalInterest: number,
  totalCost: number,
  duration: number,
  riskLevel: 'low' | 'medium' | 'high'
): TimelineScenario => ({
  id,
  plan_name: name,
  scenarioType: type,
  description,
  riskLevel,
  events: [],
  user_id: 'demo-user-id',
  plan_type: 'home_purchase',
  status: 'draft',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  property_id: null,
  custom_property_data: null,
  target_age: null,
  current_monthly_income: null,
  purchase_price: 3000000000,
  down_payment: 600000000,
  additional_costs: 0,
  other_debts: 0,
  monthly_income: 50000000,
  current_monthly_expenses: null,
  monthly_expenses: 30000000,
  current_savings: null,
  target_timeframe_months: duration,
  expected_roi: 10.5,
  risk_tolerance: 'moderate',
  expected_rental_income: null,
  expected_appreciation_rate: null,
  emergency_fund_target: null,
  dependents: 0,
  target_property_type: null,
  target_location: null,
  target_budget: null,
  investment_purpose: null,
  desired_features: {},
  down_payment_target: null,
  investment_horizon_months: null,
  preferred_banks: null,
  education_fund_target: null,
  retirement_fund_target: null,
  other_goals: {},
  feasibility_score: null,
  recommended_adjustments: {},
  is_public: false,
  view_count: 0,
  cached_calculations: null,
  calculations_last_updated: null,
  completed_at: null,
  calculatedMetrics: {
    monthlyPayment,
    totalInterest,
    totalCost,
    dtiRatio: 35,
    ltvRatio: 80,
    affordabilityScore: 7,
    payoffTimeMonths: duration,
    monthlySavings: 0
  }
})

// Mock scenarios data will be created inside the component where t is available

const EnhancedScenariosPage: React.FC = () => {
  const t = useTranslations('Dashboard')
  const { user } = useAuth()
  const [scenarios, setScenarios] = useState<TimelineScenario[]>([])
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>(['scenario-baseline'])
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar')
  const [filterRiskLevel, setFilterRiskLevel] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [filterType, setFilterType] = useState<'all' | 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingScenario, setEditingScenario] = useState<TimelineScenario | null>(null)
  const [smartScenariosLoading, setSmartScenariosLoading] = useState(false)
  const [baseScenario, setBaseScenario] = useState<FinancialScenario | null>(null)
  const [dbScenarios, setDbScenarios] = useState<any[]>([])
  const [isLoadingDb, setIsLoadingDb] = useState(true)

  // Demo scenarios data for unauthenticated users (minimal fallback)
  const demoScenarios: TimelineScenario[] = useMemo(() => [
    createMockScenario(
      'demo-scenario-1',
      'Kế hoạch mẫu',
      'baseline',
      'Kế hoạch mẫu cho người chưa đăng nhập',
      20500000,
      2920000000,
      5420000000,
      240,
      'medium'
    )
  ], [])

  // Initialize scenarios with demo data only for unauthenticated users
  useEffect(() => {
    if (!user && scenarios.length === 0) {
      setScenarios(demoScenarios)
    }
  }, [user, demoScenarios, scenarios.length])

  // Filtered scenarios based on filters
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(scenario => {
      const matchesRisk = filterRiskLevel === 'all' || scenario.riskLevel === filterRiskLevel
      const matchesType = filterType === 'all' || scenario.scenarioType === filterType
      return matchesRisk && matchesType
    })
  }, [scenarios, filterRiskLevel, filterType])

  // Load database scenarios
  useEffect(() => {
    const loadDbScenarios = async () => {
      try {
        setIsLoadingDb(true)
        if (user?.id) {
          const dbData = await DashboardService.getFinancialScenarios(user.id)
          setDbScenarios(dbData)
          
          // Convert database scenarios to TimelineScenario format
          if (dbData.length > 0) {
            const convertedScenarios = dbData.map(dbScenario => {
              return createMockScenario(
                dbScenario.id,
                dbScenario.scenario_name,
                dbScenario.scenario_type,
                dbScenario.description || 'No description available',
                dbScenario.monthly_payment,
                dbScenario.total_interest,
                dbScenario.total_cost,
                dbScenario.loan_term_months,
                dbScenario.risk_level
              )
            })
            setScenarios(convertedScenarios)
          } else {
            // Use demo scenarios if no database data for authenticated users
            setScenarios(demoScenarios)
          }
        }
      } catch (error) {
        console.error('Error loading database scenarios:', error)
      } finally {
        setIsLoadingDb(false)
      }
    }

    loadDbScenarios()
  }, [user])

  // Convert TimelineScenario to FinancialScenario for charts
  const chartScenarios: FinancialScenario[] = useMemo(() => {
    return scenarios.map(scenario => ({
      ...scenario,
      riskLevel: scenario.riskLevel,
      calculatedMetrics: scenario.calculatedMetrics
    } as FinancialScenario))
  }, [scenarios])

  // Handle parameter changes for interactive sliders
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

  // Handle scenario selection
  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenarioIds(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId)
      } else {
        return [...prev, scenarioId]
      }
    })
  }

  // Handle scenario creation/editing
  const handleScenarioChange = (scenario: TimelineScenario) => {
    // This is called during editing - we could show a live preview here
  }

  const handleSaveScenario = (scenario: TimelineScenario) => {
    if (editingScenario) {
      // Update existing scenario
      setScenarios(prev => prev.map(s => s.id === scenario.id ? scenario : s))
      toast.success('Scenario updated successfully')
    } else {
      // Create new scenario
      setScenarios(prev => [...prev, scenario])
      toast.success('Scenario created successfully')
    }
    
    setIsCreateDialogOpen(false)
    setEditingScenario(null)
  }

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId))
    setSelectedScenarioIds(prev => prev.filter(id => id !== scenarioId))
    toast.success('Scenario deleted successfully')
  }

  const handleGenerateSmartScenarios = async () => {
    setSmartScenariosLoading(true)
    try {
      // Simulate API call to generate smart scenarios
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add some smart scenarios
      const smartScenarios: TimelineScenario[] = [
        createMockScenario(
          `smart-scenario-${Date.now()}`,
          'AI Recommended - Conservative',
          'alternative',
          'AI-generated scenario based on your financial profile',
          22800000,
          2472000000,
          5472000000,
          240,
          'low'
        )
      ]
      
      setScenarios(prev => [...prev, ...smartScenarios])
      toast.success('Smart scenarios generated successfully')
    } catch (error) {
      toast.error('Failed to generate smart scenarios')
    } finally {
      setSmartScenariosLoading(false)
    }
  }

  const handleExportScenarios = () => {
    // Export selected scenarios to CSV or PDF
    const selectedScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id))
    const csvData = selectedScenarios.map(s => ({
      name: s.plan_name,
      type: s.scenarioType,
      monthlyPayment: s.calculatedMetrics?.monthlyPayment || 0,
      totalInterest: s.calculatedMetrics?.totalInterest || 0,
      totalCost: s.calculatedMetrics?.totalCost || 0,
      riskLevel: s.riskLevel
    }))
    
    // Simple CSV export
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scenarios-comparison.csv'
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Scenarios exported successfully')
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-amber-100 text-amber-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'baseline':
        return 'bg-blue-100 text-blue-800'
      case 'optimistic':
        return 'bg-green-100 text-green-800'
      case 'pessimistic':
        return 'bg-red-100 text-red-800'
      case 'alternative':
        return 'bg-purple-100 text-purple-800'
      case 'stress_test':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <LoadingStates.Content title="Loading scenarios..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('enhancedScenarios.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('enhancedScenarios.description')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleGenerateSmartScenarios}
            disabled={smartScenariosLoading}
          >
            {smartScenariosLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {t('enhancedScenarios.generateSmartScenarios')}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportScenarios}
            disabled={selectedScenarioIds.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {t('enhancedScenarios.export')}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('enhancedScenarios.createScenario')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingScenario ? t('enhancedScenarios.editScenario') : t('enhancedScenarios.createNewScenario')}
                </DialogTitle>
              </DialogHeader>
              <ErrorBoundary>
                <ScenarioParameterEditor
                  initialScenario={editingScenario || undefined}
                  onScenarioChange={handleScenarioChange}
                  onSaveScenario={handleSaveScenario}
                  onDeleteScenario={editingScenario ? handleDeleteScenario : undefined}
                />
              </ErrorBoundary>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="risk-filter">Risk Level:</Label>
              <Select value={filterRiskLevel} onValueChange={(value: any) => setFilterRiskLevel(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="type-filter">Type:</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="baseline">Baseline</SelectItem>
                  <SelectItem value="optimistic">Optimistic</SelectItem>
                  <SelectItem value="pessimistic">Pessimistic</SelectItem>
                  <SelectItem value="alternative">Alternative</SelectItem>
                  <SelectItem value="stress_test">Stress Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scenario Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-4 border rounded-lg cursor-pointer transition-all',
                  selectedScenarioIds.includes(scenario.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => handleScenarioSelect(scenario.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Checkbox
                    checked={selectedScenarioIds.includes(scenario.id)}
                    onChange={() => handleScenarioSelect(scenario.id)}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingScenario(scenario)
                        setIsCreateDialogOpen(true)
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteScenario(scenario.id)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-medium text-sm">{scenario.plan_name}</h3>
                <p className="text-xs text-gray-600 mb-2">{scenario.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={cn('text-xs', getTypeColor(scenario.scenarioType))}>
                    {scenario.scenarioType}
                  </Badge>
                  <Badge variant="outline" className={cn('text-xs', getRiskLevelColor(scenario.riskLevel))}>
                    {scenario.riskLevel}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly:</span>
                    <span className="font-medium">{formatCurrency(scenario.calculatedMetrics?.monthlyPayment || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium">{formatCurrency(scenario.calculatedMetrics?.totalCost || 0)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="comparison" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="comparison">Comparison Table</TabsTrigger>
          <TabsTrigger value="charts">Visual Charts</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Charts</TabsTrigger>
          <TabsTrigger value="interactive">Interactive Sliders</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <ErrorBoundary>
            <ScenarioComparisonTable
              scenarios={scenarios}
              selectedScenarioIds={selectedScenarioIds}
              onScenarioSelect={handleScenarioSelect}
            />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <ErrorBoundary>
            <ScenarioChart
              scenarios={scenarios}
              selectedScenarioIds={selectedScenarioIds}
              chartType={chartType}
              onChartTypeChange={setChartType}
            />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <ErrorBoundary>
            {chartScenarios.length > 0 ? (
              <AdvancedScenarioCharts
                scenarios={chartScenarios.filter(s => selectedScenarioIds.includes(s.id))}
                selectedMetrics={['monthlyPayment', 'totalCost', 'dtiRatio', 'affordabilityScore']}
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">Select scenarios to view advanced charts</p>
                </CardContent>
              </Card>
            )}
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="interactive" className="space-y-6">
          <ErrorBoundary>
            {chartScenarios.length > 0 && selectedScenarioIds.length > 0 ? (
              <InteractiveParameterSliders
                baseScenario={chartScenarios.find(s => selectedScenarioIds.includes(s.id)) || chartScenarios[0]}
                onParametersChange={handleParametersChange}
                onScenarioUpdate={handleScenarioUpdate}
                realTimeMode={true}
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">Select at least one scenario to use interactive sliders</p>
                </CardContent>
              </Card>
            )}
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scenarios.filter(s => selectedScenarioIds.includes(s.id)).map((scenario) => (
                    <div key={scenario.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{scenario.plan_name}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <div className="font-medium">
                            {scenario.calculatedMetrics?.payoffTimeMonths || 0} months
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Monthly Savings:</span>
                          <div className={cn(
                            'font-medium',
                            scenario.calculatedMetrics?.monthlySavings && scenario.calculatedMetrics.monthlySavings > 0 ? 'text-green-600' : 
                            scenario.calculatedMetrics?.monthlySavings && scenario.calculatedMetrics.monthlySavings < 0 ? 'text-red-600' : 'text-gray-600'
                          )}>
                            {scenario.calculatedMetrics?.monthlySavings ? formatCurrency(scenario.calculatedMetrics.monthlySavings) : 'None'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedScenarioIds.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Select scenarios to see recommendations
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {scenarios
                        .filter(s => selectedScenarioIds.includes(s.id))
                        .sort((a, b) => (a.calculatedMetrics?.totalCost || 0) - (b.calculatedMetrics?.totalCost || 0))
                        .map((scenario, index) => (
                          <div
                            key={scenario.id}
                            className={cn(
                              'p-3 rounded-lg border',
                              index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{scenario.plan_name}</span>
                              {index === 0 && (
                                <Badge className="bg-green-600 text-white">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {index === 0 ? (
                                'Lowest total cost with acceptable risk level'
                              ) : (
                                `${formatCurrency((scenario.calculatedMetrics?.totalCost || 0) - (scenarios.filter(s => selectedScenarioIds.includes(s.id)).sort((a, b) => (a.calculatedMetrics?.totalCost || 0) - (b.calculatedMetrics?.totalCost || 0))[0].calculatedMetrics?.totalCost || 0))} more expensive`
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedScenariosPage