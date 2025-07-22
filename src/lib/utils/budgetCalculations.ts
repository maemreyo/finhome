// src/lib/utils/budgetCalculations.ts
// Utility functions for different budget methodologies

export interface BudgetAllocation {
  [key: string]: number
}

export interface CategoryMapping {
  [categoryId: string]: string
}

export interface BudgetMethodConfig {
  name: string
  key: string
  description: string
  groups: BudgetGroup[]
  calculateAllocation: (income: number) => BudgetAllocation
  defaultCategoryMapping?: CategoryMapping
}

export interface BudgetGroup {
  key: string
  name: string
  percentage: number
  description: string
  color: string
  examples: string[]
}

// 50/30/20 Budget Rule
export const fiftyThirtyTwentyConfig: BudgetMethodConfig = {
  name: '50/30/20 Rule',
  key: '50_30_20',
  description: 'Simple budgeting rule: 50% needs, 30% wants, 20% savings',
  groups: [
    {
      key: 'needs',
      name: 'Needs (50%)',
      percentage: 50,
      description: 'Essential expenses you cannot avoid',
      color: '#ef4444', // red-500
      examples: [
        'Housing (rent/mortgage)',
        'Utilities',
        'Transportation',
        'Groceries',
        'Insurance',
        'Minimum debt payments'
      ]
    },
    {
      key: 'wants',
      name: 'Wants (30%)',
      percentage: 30,
      description: 'Lifestyle choices and entertainment',
      color: '#f59e0b', // amber-500
      examples: [
        'Dining out',
        'Entertainment',
        'Hobbies',
        'Shopping',
        'Subscriptions',
        'Travel'
      ]
    },
    {
      key: 'savings',
      name: 'Savings & Debt (20%)',
      percentage: 20,
      description: 'Savings and extra debt payments',
      color: '#10b981', // green-500
      examples: [
        'Emergency fund',
        'Retirement savings',
        'Investment',
        'Extra debt payments',
        'Future goals'
      ]
    }
  ],
  calculateAllocation: (income: number): BudgetAllocation => {
    return {
      needs: income * 0.5,
      wants: income * 0.3,
      savings: income * 0.2
    }
  }
}

// 6 Jars Method (T. Harv Eker)
export const sixJarsConfig: BudgetMethodConfig = {
  name: '6 Jars Method',
  key: '6_jars',
  description: 'T. Harv Eker\'s wealth building system with 6 allocation jars',
  groups: [
    {
      key: 'necessities',
      name: 'Necessities (55%)',
      percentage: 55,
      description: 'Essential living expenses',
      color: '#ef4444',
      examples: ['Housing', 'Food', 'Transportation', 'Utilities']
    },
    {
      key: 'education',
      name: 'Education (10%)',
      percentage: 10,
      description: 'Learning and skill development',
      color: '#3b82f6',
      examples: ['Books', 'Courses', 'Seminars', 'Training']
    },
    {
      key: 'ltss',
      name: 'Long-term Savings (10%)',
      percentage: 10,
      description: 'Long-term wealth building',
      color: '#10b981',
      examples: ['Retirement', 'Investments', 'Property']
    },
    {
      key: 'play',
      name: 'Play (10%)',
      percentage: 10,
      description: 'Fun and entertainment',
      color: '#f59e0b',
      examples: ['Entertainment', 'Hobbies', 'Dining out']
    },
    {
      key: 'financial_freedom',
      name: 'Financial Freedom (10%)',
      percentage: 10,
      description: 'Passive income investments',
      color: '#8b5cf6',
      examples: ['Stocks', 'Real Estate', 'Business investments']
    },
    {
      key: 'give',
      name: 'Give (5%)',
      percentage: 5,
      description: 'Charitable giving and helping others',
      color: '#ec4899',
      examples: ['Charity', 'Donations', 'Helping family/friends']
    }
  ],
  calculateAllocation: (income: number): BudgetAllocation => {
    return {
      necessities: income * 0.55,
      education: income * 0.10,
      ltss: income * 0.10,
      play: income * 0.10,
      financial_freedom: income * 0.10,
      give: income * 0.05
    }
  }
}

// Budget method registry
export const budgetMethods: Record<string, BudgetMethodConfig> = {
  '50_30_20': fiftyThirtyTwentyConfig,
  '6_jars': sixJarsConfig
}

// Helper functions
export function calculateBudgetAllocation(
  method: string,
  income: number
): BudgetAllocation {
  const config = budgetMethods[method]
  if (!config) {
    throw new Error(`Unknown budget method: ${method}`)
  }
  return config.calculateAllocation(income)
}

export function getBudgetMethodConfig(method: string): BudgetMethodConfig {
  const config = budgetMethods[method]
  if (!config) {
    throw new Error(`Unknown budget method: ${method}`)
  }
  return config
}

export function validateCategoryMapping(
  method: string,
  mapping: CategoryMapping
): boolean {
  const config = getBudgetMethodConfig(method)
  const validGroups = config.groups.map(g => g.key)
  
  // Check if all mapped groups are valid
  return Object.values(mapping).every(group => validGroups.includes(group))
}

export function calculateCategoryBudgets(
  method: string,
  income: number,
  categoryMapping: CategoryMapping,
  categories: Array<{ id: string; name_vi: string }>
): Record<string, number> {
  const allocation = calculateBudgetAllocation(method, income)
  const categoryBudgets: Record<string, number> = {}
  
  // Group categories by their budget group
  const groupedCategories: Record<string, string[]> = {}
  for (const [categoryId, group] of Object.entries(categoryMapping)) {
    if (!groupedCategories[group]) {
      groupedCategories[group] = []
    }
    groupedCategories[group].push(categoryId)
  }
  
  // Distribute budget evenly within each group
  for (const [group, categoryIds] of Object.entries(groupedCategories)) {
    const groupBudget = allocation[group] || 0
    const budgetPerCategory = groupBudget / categoryIds.length
    
    categoryIds.forEach(categoryId => {
      categoryBudgets[categoryId] = budgetPerCategory
    })
  }
  
  return categoryBudgets
}

export function getDefaultCategoryMapping(
  method: string,
  categories: Array<{ id: string; name_vi: string; category_key?: string }>
): CategoryMapping {
  const config = getBudgetMethodConfig(method)
  const mapping: CategoryMapping = {}
  
  if (method === '50_30_20') {
    // Map common Vietnamese category keys to 50/30/20 groups
    const needsKeywords = ['food', 'housing', 'transport', 'utilities', 'healthcare', 'insurance']
    const wantsKeywords = ['entertainment', 'dining', 'shopping', 'travel', 'hobbies']
    const savingsKeywords = ['investment', 'savings', 'debt']
    
    categories.forEach(category => {
      const categoryKey = category.category_key?.toLowerCase() || category.name_vi.toLowerCase()
      
      if (needsKeywords.some(keyword => categoryKey.includes(keyword))) {
        mapping[category.id] = 'needs'
      } else if (wantsKeywords.some(keyword => categoryKey.includes(keyword))) {
        mapping[category.id] = 'wants'
      } else if (savingsKeywords.some(keyword => categoryKey.includes(keyword))) {
        mapping[category.id] = 'savings'
      } else {
        // Default to needs for essential categories
        mapping[category.id] = 'needs'
      }
    })
  }
  
  return mapping
}

export function formatBudgetSummary(
  method: string,
  allocation: BudgetAllocation,
  totalIncome: number
): Array<{
  group: string
  name: string
  amount: number
  percentage: number
  color: string
}> {
  const config = getBudgetMethodConfig(method)
  
  return config.groups.map(group => ({
    group: group.key,
    name: group.name,
    amount: allocation[group.key] || 0,
    percentage: ((allocation[group.key] || 0) / totalIncome) * 100,
    color: group.color
  }))
}