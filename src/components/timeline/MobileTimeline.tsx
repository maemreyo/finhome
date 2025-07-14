// src/components/timeline/MobileTimeline.tsx
// Mobile-optimized vertical timeline component

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign 
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { TimelineEvent, TimelineScenario } from './TimelineVisualization'

interface MobileTimelineProps {
  scenario: TimelineScenario
  onEventClick?: (event: TimelineEvent) => void
  onPrepaymentAdd?: (month: number) => void
  className?: string
}

interface MobileTimelineEventProps {
  event: TimelineEvent
  index: number
  isLast: boolean
  onEventClick?: (event: TimelineEvent) => void
  onPrepaymentAdd?: (month: number) => void
}

const getEventStatusIcon = (event: TimelineEvent) => {
  const currentMonth = new Date().getMonth()
  
  if (event.month <= currentMonth) {
    return <CheckCircle className="w-5 h-5 text-green-500" />
  } else if (event.month === currentMonth + 1) {
    return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
  } else if (event.type === 'crisis_event') {
    return <AlertCircle className="w-5 h-5 text-red-500 animate-bounce" />
  } else {
    return <Clock className="w-5 h-5 text-gray-400" />
  }
}

const getEventStatusColor = (event: TimelineEvent): string => {
  const currentMonth = new Date().getMonth()
  
  if (event.type === 'crisis_event') return 'border-red-500 bg-red-50'
  if (event.type === 'opportunity') return 'border-blue-500 bg-blue-50'
  if (event.month <= currentMonth) return 'border-green-500 bg-green-50'
  if (event.month === currentMonth + 1) return 'border-amber-500 bg-amber-50'
  
  return 'border-gray-300 bg-gray-50'
}

const MobileTimelineEvent: React.FC<MobileTimelineEventProps> = ({
  event,
  index,
  isLast,
  onEventClick,
  onPrepaymentAdd
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  
  const controls = useAnimation()
  
  const handlePan = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setShowActions(true)
    } else if (info.offset.x < -100) {
      setShowActions(false)
    }
  }
  
  const handleTap = () => {
    setIsExpanded(!isExpanded)
    onEventClick?.(event)
  }
  
  const handleLongPress = () => {
    if (event.type !== 'crisis_event') {
      onPrepaymentAdd?.(event.month)
    }
  }
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Timeline Connector */}
      {!isLast && (
        <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-300 dark:bg-gray-600 z-0" />
      )}
      
      {/* Event Card */}
      <motion.div
        className={cn(
          "relative z-10 ml-2 mb-4 border-l-4 rounded-lg transition-all duration-200",
          getEventStatusColor(event)
        )}
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        onPan={handlePan}
        onTap={handleTap}
        onTapStart={handleLongPress}
        whileTap={{ scale: 0.98 }}
        dragElastic={0.1}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              {/* Event Icon & Status */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getEventStatusIcon(event)}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Event Title */}
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {event.name}
                  </h4>
                  
                  {/* Event Timing */}
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      T+{event.month}M
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {event.scheduledDate.toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  {/* Financial Impact */}
                  {event.financialImpact && (
                    <div className="flex items-center space-x-1 mt-2">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(event.financialImpact)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Expand/Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-200"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {event.description}
                  </p>
                  
                  {/* Event Details */}
                  {(event.balanceAfterEvent || event.paymentChange) && (
                    <div className="space-y-2">
                      {event.balanceAfterEvent && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Remaining Balance:</span>
                          <span className="font-medium">
                            {formatCurrency(event.balanceAfterEvent)}
                          </span>
                        </div>
                      )}
                      
                      {event.paymentChange && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Payment Change:</span>
                          <span className={cn(
                            "font-medium",
                            event.paymentChange > 0 ? "text-red-600" : "text-green-600"
                          )}>
                            {event.paymentChange > 0 ? "+" : ""}
                            {formatCurrency(event.paymentChange)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Priority Indicator */}
                  {event.priority >= 8 && (
                    <Badge variant="destructive" className="mt-2">
                      High Priority
                    </Badge>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Swipe Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2"
          >
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPrepaymentAdd?.(event.month)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export const MobileTimeline: React.FC<MobileTimelineProps> = ({
  scenario,
  onEventClick,
  onPrepaymentAdd,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Touch gesture handling
  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex < scenario.events.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }
  
  // Auto-scroll to current event
  useEffect(() => {
    if (containerRef.current) {
      const currentMonth = new Date().getMonth()
      const currentEventIndex = scenario.events.findIndex(
        event => event.month >= currentMonth
      )
      
      if (currentEventIndex >= 0) {
        setCurrentIndex(currentEventIndex)
      }
    }
  }, [scenario.events])
  
  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      {/* Timeline Header */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
        <h3 className="font-bold text-lg">{scenario.name}</h3>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm opacity-90">
            {scenario.events.length} Events
          </div>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              scenario.riskLevel === 'low' && "bg-green-100 text-green-800",
              scenario.riskLevel === 'medium' && "bg-amber-100 text-amber-800",
              scenario.riskLevel === 'high' && "bg-red-100 text-red-800"
            )}
          >
            {scenario.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </div>
      
      {/* Timeline Events */}
      <motion.div
        ref={containerRef}
        className="space-y-2 overflow-hidden"
        drag="y"
        dragConstraints={{ top: -100, bottom: 100 }}
        onDragEnd={(event, info) => {
          if (info.offset.y > 50) {
            handleSwipe('down')
          } else if (info.offset.y < -50) {
            handleSwipe('up')
          }
        }}
      >
        {scenario.events.map((event, index) => (
          <MobileTimelineEvent
            key={event.id}
            event={event}
            index={index}
            isLast={index === scenario.events.length - 1}
            onEventClick={onEventClick}
            onPrepaymentAdd={onPrepaymentAdd}
          />
        ))}
      </motion.div>
      
      {/* Timeline Progress */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentIndex / scenario.events.length) * 100)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / scenario.events.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {scenario.totalDuration}M
            </div>
            <div className="text-xs text-gray-500">Total Duration</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(scenario.totalInterest)}
            </div>
            <div className="text-xs text-gray-500">Total Interest</div>
          </div>
        </div>
      </div>
      
      {/* Navigation Hint */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Swipe up/down to navigate • Long press to add prepayment
      </div>
    </div>
  )
}

export default MobileTimeline