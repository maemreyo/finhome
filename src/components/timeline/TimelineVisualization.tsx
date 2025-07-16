// src/components/timeline/TimelineVisualization.tsx
// Interactive Financial Timeline Component

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CalendarDays, 
  Home, 
  Key, 
  AlertTriangle, 
  Target, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Settings,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

// Types for timeline functionality
export interface TimelineEvent {
  id: string
  type: 'loan_signing' | 'property_handover' | 'first_payment' | 'rate_change' | 'prepayment' | 'loan_completion' | 'crisis_event' | 'opportunity' | 'milestone'
  name: string
  description: string
  scheduledDate: Date
  actualDate?: Date
  month: number // Months from loan start
  financialImpact?: number
  balanceAfterEvent?: number
  paymentChange?: number
  status: 'scheduled' | 'completed' | 'modified' | 'cancelled'
  iconName: string
  colorCode: string
  priority: number // 1-10
  eventData?: Record<string, any>
}

export interface TimelineScenario {
  id: string
  name: string
  description?: string
  type: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'
  events: TimelineEvent[]
  totalDuration: number // months
  totalInterest: number
  totalCost: number
  monthlyPayment: number
  interestRate: number
  monthlySavings?: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface TimelineVisualizationProps {
  scenarios: TimelineScenario[]
  currentScenarioId: string
  onScenarioChange: (scenarioId: string) => void
  interactionMode?: 'view' | 'edit' | 'compare'
  onEventClick?: (event: TimelineEvent) => void
  onPrepaymentAdd?: (month: number, amount: number) => void
  onRestructureRequest?: () => void
  showGhostTimeline?: boolean
  enableWhatIfMode?: boolean
  className?: string
}

const getEventIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    home: Home,
    key: Key,
    alert: AlertTriangle,
    target: Target,
    dollar: DollarSign,
    trend_up: TrendingUp,
    trend_down: TrendingDown,
    help: HelpCircle,
    settings: Settings,
  }
  
  return icons[iconName] || HelpCircle
}

const getEventColor = (event: TimelineEvent, isGhost: boolean = false): string => {
  if (isGhost) return 'opacity-30'
  
  const colors: Record<string, string> = {
    completed: 'bg-green-500 border-green-600 text-white',
    current: 'bg-amber-500 border-amber-600 text-white animate-pulse',
    future: 'bg-gray-400 border-gray-500 text-white',
    warning: 'bg-red-500 border-red-600 text-white animate-bounce',
    celebration: 'bg-purple-500 border-purple-600 text-white',
    crisis: 'bg-red-600 border-red-700 text-white animate-pulse',
    opportunity: 'bg-blue-500 border-blue-600 text-white'
  }
  
  // Determine status based on event data
  const currentMonth = new Date().getMonth()
  const status = event.month <= currentMonth ? 'completed' : 
                event.month === currentMonth + 1 ? 'current' : 'future'
  
  if (event.type === 'crisis_event') return colors.crisis
  if (event.type === 'opportunity') return colors.opportunity
  if (event.priority >= 8) return colors.warning
  
  return colors[status] || colors.future
}

const TimelineEventComponent: React.FC<{
  event: TimelineEvent
  position: number
  totalEvents: number
  isGhost?: boolean
  onClick?: () => void
}> = ({ event, position, totalEvents, isGhost = false, onClick }) => {
  const IconComponent = getEventIcon(event.iconName)
  const colorClasses = getEventColor(event, isGhost)
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "relative flex flex-col items-center cursor-pointer group",
              isGhost && "opacity-30"
            )}
            style={{ left: `${(position / (totalEvents - 1)) * 100}%` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isGhost ? 0.3 : 1, y: 0 }}
            transition={{ delay: position * 0.1 }}
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Event Icon */}
            <div className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg",
              "transition-all duration-200 group-hover:shadow-xl",
              colorClasses
            )}>
              <IconComponent className="w-6 h-6" />
            </div>
            
            {/* Event Label */}
            <div className="mt-2 text-center">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {event.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                T+{event.month}M
              </div>
              {event.financialImpact && (
                <div className="text-xs font-medium text-green-600">
                  {formatCurrency(event.financialImpact)}
                </div>
              )}
            </div>
            
            {/* Priority Badge */}
            {event.priority >= 8 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                !
              </Badge>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <p className="font-medium">{event.name}</p>
            <p className="text-sm text-gray-600">{event.description}</p>
            <div className="text-xs space-y-1">
              <p>Scheduled: {event.scheduledDate.toLocaleDateString('vi-VN')}</p>
              {event.financialImpact && (
                <p>Impact: {formatCurrency(event.financialImpact)}</p>
              )}
              {event.balanceAfterEvent && (
                <p>Remaining Balance: {formatCurrency(event.balanceAfterEvent)}</p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const ScenarioSelector: React.FC<{
  scenarios: TimelineScenario[]
  currentScenarioId: string
  onScenarioChange: (scenarioId: string) => void
}> = ({ scenarios, currentScenarioId, onScenarioChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {scenarios.map((scenario) => (
        <Button
          key={scenario.id}
          variant={scenario.id === currentScenarioId ? "default" : "outline"}
          size="sm"
          onClick={() => onScenarioChange(scenario.id)}
          className={cn(
            "transition-all duration-200",
            scenario.id === currentScenarioId && "shadow-md"
          )}
        >
          <span className="mr-2">
            {scenario.type === 'baseline' && '📊'}
            {scenario.type === 'optimistic' && '📈'}
            {scenario.type === 'pessimistic' && '📉'}
            {scenario.type === 'alternative' && '🔄'}
            {scenario.type === 'stress_test' && '🚨'}
          </span>
          {scenario.name}
          {scenario.riskLevel === 'high' && (
            <Badge variant="destructive" className="ml-2 w-3 h-3 p-0" />
          )}
        </Button>
      ))}
    </div>
  )
}

const TimelineControls: React.FC<{
  onZoomIn: () => void
  onZoomOut: () => void
  onWhatIfMode: () => void
  enableWhatIfMode?: boolean
}> = ({ onZoomIn, onZoomOut, onWhatIfMode, enableWhatIfMode }) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button variant="outline" size="sm" onClick={onZoomIn}>
        <ZoomIn className="w-4 h-4 mr-2" />
        Zoom In
      </Button>
      <Button variant="outline" size="sm" onClick={onZoomOut}>
        <ZoomOut className="w-4 h-4 mr-2" />
        Zoom Out
      </Button>
      {enableWhatIfMode && (
        <Button variant="outline" size="sm" onClick={onWhatIfMode}>
          <Settings className="w-4 h-4 mr-2" />
          What-If Analysis
        </Button>
      )}
    </div>
  )
}

export const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  scenarios,
  currentScenarioId,
  onScenarioChange,
  interactionMode = 'view',
  onEventClick,
  onPrepaymentAdd,
  onRestructureRequest,
  showGhostTimeline = false,
  enableWhatIfMode = false,
  className
}) => {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [whatIfMode, setWhatIfMode] = useState(false)
  
  const currentScenario = useMemo(() => 
    scenarios.find(s => s.id === currentScenarioId) || scenarios[0],
    [scenarios, currentScenarioId]
  )
  
  const baselineScenario = useMemo(() => 
    scenarios.find(s => s.type === 'baseline') || scenarios[0],
    [scenarios]
  )
  
  const handleEventClick = useCallback((event: TimelineEvent) => {
    if (interactionMode === 'edit' && onEventClick) {
      onEventClick(event)
    }
  }, [interactionMode, onEventClick])
  
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3))
  }, [])
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5))
  }, [])
  
  const handleWhatIfMode = useCallback(() => {
    setWhatIfMode(prev => !prev)
  }, [])
  
  if (!currentScenario) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No timeline data available</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Financial Timeline
          </span>
          {currentScenario.monthlySavings && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Saves {formatCurrency(currentScenario.monthlySavings)}/month
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Scenario Selector */}
        <ScenarioSelector
          scenarios={scenarios}
          currentScenarioId={currentScenarioId}
          onScenarioChange={onScenarioChange}
        />
        
        {/* Timeline Controls */}
        <TimelineControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onWhatIfMode={handleWhatIfMode}
          enableWhatIfMode={enableWhatIfMode}
        />
        
        {/* Main Timeline */}
        <div className="relative overflow-x-auto">
          <div 
            className="relative h-32 min-w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700"
            style={{ transform: `scaleX(${zoomLevel})`, transformOrigin: 'left' }}
          >
            {/* Timeline Base Line */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-400 dark:bg-gray-600 transform -translate-y-1/2" />
            
            {/* Current Scenario Events */}
            <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2">
              {currentScenario.events.map((event, index) => (
                <TimelineEventComponent
                  key={event.id}
                  event={event}
                  position={index}
                  totalEvents={currentScenario.events.length}
                  onClick={() => handleEventClick(event)}
                />
              ))}
            </div>
            
            {/* Ghost Timeline (Baseline for comparison) */}
            {showGhostTimeline && baselineScenario && baselineScenario.id !== currentScenarioId && (
              <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2">
                {baselineScenario.events.map((event, index) => (
                  <TimelineEventComponent
                    key={`ghost-${event.id}`}
                    event={event}
                    position={index}
                    totalEvents={baselineScenario.events.length}
                    isGhost={true}
                    onClick={() => handleEventClick(event)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Timeline Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentScenario.totalDuration}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Months Total</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(currentScenario.totalInterest)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Interest</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className={cn(
              "text-2xl font-bold",
              currentScenario.riskLevel === 'low' && "text-green-600",
              currentScenario.riskLevel === 'medium' && "text-amber-600",
              currentScenario.riskLevel === 'high' && "text-red-600"
            )}>
              {currentScenario.riskLevel.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Risk Level</div>
          </div>
        </div>
        
        {/* What-If Mode Panel */}
        <AnimatePresence>
          {whatIfMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t pt-4"
            >
              <h4 className="font-medium mb-3">What-If Analysis</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPrepaymentAdd?.(12, 50000000)}
                >
                  Add Prepayment
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRestructureRequest}
                >
                  Restructure Loan
                </Button>
                <Button variant="outline" size="sm">
                  Market Crisis
                </Button>
                <Button variant="outline" size="sm">
                  Income Change
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

export default TimelineVisualization