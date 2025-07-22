// src/components/scenarios/ScenarioChart.tsx
// Visual charts for scenario differences and comparisons

'use client'

import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  TrendingUp,
  Download,
  Maximize2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { TimelineScenario } from '@/components/timeline/TimelineVisualization'

interface ScenarioChartProps {
  scenarios: TimelineScenario[]
  selectedScenarioIds: string[]
  chartType?: 'bar' | 'line' | 'pie' | 'area'
  onChartTypeChange?: (type: 'bar' | 'line' | 'pie' | 'area') => void
  className?: string
}

const COLORS = {
  baseline: '#3b82f6',
  optimistic: '#10b981',
  pessimistic: '#ef4444',
  custom: '#8b5cf6'
}

const ScenarioChart: React.FC<ScenarioChartProps> = ({
  scenarios,
  selectedScenarioIds,
  chartType = 'bar',
  onChartTypeChange,
  className
}) => {
  const t = useTranslations('ScenarioChart')
  const selectedScenarios = useMemo(() => {
    return scenarios.filter(scenario => selectedScenarioIds.includes(scenario.id))
  }, [scenarios, selectedScenarioIds])

  // Prepare data for different chart types
  const barChartData = useMemo(() => {
    return selectedScenarios.map(scenario => ({
      name: scenario.plan_name,
      monthlyPayment: scenario.calculatedMetrics?.monthlyPayment || 0,
      totalInterest: scenario.calculatedMetrics?.totalInterest || 0,
      totalCost: scenario.calculatedMetrics?.totalCost || 0,
      duration: scenario.calculatedMetrics?.payoffTimeMonths || 0,
      type: scenario.scenarioType,
      color: COLORS[scenario.scenarioType as keyof typeof COLORS] || COLORS.custom
    }))
  }, [selectedScenarios])

  const timelineData = useMemo(() => {
    if (selectedScenarios.length === 0) return []
    
    const maxDuration = Math.max(...selectedScenarios.map(s => s.calculatedMetrics?.payoffTimeMonths || 0))
    const timelinePoints = []
    
    for (let month = 0; month <= maxDuration; month += 12) {
      const dataPoint: any = { month }
      
      selectedScenarios.forEach(scenario => {
        const totalDuration = scenario.calculatedMetrics?.payoffTimeMonths || 0
        const totalInterest = scenario.calculatedMetrics?.totalInterest || 0
        if (month <= totalDuration && totalDuration > 0) {
          // Calculate cumulative interest paid up to this point
          const monthlyInterest = totalInterest / totalDuration
          const cumulativeInterest = monthlyInterest * month
          dataPoint[scenario.plan_name] = cumulativeInterest
        }
      })
      
      timelinePoints.push(dataPoint)
    }
    
    return timelinePoints
  }, [selectedScenarios])

  const pieChartData = useMemo(() => {
    return selectedScenarios.map(scenario => ({
      name: scenario.plan_name,
      value: scenario.calculatedMetrics?.totalCost || 0,
      color: COLORS[scenario.scenarioType as keyof typeof COLORS] || COLORS.custom
    }))
  }, [selectedScenarios])

  const formatTooltipValue = (value: number, name: string) => {
    if (name.includes('Payment') || name.includes('Interest') || name.includes('Cost')) {
      return formatCurrency(value)
    }
    if (name.includes('Duration')) {
      return `${value} months`
    }
    return value
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatTooltipValue(entry.value, entry.name)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="monthlyPayment" fill="#3b82f6" name="Monthly Payment" />
        <Bar dataKey="totalInterest" fill="#ef4444" name="Total Interest" />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip content={<CustomTooltip />} />
        {selectedScenarios.map((scenario) => (
          <Line
            key={scenario.id}
            type="monotone"
            dataKey={scenario.plan_name}
            stroke={COLORS[scenario.scenarioType as keyof typeof COLORS] || COLORS.custom}
            strokeWidth={2}
            dot={{ fill: COLORS[scenario.scenarioType as keyof typeof COLORS] || COLORS.custom }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={pieChartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {pieChartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value as number)} />
      </PieChart>
    </ResponsiveContainer>
  )

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip content={<CustomTooltip />} />
        {selectedScenarios.map((scenario) => (
          <Area
            key={scenario.id}
            type="monotone"
            dataKey={scenario.plan_name}
            stackId="1"
            stroke={COLORS[scenario.scenarioType as keyof typeof COLORS] || COLORS.custom}
            fill={COLORS[scenario.scenarioType as keyof typeof COLORS] || COLORS.custom}
            fillOpacity={0.7}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart()
      case 'line':
        return renderLineChart()
      case 'pie':
        return renderPieChart()
      case 'area':
        return renderAreaChart()
      default:
        return renderBarChart()
    }
  }

  const getChartDescription = () => {
    switch (chartType) {
      case 'bar':
        return t('chartTypes.bar')
      case 'line':
        return t('chartTypes.line')
      case 'pie':
        return t('chartTypes.pie')
      case 'area':
        return t('chartTypes.area')
      default:
        return t('chartTypes.default')
    }
  }

  if (selectedScenarios.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('emptyState.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">{t('emptyState.message')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('title')}
            </CardTitle>
            <CardDescription>
              {getChartDescription()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              {t('actions.export')}
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="w-4 h-4 mr-2" />
              {t('actions.fullscreen')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={chartType} onValueChange={(value) => onChartTypeChange?.(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bar" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {t('chartTypes.bar')}
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-2">
              <LineChartIcon className="w-4 h-4" />
              {t('chartTypes.line')}
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" />
              {t('chartTypes.pie')}
            </TabsTrigger>
            <TabsTrigger value="area" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('chartTypes.area')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={chartType} className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderChart()}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {selectedScenarios.map((scenario) => (
            <div key={scenario.id} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[scenario.scenarioType as keyof typeof COLORS] || COLORS.custom }}
              />
              <span className="text-sm font-medium">{scenario.plan_name}</span>
              <Badge variant="outline" className="text-xs">
                {scenario.scenarioType}
              </Badge>
            </div>
          ))}
        </div>

        {/* Key Insights */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">{t('insights.title')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">{t('insights.lowestCost')}</span>
              </div>
              <div className="text-sm text-blue-700">
                {selectedScenarios.reduce((min, scenario) => 
                  (scenario.calculatedMetrics?.totalCost || 0) < (min.calculatedMetrics?.totalCost || 0) ? scenario : min
                ).plan_name}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">{t('insights.shortestDuration')}</span>
              </div>
              <div className="text-sm text-green-700">
                {selectedScenarios.reduce((min, scenario) => 
                  (scenario.calculatedMetrics?.payoffTimeMonths || 0) < (min.calculatedMetrics?.payoffTimeMonths || 0) ? scenario : min
                ).plan_name}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">{t('insights.lowestRisk')}</span>
              </div>
              <div className="text-sm text-purple-700">
                {selectedScenarios.find(s => s.riskLevel === 'low')?.plan_name || 
                 selectedScenarios.find(s => s.riskLevel === 'medium')?.plan_name ||
                 selectedScenarios[0]?.plan_name}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScenarioChart