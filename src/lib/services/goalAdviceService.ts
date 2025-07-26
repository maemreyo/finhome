// src/lib/services/goalAdviceService.ts
// Enhanced service for providing personalized financial advice for savings goals

import { createClient } from '@/lib/supabase/client'

export interface SpendingAnalysis {
  categoryId: string
  categoryName: string
  averageMonthlySpending: number
  lastMonthSpending: number
  trend: 'increasing' | 'decreasing' | 'stable'
  percentageOfIncome: number
  isReducible: boolean
  priority: 'high' | 'medium' | 'low'
}

export interface GoalAdvice {
  goalId: string
  goalName: string
  requiredMonthlySavings: number
  currentMonthlySavings: number
  gap: number
  spendingRecommendations: SpendingRecommendation[]
  timeline: {
    canAchieveOnTime: boolean
    recommendedAdjustments?: string[]
    alternativeTimeline?: number
  }
  housePurchaseSpecific?: HousePurchaseAdvice
}

export interface SpendingRecommendation {
  categoryId: string
  categoryName: string
  currentSpending: number
  recommendedReduction: number
  potentialSavings: number
  difficulty: 'easy' | 'medium' | 'hard'
  specificActions: string[]
  impact: 'low' | 'medium' | 'high'
}

export interface HousePurchaseAdvice {
  stage: string
  stageSpecificTips: string[]
  downPaymentProgress: number
  recommendedEmergencyFund: number
  debtToIncomeRatio?: number
  creditScoreRecommendations?: string[]
  nextSteps: string[]
}

export class GoalAdviceService {
  private supabase = createClient()

  /**
   * Analyze user's spending patterns and generate actionable advice for a specific goal
   */
  async generateGoalAdvice(userId: string, goalId: string): Promise<GoalAdvice> {
    try {
      // Fetch goal details
      const { data: goal, error: goalError } = await this.supabase
        .from('expense_goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', userId)
        .single()

      if (goalError || !goal) {
        throw new Error('Goal not found')
      }

      // Get user's spending analysis
      const spendingAnalysis = await this.analyzeUserSpending(userId)
      
      // Calculate required monthly savings
      const requiredMonthlySavings = this.calculateRequiredMonthlySavings(goal)
      
      // Get current savings rate
      const currentMonthlySavings = await this.calculateCurrentSavingsRate(userId)
      
      // Generate spending recommendations
      const spendingRecommendations = this.generateSpendingRecommendations(
        spendingAnalysis, 
        requiredMonthlySavings - currentMonthlySavings
      )

      // Generate timeline analysis
      const timeline = this.analyzeTimeline(goal, currentMonthlySavings, requiredMonthlySavings)

      // Generate house-specific advice if applicable
      const housePurchaseSpecific = goal.goal_type === 'buy_house' 
        ? await this.generateHousePurchaseAdvice(userId, goal) 
        : undefined

      return {
        goalId: goal.id,
        goalName: goal.name,
        requiredMonthlySavings,
        currentMonthlySavings,
        gap: requiredMonthlySavings - currentMonthlySavings,
        spendingRecommendations,
        timeline,
        housePurchaseSpecific
      }
    } catch (error) {
      console.error('Error generating goal advice:', error)
      throw error
    }
  }

  /**
   * Analyze user's spending patterns by category
   */
  private async analyzeUserSpending(userId: string): Promise<SpendingAnalysis[]> {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    // Get expense transactions for the last 3 months
    const { data: transactions, error } = await this.supabase
      .from('expense_transactions')
      .select(`
        amount,
        transaction_date,
        expense_category_id,
        expense_categories(id, name_vi)
      `)
      .eq('user_id', userId)
      .eq('transaction_type', 'expense')
      .gte('transaction_date', threeMonthsAgo.toISOString().split('T')[0])
      .order('transaction_date', { ascending: false })

    if (error || !transactions) {
      console.error('Error fetching transactions:', error)
      return []
    }

    // Group by category and calculate spending patterns
    const categorySpending: { [categoryId: string]: {
      categoryName: string
      monthlyAmounts: number[]
      totalAmount: number
    } } = {}

    transactions.forEach(transaction => {
      const categoryId = transaction.expense_category_id
      const amount = Number(transaction.amount)
      const categoryName = (transaction.expense_categories as any)?.name_vi || 'Unknown'

      if (categoryId && !categorySpending[categoryId]) {
        categorySpending[categoryId] = {
          categoryName,
          monthlyAmounts: [0, 0, 0], // Last 3 months
          totalAmount: 0
        }
      }

      // Determine which month this transaction belongs to
      const transactionDate = new Date(transaction.transaction_date)
      const monthsAgo = Math.floor((Date.now() - transactionDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      
      if (categoryId && monthsAgo >= 0 && monthsAgo < 3) {
        categorySpending[categoryId].monthlyAmounts[monthsAgo] += amount
      }
      if (categoryId) {
        categorySpending[categoryId].totalAmount += amount
      }
    })

    // Convert to SpendingAnalysis array
    return Object.entries(categorySpending).map(([categoryId, data]) => {
      const averageMonthlySpending = data.totalAmount / 3
      const lastMonthSpending = data.monthlyAmounts[0]
      const previousMonthSpending = data.monthlyAmounts[1]

      // Determine trend
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (lastMonthSpending > previousMonthSpending * 1.1) {
        trend = 'increasing'
      } else if (lastMonthSpending < previousMonthSpending * 0.9) {
        trend = 'decreasing'
      }

      // Determine if category is reducible (non-essential categories)
      const isReducible = this.isCategoryReducible(data.categoryName)
      
      // Assign priority based on spending amount and reducibility
      const priority = this.calculateReductionPriority(averageMonthlySpending, isReducible)

      return {
        categoryId,
        categoryName: data.categoryName,
        averageMonthlySpending,
        lastMonthSpending,
        trend,
        percentageOfIncome: 0, // Will be calculated separately if income data is available
        isReducible,
        priority
      }
    }).sort((a, b) => b.averageMonthlySpending - a.averageMonthlySpending)
  }

  /**
   * Calculate required monthly savings for a goal
   */
  private calculateRequiredMonthlySavings(goal: any): number {
    if (!goal.target_date) return 0

    const targetDate = new Date(goal.target_date)
    const now = new Date()
    const monthsRemaining = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    
    // Get current progress
    const remainingAmount = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount || 0))
    
    return remainingAmount / monthsRemaining
  }

  /**
   * Calculate user's current savings rate
   */
  private async calculateCurrentSavingsRate(userId: string): Promise<number> {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    // Get income and expenses for last month
    const { data: transactions, error } = await this.supabase
      .from('expense_transactions')
      .select('amount, transaction_type')
      .eq('user_id', userId)
      .gte('transaction_date', lastMonth.toISOString().split('T')[0])

    if (error || !transactions) return 0

    const income = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return Math.max(0, income - expenses)
  }

  /**
   * Generate specific spending reduction recommendations
   */
  private generateSpendingRecommendations(
    spendingAnalysis: SpendingAnalysis[], 
    targetReduction: number
  ): SpendingRecommendation[] {
    const recommendations: SpendingRecommendation[] = []
    let remainingReduction = targetReduction

    // Sort by priority and reducibility
    const sortedCategories = spendingAnalysis
      .filter(category => category.isReducible && category.averageMonthlySpending > 0)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

    for (const category of sortedCategories) {
      if (remainingReduction <= 0) break

      const maxReduction = this.calculateMaxReduction(category)
      const recommendedReduction = Math.min(remainingReduction, maxReduction)

      if (recommendedReduction > 0) {
        const recommendation: SpendingRecommendation = {
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          currentSpending: category.averageMonthlySpending,
          recommendedReduction,
          potentialSavings: recommendedReduction,
          difficulty: this.calculateDifficulty(category.categoryName, recommendedReduction / category.averageMonthlySpending),
          specificActions: this.generateSpecificActions(category.categoryName, recommendedReduction),
          impact: this.calculateImpact(recommendedReduction / targetReduction)
        }

        recommendations.push(recommendation)
        remainingReduction -= recommendedReduction
      }
    }

    return recommendations
  }

  /**
   * Analyze timeline feasibility
   */
  private analyzeTimeline(goal: any, currentSavings: number, requiredSavings: number) {
    const canAchieveOnTime = currentSavings >= requiredSavings
    const recommendedAdjustments: string[] = []

    if (!canAchieveOnTime) {
      const gap = requiredSavings - currentSavings
      
      recommendedAdjustments.push(
        `Cần tăng tiết kiệm thêm ${gap.toLocaleString('vi-VN')} VND mỗi tháng`
      )

      if (gap > currentSavings * 0.5) {
        recommendedAdjustments.push('Xem xét kéo dài thời gian mục tiêu để giảm áp lực tài chính')
      }
    }

    // Calculate alternative timeline if needed
    let alternativeTimeline: number | undefined
    if (!canAchieveOnTime && currentSavings > 0) {
      const remainingAmount = Number(goal.target_amount) - Number(goal.current_amount || 0)
      alternativeTimeline = Math.ceil(remainingAmount / currentSavings)
    }

    return {
      canAchieveOnTime,
      recommendedAdjustments: recommendedAdjustments.length > 0 ? recommendedAdjustments : undefined,
      alternativeTimeline
    }
  }

  /**
   * Generate house purchase specific advice
   */
  private async generateHousePurchaseAdvice(userId: string, goal: any): Promise<HousePurchaseAdvice> {
    const stage = goal.house_purchase_data?.funnel_stage || 'initial'
    const downPaymentPercentage = goal.house_purchase_data?.down_payment_percentage || 20
    const currentAmount = Number(goal.current_amount || 0)
    const targetAmount = Number(goal.target_amount)
    
    const downPaymentProgress = (currentAmount / targetAmount) * 100

    // Calculate recommended emergency fund (3-6 months of expenses)
    const monthlyExpenses = await this.calculateMonthlyExpenses(userId)
    const recommendedEmergencyFund = monthlyExpenses * 6

    // Get additional financial metrics for house purchase
    const monthlyIncome = await this.calculateMonthlyIncome(userId)
    const debtToIncomeRatio = monthlyExpenses / monthlyIncome * 100

    const stageSpecificTips = this.getHousePurchaseStageAdvice(stage, downPaymentProgress)
    const nextSteps = this.getHousePurchaseNextSteps(stage, downPaymentProgress)
    const creditScoreRecommendations = this.getCreditScoreRecommendations(stage, downPaymentProgress)

    return {
      stage,
      stageSpecificTips,
      downPaymentProgress,
      recommendedEmergencyFund,
      debtToIncomeRatio: debtToIncomeRatio > 0 ? debtToIncomeRatio : undefined,
      creditScoreRecommendations,
      nextSteps
    }
  }

  /**
   * Calculate user's monthly income
   */
  private async calculateMonthlyIncome(userId: string): Promise<number> {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const { data: transactions, error } = await this.supabase
      .from('expense_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('transaction_type', 'income')
      .gte('transaction_date', lastMonth.toISOString().split('T')[0])

    if (error || !transactions) return 0

    return transactions.reduce((sum, t) => sum + Number(t.amount), 0)
  }

  /**
   * Get credit score recommendations based on house purchase stage
   */
  private getCreditScoreRecommendations(stage: string, progress: number): string[] {
    const baseRecommendations = [
      'Kiểm tra báo cáo tín dụng miễn phí hàng năm',
      'Thanh toán tất cả các khoản nợ đúng hạn',
      'Giữ mức sử dụng thẻ tín dụng dưới 30%',
      'Không đóng các tài khoản tín dụng cũ'
    ]

    const stageSpecific: { [key: string]: string[] } = {
      initial: [
        'Bắt đầu theo dõi điểm tín dụng thường xuyên',
        'Cân nhắc mở tài khoản tiết kiệm chuyên dụng cho mua nhà'
      ],
      researching: [
        'Liên hệ ngân hàng để tư vấn về điều kiện vay',
        'Cải thiện điểm tín dụng nếu dưới 650 điểm'
      ],
      ready_to_view: [
        'Xin giấy xác nhận khả năng vay từ ngân hàng',
        'Chuẩn bị đầy đủ hồ sơ tài chính'
      ],
      qualified_lead: [
        'Hoàn tất thủ tục vay với ngân hàng đã chọn',
        'Đảm bảo không có thay đổi lớn về tài chính trước khi ký hợp đồng'
      ]
    }

    return [...baseRecommendations, ...(stageSpecific[stage] || [])]
  }

  /**
   * Calculate user's monthly expenses
   */
  private async calculateMonthlyExpenses(userId: string): Promise<number> {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const { data: transactions, error } = await this.supabase
      .from('expense_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('transaction_type', 'expense')
      .gte('transaction_date', lastMonth.toISOString().split('T')[0])

    if (error || !transactions) return 0

    return transactions.reduce((sum, t) => sum + Number(t.amount), 0)
  }

  /**
   * Helper methods
   */
  private isCategoryReducible(categoryName: string): boolean {
    const nonReducibleCategories = [
      'Bills & Utilities', 'Healthcare', 'Insurance', 'Debt Payment',
      'Hóa đơn & Tiện ích', 'Y tế', 'Bảo hiểm', 'Trả nợ'
    ]
    
    const reducibleCategories = [
      'Entertainment', 'Dining Out', 'Shopping', 'Travel', 'Hobbies',
      'Giải trí', 'Ăn ngoài', 'Mua sắm', 'Du lịch', 'Sở thích'
    ]

    return !nonReducibleCategories.some(cat => 
      categoryName.toLowerCase().includes(cat.toLowerCase())
    ) || reducibleCategories.some(cat =>
      categoryName.toLowerCase().includes(cat.toLowerCase())
    )
  }

  private calculateReductionPriority(averageSpending: number, isReducible: boolean): 'high' | 'medium' | 'low' {
    if (!isReducible) return 'low'
    if (averageSpending > 2000000) return 'high'  // > 2M VND
    if (averageSpending > 500000) return 'medium' // > 500K VND
    return 'low'
  }

  private calculateMaxReduction(category: SpendingAnalysis): number {
    // Maximum reduction percentages by category type
    const reductionLimits = {
      high: 0.3,   // Can reduce up to 30%
      medium: 0.2, // Can reduce up to 20%
      low: 0.1     // Can reduce up to 10%
    }

    return category.averageMonthlySpending * reductionLimits[category.priority]
  }

  private calculateDifficulty(categoryName: string, reductionPercentage: number): 'easy' | 'medium' | 'hard' {
    if (reductionPercentage > 0.25) return 'hard'
    if (reductionPercentage > 0.15) return 'medium'
    return 'easy'
  }

  private calculateImpact(percentage: number): 'low' | 'medium' | 'high' {
    if (percentage > 0.3) return 'high'
    if (percentage > 0.15) return 'medium'
    return 'low'
  }

  private generateSpecificActions(categoryName: string, reduction: number): string[] {
    const actions: { [key: string]: string[] } = {
      'Food & Dining': [
        'Nấu ăn tại nhà thay vì đặt đồ ăn',
        'Mang cơm trưa đi làm',
        'Giảm số lần ăn ngoài mỗi tuần'
      ],
      'Entertainment': [
        'Chọn các hoạt động giải trí miễn phí',
        'Chia sẻ tài khoản streaming với gia đình',
        'Tham gia các sự kiện cộng đồng miễn phí'
      ],
      'Shopping': [
        'Lập danh sách mua sắm và tuân thủ',
        'So sánh giá trước khi mua',
        'Áp dụng quy tắc "đợi 24 giờ" trước khi mua đồ không cần thiết'
      ],
      'Transportation': [
        'Sử dụng phương tiện công cộng',
        'Đi chung xe với đồng nghiệp',
        'Kết hợp nhiều việc vặt trong một chuyến đi'
      ]
    }

    // Find matching category
    const matchingCategory = Object.keys(actions).find(key => 
      categoryName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(categoryName.toLowerCase())
    )

    return matchingCategory ? actions[matchingCategory] : [
      'Xem xét giảm chi tiêu trong danh mục này',
      'Tìm các lựa chọn thay thế tiết kiệm hơn',
      'Đặt ngân sách hàng tháng cho danh mục này'
    ]
  }

  private getHousePurchaseStageAdvice(stage: string, progress: number): string[] {
    const stageAdvice: { [key: string]: string[] } = {
      initial: [
        'Tìm hiểu về các khu vực bạn muốn mua nhà',
        'Nghiên cứu giá cả thị trường bất động sản',
        'Bắt đầu cải thiện điểm tín dụng nếu cần',
        'Tính toán chi phí thực tế bao gồm thuế, phí, bảo hiểm'
      ],
      researching: [
        'So sánh các ngân hàng để tìm lãi suất vay tốt nhất',
        'Chuẩn bị các giấy tờ cần thiết cho vay',
        'Xem xét thuê môi giới bất động sản uy tín',
        'Tham gia các khóa học về mua nhà lần đầu'
      ],
      ready_to_view: [
        'Lập danh sách tiêu chí quan trọng khi xem nhà',
        'Chuẩn bị câu hỏi để hỏi người bán',
        'Nghiên cứu lịch sử giá của khu vực',
        'Cân nhắc thuê thẩm định viên độc lập'
      ],
      qualified_lead: [
        'Chuẩn bị thương lượng giá',
        'Hiểu rõ quy trình pháp lý mua bán',
        'Chuẩn bị quỹ dự phòng cho chi phí phát sinh',
        'Lên kế hoạch chuyển nhà và trang trí'
      ]
    }

    return stageAdvice[stage] || stageAdvice.initial
  }

  private getHousePurchaseNextSteps(stage: string, progress: number): string[] {
    if (progress < 20) {
      return [
        'Tập trung tăng tỷ lệ tiết kiệm hàng tháng',
        'Xem xét giảm chi tiêu không cần thiết',
        'Tìm hiểu các chương trình hỗ trợ vay mua nhà'
      ]
    }

    if (progress < 50) {
      return [
        'Tiếp tục duy trì kỷ luật tiết kiệm',
        'Bắt đầu nghiên cứu các dự án bất động sản',
        'Chuẩn bị hồ sơ tài chính cho ngân hàng'
      ]
    }

    if (progress < 80) {
      return [
        'Liên hệ ngân hàng để được tư vấn về gói vay',
        'Bắt đầu xem nhà và so sánh các lựa chọn',
        'Chuẩn bị kế hoạch cho các chi phí phát sinh'
      ]
    }

    return [
      'Sẵn sàng thực hiện giao dịch mua nhà',
      'Finalize môi giới và luật sư',
      'Lên kế hoạch chi tiết cho ngày chuyển nhà'
    ]
  }
}