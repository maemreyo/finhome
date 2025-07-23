// src/app/api/expenses/log-correction/route.ts
// API endpoint for logging AI corrections to improve future suggestions
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for logging corrections
const logCorrectionSchema = z.object({
  input_text: z.string().min(1, 'Input text is required'),
  original_suggestion: z.object({
    transaction_type: z.enum(['expense', 'income', 'transfer']),
    amount: z.number(),
    description: z.string(),
    suggested_category_id: z.string().optional(),
    suggested_category_name: z.string().optional(),
    suggested_tags: z.array(z.string()).default([]),
    confidence_score: z.number().min(0).max(1).default(0.5),
  }),
  corrected_data: z.object({
    transaction_type: z.enum(['expense', 'income', 'transfer']),
    amount: z.number(),
    description: z.string(),
    expense_category_id: z.string().optional(),
    income_category_id: z.string().optional(),
    tags: z.array(z.string()).default([]),
    wallet_id: z.string().optional(),
  }),
  correction_type: z.enum([
    'category_change',
    'amount_change', 
    'description_change',
    'transaction_type_change',
    'tags_change',
    'wallet_change',
    'multiple_changes'
  ]),
  session_id: z.string().uuid().optional(), // To group related corrections
})

// POST /api/expenses/log-correction - Log AI correction for learning
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = logCorrectionSchema.parse(body)

    // Log the correction using the database function
    const { data: correctionId, error: logError } = await supabase
      .rpc('log_ai_correction', {
        p_user_id: user.id,
        p_input_text: validatedData.input_text,
        p_original_suggestion: validatedData.original_suggestion,
        p_corrected_data: validatedData.corrected_data,
        p_correction_type: validatedData.correction_type,
        p_confidence_before: validatedData.original_suggestion.confidence_score
      })

    if (logError) {
      console.error('Error logging AI correction:', logError)
      return NextResponse.json({ 
        error: 'Failed to log correction' 
      }, { status: 500 })
    }

    // Create or update learning patterns based on the correction
    await createLearningPattern(supabase, user.id, validatedData)

    // Log parsing session data if session_id is provided
    if (validatedData.session_id) {
      await updateParsingSession(supabase, validatedData.session_id, {
        correction_logged: true,
        correction_type: validatedData.correction_type
      })
    }

    return NextResponse.json({ 
      success: true,
      correction_id: correctionId,
      message: 'Correction logged successfully. AI will learn from this feedback.'
    })

  } catch (error) {
    console.error('Log correction API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid correction data', 
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to log correction',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to create learning patterns from corrections
async function createLearningPattern(
  supabase: any, 
  userId: string, 
  correctionData: z.infer<typeof logCorrectionSchema>
) {
  try {
    const { original_suggestion, corrected_data, input_text } = correctionData

    // Determine pattern type based on correction
    let patternType = 'merchant_category'
    let triggerText = input_text.toLowerCase()

    // Extract meaningful keywords from input text
    const keywords = extractKeywords(input_text)
    
    for (const keyword of keywords) {
      // Check if pattern already exists
      const { data: existingPattern } = await supabase
        .from('ai_learning_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('pattern_type', patternType)
        .eq('trigger_text', keyword)
        .single()

      const correctedCategoryId = corrected_data.expense_category_id || corrected_data.income_category_id

      if (existingPattern) {
        // Update existing pattern
        await supabase
          .from('ai_learning_patterns')
          .update({
            predicted_category_id: correctedCategoryId,
            predicted_tags: corrected_data.tags,
            usage_count: existingPattern.usage_count + 1,
            confidence_score: Math.min(existingPattern.confidence_score + 0.1, 1.0),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPattern.id)
      } else {
        // Create new pattern
        await supabase
          .from('ai_learning_patterns')
          .insert({
            user_id: userId,
            pattern_type: patternType,
            trigger_text: keyword,
            predicted_category_id: correctedCategoryId,
            predicted_tags: corrected_data.tags,
            confidence_score: 0.7, // Start with moderate confidence
            usage_count: 1,
            success_rate: 100.0
          })
      }
    }
  } catch (error) {
    console.error('Error creating learning pattern:', error)
    // Don't throw - this is not critical for the main flow
  }
}

// Helper function to extract meaningful keywords from text
function extractKeywords(text: string): string[] {
  const cleaned = text.toLowerCase()
    .replace(/[^\w\sáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữự]/g, '')
  
  const words = cleaned.split(/\s+/).filter(word => word.length > 2)
  
  // Common Vietnamese transaction keywords
  const meaningfulWords = words.filter(word => 
    !['tiêu', 'mua', 'ăn', 'uống', 'với', 'bạn', 'bè', 'hôm', 'nay', 'được', 'thật'].includes(word)
  )
  
  return meaningfulWords.slice(0, 3) // Take top 3 meaningful words
}

// Helper function to update parsing session
async function updateParsingSession(
  supabase: any, 
  sessionId: string, 
  updates: any
) {
  try {
    await supabase
      .from('ai_parsing_sessions')
      .update({
        user_corrections: updates,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
  } catch (error) {
    console.error('Error updating parsing session:', error)
  }
}