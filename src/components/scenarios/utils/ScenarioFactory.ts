// src/components/scenarios/utils/ScenarioFactory.ts

import type { TimelineScenario } from '@/components/timeline/TimelineVisualization'
import { calculateScenarioMetrics } from './ScenarioCalculations'

/**
 * Create scenario from database data or baseline parameters
 */
export const createScenarioFromData = (
  id: string,
  name: string,
  type: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test',
  description: string,
  riskLevel: 'low' | 'medium' | 'high',
  purchasePrice: number = 3000000000,
  downPayment: number = 600000000,
  interestRate: number = 8.5,
  termMonths: number = 240,
  monthlyIncome: number = 50000000,
  monthlyExpenses: number = 30000000
): TimelineScenario => {
  const calculatedMetrics = calculateScenarioMetrics(
    purchasePrice,
    downPayment,
    interestRate,
    termMonths,
    monthlyIncome,
    monthlyExpenses
  )

  return {
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
    purchase_price: purchasePrice,
    down_payment: downPayment,
    additional_costs: 0,
    other_debts: 0,
    monthly_income: monthlyIncome,
    current_monthly_expenses: null,
    monthly_expenses: monthlyExpenses,
    current_savings: null,
    target_timeframe_months: termMonths,
    expected_roi: interestRate,
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
    // New required fields
    is_favorite: false,
    roi: interestRate,
    total_progress: 0,
    financial_progress: 0,
    monthly_contribution: 0,
    estimated_completion_date: null,
    risk_level: riskLevel,
    tags: [],
    notes: null,
    shared_with: [],
    calculatedMetrics
  }
}

/**
 * Generate AI-powered smart scenarios using Gemini API
 * This function serves as a wrapper for the Gemini service
 * Falls back to rule-based generation if AI is unavailable
 */
export const generateSmartScenarios = async (
  baseScenario: TimelineScenario | undefined,
  userProfile: {
    monthlyIncome: number
    monthlyExpenses: number
    riskTolerance: string
    investmentGoals: string
  },
  additionalData?: {
    currentSavings?: number
    dependents?: number
    age?: number
    location?: string
    investmentHorizon?: number
  },
  locale: string = 'en'
): Promise<{
  scenarios: TimelineScenario[]
  analysis: {
    userProfileSummary: string
    marketContext: string
    overallStrategy: string
    nextSteps: string[]
  }
}> => {
  // Import Gemini service dynamically to avoid SSR issues
  const { geminiScenarioService } = await import('@/lib/services/geminiService')
  
  try {
    // Prepare user profile for AI analysis
    const aiUserProfile = {
      monthlyIncome: userProfile.monthlyIncome,
      monthlyExpenses: userProfile.monthlyExpenses,
      currentSavings: additionalData?.currentSavings || 0,
      riskTolerance: userProfile.riskTolerance as 'conservative' | 'moderate' | 'aggressive',
      investmentGoals: userProfile.investmentGoals,
      dependents: additionalData?.dependents || 0,
      age: additionalData?.age,
      location: additionalData?.location,
      investmentHorizon: additionalData?.investmentHorizon || 240
    }

    // Get AI-powered analysis
    const aiAnalysis = await geminiScenarioService.generateSmartScenarios(
      aiUserProfile,
      baseScenario ? {
        purchasePrice: baseScenario.purchase_price || 3000000000,
        downPayment: baseScenario.down_payment || 600000000,
        interestRate: baseScenario.expected_roi || 8.5,
        loanTermMonths: baseScenario.target_timeframe_months || 240
      } : undefined,
      locale
    )

    // Convert AI recommendations to TimelineScenario objects
    const aiScenarios: TimelineScenario[] = aiAnalysis.recommendations.map((rec, index) => {
      const downPayment = rec.purchasePrice * (rec.downPaymentPercentage / 100)
      
      return createScenarioFromData(
        `ai-scenario-${Date.now()}-${index}`,
        rec.name,
        rec.type,
        `${rec.description}\n\nAI Reasoning: ${rec.reasoning}`,
        rec.riskLevel,
        rec.purchasePrice,
        downPayment,
        rec.interestRate,
        rec.loanTermYears * 12, // Convert years to months
        userProfile.monthlyIncome,
        userProfile.monthlyExpenses
      )
    })

    return {
      scenarios: aiScenarios,
      analysis: {
        userProfileSummary: aiAnalysis.userProfileSummary,
        marketContext: aiAnalysis.marketContext,
        overallStrategy: aiAnalysis.overallStrategy,
        nextSteps: aiAnalysis.nextSteps
      }
    }
  } catch (error) {
    console.error('AI scenario generation failed, falling back to rule-based:', error)
    
    // Fallback to original rule-based generation
    const fallbackScenarios = generateRuleBasedSmartScenarios(baseScenario, userProfile)
    
    return {
      scenarios: fallbackScenarios,
      analysis: locale === 'vi' ? {
        userProfileSummary: `Phân tích dựa trên khả năng chấp nhận rủi ro ${userProfile.riskTolerance} và thu nhập hàng tháng ${(userProfile.monthlyIncome / 1000000).toFixed(1)}M VND.`,
        marketContext: 'Điều kiện thị trường hiện tại ủng hộ các phương pháp cân bằng với thanh toán trước 20-30%.',
        overallStrategy: 'Được tạo bằng các quy tắc lập kế hoạch tài chính đã được chứng minh và thực tiễn thị trường tốt nhất.',
        nextSteps: [
          'Xem lại các kịch bản được tạo',
          'Xem xét sở thích cá nhân của bạn',
          'Nhận tư vấn chuyên nghiệp cho quyết định cuối cùng'
        ]
      } : {
        userProfileSummary: `Analysis based on your ${userProfile.riskTolerance} risk tolerance and monthly income of ${(userProfile.monthlyIncome / 1000000).toFixed(1)}M VND.`,
        marketContext: 'Current market conditions favor balanced approaches with 20-30% down payments.',
        overallStrategy: 'Generated using proven financial planning rules and market best practices.',
        nextSteps: [
          'Review the generated scenarios',
          'Consider your personal preferences',
          'Get professional advice for final decisions'
        ]
      }
    }
  }
}

/**
 * Original rule-based smart scenario generation (now as fallback)
 */
export const generateRuleBasedSmartScenarios = (
  baseScenario: TimelineScenario | undefined,
  userProfile: {
    monthlyIncome: number
    monthlyExpenses: number
    riskTolerance: string
    investmentGoals: string
  }
): TimelineScenario[] => {
  const smartScenarios: TimelineScenario[] = []
  
  // Conservative scenario (Lower risk, higher down payment)
  if (userProfile.riskTolerance === 'conservative' || userProfile.riskTolerance === 'moderate') {
    smartScenarios.push(createScenarioFromData(
      `ai-conservative-${Date.now()}`,
      'AI Conservative Plan',
      'alternative',
      'AI-generated conservative scenario with lower risk and stable returns',
      'low',
      baseScenario?.purchase_price || 3000000000,
      Math.min((baseScenario?.purchase_price || 3000000000) * 0.35, (baseScenario?.down_payment || 600000000) * 1.4),
      9.2,
      300,
      userProfile.monthlyIncome,
      userProfile.monthlyExpenses * 0.9
    ))
  }

  // Balanced scenario (Optimized parameters)
  smartScenarios.push(createScenarioFromData(
    `ai-balanced-${Date.now()}`,
    'AI Optimized Plan',
    'optimistic', 
    'AI-optimized scenario balancing risk and returns based on market data',
    'medium',
    baseScenario?.purchase_price || 3000000000,
    (baseScenario?.purchase_price || 3000000000) * 0.25,
    8.8,
    240,
    userProfile.monthlyIncome * 1.05,
    userProfile.monthlyExpenses
  ))

  // Aggressive scenario (Higher leverage, faster payoff)
  if (userProfile.riskTolerance === 'aggressive' || userProfile.monthlyIncome > 60000000) {
    smartScenarios.push(createScenarioFromData(
      `ai-aggressive-${Date.now()}`,
      'AI Growth-Focused Plan',
      'alternative',
      'High-leverage scenario optimized for wealth building and faster equity growth',
      'high',
      baseScenario?.purchase_price || 3000000000,
      (baseScenario?.purchase_price || 3000000000) * 0.15,
      9.5,
      180,
      userProfile.monthlyIncome,
      userProfile.monthlyExpenses
    ))
  }

  return smartScenarios
}

/**
 * Create demo scenarios for unauthenticated users
 */
export const createDemoScenarios = (t: (key: string) => string): TimelineScenario[] => [
  createScenarioFromData(
    'demo-scenario-1',
    t('mockScenarios.demoPlanName'),
    'baseline',
    t('mockScenarios.demoPlanDescription'),
    'medium'
  )
]