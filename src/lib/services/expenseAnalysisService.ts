// src/lib/services/expenseAnalysisService.ts
// Service for analyzing expense data and generating insights for storytelling reports

import { 
  subMonths, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval,
  differenceInDays,
  format,
  parseISO,
  isSameMonth,
  startOfQuarter,
  endOfQuarter
} from 'date-fns'
import { vi } from 'date-fns/locale'

export interface Transaction {
  id: string
  transaction_type: 'expense' | 'income' | 'transfer'
  amount: number
  transaction_date: string
  description?: string
  merchant_name?: string
  expense_category?: {
    id: string
    name_vi: string
    color: string
  }
  income_category?: {
    id: string
    name_vi: string
    color: string
  }
  wallet: {
    name: string
    color: string
  }
}

export interface SpendingInsight {
  id: string
  type: 'trend' | 'anomaly' | 'comparison' | 'milestone' | 'habit' | 'recommendation'
  severity: 'positive' | 'neutral' | 'warning' | 'negative'
  title: string
  narrative: string
  details: string
  data: {
    current_value?: number
    previous_value?: number
    change_percentage?: number
    category?: string
    merchant?: string
    time_period?: string
    [key: string]: any
  }
  icon: string
  color: string
}

export interface StorytellingReport {
  user_id: string
  period: {
    start: string
    end: string
    label: string
  }
  summary: {
    total_expenses: number
    total_income: number
    net_amount: number
    transaction_count: number
    top_category: string
    average_daily_spending: number
  }
  insights: SpendingInsight[]
  generated_at: string
}

export class ExpenseAnalysisService {
  
  static generateStorytellingReport(
    transactions: Transaction[],
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ): StorytellingReport {
    const currentTransactions = this.filterTransactionsByPeriod(transactions, periodStart, periodEnd)
    const previousTransactions = this.getPreviousPeriodTransactions(transactions, periodStart, periodEnd)
    
    const summary = this.calculateSummary(currentTransactions)
    const insights = this.generateInsights(currentTransactions, previousTransactions, periodStart, periodEnd)
    
    return {
      user_id: userId,
      period: {
        start: periodStart.toISOString().split('T')[0],
        end: periodEnd.toISOString().split('T')[0],
        label: this.getPeriodLabel(periodStart, periodEnd)
      },
      summary,
      insights: insights.sort((a, b) => this.getInsightPriority(a) - this.getInsightPriority(b)),
      generated_at: new Date().toISOString()
    }
  }

  private static filterTransactionsByPeriod(transactions: Transaction[], start: Date, end: Date): Transaction[] {
    return transactions.filter(t => 
      isWithinInterval(parseISO(t.transaction_date), { start, end })
    )
  }

  private static getPreviousPeriodTransactions(transactions: Transaction[], start: Date, end: Date): Transaction[] {
    const periodLength = differenceInDays(end, start)
    const previousStart = subDays(start, periodLength + 1)
    const previousEnd = subDays(start, 1)
    
    return this.filterTransactionsByPeriod(transactions, previousStart, previousEnd)
  }

  private static calculateSummary(transactions: Transaction[]) {
    const expenses = transactions.filter(t => t.transaction_type === 'expense')
    const income = transactions.filter(t => t.transaction_type === 'income')
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    
    const categoryTotals = expenses.reduce((acc, t) => {
      const category = t.expense_category?.name_vi || 'Khác'
      acc[category] = (acc[category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Không có dữ liệu'
    
    return {
      total_expenses: totalExpenses,
      total_income: totalIncome,
      net_amount: totalIncome - totalExpenses,
      transaction_count: transactions.length,
      top_category: topCategory,
      average_daily_spending: totalExpenses / Math.max(1, differenceInDays(new Date(), subDays(new Date(), 30)))
    }
  }

  private static generateInsights(
    current: Transaction[],
    previous: Transaction[],
    periodStart: Date,
    periodEnd: Date
  ): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    
    // Spending trend analysis
    insights.push(...this.analyzeSpendingTrends(current, previous))
    
    // Category analysis
    insights.push(...this.analyzeCategoryChanges(current, previous))
    
    // Anomaly detection
    insights.push(...this.detectAnomalies(current, previous))
    
    // Habit insights
    insights.push(...this.analyzeSpendingHabits(current))
    
    // Milestone achievements
    insights.push(...this.detectMilestones(current, previous))
    
    // Recommendations
    insights.push(...this.generateRecommendations(current, previous))
    
    return insights.filter(insight => insight !== null) as SpendingInsight[]
  }

  private static analyzeSpendingTrends(current: Transaction[], previous: Transaction[]): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    
    const currentExpenses = current.filter(t => t.transaction_type === 'expense')
    const previousExpenses = previous.filter(t => t.transaction_type === 'expense')
    
    const currentTotal = currentExpenses.reduce((sum, t) => sum + t.amount, 0)
    const previousTotal = previousExpenses.reduce((sum, t) => sum + t.amount, 0)
    
    if (previousTotal > 0) {
      const changePercentage = ((currentTotal - previousTotal) / previousTotal) * 100
      
      if (Math.abs(changePercentage) > 5) {
        const isIncrease = changePercentage > 0
        
        insights.push({
          id: 'spending-trend',
          type: 'trend',
          severity: isIncrease ? (changePercentage > 20 ? 'warning' : 'neutral') : 'positive',
          title: isIncrease ? 'Chi tiêu tăng' : 'Chi tiêu giảm',
          narrative: this.generateSpendingTrendNarrative(changePercentage, currentTotal, previousTotal),
          details: `Kỳ hiện tại: ${this.formatCurrency(currentTotal)}, Kỳ trước: ${this.formatCurrency(previousTotal)}`,
          data: {
            current_value: currentTotal,
            previous_value: previousTotal,
            change_percentage: changePercentage
          },
          icon: isIncrease ? 'trending-up' : 'trending-down',
          color: isIncrease ? (changePercentage > 20 ? '#ef4444' : '#f59e0b') : '#10b981'
        })
      }
    }
    
    return insights
  }

  private static analyzeCategoryChanges(current: Transaction[], previous: Transaction[]): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    
    const currentByCategory = this.groupByCategory(current.filter(t => t.transaction_type === 'expense'))
    const previousByCategory = this.groupByCategory(previous.filter(t => t.transaction_type === 'expense'))
    
    Object.entries(currentByCategory).forEach(([category, currentAmount]) => {
      const previousAmount = previousByCategory[category] || 0
      
      if (previousAmount > 0) {
        const changePercentage = ((currentAmount - previousAmount) / previousAmount) * 100
        
        if (Math.abs(changePercentage) > 15 && currentAmount > 10000) {
          const isIncrease = changePercentage > 0
          
          insights.push({
            id: `category-change-${category}`,
            type: 'comparison',
            severity: this.getCategorySeverity(category, changePercentage),
            title: `${category}: ${isIncrease ? 'Tăng' : 'Giảm'} ${Math.abs(changePercentage).toFixed(0)}%`,
            narrative: this.generateCategoryChangeNarrative(category, changePercentage, currentAmount, previousAmount),
            details: `${category}: ${this.formatCurrency(currentAmount)} (${isIncrease ? '+' : ''}${changePercentage.toFixed(1)}%)`,
            data: {
              category,
              current_value: currentAmount,
              previous_value: previousAmount,
              change_percentage: changePercentage
            },
            icon: this.getCategoryIcon(category),
            color: isIncrease ? '#f59e0b' : '#10b981'
          })
        }
      }
    })
    
    return insights.slice(0, 3) // Top 3 category changes
  }

  private static detectAnomalies(current: Transaction[], previous: Transaction[]): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    
    // Detect unusually large transactions
    const expenses = current.filter(t => t.transaction_type === 'expense')
    const averageTransaction = expenses.length > 0 
      ? expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length 
      : 0
    
    const largeTransactions = expenses.filter(t => t.amount > averageTransaction * 3 && t.amount > 50000)
    
    if (largeTransactions.length > 0) {
      const largest = largeTransactions.reduce((max, t) => t.amount > max.amount ? t : max)
      
      insights.push({
        id: 'large-transaction',
        type: 'anomaly',
        severity: 'warning',
        title: 'Giao dịch lớn bất thường',
        narrative: this.generateAnomalyNarrative(largest),
        details: `${largest.expense_category?.name_vi || 'Không xác định'}: ${this.formatCurrency(largest.amount)}`,
        data: {
          transaction_amount: largest.amount,
          category: largest.expense_category?.name_vi,
          merchant: largest.merchant_name,
          date: largest.transaction_date
        },
        icon: 'alert-triangle',
        color: '#f59e0b'
      })
    }
    
    return insights
  }

  private static analyzeSpendingHabits(current: Transaction[]): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    
    // Analyze merchant frequency
    const merchantFrequency = current.reduce((acc, t) => {
      if (t.merchant_name && t.transaction_type === 'expense') {
        acc[t.merchant_name] = (acc[t.merchant_name] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    const frequentMerchants = Object.entries(merchantFrequency)
      .filter(([, count]) => count >= 5)
      .sort(([,a], [,b]) => b - a)
    
    if (frequentMerchants.length > 0) {
      const [topMerchant, frequency] = frequentMerchants[0]
      const merchantTransactions = current.filter(t => t.merchant_name === topMerchant)
      const totalSpent = merchantTransactions.reduce((sum, t) => sum + t.amount, 0)
      
      insights.push({
        id: 'spending-habit',
        type: 'habit',
        severity: 'neutral',
        title: 'Thói quen chi tiêu',
        narrative: `Bạn đã chi tiêu tại ${topMerchant} ${frequency} lần trong kỳ này, tổng cộng ${this.formatCurrency(totalSpent)}. Đây có vẻ là một trong những địa điểm yêu thích của bạn.`,
        details: `Tần suất: ${frequency} lần, Tổng chi: ${this.formatCurrency(totalSpent)}`,
        data: {
          merchant: topMerchant,
          frequency,
          total_amount: totalSpent
        },
        icon: 'repeat',
        color: '#6366f1'
      })
    }
    
    return insights
  }

  private static detectMilestones(current: Transaction[], previous: Transaction[]): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    
    const currentExpenses = current.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const currentIncome = current.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0
    
    // Savings milestone
    if (savingsRate > 20) {
      insights.push({
        id: 'savings-milestone',
        type: 'milestone',
        severity: 'positive',
        title: 'Tiết kiệm xuất sắc!',
        narrative: `Chúc mừng! Bạn đã tiết kiệm được ${savingsRate.toFixed(1)}% thu nhập trong kỳ này. Đây là một thành tích đáng khen ngợi!`,
        details: `Tỷ lệ tiết kiệm: ${savingsRate.toFixed(1)}%`,
        data: {
          savings_rate: savingsRate,
          savings_amount: currentIncome - currentExpenses
        },
        icon: 'trophy',
        color: '#10b981'
      })
    }
    
    return insights
  }

  private static generateRecommendations(current: Transaction[], previous: Transaction[]): SpendingInsight[] {
    const insights: SpendingInsight[] = []
    
    // Analyze category spending for recommendations
    const categoryTotals = this.groupByCategory(current.filter(t => t.transaction_type === 'expense'))
    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
    
    // Food spending recommendation
    const foodCategories = ['Ăn uống', 'Thực phẩm', 'Nhà hàng']
    const foodSpending = Object.entries(categoryTotals)
      .filter(([category]) => foodCategories.some(food => category.toLowerCase().includes(food.toLowerCase())))
      .reduce((sum, [, amount]) => sum + amount, 0)
    
    if (foodSpending > totalExpenses * 0.3 && foodSpending > 50000) {
      insights.push({
        id: 'food-recommendation',
        type: 'recommendation',
        severity: 'neutral',
        title: 'Gợi ý tiết kiệm chi phí ăn uống',
        narrative: `Chi phí ăn uống của bạn chiếm ${((foodSpending/totalExpenses) * 100).toFixed(1)}% tổng chi tiêu. Thử nấu ăn tại nhà nhiều hơn để tiết kiệm chi phí.`,
        details: `Chi phí ăn uống: ${this.formatCurrency(foodSpending)} (${((foodSpending/totalExpenses) * 100).toFixed(1)}% tổng chi)`,
        data: {
          food_spending: foodSpending,
          percentage_of_total: (foodSpending/totalExpenses) * 100
        },
        icon: 'lightbulb',
        color: '#6366f1'
      })
    }
    
    return insights
  }

  // Helper methods
  private static groupByCategory(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce((acc, t) => {
      const category = t.expense_category?.name_vi || 'Khác'
      acc[category] = (acc[category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)
  }

  private static generateSpendingTrendNarrative(changePercentage: number, current: number, previous: number): string {
    const isIncrease = changePercentage > 0
    const verb = isIncrease ? 'tăng' : 'giảm'
    const amount = Math.abs(current - previous)
    
    if (Math.abs(changePercentage) > 30) {
      return `Chi tiêu của bạn đã ${verb} đáng kể ${Math.abs(changePercentage).toFixed(1)}% so với kỳ trước (${this.formatCurrency(amount)}). ${isIncrease ? 'Hãy xem xét các khoản chi lớn và điều chỉnh ngân sách phù hợp.' : 'Đây là một tín hiệu tích cực cho việc quản lý tài chính!'}`
    } else if (Math.abs(changePercentage) > 15) {
      return `Chi tiêu của bạn ${verb} ${Math.abs(changePercentage).toFixed(1)}% so với kỳ trước. ${isIncrease ? 'Theo dõi chi tiêu để đảm bảo không vượt quá ngân sách.' : 'Bạn đang trên đà tiết kiệm tốt!'}`
    } else {
      return `Chi tiêu của bạn ${verb} nhẹ ${Math.abs(changePercentage).toFixed(1)}% so với kỳ trước. Mức chi tiêu khá ổn định.`
    }
  }

  private static generateCategoryChangeNarrative(category: string, changePercentage: number, current: number, previous: number): string {
    const isIncrease = changePercentage > 0
    const verb = isIncrease ? 'tăng' : 'giảm'
    
    const insights = this.getCategoryInsights(category, isIncrease)
    
    return `Chi tiêu cho ${category} đã ${verb} ${Math.abs(changePercentage).toFixed(1)}% so với kỳ trước. ${insights}`
  }

  private static generateAnomalyNarrative(transaction: Transaction): string {
    const category = transaction.expense_category?.name_vi || 'không xác định'
    const date = format(parseISO(transaction.transaction_date), 'dd/MM/yyyy', { locale: vi })
    
    return `Bạn có một khoản chi ${this.formatCurrency(transaction.amount)} cho ${category} vào ngày ${date}${transaction.merchant_name ? ` tại ${transaction.merchant_name}` : ''}. Đây là một trong những giao dịch lớn nhất trong kỳ này.`
  }

  private static getCategoryInsights(category: string, isIncrease: boolean): string {
    const categoryLower = category.toLowerCase()
    
    if (categoryLower.includes('xăng') || categoryLower.includes('giao thông')) {
      return isIncrease ? 'Có thể do giá xăng tăng hoặc bạn di chuyển nhiều hơn.' : 'Có thể bạn đã giảm đi lại hoặc sử dụng phương tiện công cộng nhiều hơn.'
    } else if (categoryLower.includes('ăn') || categoryLower.includes('thực phẩm')) {
      return isIncrease ? 'Có thể do tăng giá thực phẩm hoặc ăn ngoài nhiều hơn.' : 'Có thể bạn đã nấu ăn tại nhà nhiều hơn hoặc tiết kiệm chi phí ăn uống.'
    } else if (categoryLower.includes('giải trí') || categoryLower.includes('mua sắm')) {
      return isIncrease ? 'Bạn có vẻ đã tăng chi tiêu cho các hoạt động giải trí.' : 'Bạn đã kiềm chế chi tiêu cho giải trí tốt hơn.'
    } else if (categoryLower.includes('sức khỏe') || categoryLower.includes('y tế')) {
      return isIncrease ? 'Chi phí sức khỏe có thể tăng do khám bệnh hoặc mua thuốc.' : 'May mắn là chi phí y tế đã giảm.'
    }
    
    return isIncrease ? 'Hãy xem xét lý do tăng chi tiêu ở danh mục này.' : 'Đây là dấu hiệu tích cực cho việc tiết kiệm.'
  }

  private static getCategorySeverity(category: string, changePercentage: number): SpendingInsight['severity'] {
    const categoryLower = category.toLowerCase()
    const isIncrease = changePercentage > 0
    const magnitude = Math.abs(changePercentage)
    
    // Essential categories (housing, utilities, healthcare) - increases are more concerning
    if (categoryLower.includes('nhà') || categoryLower.includes('điện') || categoryLower.includes('nước') || categoryLower.includes('sức khỏe')) {
      return isIncrease ? (magnitude > 30 ? 'warning' : 'neutral') : 'positive'
    }
    
    // Discretionary categories (entertainment, shopping) - decreases are positive
    if (categoryLower.includes('giải trí') || categoryLower.includes('mua sắm')) {
      return isIncrease ? (magnitude > 50 ? 'negative' : 'warning') : 'positive'
    }
    
    return isIncrease ? 'warning' : 'positive'
  }

  private static getCategoryIcon(category: string): string {
    const categoryLower = category.toLowerCase()
    
    if (categoryLower.includes('ăn') || categoryLower.includes('thực phẩm')) return 'utensils'
    if (categoryLower.includes('giao thông') || categoryLower.includes('xăng')) return 'car'
    if (categoryLower.includes('giải trí')) return 'gamepad'
    if (categoryLower.includes('sức khỏe') || categoryLower.includes('y tế')) return 'heart'
    if (categoryLower.includes('mua sắm')) return 'shopping-bag'
    if (categoryLower.includes('nhà') || categoryLower.includes('điện') || categoryLower.includes('nước')) return 'home'
    
    return 'pie-chart'
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  private static getPeriodLabel(start: Date, end: Date): string {
    if (isSameMonth(start, end)) {
      return `Tháng ${format(start, 'MM/yyyy', { locale: vi })}`
    }
    return `${format(start, 'dd/MM', { locale: vi })} - ${format(end, 'dd/MM/yyyy', { locale: vi })}`
  }

  private static getInsightPriority(insight: SpendingInsight): number {
    // Priority order: negative, warning, milestone, positive, neutral
    const severityPriority = {
      'negative': 1,
      'warning': 2,
      'positive': 3,
      'neutral': 4
    }
    
    const typePriority = {
      'anomaly': 1,
      'trend': 2,
      'comparison': 3,
      'milestone': 4,
      'habit': 5,
      'recommendation': 6
    }
    
    return severityPriority[insight.severity] * 10 + typePriority[insight.type]
  }
}