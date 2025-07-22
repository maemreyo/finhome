// src/lib/services/geminiService.ts
// AI-powered scenario generation using Google Gemini

export interface UserFinancialProfile {
  monthlyIncome: number
  monthlyExpenses: number
  currentSavings?: number
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentGoals: string
  dependents: number
  age?: number
  location?: string
  propertyType?: 'residential' | 'commercial' | 'mixed'
  investmentHorizon?: number // months
}

export interface SmartScenarioRecommendation {
  name: string
  type: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'
  description: string
  riskLevel: 'low' | 'medium' | 'high'
  purchasePrice: number
  downPaymentPercentage: number
  interestRate: number
  loanTermYears: number
  reasoning: string
  keyBenefits: string[]
  potentialRisks: string[]
  monthlyPaymentEstimate: number
  totalCostEstimate: number
}

export interface SmartScenarioAnalysis {
  userProfileSummary: string
  marketContext: string
  recommendations: SmartScenarioRecommendation[]
  overallStrategy: string
  nextSteps: string[]
}

class GeminiScenarioService {
  private readonly apiKey: string | undefined
  private readonly apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  }

  private isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Generate AI-powered scenario analysis using Google Gemini
   */
  async generateSmartScenarios(
    userProfile: UserFinancialProfile,
    baseScenario?: {
      purchasePrice: number
      downPayment: number
      interestRate: number
      loanTermMonths: number
    },
    locale: string = 'en'
  ): Promise<SmartScenarioAnalysis> {
    if (!this.isConfigured()) {
      // Fallback to enhanced rule-based generation when Gemini is not configured
      return this.generateFallbackScenarios(userProfile, baseScenario, locale)
    }

    try {
      const prompt = this.buildScenarioPrompt(userProfile, baseScenario, locale)
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!aiResponse) {
        throw new Error('No response from Gemini API')
      }

      return this.parseAIResponse(aiResponse, userProfile, baseScenario)
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      // Fallback to rule-based scenarios on error
      return this.generateFallbackScenarios(userProfile, baseScenario, locale)
    }
  }

  private buildScenarioPrompt(
    userProfile: UserFinancialProfile,
    baseScenario?: { purchasePrice: number; downPayment: number; interestRate: number; loanTermMonths: number },
    locale: string = 'en'
  ): string {
    const currencyFormat = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    })

    const isVietnamese = locale === 'vi'
    
    return isVietnamese ? `
Bạn là một cố vấn tài chính bất động sản Việt Nam. Hãy phân tích hồ sơ tài chính của người dùng và tạo ra 3-4 kịch bản đầu tư bất động sản được tối ưu hóa.

HỒ SƠ NGƯỜI DÙNG:
- Thu nhập hàng tháng: ${currencyFormat.format(userProfile.monthlyIncome)}
- Chi phí hàng tháng: ${currencyFormat.format(userProfile.monthlyExpenses)}
- Tiền tiết kiệm hiện tại: ${currencyFormat.format(userProfile.currentSavings || 0)}
- Khả năng chấp nhận rủi ro: ${userProfile.riskTolerance}
- Mục tiêu đầu tư: ${userProfile.investmentGoals}
- Người phụ thuộc: ${userProfile.dependents}
- Thời hạn đầu tư: ${userProfile.investmentHorizon || 240} tháng
${baseScenario ? `
XEM XÉT HIỆN TẠI:
- Giá bất động sản: ${currencyFormat.format(baseScenario.purchasePrice)}
- Tiền trả trước: ${currencyFormat.format(baseScenario.downPayment)}
- Lãi suất: ${baseScenario.interestRate}%
- Thời hạn vay: ${Math.round(baseScenario.loanTermMonths / 12)} năm
` : ''}

BỐI CẢNH THỊ TRƯỜNG (Việt Nam 2024):
- Lãi suất vay mua nhà trung bình: 8.5-12% hàng năm
- Tiền trả trước điển hình: 20-30%
- Tăng giá bất động sản: 5-8% hàng năm ở các thành phố lớn
- Tỷ lệ lạm phát: ~3.5%

Tạo một phân tích tài chính chi tiết với chính xác 3-4 kịch bản. Định dạng phản hồi của bạn như JSON hợp lệ:

{
  "userProfileSummary": "Phân tích ngắn gọn về sức khỏe tài chính và khả năng của người dùng",
  "marketContext": "Thông tin chi tiết về thị trường bất động sản Việt Nam hiện tại",
  "recommendations": [
    {
      "name": "Kế hoạch An toàn Thận trọng",
      "type": "baseline",
      "description": "Chiến lược rủi ro thấp với tiền trả trước cao hơn",
      "riskLevel": "low",
      "purchasePrice": 2800000000,
      "downPaymentPercentage": 35,
      "interestRate": 9.2,
      "loanTermYears": 25,
      "reasoning": "Tại sao cách tiếp cận này giảm thiểu rủi ro",
      "keyBenefits": ["Thanh toán hàng tháng thấp hơn", "Giảm gánh nặng lãi suất"],
      "potentialRisks": ["Chi phí cơ hội của việc trả trước cao"],
      "monthlyPaymentEstimate": 18500000,
      "totalCostEstimate": 4200000000
    }
  ],
  "overallStrategy": "Phương pháp tổng thể được đề xuất dựa trên khả năng chịu rủi ro và mục tiêu",
  "nextSteps": ["Khuyến nghị hành động cụ thể cho người dùng"]
}

Đảm bảo giá mua thực tế cho thị trường Việt Nam (khoảng 1.5-5 tỷ VND). Tính toán thanh toán hàng tháng chính xác bằng công thức thế chấp Việt Nam. Xem xét tỷ lệ DTI nên dưới 40% để được phê duyệt.
    `.trim() : `
You are a Vietnamese real estate financial advisor. Analyze the user's financial profile and generate 3-4 optimized property investment scenarios.

USER PROFILE:
- Monthly Income: ${currencyFormat.format(userProfile.monthlyIncome)}
- Monthly Expenses: ${currencyFormat.format(userProfile.monthlyExpenses)}
- Current Savings: ${currencyFormat.format(userProfile.currentSavings || 0)}
- Risk Tolerance: ${userProfile.riskTolerance}
- Investment Goals: ${userProfile.investmentGoals}
- Dependents: ${userProfile.dependents}
- Investment Horizon: ${userProfile.investmentHorizon || 240} months
${baseScenario ? `
CURRENT CONSIDERATION:
- Property Price: ${currencyFormat.format(baseScenario.purchasePrice)}
- Down Payment: ${currencyFormat.format(baseScenario.downPayment)}
- Interest Rate: ${baseScenario.interestRate}%
- Loan Term: ${Math.round(baseScenario.loanTermMonths / 12)} years
` : ''}

MARKET CONTEXT (Vietnam 2024):
- Average mortgage rates: 8.5-12% annually
- Typical down payment: 20-30%
- Property appreciation: 5-8% annually in major cities
- Inflation rate: ~3.5%

Generate a detailed financial analysis with exactly 3-4 scenarios. Format your response as valid JSON:

{
  "userProfileSummary": "Brief analysis of user's financial health and capacity",
  "marketContext": "Current Vietnamese real estate market insights",
  "recommendations": [
    {
      "name": "Conservative Safe Plan",
      "type": "baseline",
      "description": "Low-risk strategy with higher down payment",
      "riskLevel": "low",
      "purchasePrice": 2800000000,
      "downPaymentPercentage": 35,
      "interestRate": 9.2,
      "loanTermYears": 25,
      "reasoning": "Why this approach minimizes risk",
      "keyBenefits": ["Lower monthly payments", "Reduced interest burden"],
      "potentialRisks": ["Opportunity cost of high down payment"],
      "monthlyPaymentEstimate": 18500000,
      "totalCostEstimate": 4200000000
    }
  ],
  "overallStrategy": "Recommended overall approach based on risk tolerance and goals",
  "nextSteps": ["Specific actionable recommendations for the user"]
}

Make sure purchase prices are realistic for Vietnamese market (1.5-5 billion VND range). Calculate accurate monthly payments using Vietnamese mortgage formulas. Consider DTI ratios should be under 40% for approval.
    `.trim()
  }

  private parseAIResponse(
    aiResponse: string,
    userProfile: UserFinancialProfile,
    baseScenario?: any
  ): SmartScenarioAnalysis {
    try {
      // Extract JSON from the AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const analysis = JSON.parse(jsonMatch[0]) as SmartScenarioAnalysis
      
      // Validate and sanitize the response
      if (!analysis.recommendations || !Array.isArray(analysis.recommendations)) {
        throw new Error('Invalid recommendations format')
      }

      // Ensure all scenarios have required fields
      analysis.recommendations = analysis.recommendations.map(rec => ({
        ...rec,
        name: rec.name || 'AI Generated Plan',
        type: rec.type || 'alternative',
        description: rec.description || 'AI-optimized scenario',
        riskLevel: rec.riskLevel || 'medium',
        reasoning: rec.reasoning || 'Optimized for your financial profile',
        keyBenefits: rec.keyBenefits || ['Tailored to your profile'],
        potentialRisks: rec.potentialRisks || ['Market volatility']
      }))

      return analysis
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return this.generateFallbackScenarios(userProfile, baseScenario)
    }
  }

  /**
   * Enhanced fallback scenarios when AI is not available
   */
  private generateFallbackScenarios(
    userProfile: UserFinancialProfile,
    baseScenario?: any,
    locale: string = 'en'
  ): SmartScenarioAnalysis {
    const basePurchasePrice = baseScenario?.purchasePrice || 3000000000
    const disposableIncome = userProfile.monthlyIncome - userProfile.monthlyExpenses
    const dtiRatio = disposableIncome / userProfile.monthlyIncome

    const recommendations: SmartScenarioRecommendation[] = []

    // Conservative scenario
    if (userProfile.riskTolerance === 'conservative' || dtiRatio < 0.3) {
      recommendations.push({
        name: 'Conservative Stability Plan',
        type: 'baseline',
        description: 'Low-risk approach with maximum financial safety',
        riskLevel: 'low',
        purchasePrice: Math.min(basePurchasePrice, disposableIncome * 60), // Conservative price-to-income ratio
        downPaymentPercentage: 35,
        interestRate: 9.5,
        loanTermYears: 25,
        reasoning: 'High down payment reduces loan risk and monthly burden',
        keyBenefits: ['Lower monthly payments', 'Reduced total interest', 'Lower approval risk'],
        potentialRisks: ['Opportunity cost of high down payment', 'Slower wealth building'],
        monthlyPaymentEstimate: disposableIncome * 0.3,
        totalCostEstimate: basePurchasePrice * 1.4
      })
    }

    // Balanced scenario
    recommendations.push({
      name: 'Balanced Growth Plan', 
      type: 'optimistic',
      description: 'Optimal balance between risk and returns',
      riskLevel: 'medium',
      purchasePrice: basePurchasePrice,
      downPaymentPercentage: 25,
      interestRate: 9.0,
      loanTermYears: 20,
      reasoning: 'Market-standard approach with good balance of leverage and safety',
      keyBenefits: ['Moderate leverage', 'Faster equity building', 'Good market positioning'],
      potentialRisks: ['Interest rate fluctuation', 'Market volatility'],
      monthlyPaymentEstimate: disposableIncome * 0.35,
      totalCostEstimate: basePurchasePrice * 1.35
    })

    // Aggressive scenario for high-income users
    if (userProfile.riskTolerance === 'aggressive' && dtiRatio > 0.4) {
      recommendations.push({
        name: 'Wealth Maximization Plan',
        type: 'alternative',
        description: 'High-leverage strategy for accelerated wealth building',
        riskLevel: 'high',
        purchasePrice: basePurchasePrice * 1.2,
        downPaymentPercentage: 20,
        interestRate: 9.8,
        loanTermYears: 15,
        reasoning: 'Maximize leverage to accelerate equity growth and portfolio expansion',
        keyBenefits: ['Higher leverage potential', 'Faster payoff', 'Maximum wealth building'],
        potentialRisks: ['Higher monthly payments', 'Market sensitivity', 'Cash flow pressure'],
        monthlyPaymentEstimate: disposableIncome * 0.45,
        totalCostEstimate: basePurchasePrice * 1.3
      })
    }

    const isVietnamese = locale === 'vi'
    
    return {
      userProfileSummary: isVietnamese 
        ? `Dựa trên thu nhập hàng tháng của bạn là ${(userProfile.monthlyIncome / 1000000).toFixed(1)}M VND và khả năng chấp nhận rủi ro ${userProfile.riskTolerance}, bạn có ${(disposableIncome / 1000000).toFixed(1)}M VND khả dụng hàng tháng để đầu tư bất động sản.`
        : `Based on your monthly income of ${(userProfile.monthlyIncome / 1000000).toFixed(1)}M VND and ${userProfile.riskTolerance} risk tolerance, you have ${(disposableIncome / 1000000).toFixed(1)}M VND available monthly for property investment.`,
      marketContext: isVietnamese
        ? 'Thị trường bất động sản Việt Nam tăng trưởng ổn định với lãi suất thế chấp từ 8.5-12%. Giá bất động sản tại các thành phố lớn tiếp tục tăng 5-8% hàng năm.'
        : 'Vietnamese real estate market shows steady growth with mortgage rates between 8.5-12%. Property prices in major cities continue appreciating at 5-8% annually.',
      recommendations,
      overallStrategy: isVietnamese
        ? (userProfile.riskTolerance === 'conservative' 
            ? 'Tập trung vào sự ổn định với thanh toán trước cao hơn và thời hạn dài hơn để giảm thiểu gánh nặng hàng tháng'
            : userProfile.riskTolerance === 'aggressive'
            ? 'Tận dụng cơ hội thị trường với tài chính tối ưu để tối đa hóa tiềm năng tạo dựng tài sản'
            : 'Cân bằng rủi ro và lợi nhuận với cách tiếp cận tiêu chuẩn thị trường và đòn bẩy vừa phải')
        : (userProfile.riskTolerance === 'conservative' 
            ? 'Focus on stability with higher down payments and longer terms to minimize monthly burden'
            : userProfile.riskTolerance === 'aggressive'
            ? 'Leverage market opportunities with optimal financing to maximize wealth building potential'
            : 'Balance risk and returns with market-standard approach and moderate leverage'),
      nextSteps: isVietnamese
        ? [
            'Xem xét và so sánh các kịch bản chi tiết',
            'Nhận phê duyệt trước cho kịch bản ưa thích của bạn',
            'Nghiên cứu bất động sản trong phạm vi giá mục tiêu',
            'Xem xét tư vấn với nhà môi giới thế chấp để có mức lãi suất tốt nhất'
          ]
        : [
            'Review and compare detailed scenarios',
            'Get pre-approval for your preferred scenario',
            'Research properties in your target price range',
            'Consider consulting with a mortgage broker for best rates'
          ]
    }
  }
}

export const geminiScenarioService = new GeminiScenarioService()