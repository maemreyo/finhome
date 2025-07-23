// src/app/api/expenses/parsing-sessions/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const parsingSessionSchema = z.object({
  input_text: z.string(),
  transactions_parsed: z.number(),
  avg_confidence: z.number(),
  parsed_transactions: z.array(z.any()),
  parsing_duration_ms: z.number().optional(),
  success: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = parsingSessionSchema.parse(body)

    // Log the parsing session (currently just console log until table is created)
    console.log('Parsing session data:', {
      user_id: user.id,
      input_text: validatedData.input_text,
      transactions_parsed: validatedData.transactions_parsed,
      avg_confidence: validatedData.avg_confidence,
      parsing_duration_ms: validatedData.parsing_duration_ms,
      success: validatedData.success ?? true,
      timestamp: new Date().toISOString()
    })

    // TODO: Save to expense_parsing_sessions table once it's created in database

    return NextResponse.json({ 
      success: true,
      session_id: crypto.randomUUID(),
      message: 'Parsing session logged successfully'
    })

  } catch (error) {
    console.error('Parsing session API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid session data', 
        details: error.issues 
      }, { status: 400 })
    }

    // Don't fail the request for logging errors
    return NextResponse.json({ 
      success: true,
      message: 'Request processed despite logging issues',
      warning: error instanceof Error ? error.message : 'Unknown logging error'
    })
  }
}