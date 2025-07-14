// src/components/timeline/TimelineDemo.tsx
// Demo component showcasing timeline functionality

'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Smartphone, 
  Monitor, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  Plus
} from 'lucide-react'

import { TimelineVisualization, TimelineEvent, TimelineScenario } from './TimelineVisualization'
import { MobileTimeline } from './MobileTimeline'
import { generateTimelineEvents, convertScenarioToTimeline } from '@/lib/timeline/timelineUtils'
import { ScenarioEngine, ScenarioDefinition } from '@/lib/financial/scenarios'
import { LoanParameters } from '@/lib/financial/calculations'

// Sample data for demo
const sampleLoanParams: LoanParameters = {
  principal: 2400000000, // 2.4 billion VND
  annualRate: 10.5,
  termMonths: 240, // 20 years
  promotionalRate: 7.5,
  promotionalPeriodMonths: 24
}

const samplePersonalFinances = {
  monthlyIncome: 50000000, // 50M VND
  monthlyExpenses: 25000000  // 25M VND
}

const sampleInvestmentParams = {
  expectedRentalIncome: 18000000, // 18M VND
  propertyExpenses: 3000000, // 3M VND
  appreciationRate: 8, // 8% annually
  initialPropertyValue: 3000000000 // 3B VND
}

export const TimelineDemo: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState('baseline')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [prepaymentDialogOpen, setPrepaymentDialogOpen] = useState(false)
  const [prepaymentAmount, setPrepaymentAmount] = useState('')
  const [prepaymentMonth, setPrepaymentMonth] = useState('')
  
  // Generate scenarios using the financial engine
  const scenarios = useMemo(() => {
    const baselineScenario: ScenarioDefinition = {
      id: 'baseline',
      name: 'Kịch bản cơ bản',
      type: 'baseline',
      description: 'Kế hoạch tài chính ban đầu',
      parameters: {},
      assumptions: {
        economicGrowth: 5,
        inflationRate: 4,
        propertyMarketTrend: 'stable',
        personalCareerGrowth: 5,
        emergencyFundMonths: 6
      }
    }
    
    const scenarioEngine = new ScenarioEngine(
      baselineScenario,
      sampleLoanParams,
      samplePersonalFinances,
      sampleInvestmentParams
    )
    
    // Generate all predefined scenarios
    const allScenarioResults = [
      scenarioEngine.generateScenario(baselineScenario),
      ...scenarioEngine.generatePredefinedScenarios()
    ]
    
    // Convert to timeline scenarios
    return allScenarioResults.map(result => convertScenarioToTimeline(result))
  }, [])
  
  const currentScenario = useMemo(() => 
    scenarios.find(s => s.id === selectedScenarioId) || scenarios[0],
    [scenarios, selectedScenarioId]
  )
  
  const handleEventClick = (event: TimelineEvent) => {
    console.log('Event clicked:', event)
    // Here you would typically open a detailed view or edit dialog
  }
  
  const handlePrepaymentAdd = (month: number, amount?: number) => {
    if (amount) {
      console.log(`Adding prepayment: ${amount.toLocaleString()} VND at month ${month}`)
      // Here you would recalculate the timeline with the prepayment
    } else {
      setPrepaymentMonth(month.toString())
      setPrepaymentDialogOpen(true)
    }
  }
  
  const handleRestructure = () => {
    console.log('Requesting loan restructure')
    // Here you would open restructure options
  }
  
  const handlePrepaymentSubmit = () => {
    const amount = parseInt(prepaymentAmount.replace(/,/g, ''))
    const month = parseInt(prepaymentMonth)
    
    if (amount && month) {
      handlePrepaymentAdd(month, amount)
      setPrepaymentDialogOpen(false)
      setPrepaymentAmount('')
      setPrepaymentMonth('')
    }
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          🕐 Interactive Financial Timeline
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize your loan journey with adaptive scenarios and real-time what-if analysis
        </p>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Timeline Controls</span>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Loan Summary */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Loan Details</h4>
              <div className="text-2xl font-bold text-blue-600">
                {(sampleLoanParams.principal / 1000000000).toFixed(1)}B VND
              </div>
              <div className="text-sm text-gray-500">
                {sampleLoanParams.termMonths / 12} years • {sampleLoanParams.annualRate}%
              </div>
            </div>
            
            {/* Monthly Payment */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Monthly Payment</h4>
              <div className="text-2xl font-bold text-green-600">
                17.4M VND
              </div>
              <div className="text-sm text-gray-500">
                After promotional period
              </div>
            </div>
            
            {/* Risk Level */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Risk Level</h4>
              <Badge 
                variant="secondary"
                className={`text-lg font-bold ${
                  currentScenario.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                  currentScenario.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {currentScenario.riskLevel.toUpperCase()}
              </Badge>
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Quick Actions</h4>
              <div className="flex flex-wrap gap-1">
                <Dialog open={prepaymentDialogOpen} onOpenChange={setPrepaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-3 h-3 mr-1" />
                      Prepay
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Prepayment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="prepayment-month">Month</Label>
                        <Input
                          id="prepayment-month"
                          type="number"
                          placeholder="e.g., 12"
                          value={prepaymentMonth}
                          onChange={(e) => setPrepaymentMonth(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="prepayment-amount">Amount (VND)</Label>
                        <Input
                          id="prepayment-amount"
                          type="text"
                          placeholder="e.g., 100,000,000"
                          value={prepaymentAmount}
                          onChange={(e) => setPrepaymentAmount(e.target.value)}
                        />
                      </div>
                      <Button onClick={handlePrepaymentSubmit} className="w-full">
                        Add Prepayment
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button size="sm" variant="outline" onClick={handleRestructure}>
                  <Settings className="w-3 h-3 mr-1" />
                  Restructure
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Timeline Visualization */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'desktop' | 'mobile')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="desktop" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Desktop View
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Mobile View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="desktop" className="space-y-4">
          <TimelineVisualization
            scenarios={scenarios}
            currentScenarioId={selectedScenarioId}
            onScenarioChange={setSelectedScenarioId}
            interactionMode="edit"
            onEventClick={handleEventClick}
            onPrepaymentAdd={handlePrepaymentAdd}
            onRestructureRequest={handleRestructure}
            showGhostTimeline={true}
            enableWhatIfMode={true}
          />
        </TabsContent>
        
        <TabsContent value="mobile" className="space-y-4">
          <div className="flex justify-center">
            <MobileTimeline
              scenario={currentScenario}
              onEventClick={handleEventClick}
              onPrepaymentAdd={handlePrepaymentAdd}
              className="max-w-sm"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Scenario Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Financial Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Interest:</span>
                <span className="font-medium">{(currentScenario.totalInterest / 1000000).toFixed(1)}M VND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="font-medium">{currentScenario.totalDuration} months</span>
              </div>
              {currentScenario.monthlySavings && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Savings:</span>
                  <span className="font-medium text-green-600">
                    {(currentScenario.monthlySavings / 1000000).toFixed(1)}M VND
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {currentScenario.riskLevel === 'low' && (
                <>
                  <p className="text-green-600">✓ Excellent payment capacity</p>
                  <p className="text-blue-600">💡 Consider additional investments</p>
                </>
              )}
              {currentScenario.type === 'optimistic' && (
                <p className="text-green-600">📈 Great growth potential</p>
              )}
              <p className="text-gray-600">🎯 Prepayment opportunities available</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {currentScenario.riskLevel === 'high' && (
                <p className="text-red-600">⚠️ High debt-to-income ratio</p>
              )}
              {currentScenario.type === 'pessimistic' && (
                <p className="text-red-600">📉 Economic downturn impact</p>
              )}
              <p className="text-amber-600">💡 Monitor cash flow regularly</p>
              <p className="text-gray-600">🛡️ Maintain emergency fund</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Features Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Interactive Events</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Click events for details</li>
                <li>• Drag to modify timeline</li>
                <li>• Add prepayments</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Scenario Modeling</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Multiple scenarios</li>
                <li>• Real-time comparison</li>
                <li>• What-if analysis</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Mobile Optimized</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Vertical timeline</li>
                <li>• Touch gestures</li>
                <li>• Swipe navigation</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Smart Alerts</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Crisis warnings</li>
                <li>• Opportunities</li>
                <li>• Proactive guidance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TimelineDemo