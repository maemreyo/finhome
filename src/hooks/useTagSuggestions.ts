// src/hooks/useTagSuggestions.ts
// Hook to manage tag suggestions for quick transaction entry
'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseTagSuggestionsProps {
  userId?: string
}

export function useTagSuggestions({ userId }: UseTagSuggestionsProps = {}) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch popular tags from user's transaction history
  const fetchTagSuggestions = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/expenses/tags/suggestions')
      if (!response.ok) throw new Error('Failed to fetch tag suggestions')

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions')
      // Fallback to common Vietnamese transaction tags
      setSuggestions([
        'Ăn uống', 'Cà phê', 'Shopping', 'Xăng xe', 'Siêu thị',
        'Thuê nhà', 'Điện nước', 'Internet', 'Điện thoại', 'Y tế',
        'Giải trí', 'Du lịch', 'Quà tặng', 'Từ thiện', 'Đầu tư'
      ])
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Add a new tag to local suggestions (for learning from user behavior)
  const addTagToSuggestions = useCallback((tag: string) => {
    if (tag.trim() && !suggestions.includes(tag.trim())) {
      setSuggestions(prev => [tag.trim(), ...prev.slice(0, 19)]) // Keep max 20 suggestions
    }
  }, [suggestions])

  // Get filtered suggestions based on input
  const getFilteredSuggestions = useCallback((input: string, excludeTags: string[] = []) => {
    if (!input.trim()) {
      return suggestions.filter(tag => !excludeTags.includes(tag)).slice(0, 8)
    }

    return suggestions
      .filter(tag => 
        tag.toLowerCase().includes(input.toLowerCase()) && 
        !excludeTags.includes(tag)
      )
      .slice(0, 8)
  }, [suggestions])

  // Initialize suggestions on mount
  useEffect(() => {
    fetchTagSuggestions()
  }, [fetchTagSuggestions])

  return {
    suggestions,
    loading,
    error,
    addTagToSuggestions,
    getFilteredSuggestions,
    refreshSuggestions: fetchTagSuggestions
  }
}