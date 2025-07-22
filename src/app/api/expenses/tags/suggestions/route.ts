// src/app/api/expenses/tags/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/expenses/tags/suggestions - Get popular tag suggestions for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query to get all tags used by the user, with frequency
    const { data: transactions, error } = await supabase
      .from('expense_transactions')
      .select('tags')
      .eq('user_id', user.id)
      .not('tags', 'is', null)
      .not('tags', 'eq', '{}')
      .order('created_at', { ascending: false })
      .limit(1000) // Look at last 1000 transactions

    if (error) {
      console.error('Error fetching tag suggestions:', error)
      // Return default suggestions on error
      return NextResponse.json({
        suggestions: [
          'Ăn uống', 'Cà phé', 'Shopping', 'Xăng xe', 'Siêu thị',
          'Thuê nhà', 'Điện nước', 'Internet', 'Điện thoại', 'Y tế',
          'Giải trí', 'Du lịch', 'Quà tặng', 'Từ thiện', 'Đầu tư'
        ]
      })
    }

    // Extract and count tag frequency
    const tagFrequency: Record<string, number> = {}
    
    transactions.forEach(transaction => {
      if (Array.isArray(transaction.tags)) {
        transaction.tags.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) {
            const cleanTag = tag.trim()
            tagFrequency[cleanTag] = (tagFrequency[cleanTag] || 0) + 1
          }
        })
      }
    })

    // Sort by frequency and get top suggestions
    const suggestions = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag]) => tag)

    // If user has few tags, supplement with common Vietnamese tags
    if (suggestions.length < 10) {
      const commonTags = [
        'Ăn uống', 'Cà phé', 'Shopping', 'Xăng xe', 'Siêu thị',
        'Thuê nhà', 'Điện nước', 'Internet', 'Điện thoại', 'Y tế',
        'Giải trí', 'Du lịch', 'Quà tặng', 'Từ thiện', 'Đầu tư',
        'Gym', 'Sách', 'Làm đẹp', 'Sửa chữa', 'Bảo hiểm'
      ]
      
      // Add common tags that user hasn't used yet
      commonTags.forEach(tag => {
        if (!suggestions.includes(tag) && suggestions.length < 20) {
          suggestions.push(tag)
        }
      })
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 20),
      tagCount: Object.keys(tagFrequency).length,
      totalTransactions: transactions.length
    })

  } catch (error) {
    console.error('Tag suggestions API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        suggestions: [
          'Ăn uống', 'Cà phé', 'Shopping', 'Xăng xe', 'Siêu thị',
          'Thuê nhà', 'Điện nước', 'Internet', 'Điện thoại', 'Y tế'
        ]
      }, 
      { status: 500 }
    )
  }
}