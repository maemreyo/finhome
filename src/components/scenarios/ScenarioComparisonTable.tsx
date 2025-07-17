// src/components/scenarios/ScenarioComparisonTable.tsx
// Side-by-side scenario comparison table component

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Calendar,
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import type { FinancialScenario } from '@/types/scenario'

interface ScenarioComparisonTableProps {
  scenarios: FinancialScenario[]
  selectedScenarioIds: string[]
  onScenarioSelect: (scenarioId: string) => void
  className?: string
}

interface ComparisonMetric {
  key: string
  label: string
  icon: React.ComponentType<any>
  format: (value: any) => string
  accessor: (scenario: FinancialScenario) => any
  type: 'currency' | 'percentage' | 'number' | 'months' | 'text'
  importance: 'high' | 'medium' | 'low'
}

const comparisonMetrics: ComparisonMetric[] = [
  {
    key: 'monthlyPayment',
    label: 'Monthly Payment',
    icon: DollarSign,
    format: (value) => formatCurrency(value),
    accessor: (scenario) => scenario.calculatedMetrics?.monthlyPayment || 0,
    type: 'currency',
    importance: 'high'
  },
  {
    key: 'totalInterest',
    label: 'Total Interest',
    icon: Calculator,
    format: (value) => formatCurrency(value),
    accessor: (scenario) => scenario.calculatedMetrics?.totalInterest || 0,
    type: 'currency',
    importance: 'high'
  },
  {
    key: 'totalCost',
    label: 'Total Cost',
    icon: Target,
    format: (value) => formatCurrency(value),
    accessor: (scenario) => scenario.calculatedMetrics?.totalCost || 0,
    type: 'currency',
    importance: 'high'
  },
  {
    key: 'totalDuration',
    label: 'Loan Duration',
    icon: Calendar,
    format: (value) => `${value} months`,
    accessor: (scenario) => scenario.calculatedMetrics?.payoffTimeMonths || scenario.target_timeframe_months || 240,
    type: 'months',
    importance: 'medium'
  },
  {
    key: 'interestRate',
    label: 'Interest Rate',
    icon: TrendingUp,
    format: (value) => `${value.toFixed(2)}%`,
    accessor: (scenario) => scenario.expected_roi || 10.5,
    type: 'percentage',
    importance: 'high'
  },
  {
    key: 'riskLevel',
    label: 'Risk Level',
    icon: AlertTriangle,
    format: (value) => value.charAt(0).toUpperCase() + value.slice(1),
    accessor: (scenario) => scenario.riskLevel,
    type: 'text',
    importance: 'medium'
  }
]

const ScenarioComparisonTable: React.FC<ScenarioComparisonTableProps> = ({
  scenarios,
  selectedScenarioIds,
  onScenarioSelect,
  className
}) => {
  const selectedScenarios = useMemo(() => {
    return scenarios.filter(scenario => selectedScenarioIds.includes(scenario.id))
  }, [scenarios, selectedScenarioIds])

  const baselineScenario = useMemo(() => {
    return selectedScenarios.find(s => s.scenarioType === 'baseline') || selectedScenarios[0]
  }, [selectedScenarios])

  const getComparisonIndicator = (currentValue: any, baselineValue: any, type: string) => {
    if (!baselineScenario || currentValue === baselineValue) {
      return { icon: Minus, color: 'text-gray-500', trend: 'neutral' }
    }

    let isImprovement = false
    
    switch (type) {
      case 'currency':
        // Lower values are better for costs
        isImprovement = currentValue < baselineValue
        break
      case 'percentage':
        // Lower rates are generally better
        isImprovement = currentValue < baselineValue
        break
      case 'months':
        // Shorter duration is generally better
        isImprovement = currentValue < baselineValue
        break
      case 'text':
        // For risk level: low < medium < high
        const riskOrder = { low: 1, medium: 2, high: 3 }
        isImprovement = riskOrder[currentValue as keyof typeof riskOrder] < riskOrder[baselineValue as keyof typeof riskOrder]
        break
      default:
        isImprovement = false
    }

    return {
      icon: isImprovement ? TrendingUp : TrendingDown,
      color: isImprovement ? 'text-green-600' : 'text-red-600',
      trend: isImprovement ? 'up' : 'down'
    }
  }

  const getScenarioTypeColor = (type: string) => {
    switch (type) {
      case 'baseline':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'optimistic':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pessimistic':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'alternative':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'stress_test':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
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

  if (selectedScenarios.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Scenario Comparison
          </CardTitle>
          <CardDescription>
            Select scenarios to compare them side by side
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No scenarios selected for comparison</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Scenario Comparison
        </CardTitle>
        <CardDescription>
          Compare {selectedScenarios.length} scenario{selectedScenarios.length > 1 ? 's' : ''} side by side
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Metric</TableHead>
                {selectedScenarios.map((scenario) => (
                  <TableHead key={scenario.id} className="text-center min-w-[150px]">
                    <div className="space-y-2">
                      <div className="font-medium">{scenario.plan_name}</div>
                      <div className="flex items-center justify-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getScenarioTypeColor(scenario.scenarioType))}
                        >
                          {scenario.scenarioType}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getRiskLevelColor(scenario.riskLevel))}
                        >
                          {scenario.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonMetrics.map((metric) => (
                <TableRow key={metric.key}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <metric.icon className="w-4 h-4 text-gray-500" />
                      {metric.label}
                    </div>
                  </TableCell>
                  {selectedScenarios.map((scenario) => {
                    const value = metric.accessor(scenario)
                    const baselineValue = baselineScenario ? metric.accessor(baselineScenario) : value
                    const comparison = getComparisonIndicator(value, baselineValue, metric.type)
                    
                    return (
                      <TableCell key={scenario.id} className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {metric.format(value)}
                          </div>
                          {scenario.id !== baselineScenario?.id && (
                            <div className={cn('flex items-center justify-center gap-1 text-xs', comparison.color)}>
                              <comparison.icon className="w-3 h-3" />
                              {metric.type === 'currency' && (
                                <span>
                                  {comparison.trend === 'up' ? '+' : ''}
                                  {formatCurrency(value - baselineValue)}
                                </span>
                              )}
                              {metric.type === 'percentage' && (
                                <span>
                                  {comparison.trend === 'up' ? '+' : ''}
                                  {(value - baselineValue).toFixed(2)}%
                                </span>
                              )}
                              {metric.type === 'months' && (
                                <span>
                                  {comparison.trend === 'up' ? '+' : ''}
                                  {value - baselineValue} months
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Section */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4">Scenario Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedScenarios.map((scenario) => {
              const totalCost = scenario.calculatedMetrics?.totalCost || 0
              const bestCost = Math.min(...selectedScenarios.map(s => s.calculatedMetrics?.totalCost || 0))
              const costSavings = totalCost - bestCost
              const isBest = totalCost === bestCost

              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-4 border rounded-lg relative',
                    isBest ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  )}
                >
                  {isBest && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Best
                      </Badge>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{scenario.plan_name}</div>
                    <div className="text-xs text-gray-600">
                      Total Cost: {formatCurrency(totalCost)}
                    </div>
                    
                    {!isBest && costSavings > 0 && (
                      <div className="text-xs text-red-600">
                        {formatCurrency(costSavings)} more than best option
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Risk:</span>
                      <Badge variant="outline" className={cn('text-xs', getRiskLevelColor(scenario.riskLevel))}>
                        {scenario.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScenarioComparisonTable