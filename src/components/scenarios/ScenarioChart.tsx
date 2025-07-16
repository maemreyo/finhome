// src/components/scenarios/ScenarioChart.tsx
// Visual charts for scenario differences and comparisons

'use client'

import React, { useMemo } from 'react'
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
  Legend,
  Area,
  AreaChart,
  ReferenceLine
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
import { cn } from '@/lib/utils'
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
  const selectedScenarios = useMemo(() => {
    return scenarios.filter(scenario => selectedScenarioIds.includes(scenario.id))
  }, [scenarios, selectedScenarioIds])

  // Prepare data for different chart types
  const barChartData = useMemo(() => {
    return selectedScenarios.map(scenario => ({
      name: scenario.name,
      monthlyPayment: scenario.monthlyPayment,
      totalInterest: scenario.totalInterest,
      totalCost: scenario.totalCost,
      duration: scenario.totalDuration,
      type: scenario.type,
      color: COLORS[scenario.type as keyof typeof COLORS] || COLORS.custom
    }))
  }, [selectedScenarios])

  const timelineData = useMemo(() => {
    if (selectedScenarios.length === 0) return []
    
    const maxDuration = Math.max(...selectedScenarios.map(s => s.totalDuration))
    const timelinePoints = []
    
    for (let month = 0; month <= maxDuration; month += 12) {
      const dataPoint: any = { month }
      
      selectedScenarios.forEach(scenario => {
        if (month <= scenario.totalDuration) {
          // Calculate cumulative interest paid up to this point
          const monthlyInterest = scenario.totalInterest / scenario.totalDuration
          const cumulativeInterest = monthlyInterest * month
          dataPoint[scenario.name] = cumulativeInterest
        }
      })
      
      timelinePoints.push(dataPoint)
    }
    
    return timelinePoints
  }, [selectedScenarios])

  const pieChartData = useMemo(() => {
    return selectedScenarios.map(scenario => ({
      name: scenario.name,
      value: scenario.totalCost,
      color: COLORS[scenario.type as keyof typeof COLORS] || COLORS.custom
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
            dataKey={scenario.name}
            stroke={COLORS[scenario.type as keyof typeof COLORS] || COLORS.custom}
            strokeWidth={2}
            dot={{ fill: COLORS[scenario.type as keyof typeof COLORS] || COLORS.custom }}
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
        {selectedScenarios.map((scenario, index) => (
          <Area
            key={scenario.id}
            type="monotone"
            dataKey={scenario.name}
            stackId="1"
            stroke={COLORS[scenario.type as keyof typeof COLORS] || COLORS.custom}
            fill={COLORS[scenario.type as keyof typeof COLORS] || COLORS.custom}
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
        return 'Compare monthly payments and total interest across scenarios'
      case 'line':
        return 'Track cumulative interest payments over time'
      case 'pie':
        return 'View total cost distribution across scenarios'
      case 'area':
        return 'Visualize cumulative interest growth over time'
      default:
        return 'Compare scenarios visually'
    }
  }

  if (selectedScenarios.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Scenario Charts
          </CardTitle>
          <CardDescription>
            Select scenarios to view visual comparisons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No scenarios selected for visualization</p>
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
              Scenario Charts
            </CardTitle>
            <CardDescription>
              {getChartDescription()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={chartType} onValueChange={(value) => onChartTypeChange?.(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bar" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Bar
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-2">
              <LineChartIcon className="w-4 h-4" />
              Line
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" />
              Pie
            </TabsTrigger>
            <TabsTrigger value="area" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Area
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
                style={{ backgroundColor: COLORS[scenario.type as keyof typeof COLORS] || COLORS.custom }}
              />
              <span className="text-sm font-medium">{scenario.name}</span>
              <Badge variant="outline" className="text-xs">
                {scenario.type}
              </Badge>
            </div>
          ))}
        </div>

        {/* Key Insights */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Lowest Cost</span>
              </div>
              <div className="text-sm text-blue-700">
                {selectedScenarios.reduce((min, scenario) => 
                  scenario.totalCost < min.totalCost ? scenario : min
                ).name}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Shortest Duration</span>
              </div>
              <div className="text-sm text-green-700">
                {selectedScenarios.reduce((min, scenario) => 
                  scenario.totalDuration < min.totalDuration ? scenario : min
                ).name}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Lowest Risk</span>
              </div>
              <div className="text-sm text-purple-700">
                {selectedScenarios.find(s => s.riskLevel === 'low')?.name || 
                 selectedScenarios.find(s => s.riskLevel === 'medium')?.name ||
                 selectedScenarios[0]?.name}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScenarioChart