// src/lib/timeline/timelineUtils.ts
// Timeline utility functions and data generators

import { TimelineEvent, TimelineScenario } from '@/components/timeline/TimelineVisualization'
import { ScenarioResults, ScenarioDefinition } from '@/lib/financial/scenarios'
import { CashFlowProjection } from '@/lib/financial/calculations'

export interface TimelineGeneratorParams {
  loanAmount: number
  loanTermMonths: number
  promotionalPeriodMonths?: number
  startDate?: Date
}

/**
 * Generate timeline events from loan parameters
 */
export function generateTimelineEvents(params: TimelineGeneratorParams): TimelineEvent[] {
  const { loanAmount, loanTermMonths, promotionalPeriodMonths = 0, startDate = new Date() } = params
  
  const events: TimelineEvent[] = []
  
  // 1. Loan Signing Event
  events.push({
    id: 'loan-signing',
    type: 'loan_signing',
    name: 'Ký HĐMB',
    description: 'Ký hợp đồng mua bán và hợp đồng vay',
    scheduledDate: new Date(startDate),
    month: 0,
    financialImpact: -loanAmount,
    status: 'scheduled',
    iconName: 'home',
    colorCode: '#10B981',
    priority: 9,
    eventData: {
      loanAmount,
      contractSigned: true
    }
  })
  
  // 2. Property Handover (typically 1 month after signing)
  const handoverDate = new Date(startDate)
  handoverDate.setMonth(handoverDate.getMonth() + 1)
  
  events.push({
    id: 'property-handover',
    type: 'property_handover',
    name: 'Nhận nhà',
    description: 'Bàn giao nhà và bắt đầu trả góp',
    scheduledDate: handoverDate,
    month: 1,
    status: 'scheduled',
    iconName: 'key',
    colorCode: '#F59E0B',
    priority: 8,
    eventData: {
      firstPaymentDue: true
    }
  })
  
  // 3. First Payment
  const firstPaymentDate = new Date(handoverDate)
  firstPaymentDate.setDate(15) // Typically mid-month
  
  events.push({
    id: 'first-payment',
    type: 'first_payment',
    name: 'Trả góp đầu tiên',
    description: 'Kỳ trả góp đầu tiên với lãi suất ưu đãi',
    scheduledDate: firstPaymentDate,
    month: 1,
    status: 'scheduled',
    iconName: 'dollar',
    colorCode: '#3B82F6',
    priority: 7
  })
  
  // 4. End of Promotional Period (if applicable)
  if (promotionalPeriodMonths > 0) {
    const promotionalEndDate = new Date(startDate)
    promotionalEndDate.setMonth(promotionalEndDate.getMonth() + promotionalPeriodMonths)
    
    events.push({
      id: 'promotional-end',
      type: 'rate_change',
      name: 'Hết lãi suất ưu đãi',
      description: 'Chuyển sang lãi suất thông thường',
      scheduledDate: promotionalEndDate,
      month: promotionalPeriodMonths,
      status: 'scheduled',
      iconName: 'alert',
      colorCode: '#EF4444',
      priority: 8,
      eventData: {
        rateChange: true,
        newRateType: 'regular'
      }
    })
  }
  
  // 5. Mid-term Milestone (halfway point)
  const midtermMonth = Math.floor(loanTermMonths / 2)
  const midtermDate = new Date(startDate)
  midtermDate.setMonth(midtermDate.getMonth() + midtermMonth)
  
  events.push({
    id: 'midterm-milestone',
    type: 'milestone',
    name: 'Nửa chặng đường',
    description: 'Đã hoàn thành 50% thời gian vay',
    scheduledDate: midtermDate,
    month: midtermMonth,
    status: 'scheduled',
    iconName: 'trend_up',
    colorCode: '#8B5CF6',
    priority: 5
  })
  
  // 6. Loan Completion
  const completionDate = new Date(startDate)
  completionDate.setMonth(completionDate.getMonth() + loanTermMonths)
  
  events.push({
    id: 'loan-completion',
    type: 'loan_completion',
    name: 'Trả hết nợ',
    description: 'Hoàn thành nghĩa vụ trả nợ',
    scheduledDate: completionDate,
    month: loanTermMonths,
    balanceAfterEvent: 0,
    status: 'scheduled',
    iconName: 'target',
    colorCode: '#10B981',
    priority: 10,
    eventData: {
      loanCompleted: true,
      celebrationEvent: true
    }
  })
  
  return events.sort((a, b) => a.month - b.month)
}

/**
 * Generate timeline events from scenario results
 */
export function generateTimelineFromScenario(scenarioResult: ScenarioResults): TimelineEvent[] {
  const events: TimelineEvent[] = []
  const { scenario, cashFlowProjections, metrics } = scenarioResult
  
  // Extract key milestones from cash flow projections
  const startDate = new Date()
  
  // Loan start
  events.push({
    id: 'loan-start',
    type: 'loan_signing',
    name: 'Bắt đầu vay',
    description: scenario.description,
    scheduledDate: startDate,
    month: 0,
    status: 'scheduled',
    iconName: 'home',
    colorCode: '#10B981',
    priority: 9
  })
  
  // Find significant cash flow changes
  cashFlowProjections.forEach((projection, index) => {
    const previousProjection = cashFlowProjections[index - 1]
    
    // Detect payment changes (rate changes, prepayments)
    if (previousProjection && Math.abs(projection.totalPayment - previousProjection.totalPayment) > 1000000) {
      const eventDate = new Date(startDate)
      eventDate.setMonth(eventDate.getMonth() + projection.month)
      
      events.push({
        id: `payment-change-${projection.month}`,
        type: projection.totalPayment > previousProjection.totalPayment ? 'rate_change' : 'prepayment',
        name: projection.totalPayment > previousProjection.totalPayment ? 'Thay đổi kỳ trả' : 'Trả thêm',
        description: `Thay đổi từ ${previousProjection.totalPayment.toLocaleString()} thành ${projection.totalPayment.toLocaleString()}`,
        scheduledDate: eventDate,
        month: projection.month,
        paymentChange: projection.totalPayment - previousProjection.totalPayment,
        balanceAfterEvent: projection.remainingBalance,
        status: 'scheduled',
        iconName: projection.totalPayment > previousProjection.totalPayment ? 'alert' : 'dollar',
        colorCode: projection.totalPayment > previousProjection.totalPayment ? '#EF4444' : '#10B981',
        priority: 7
      })
    }
    
    // Detect when loan is paid off
    if (projection.remainingBalance === 0 && previousProjection?.remainingBalance > 0) {
      const completionDate = new Date(startDate)
      completionDate.setMonth(completionDate.getMonth() + projection.month)
      
      events.push({
        id: 'loan-completion',
        type: 'loan_completion',
        name: 'Trả hết nợ',
        description: 'Hoàn thành nghĩa vụ trả nợ',
        scheduledDate: completionDate,
        month: projection.month,
        balanceAfterEvent: 0,
        status: 'scheduled',
        iconName: 'target',
        colorCode: '#10B981',
        priority: 10
      })
    }
  })
  
  // Add scenario-specific events
  if (scenario.type === 'pessimistic' || scenario.type === 'stress_test') {
    // Add crisis events
    const crisisMonth = Math.floor(cashFlowProjections.length * 0.3) // 30% into the loan
    const crisisDate = new Date(startDate)
    crisisDate.setMonth(crisisDate.getMonth() + crisisMonth)
    
    events.push({
      id: 'crisis-event',
      type: 'crisis_event',
      name: 'Khó khăn tài chính',
      description: 'Tình huống khó khăn trong kịch bản bi quan',
      scheduledDate: crisisDate,
      month: crisisMonth,
      status: 'scheduled',
      iconName: 'alert',
      colorCode: '#EF4444',
      priority: 9,
      eventData: {
        crisisType: scenario.type,
        needsAction: true
      }
    })
  }
  
  if (scenario.type === 'optimistic') {
    // Add opportunity events
    const opportunityMonth = Math.floor(cashFlowProjections.length * 0.4) // 40% into the loan
    const opportunityDate = new Date(startDate)
    opportunityDate.setMonth(opportunityDate.getMonth() + opportunityMonth)
    
    events.push({
      id: 'opportunity-event',
      type: 'opportunity',
      name: 'Cơ hội đầu tư',
      description: 'Cơ hội mở rộng danh mục trong kịch bản lạc quan',
      scheduledDate: opportunityDate,
      month: opportunityMonth,
      status: 'scheduled',
      iconName: 'trend_up',
      colorCode: '#3B82F6',
      priority: 6
    })
  }
  
  return events.sort((a, b) => a.month - b.month)
}

/**
 * Convert scenario results to timeline scenario
 */
export function convertScenarioToTimeline(scenarioResult: ScenarioResults): TimelineScenario {
  const events = generateTimelineFromScenario(scenarioResult)
  
  // Determine risk level based on scenario metrics
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  
  if (scenarioResult.metrics.debtToIncomeRatio > 40) {
    riskLevel = 'high'
  } else if (scenarioResult.metrics.debtToIncomeRatio > 30 || scenarioResult.metrics.affordabilityScore < 6) {
    riskLevel = 'medium'
  }
  
  // Override risk level for specific scenario types
  if (scenarioResult.scenario.type === 'stress_test' || scenarioResult.scenario.type === 'pessimistic') {
    riskLevel = 'high'
  } else if (scenarioResult.scenario.type === 'optimistic') {
    riskLevel = 'low'
  }
  
  return {
    id: scenarioResult.scenario.id,
    name: scenarioResult.scenario.name,
    type: scenarioResult.scenario.type,
    events,
    totalDuration: Math.max(...events.map(e => e.month)),
    totalInterest: scenarioResult.metrics.totalInterest,
    monthlySavings: scenarioResult.comparisonToBaseline?.monthlySavings,
    riskLevel
  }
}

/**
 * Generate crisis timeline events
 */
export function generateCrisisTimeline(
  baseEvents: TimelineEvent[],
  crisisMonth: number,
  crisisType: 'payment_delay' | 'restructure' | 'default'
): TimelineEvent[] {
  const crisisEvents = [...baseEvents]
  const startDate = new Date()
  
  switch (crisisType) {
    case 'payment_delay':
      // Add missed payment events
      for (let i = 0; i < 3; i++) {
        const missedMonth = crisisMonth + i
        const missedDate = new Date(startDate)
        missedDate.setMonth(missedDate.getMonth() + missedMonth)
        
        crisisEvents.push({
          id: `missed-payment-${missedMonth}`,
          type: 'crisis_event',
          name: `Trễ thanh toán T+${missedMonth}`,
          description: 'Không thể thanh toán đúng hạn',
          scheduledDate: missedDate,
          month: missedMonth,
          status: 'scheduled',
          iconName: 'alert',
          colorCode: '#EF4444',
          priority: 9,
          eventData: {
            missedPayment: true,
            penaltyApplied: true
          }
        })
      }
      break
      
    case 'restructure':
      const restructureDate = new Date(startDate)
      restructureDate.setMonth(restructureDate.getMonth() + crisisMonth + 3)
      
      crisisEvents.push({
        id: 'loan-restructure',
        type: 'milestone',
        name: 'Tái cấu trúc khoản vay',
        description: 'Đàm phán lại điều kiện vay với ngân hàng',
        scheduledDate: restructureDate,
        month: crisisMonth + 3,
        status: 'scheduled',
        iconName: 'settings',
        colorCode: '#F59E0B',
        priority: 8,
        eventData: {
          restructured: true,
          newTerms: true
        }
      })
      break
      
    case 'default':
      const defaultDate = new Date(startDate)
      defaultDate.setMonth(defaultDate.getMonth() + crisisMonth + 6)
      
      crisisEvents.push({
        id: 'loan-default',
        type: 'crisis_event',
        name: 'Vỡ nợ',
        description: 'Không thể tiếp tục trả nợ - nguy cơ tịch thu tài sản',
        scheduledDate: defaultDate,
        month: crisisMonth + 6,
        status: 'scheduled',
        iconName: 'alert',
        colorCode: '#DC2626',
        priority: 10,
        eventData: {
          defaulted: true,
          foreclosureRisk: true
        }
      })
      break
  }
  
  return crisisEvents.sort((a, b) => a.month - b.month)
}

/**
 * Add prepayment event to timeline
 */
export function addPrepaymentEvent(
  events: TimelineEvent[],
  month: number,
  amount: number
): TimelineEvent[] {
  const newEvents = [...events]
  const startDate = new Date()
  const prepaymentDate = new Date(startDate)
  prepaymentDate.setMonth(prepaymentDate.getMonth() + month)
  
  // Remove any existing prepayment at this month
  const existingIndex = newEvents.findIndex(e => e.month === month && e.type === 'prepayment')
  if (existingIndex >= 0) {
    newEvents.splice(existingIndex, 1)
  }
  
  newEvents.push({
    id: `prepayment-${month}`,
    type: 'prepayment',
    name: 'Trả thêm',
    description: `Trả thêm ${amount.toLocaleString()} VND`,
    scheduledDate: prepaymentDate,
    month,
    financialImpact: -amount,
    status: 'scheduled',
    iconName: 'dollar',
    colorCode: '#10B981',
    priority: 6,
    eventData: {
      prepaymentAmount: amount
    }
  })
  
  return newEvents.sort((a, b) => a.month - b.month)
}

/**
 * Calculate timeline compression after prepayment
 */
export function calculateTimelineCompression(
  originalEvents: TimelineEvent[],
  prepaymentMonth: number,
  prepaymentAmount: number,
  remainingBalance: number
): { compressedEvents: TimelineEvent[]; monthsSaved: number } {
  // This is a simplified calculation - in practice you'd use the financial calculation engine
  const interestSaved = prepaymentAmount * 0.8 // Rough estimate
  const monthsSaved = Math.floor(interestSaved / 10000000) // Rough estimate: 10M VND = 1 month
  
  const compressedEvents = originalEvents.map(event => {
    if (event.month > prepaymentMonth) {
      return {
        ...event,
        month: Math.max(prepaymentMonth + 1, event.month - monthsSaved)
      }
    }
    return event
  })
  
  return { compressedEvents, monthsSaved }
}

const timelineUtils = {
  generateTimelineEvents,
  generateTimelineFromScenario,
  convertScenarioToTimeline,
  generateCrisisTimeline,
  addPrepaymentEvent,
  calculateTimelineCompression
}

export default timelineUtils