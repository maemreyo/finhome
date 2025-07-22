// src/app/api/expenses/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/expenses/categories - Fetch expense and income categories
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'expense' | 'income' | 'all' || 'all'

    const results: any = {}

    // Fetch expense categories
    if (type === 'expense' || type === 'all') {
      const { data: expenseCategories, error: expenseError } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (expenseError) {
        console.error('Error fetching expense categories:', expenseError)
        return NextResponse.json({ error: 'Failed to fetch expense categories' }, { status: 500 })
      }

      results.expense_categories = expenseCategories
    }

    // Fetch income categories
    if (type === 'income' || type === 'all') {
      const { data: incomeCategories, error: incomeError } = await supabase
        .from('income_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (incomeError) {
        console.error('Error fetching income categories:', incomeError)
        return NextResponse.json({ error: 'Failed to fetch income categories' }, { status: 500 })
      }

      results.income_categories = incomeCategories
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}