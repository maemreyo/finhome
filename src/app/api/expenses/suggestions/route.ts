// src/app/api/expenses/suggestions/route.ts
// API for intelligent transaction suggestions based on user patterns
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const suggestionQuerySchema = z.object({
  query: z.string().optional(), // Current input text
  type: z.enum(['description', 'merchant', 'category', 'amount']).optional(),
  transaction_type: z.enum(['expense', 'income', 'transfer']).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
})

interface TransactionPattern {
  description: string | null
  merchant_name: string | null
  expense_category_id: string | null
  income_category_id: string | null
  amount: number
  frequency: number
  last_used: string
  category_name?: string
  avg_amount?: number
  tags?: string[]
}

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

// GET /api/expenses/suggestions - Get intelligent transaction suggestions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = suggestionQuerySchema.parse(queryParams)

    // Get user's transaction history for pattern analysis
    const { data: transactions, error } = await supabase
      .from('expense_transactions')
      .select(`
        description,
        merchant_name,
        expense_category_id,
        income_category_id,
        amount,
        tags,
        transaction_date,
        created_at,
        transaction_type,
        expense_category:expense_categories(id, name_vi, name_en, color),
        income_category:income_categories(id, name_vi, name_en, color)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1000) // Analyze last 1000 transactions

    if (error) {
      console.error('Error fetching transaction history:', error)
      return NextResponse.json({ error: 'Failed to fetch transaction history' }, { status: 500 })
    }

    // Analyze patterns and generate suggestions
    const suggestions = await generateIntelligentSuggestions(
      transactions,
      validatedQuery.query || '',
      validatedQuery.type,
      validatedQuery.transaction_type,
      validatedQuery.limit || 10
    )

    return NextResponse.json({
      suggestions,
      patterns_analyzed: transactions.length,
      query: validatedQuery.query,
      suggestion_type: validatedQuery.type
    })

  } catch (error) {
    console.error('Suggestion API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateIntelligentSuggestions(
  transactions: any[],
  query: string,
  suggestionType?: string,
  transactionType?: string,
  limit: number = 10
): Promise<SuggestionResult[]> {
  const patterns: Record<string, TransactionPattern> = {}
  const suggestions: SuggestionResult[] = []

  // Filter transactions by type if specified
  const filteredTransactions = transactionType 
    ? transactions.filter(t => t.transaction_type === transactionType)
    : transactions

  // Build patterns from transaction history
  filteredTransactions.forEach(transaction => {
    // Pattern for descriptions
    if (transaction.description) {
      const key = `desc_${transaction.description.toLowerCase()}`
      if (!patterns[key]) {
        patterns[key] = {
          description: transaction.description,
          merchant_name: transaction.merchant_name,
          expense_category_id: transaction.expense_category_id,
          income_category_id: transaction.income_category_id,
          amount: transaction.amount,
          frequency: 0,
          last_used: transaction.created_at,
          tags: transaction.tags
        }
      }
      patterns[key].frequency += 1
      patterns[key].last_used = transaction.created_at
      patterns[key].category_name = transaction.expense_category?.name_vi || transaction.income_category?.name_vi
    }

    // Pattern for merchant names
    if (transaction.merchant_name) {
      const key = `merchant_${transaction.merchant_name.toLowerCase()}`
      if (!patterns[key]) {
        patterns[key] = {
          description: transaction.description,
          merchant_name: transaction.merchant_name,
          expense_category_id: transaction.expense_category_id,
          income_category_id: transaction.income_category_id,
          amount: transaction.amount,
          frequency: 0,
          last_used: transaction.created_at,
          tags: transaction.tags
        }
      }
      patterns[key].frequency += 1
      patterns[key].last_used = transaction.created_at
      patterns[key].category_name = transaction.expense_category?.name_vi || transaction.income_category?.name_vi
    }
  })

  // Generate suggestions based on query and type
  const queryLower = query.toLowerCase()

  if (!suggestionType || suggestionType === 'description') {
    // Description suggestions
    Object.entries(patterns)
      .filter(([key, pattern]) => 
        key.startsWith('desc_') && 
        pattern.description &&
        pattern.description.toLowerCase().includes(queryLower) &&
        pattern.frequency >= 1
      )
      .sort(([, a], [, b]) => {
        // Sort by frequency and recency
        const scoreA = a.frequency * 0.7 + (new Date(a.last_used).getTime() / 1000000000) * 0.3
        const scoreB = b.frequency * 0.7 + (new Date(b.last_used).getTime() / 1000000000) * 0.3
        return scoreB - scoreA
      })
      .slice(0, limit)
      .forEach(([, pattern]) => {
        const category = transactionType === 'income' 
          ? { id: pattern.income_category_id || '', name_vi: pattern.category_name || '', name_en: '', color: '#10B981' }
          : { id: pattern.expense_category_id || '', name_vi: pattern.category_name || '', name_en: '', color: '#F59E0B' }

        suggestions.push({
          type: 'description',
          value: pattern.description || '',
          confidence: Math.min(pattern.frequency * 0.1, 0.95),
          frequency: pattern.frequency,
          last_used: pattern.last_used,
          predicted_category: category.id ? category : undefined,
          predicted_amount: pattern.amount,
          related_tags: pattern.tags || []
        })
      })
  }

  if (!suggestionType || suggestionType === 'merchant') {
    // Merchant suggestions
    Object.entries(patterns)
      .filter(([key, pattern]) => 
        key.startsWith('merchant_') && 
        pattern.merchant_name &&
        pattern.merchant_name.toLowerCase().includes(queryLower) &&
        pattern.frequency >= 1
      )
      .sort(([, a], [, b]) => {
        const scoreA = a.frequency * 0.7 + (new Date(a.last_used).getTime() / 1000000000) * 0.3
        const scoreB = b.frequency * 0.7 + (new Date(b.last_used).getTime() / 1000000000) * 0.3
        return scoreB - scoreA
      })
      .slice(0, limit)
      .forEach(([, pattern]) => {
        const category = transactionType === 'income' 
          ? { id: pattern.income_category_id || '', name_vi: pattern.category_name || '', name_en: '', color: '#10B981' }
          : { id: pattern.expense_category_id || '', name_vi: pattern.category_name || '', name_en: '', color: '#F59E0B' }

        suggestions.push({
          type: 'merchant',
          value: pattern.merchant_name || '',
          confidence: Math.min(pattern.frequency * 0.15, 0.95),
          frequency: pattern.frequency,
          last_used: pattern.last_used,
          predicted_category: category.id ? category : undefined,
          predicted_amount: pattern.amount,
          related_tags: pattern.tags || []
        })
      })
  }

  if (!suggestionType || suggestionType === 'amount') {
    // Amount suggestions based on similar descriptions/merchants
    const amountPatterns: Record<number, { frequency: number, last_used: string, contexts: string[] }> = {}
    
    filteredTransactions.forEach(transaction => {
      const amount = transaction.amount
      if (!amountPatterns[amount]) {
        amountPatterns[amount] = {
          frequency: 0,
          last_used: transaction.created_at,
          contexts: []
        }
      }
      amountPatterns[amount].frequency += 1
      amountPatterns[amount].last_used = transaction.created_at
      
      if (transaction.description) {
        amountPatterns[amount].contexts.push(transaction.description)
      }
      if (transaction.merchant_name) {
        amountPatterns[amount].contexts.push(transaction.merchant_name)
      }
    })

    // Get top recurring amounts
    Object.entries(amountPatterns)
      .filter(([amount, data]) => data.frequency >= 2) // Only suggest amounts used multiple times
      .sort(([, a], [, b]) => {
        const scoreA = a.frequency * 0.8 + (new Date(a.last_used).getTime() / 1000000000) * 0.2
        const scoreB = b.frequency * 0.8 + (new Date(b.last_used).getTime() / 1000000000) * 0.2
        return scoreB - scoreA
      })
      .slice(0, Math.min(limit, 5)) // Limit amount suggestions
      .forEach(([amount, data]) => {
        suggestions.push({
          type: 'amount',
          value: parseInt(amount),
          confidence: Math.min(data.frequency * 0.1, 0.9),
          frequency: data.frequency,
          last_used: data.last_used
        })
      })
  }

  return suggestions
}