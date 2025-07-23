// src/hooks/useRecentTransactions.ts
// Hook for fetching and managing user's recent transactions for personalized suggestions

import { useState, useEffect, useCallback } from 'react'

interface RecentTransaction {
  id: string
  description: string
  amount: number
  transaction_type: 'expense' | 'income' | 'transfer'
  category_name?: string
  merchant_name?: string
  transaction_date: string
  frequency?: number
}

interface PersonalizedSuggestion {
  text: string
  type: 'recent_pattern' | 'frequent_merchant' | 'common_amount'
  icon: string
  confidence: number
  frequency: number
  lastUsed: string
}

interface UseRecentTransactionsOptions {
  userId?: string
  limit?: number
  enabled?: boolean
}

export function useRecentTransactions({ 
  userId, 
  limit = 10,
  enabled = true 
}: UseRecentTransactionsOptions = {}) {
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch recent transactions from API
  const fetchRecentTransactions = useCallback(async () => {
    if (!enabled || !userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/expenses/recent?limit=${limit}&userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recent transactions')
      }

      const data = await response.json()
      
      if (data.success && data.transactions) {
        setRecentTransactions(data.transactions)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching recent transactions:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Set empty array on error to avoid breaking the UI
      setRecentTransactions([])
    } finally {
      setLoading(false)
    }
  }, [userId, limit, enabled])

  // Generate personalized conversational suggestions based on recent transactions
  const getPersonalizedSuggestions = useCallback((): PersonalizedSuggestion[] => {
    if (recentTransactions.length === 0) return []

    const suggestions: PersonalizedSuggestion[] = []

    // Group transactions by description patterns
    const descriptionFrequency = new Map<string, { count: number; lastUsed: string; amount: number }>()
    const merchantFrequency = new Map<string, { count: number; lastUsed: string; avgAmount: number }>()

    recentTransactions.forEach(transaction => {
      // Track description patterns
      if (transaction.description) {
        const desc = transaction.description.toLowerCase().trim()
        if (desc.length > 2) {
          const existing = descriptionFrequency.get(desc) || { count: 0, lastUsed: '', amount: 0 }
          descriptionFrequency.set(desc, {
            count: existing.count + 1,
            lastUsed: transaction.transaction_date,
            amount: transaction.amount
          })
        }
      }

      // Track merchant patterns
      if (transaction.merchant_name) {
        const merchant = transaction.merchant_name.toLowerCase().trim()
        if (merchant.length > 2) {
          const existing = merchantFrequency.get(merchant) || { count: 0, lastUsed: '', avgAmount: 0 }
          merchantFrequency.set(merchant, {
            count: existing.count + 1,
            lastUsed: transaction.transaction_date,
            avgAmount: (existing.avgAmount * existing.count + transaction.amount) / (existing.count + 1)
          })
        }
      }
    })

    // Generate suggestions from frequent descriptions
    Array.from(descriptionFrequency.entries())
      .filter(([_, data]) => data.count >= 2) // Only suggest if used at least twice
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .forEach(([description, data]) => {
        const amountText = data.amount >= 1000000 
          ? `${(data.amount / 1000000).toFixed(1).replace('.0', '')}tr`
          : `${(data.amount / 1000)}k`
        
        suggestions.push({
          text: `${description} ${amountText}`,
          type: 'recent_pattern',
          icon: '🔄',
          confidence: Math.min(data.count / 5, 1), // Max confidence at 5 uses
          frequency: data.count,
          lastUsed: data.lastUsed
        })
      })

    // Generate suggestions from frequent merchants
    Array.from(merchantFrequency.entries())
      .filter(([_, data]) => data.count >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 2)
      .forEach(([merchant, data]) => {
        const amountText = data.avgAmount >= 1000000 
          ? `${(data.avgAmount / 1000000).toFixed(1).replace('.0', '')}tr`
          : `${Math.round(data.avgAmount / 1000)}k`
        
        suggestions.push({
          text: `mua sắm tại ${merchant} ${amountText}`,
          type: 'frequent_merchant',
          icon: '🏪',
          confidence: Math.min(data.count / 4, 1),
          frequency: data.count,
          lastUsed: data.lastUsed
        })
      })

    // Generate suggestions from common amounts
    const amountFrequency = new Map<number, number>()
    recentTransactions.forEach(transaction => {
      // Round to nearest 5k for grouping
      const roundedAmount = Math.round(transaction.amount / 5000) * 5000
      amountFrequency.set(roundedAmount, (amountFrequency.get(roundedAmount) || 0) + 1)
    })

    Array.from(amountFrequency.entries())
      .filter(([amount, count]) => count >= 2 && amount > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .forEach(([amount, count]) => {
        const amountText = amount >= 1000000 
          ? `${(amount / 1000000).toFixed(1).replace('.0', '')} triệu`
          : `${(amount / 1000)}k`
        
        suggestions.push({
          text: `chi tiêu thường xuyên ${amountText}`,
          type: 'common_amount',
          icon: '💰',
          confidence: Math.min(count / 3, 1),
          frequency: count,
          lastUsed: new Date().toISOString()
        })
      })

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }, [recentTransactions])

  // Get recent transaction patterns for smart defaults
  const getSmartDefaults = useCallback(() => {
    if (recentTransactions.length === 0) return null

    const now = new Date()
    const currentHour = now.getHours()
    
    // Find transactions from similar time periods
    const timeBasedTransactions = recentTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date)
      const transactionHour = transactionDate.getHours()
      
      // Match transactions within 2 hours of current time
      return Math.abs(transactionHour - currentHour) <= 2
    })

    if (timeBasedTransactions.length > 0) {
      // Return the most recent similar-time transaction
      const mostRecent = timeBasedTransactions[0]
      return {
        suggestedDescription: mostRecent.description,
        suggestedAmount: mostRecent.amount,
        suggestedMerchant: mostRecent.merchant_name,
        confidence: timeBasedTransactions.length / recentTransactions.length
      }
    }

    return null
  }, [recentTransactions])

  // Check if a transaction is similar to recent ones
  const isSimilarToRecent = useCallback((description: string, amount?: number) => {
    if (recentTransactions.length === 0) return false

    const descLower = description.toLowerCase().trim()
    
    return recentTransactions.some(transaction => {
      const recentDescLower = (transaction.description || '').toLowerCase().trim()
      
      // Check description similarity
      const descriptionMatch = recentDescLower.includes(descLower) || descLower.includes(recentDescLower)
      
      // Check amount similarity (within 20%)
      const amountMatch = amount ? Math.abs(transaction.amount - amount) / transaction.amount < 0.2 : true
      
      return descriptionMatch && amountMatch
    })
  }, [recentTransactions])

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    fetchRecentTransactions()
  }, [fetchRecentTransactions])

  return {
    recentTransactions,
    loading,
    error,
    refreshRecentTransactions: fetchRecentTransactions,
    getPersonalizedSuggestions,
    getSmartDefaults,
    isSimilarToRecent,
    hasRecentTransactions: recentTransactions.length > 0
  }
}