// src/hooks/useIntelligentSuggestions.ts
// Hook for intelligent transaction entry suggestions based on user patterns
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface SuggestionResult {
  type: 'description' | 'merchant' | 'category' | 'amount'
  value: string | number
  confidence: number
  frequency: number
  last_used: string
  predicted_category?: {
    id: string
    name_vi: string
    name_en: string
    color: string
  }
  predicted_amount?: number
  related_tags?: string[]
}

interface SuggestionsResponse {
  suggestions: SuggestionResult[]
  patterns_analyzed: number
  query: string
  suggestion_type?: string
}

interface UseIntelligentSuggestionsProps {
  transactionType: 'expense' | 'income' | 'transfer'
  debounceMs?: number
}

export function useIntelligentSuggestions({
  transactionType,
  debounceMs = 300
}: UseIntelligentSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (
    query: string,
    type?: 'description' | 'merchant' | 'category' | 'amount',
    immediate = false
  ) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const executeFetch = async () => {
      if (!query.trim() && type !== 'amount') {
        setSuggestions([])
        return
      }

      setLoading(true)
      setError(null)

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const params = new URLSearchParams({
          query: query.trim(),
          transaction_type: transactionType,
          limit: '8'
        })

        if (type) {
          params.append('type', type)
        }

        const response = await fetch(`/api/expenses/suggestions?${params}`, {
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions')
        }

        const data: SuggestionsResponse = await response.json()
        
        if (!controller.signal.aborted) {
          setSuggestions(data.suggestions || [])
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch suggestions')
          setSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    if (immediate) {
      executeFetch()
    } else {
      debounceRef.current = setTimeout(executeFetch, debounceMs)
    }
  }, [transactionType, debounceMs])

  // Get description suggestions
  const getDescriptionSuggestions = useCallback((query: string) => {
    fetchSuggestions(query, 'description')
  }, [fetchSuggestions])

  // Get merchant suggestions
  const getMerchantSuggestions = useCallback((query: string) => {
    fetchSuggestions(query, 'merchant')
  }, [fetchSuggestions])

  // Get amount suggestions
  const getAmountSuggestions = useCallback(() => {
    fetchSuggestions('', 'amount', true)
  }, [fetchSuggestions])

  // Find best category match for given input
  const predictCategory = useCallback((input: string): SuggestionResult | null => {
    const matchingSuggestions = suggestions.filter(s => 
      (s.type === 'description' || s.type === 'merchant') &&
      s.predicted_category &&
      s.confidence > 0.3
    )

    if (matchingSuggestions.length === 0) return null

    // Return the suggestion with highest confidence
    return matchingSuggestions.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    )
  }, [suggestions])

  // Find best amount match for given context
  const predictAmount = useCallback((context: string): number | null => {
    const contextLower = context.toLowerCase()
    const matchingSuggestions = suggestions.filter(s => 
      (s.type === 'description' || s.type === 'merchant') &&
      s.predicted_amount &&
      s.value.toString().toLowerCase().includes(contextLower)
    )

    if (matchingSuggestions.length === 0) {
      // Return most common amount if no context match
      const amountSuggestions = suggestions.filter(s => s.type === 'amount')
      if (amountSuggestions.length > 0) {
        return amountSuggestions[0].value as number
      }
      return null
    }

    // Return the most confident amount prediction
    const bestMatch = matchingSuggestions.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    )
    
    return bestMatch.predicted_amount || null
  }, [suggestions])

  // Get tags related to current input
  const getRelatedTags = useCallback((input: string): string[] => {
    const inputLower = input.toLowerCase()
    const matchingSuggestions = suggestions.filter(s =>
      s.value.toString().toLowerCase().includes(inputLower) &&
      s.related_tags &&
      s.related_tags.length > 0
    )

    const allTags = matchingSuggestions.flatMap(s => s.related_tags || [])
    
    // Remove duplicates and return most relevant tags
    const uniqueTags = [...new Set(allTags)]
    return uniqueTags.slice(0, 5)
  }, [suggestions])

  // Apply suggestion to form - returns suggested field values
  const applySuggestion = useCallback((suggestion: SuggestionResult) => {
    const result: Record<string, any> = {}

    if (suggestion.type === 'description') {
      result.description = suggestion.value
    } else if (suggestion.type === 'merchant') {
      result.merchant_name = suggestion.value
    }

    if (suggestion.predicted_category) {
      const categoryField = transactionType === 'expense' ? 'expense_category_id' : 'income_category_id'
      result[categoryField] = suggestion.predicted_category.id
    }

    if (suggestion.predicted_amount) {
      result.amount = suggestion.predicted_amount
    }

    if (suggestion.related_tags && suggestion.related_tags.length > 0) {
      result.suggested_tags = suggestion.related_tags
    }

    return result
  }, [transactionType])

  // Clear suggestions and cancel any pending requests
  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setError(null)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    suggestions,
    loading,
    error,
    getDescriptionSuggestions,
    getMerchantSuggestions,
    getAmountSuggestions,
    predictCategory,
    predictAmount,
    getRelatedTags,
    applySuggestion,
    clearSuggestions
  }
}