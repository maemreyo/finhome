// src/components/scenarios/ScenarioParameterEditor.tsx
// Interactive parameter adjustment component for scenario creation and modification

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Percent,
  Home,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save,
  Plus,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { ScenarioEngine, type ScenarioDefinition } from '@/lib/financial/scenarios'
import { calculateMonthlyPayment, type LoanParameters } from '@/lib/financial/calculations'
import type { FinancialScenario, ScenarioParameters as ScenarioParams } from '@/types/scenario'

interface ScenarioParameterEditorProps {
  initialScenario?: FinancialScenario
  onScenarioChange: (scenario: FinancialScenario) => void
  onSaveScenario: (scenario: FinancialScenario) => void
  onDeleteScenario?: (scenarioId: string) => void
  className?: string
}

interface ScenarioParameters {
  name: string
  type: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'
  purchasePrice: number
  downPayment: number
  loanAmount: number
  interestRate: number
  loanTermYears: number
  monthlyIncome: number
  monthlyExpenses: number
  propertyTax: number
  insurance: number
  maintenanceReserve: number
  expectedRentalIncome: number
  rentGrowthRate: number
  propertyAppreciationRate: number
  vacancyRate: number
  capEx: number
  description: string
}

const defaultParameters: ScenarioParameters = {
  name: 'Custom Scenario',
  type: 'alternative',
  purchasePrice: 3000000000, // 3B VND
  downPayment: 600000000,    // 600M VND (20%)
  loanAmount: 2400000000,    // 2.4B VND
  interestRate: 10.5,
  loanTermYears: 20,
  monthlyIncome: 50000000,   // 50M VND
  monthlyExpenses: 30000000, // 30M VND
  propertyTax: 0.5,
  insurance: 0.2,
  maintenanceReserve: 1,
  expectedRentalIncome: 25000000, // 25M VND
  rentGrowthRate: 3,
  propertyAppreciationRate: 5,
  vacancyRate: 5,
  capEx: 1,
  description: ''
}

const ScenarioParameterEditor: React.FC<ScenarioParameterEditorProps> = ({
  initialScenario,
  onScenarioChange,
  onSaveScenario,
  onDeleteScenario,
  className
}) => {
  const [parameters, setParameters] = useState<ScenarioParameters>(() => {
    if (initialScenario) {
      return {
        name: initialScenario.plan_name,
        type: initialScenario.scenarioType,
        purchasePrice: initialScenario.purchase_price || defaultParameters.purchasePrice,
        downPayment: initialScenario.down_payment || defaultParameters.downPayment,
        loanAmount: (initialScenario.purchase_price || defaultParameters.purchasePrice) - (initialScenario.down_payment || defaultParameters.downPayment),
        interestRate: initialScenario.expected_roi || defaultParameters.interestRate,
        loanTermYears: Math.round((initialScenario.target_timeframe_months || 240) / 12),
        monthlyIncome: initialScenario.monthly_income || defaultParameters.monthlyIncome,
        monthlyExpenses: initialScenario.monthly_expenses || defaultParameters.monthlyExpenses,
        propertyTax: defaultParameters.propertyTax,
        insurance: defaultParameters.insurance,
        maintenanceReserve: defaultParameters.maintenanceReserve,
        expectedRentalIncome: initialScenario.expected_rental_income || defaultParameters.expectedRentalIncome,
        rentGrowthRate: defaultParameters.rentGrowthRate,
        propertyAppreciationRate: initialScenario.expected_appreciation_rate || defaultParameters.propertyAppreciationRate,
        vacancyRate: defaultParameters.vacancyRate,
        capEx: defaultParameters.capEx,
        description: initialScenario.description || ''
      }
    }
    return defaultParameters
  })

  const [isCalculating, setIsCalculating] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [previewMode, setPreviewMode] = useState(false)

  // Calculate derived values
  const calculatedScenario = useMemo(() => {
    const loanParams: LoanParameters = {
      principal: parameters.loanAmount,
      annualRate: parameters.interestRate,
      termMonths: parameters.loanTermYears * 12
    }

    const monthlyPayment = calculateMonthlyPayment(loanParams)
    const totalInterest = (monthlyPayment * loanParams.termMonths) - parameters.loanAmount
    const totalCost = parameters.loanAmount + totalInterest

    // Calculate cash flow
    const monthlyRental = parameters.expectedRentalIncome * (1 - parameters.vacancyRate / 100)
    const monthlyExpenses = (parameters.propertyTax + parameters.insurance + parameters.maintenanceReserve + parameters.capEx) * parameters.purchasePrice / 100 / 12
    const netCashFlow = monthlyRental - monthlyPayment - monthlyExpenses

    // Determine risk level
    const dtiRatio = (monthlyPayment / parameters.monthlyIncome) * 100
    const ltvRatio = (parameters.loanAmount / parameters.purchasePrice) * 100
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (dtiRatio > 40 || ltvRatio > 80 || netCashFlow < 0) {
      riskLevel = 'high'
    } else if (dtiRatio > 30 || ltvRatio > 70 || netCashFlow < 5000000) {
      riskLevel = 'medium'
    }

    const scenario: FinancialScenario = {
      // Copy all base FinancialPlan properties
      ...(initialScenario || {}),
      
      // Update with calculated values
      id: initialScenario?.id || `scenario-${Date.now()}`,
      plan_name: parameters.name,
      description: parameters.description,
      scenarioType: parameters.type,
      riskLevel,
      user_id: initialScenario?.user_id || '',
      plan_type: initialScenario?.plan_type || 'home_purchase',
      status: initialScenario?.status || 'draft',
      purchase_price: parameters.purchasePrice,
      down_payment: parameters.downPayment,
      monthly_income: parameters.monthlyIncome,
      monthly_expenses: parameters.monthlyExpenses,
      target_timeframe_months: parameters.loanTermYears * 12,
      expected_roi: parameters.interestRate,
      expected_rental_income: parameters.expectedRentalIncome,
      expected_appreciation_rate: parameters.propertyAppreciationRate,
      created_at: initialScenario?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Calculated metrics
      calculatedMetrics: {
        monthlyPayment,
        totalInterest,
        totalCost,
        dtiRatio,
        ltvRatio,
        affordabilityScore: netCashFlow > 0 ? 8 : 5,
        payoffTimeMonths: parameters.loanTermYears * 12,
        monthlySavings: netCashFlow > 0 ? netCashFlow : undefined
      }
    } as FinancialScenario

    return scenario
  }, [parameters, initialScenario?.id])

  // Validation
  useEffect(() => {
    const errors: string[] = []

    if (parameters.purchasePrice <= 0) {
      errors.push('Purchase price must be greater than 0')
    }

    if (parameters.downPayment >= parameters.purchasePrice) {
      errors.push('Down payment must be less than purchase price')
    }

    if (parameters.interestRate <= 0 || parameters.interestRate > 30) {
      errors.push('Interest rate must be between 0% and 30%')
    }

    if (parameters.loanTermYears < 1 || parameters.loanTermYears > 30) {
      errors.push('Loan term must be between 1 and 30 years')
    }

    const dtiRatio = (calculatedScenario.calculatedMetrics?.monthlyPayment || 0) / parameters.monthlyIncome * 100
    if (dtiRatio > 50) {
      errors.push('Debt-to-income ratio exceeds 50% - this may not be feasible')
    }

    setValidationErrors(errors)
  }, [parameters, calculatedScenario])

  // Update calculated values when parameters change
  useEffect(() => {
    setParameters(prev => ({
      ...prev,
      loanAmount: prev.purchasePrice - prev.downPayment
    }))
  }, [parameters.purchasePrice, parameters.downPayment])

  // Notify parent of changes
  useEffect(() => {
    if (validationErrors.length === 0) {
      onScenarioChange(calculatedScenario)
    }
  }, [calculatedScenario, validationErrors, onScenarioChange])

  const handleParameterChange = (key: keyof ScenarioParameters, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    if (validationErrors.length === 0) {
      onSaveScenario(calculatedScenario)
    }
  }

  const handleReset = () => {
    setParameters(defaultParameters)
  }

  const handlePresetScenario = (preset: 'conservative' | 'moderate' | 'aggressive') => {
    const presets = {
      conservative: {
        interestRate: 11.5,
        loanTermYears: 25,
        downPayment: parameters.purchasePrice * 0.3, // 30% down
        propertyAppreciationRate: 3,
        rentGrowthRate: 2,
        vacancyRate: 8
      },
      moderate: {
        interestRate: 10.5,
        loanTermYears: 20,
        downPayment: parameters.purchasePrice * 0.2, // 20% down
        propertyAppreciationRate: 5,
        rentGrowthRate: 3,
        vacancyRate: 5
      },
      aggressive: {
        interestRate: 9.5,
        loanTermYears: 15,
        downPayment: parameters.purchasePrice * 0.15, // 15% down
        propertyAppreciationRate: 7,
        rentGrowthRate: 4,
        vacancyRate: 3
      }
    }

    const presetParams = presets[preset]
    setParameters(prev => ({
      ...prev,
      ...presetParams,
      name: `${preset.charAt(0).toUpperCase() + preset.slice(1)} Scenario`,
      type: 'alternative'
    }))
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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Scenario Parameters
            </CardTitle>
            <CardDescription>
              Adjust parameters to create custom scenarios
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isCalculating}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={validationErrors.length > 0 || isCalculating}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {previewMode ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Monthly Payment</Label>
                  <div className="text-2xl font-bold">{formatCurrency(calculatedScenario.calculatedMetrics?.monthlyPayment || 0)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Total Interest</Label>
                  <div className="text-2xl font-bold">{formatCurrency(calculatedScenario.calculatedMetrics?.totalInterest || 0)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Total Cost</Label>
                  <div className="text-2xl font-bold">{formatCurrency(calculatedScenario.calculatedMetrics?.totalCost || 0)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Risk Level</Label>
                  <Badge className={cn('text-sm', getRiskLevelColor(calculatedScenario.riskLevel))}>
                    {calculatedScenario.riskLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Key Metrics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Monthly Payment:</span> {formatCurrency(calculatedScenario.calculatedMetrics?.monthlyPayment || 0)}
                  </div>
                  <div>
                    <span className="text-gray-600">Total Interest:</span> {formatCurrency(calculatedScenario.calculatedMetrics?.totalInterest || 0)}
                  </div>
                  <div>
                    <span className="text-gray-600">Total Cost:</span> {formatCurrency(calculatedScenario.calculatedMetrics?.totalCost || 0)}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="loan">Loan</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Scenario Name</Label>
                      <Input
                        id="name"
                        value={parameters.name}
                        onChange={(e) => handleParameterChange('name', e.target.value)}
                        placeholder="Enter scenario name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Scenario Type</Label>
                      <Select value={parameters.type} onValueChange={(value) => handleParameterChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baseline">Baseline</SelectItem>
                          <SelectItem value="optimistic">Optimistic</SelectItem>
                          <SelectItem value="pessimistic">Pessimistic</SelectItem>
                          <SelectItem value="alternative">Alternative</SelectItem>
                          <SelectItem value="stress_test">Stress Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchasePrice">Purchase Price</Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        value={parameters.purchasePrice}
                        onChange={(e) => handleParameterChange('purchasePrice', Number(e.target.value))}
                        placeholder="Enter purchase price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="downPayment">Down Payment</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        value={parameters.downPayment}
                        onChange={(e) => handleParameterChange('downPayment', Number(e.target.value))}
                        placeholder="Enter down payment"
                      />
                      <div className="text-sm text-gray-600">
                        {((parameters.downPayment / parameters.purchasePrice) * 100).toFixed(1)}% of purchase price
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Quick Presets</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetScenario('conservative')}
                      >
                        Conservative
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetScenario('moderate')}
                      >
                        Moderate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetScenario('aggressive')}
                      >
                        Aggressive
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="loan" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <div className="px-3">
                        <Slider
                          value={[parameters.interestRate]}
                          onValueChange={(value) => handleParameterChange('interestRate', value[0])}
                          max={20}
                          min={5}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: {parameters.interestRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
                      <div className="px-3">
                        <Slider
                          value={[parameters.loanTermYears]}
                          onValueChange={(value) => handleParameterChange('loanTermYears', value[0])}
                          max={30}
                          min={5}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: {parameters.loanTermYears} years
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Loan Amount (Calculated)</Label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        {formatCurrency(parameters.loanAmount)}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="income" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">Monthly Income</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={parameters.monthlyIncome}
                        onChange={(e) => handleParameterChange('monthlyIncome', Number(e.target.value))}
                        placeholder="Enter monthly income"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                      <Input
                        id="monthlyExpenses"
                        type="number"
                        value={parameters.monthlyExpenses}
                        onChange={(e) => handleParameterChange('monthlyExpenses', Number(e.target.value))}
                        placeholder="Enter monthly expenses"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedRentalIncome">Expected Rental Income</Label>
                    <Input
                      id="expectedRentalIncome"
                      type="number"
                      value={parameters.expectedRentalIncome}
                      onChange={(e) => handleParameterChange('expectedRentalIncome', Number(e.target.value))}
                      placeholder="Enter expected rental income"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyAppreciationRate">Property Appreciation Rate (%)</Label>
                      <div className="px-3">
                        <Slider
                          value={[parameters.propertyAppreciationRate]}
                          onValueChange={(value) => handleParameterChange('propertyAppreciationRate', value[0])}
                          max={10}
                          min={0}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: {parameters.propertyAppreciationRate}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rentGrowthRate">Rent Growth Rate (%)</Label>
                      <div className="px-3">
                        <Slider
                          value={[parameters.rentGrowthRate]}
                          onValueChange={(value) => handleParameterChange('rentGrowthRate', value[0])}
                          max={10}
                          min={0}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: {parameters.rentGrowthRate}%
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vacancyRate">Vacancy Rate (%)</Label>
                      <div className="px-3">
                        <Slider
                          value={[parameters.vacancyRate]}
                          onValueChange={(value) => handleParameterChange('vacancyRate', value[0])}
                          max={20}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: {parameters.vacancyRate}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertyTax">Property Tax (%)</Label>
                      <div className="px-3">
                        <Slider
                          value={[parameters.propertyTax]}
                          onValueChange={(value) => handleParameterChange('propertyTax', value[0])}
                          max={2}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: {parameters.propertyTax}%
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Real-time Calculations */}
        {!previewMode && validationErrors.length === 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Live Calculations
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Monthly Payment:</span>
                <div className="font-medium">{formatCurrency(calculatedScenario.calculatedMetrics?.monthlyPayment || 0)}</div>
              </div>
              <div>
                <span className="text-gray-600">Total Interest:</span>
                <div className="font-medium">{formatCurrency(calculatedScenario.calculatedMetrics?.totalInterest || 0)}</div>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <div className="font-medium">{calculatedScenario.calculatedMetrics?.payoffTimeMonths || 0} months</div>
              </div>
              <div>
                <span className="text-gray-600">Risk Level:</span>
                <Badge className={cn('text-xs', getRiskLevelColor(calculatedScenario.riskLevel))}>
                  {calculatedScenario.riskLevel}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ScenarioParameterEditor