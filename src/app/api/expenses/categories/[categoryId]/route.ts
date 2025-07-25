// src/app/api/expenses/categories/[categoryId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateCategorySchema = z.object({
  icon: z.string().optional(),
  color: z.string().optional(),
  category_type: z.enum(['expense', 'income']).optional(),
})

// PUT /api/expenses/categories/[categoryId] - Update category icon and color
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)
    const { categoryId } = await params

    if (!validatedData.icon && !validatedData.color) {
      return NextResponse.json({ error: 'At least one field (icon or color) must be provided' }, { status: 400 })
    }

    // Determine which table to update based on category_type
    const categoryType = validatedData.category_type || 'expense'
    const tableName = categoryType === 'expense' ? 'expense_categories' : 'income_categories'

    // First check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from(tableName)
      .select('id, icon, color')
      .eq('id', categoryId)
      .single()

    if (fetchError || !existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Update the category
    const updateData: any = {}
    if (validatedData.icon) updateData.icon = validatedData.icon
    if (validatedData.color) updateData.color = validatedData.color

    const { data: updatedCategory, error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating category:', updateError)
      return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }

    return NextResponse.json({ 
      category: updatedCategory,
      message: 'Category updated successfully'
    })

  } catch (error) {
    console.error('Update category error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid category data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/expenses/categories/[categoryId] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryType = searchParams.get('type') as 'expense' | 'income' || 'expense'
    const { categoryId } = await params

    const tableName = categoryType === 'expense' ? 'expense_categories' : 'income_categories'

    const { data: category, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', categoryId)
      .single()

    if (error) {
      console.error('Error fetching category:', error)
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category })

  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}