// src/lib/utils/__tests__/budgetCalculations.test.ts
// Tests for budget calculation utilities

import {
  calculateBudgetAllocation,
  getBudgetMethodConfig,
  validateCategoryMapping,
  calculateCategoryBudgets,
  getDefaultCategoryMapping,
  formatBudgetSummary,
  fiftyThirtyTwentyConfig
} from '../budgetCalculations'

describe('50/30/20 Budget Calculations', () => {
  const testIncome = 60000 // 60k per month
  const testCategories = [
    { id: '1', name_vi: 'Ăn uống', category_key: 'food' },
    { id: '2', name_vi: 'Nhà ở', category_key: 'housing' },
    { id: '3', name_vi: 'Giải trí', category_key: 'entertainment' },
    { id: '4', name_vi: 'Tiết kiệm', category_key: 'savings' }
  ]

  describe('calculateBudgetAllocation', () => {
    it('should calculate 50/30/20 allocation correctly', () => {
      const allocation = calculateBudgetAllocation('50_30_20', testIncome)
      
      expect(allocation.needs).toBe(30000) // 50%
      expect(allocation.wants).toBe(18000) // 30%
      expect(allocation.savings).toBe(12000) // 20%
    })

    it('should throw error for unknown budget method', () => {
      expect(() => {
        calculateBudgetAllocation('unknown_method', testIncome)
      }).toThrow('Unknown budget method: unknown_method')
    })
  })

  describe('getBudgetMethodConfig', () => {
    it('should return 50/30/20 config', () => {
      const config = getBudgetMethodConfig('50_30_20')
      
      expect(config.name).toBe('50/30/20 Rule')
      expect(config.key).toBe('50_30_20')
      expect(config.groups).toHaveLength(3)
      expect(config.groups[0].key).toBe('needs')
      expect(config.groups[0].percentage).toBe(50)
    })
  })

  describe('validateCategoryMapping', () => {
    it('should validate correct mapping', () => {
      const mapping = { '1': 'needs', '2': 'wants', '3': 'savings' }
      const isValid = validateCategoryMapping('50_30_20', mapping)
      
      expect(isValid).toBe(true)
    })

    it('should reject invalid group mapping', () => {
      const mapping = { '1': 'invalid_group' }
      const isValid = validateCategoryMapping('50_30_20', mapping)
      
      expect(isValid).toBe(false)
    })
  })

  describe('calculateCategoryBudgets', () => {
    it('should distribute budget evenly within groups', () => {
      const mapping = {
        '1': 'needs',  // food
        '2': 'needs',  // housing  
        '3': 'wants',  // entertainment
        '4': 'savings' // savings
      }
      
      const categoryBudgets = calculateCategoryBudgets('50_30_20', testIncome, mapping, testCategories)
      
      // Needs group: 30000 / 2 = 15000 each
      expect(categoryBudgets['1']).toBe(15000)
      expect(categoryBudgets['2']).toBe(15000)
      
      // Wants group: 18000 / 1 = 18000
      expect(categoryBudgets['3']).toBe(18000)
      
      // Savings group: 12000 / 1 = 12000
      expect(categoryBudgets['4']).toBe(12000)
    })
  })

  describe('getDefaultCategoryMapping', () => {
    it('should provide sensible defaults', () => {
      const mapping = getDefaultCategoryMapping('50_30_20', testCategories)
      
      expect(mapping['1']).toBe('needs') // food -> needs
      expect(mapping['2']).toBe('needs') // housing -> needs
      expect(mapping['3']).toBe('wants') // entertainment -> wants
      expect(mapping['4']).toBe('savings') // savings -> savings
    })
  })

  describe('formatBudgetSummary', () => {
    it('should format budget summary correctly', () => {
      const allocation = calculateBudgetAllocation('50_30_20', testIncome)
      const summary = formatBudgetSummary('50_30_20', allocation, testIncome)
      
      expect(summary).toHaveLength(3)
      expect(summary[0]).toEqual({
        group: 'needs',
        name: 'Needs (50%)',
        amount: 30000,
        percentage: 50,
        color: '#ef4444'
      })
    })
  })

  describe('fiftyThirtyTwentyConfig', () => {
    it('should have correct configuration', () => {
      expect(fiftyThirtyTwentyConfig.key).toBe('50_30_20')
      expect(fiftyThirtyTwentyConfig.groups).toHaveLength(3)
      
      const [needs, wants, savings] = fiftyThirtyTwentyConfig.groups
      
      expect(needs.key).toBe('needs')
      expect(needs.percentage).toBe(50)
      expect(wants.key).toBe('wants')
      expect(wants.percentage).toBe(30)
      expect(savings.key).toBe('savings')
      expect(savings.percentage).toBe(20)
    })

    it('should calculate allocation correctly', () => {
      const allocation = fiftyThirtyTwentyConfig.calculateAllocation(testIncome)
      
      expect(allocation.needs).toBe(30000)
      expect(allocation.wants).toBe(18000)
      expect(allocation.savings).toBe(12000)
    })
  })
})