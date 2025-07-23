// src/app/api/expenses/parse-from-text/route.ts
// API endpoint for parsing natural language text into structured transaction data using Gemini AI
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

// Validation schema for the input
const parseTextSchema = z.object({
  text: z.string().min(1, 'Text input is required'),
  user_preferences: z.object({
    default_wallet_id: z.string().uuid().optional(),
    timezone: z.string().optional(),
    currency: z.string().default('VND'),
  }).optional(),
})

// Schema for the AI response
const aiTransactionSchema = z.object({
  transaction_type: z.enum(['expense', 'income', 'transfer']),
  amount: z.number().positive(),
  description: z.string(),
  suggested_category_id: z.string().optional(),
  suggested_category_name: z.string().optional(),
  suggested_tags: z.array(z.string()).default([]),
  suggested_wallet_id: z.string().optional(),
  confidence_score: z.number().min(0).max(1).default(0.5),
  extracted_merchant: z.string().nullable().optional(),
  extracted_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

const aiResponseSchema = z.object({
  transactions: z.array(aiTransactionSchema),
  analysis_summary: z.string().optional(),
})

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

async function buildAIPrompt(
  inputText: string, 
  categories: any[], 
  wallets: any[], 
  userCorrections: any[] = []
): Promise<string> {
  // Build category mapping for AI reference
  const categoryMapping = categories.map(cat => ({
    id: cat.id,
    name_vi: cat.name_vi,
    name_en: cat.name_en,
    category_key: cat.category_key,
    type: cat.category_type || 'expense'
  }))

  // Build wallet mapping
  const walletMapping = wallets.map(wallet => ({
    id: wallet.id,
    name: wallet.name,
    type: wallet.wallet_type
  }))

  // Build user correction context
  const correctionContext = userCorrections.length > 0 
    ? `\nUser Correction History (learn from these patterns):\n${userCorrections.map(c => 
        `"${c.input_text}" -> ${c.corrected_category} (was: ${c.original_category})`
      ).join('\n')}`
    : ''

  return `You are an expert Vietnamese financial assistant. Parse the following Vietnamese text and extract transaction information. Follow these rules strictly:

CATEGORIES AVAILABLE:
${JSON.stringify(categoryMapping, null, 2)}

WALLETS AVAILABLE:
${JSON.stringify(walletMapping, null, 2)}

${correctionContext}

PARSING RULES:
1. Extract ALL transactions mentioned in the text (there can be multiple)
2. For each transaction, determine:
   - transaction_type: "expense" (chi tiêu), "income" (thu nhập), or "transfer" (chuyển khoản)
   - amount: Extract numerical value (support formats like "25k", "5 triệu", "50,000")
   - description: Clean, concise description of what the transaction is about
   - suggested_category_id: Match to the EXACT ID from categories above (REQUIRED)
   - suggested_category_name: The matched category name
   - suggested_tags: Array of relevant hashtags (e.g., ["#trà_sữa", "#bạn_bè"])
   - confidence_score: Your confidence in this categorization (0.0-1.0)
   - extracted_merchant: Business/place name if mentioned
   - extracted_date: Date if mentioned, format YYYY-MM-DD
   - notes: Additional context or details

3. AMOUNT PARSING RULES:
   - "k" = thousand (25k = 25,000)
   - "triệu" = million (5 triệu = 5,000,000)
   - "tr" = million (15tr = 15,000,000)
   - Handle decimal points and commas appropriately

4. TRANSACTION TYPE DETECTION:
   - Keywords for EXPENSE: tiêu, mua, ăn, uống, đổ xăng, thanh toán, chi, trả
   - Keywords for INCOME: nhận, lương, thưởng, thu, kiếm, được
   - Keywords for TRANSFER: chuyển, gửi, transfer

5. CATEGORY MATCHING:
   - Be smart about matching Vietnamese terms to categories
   - "trà sữa", "cà phê", "ăn uống" -> food_dining category
   - "xăng", "grab", "taxi", "xe" -> transportation category
   - "mua sắm", "shopping" -> shopping category
   - "lương", "salary" -> salary category
   - Use category_key to help with matching logic

6. TAG GENERATION:
   - Generate 2-4 relevant tags per transaction
   - Use Vietnamese hashtag format (#tag_name)
   - Be specific and contextual

7. OUTPUT FORMAT:
   Return ONLY valid JSON matching this exact structure:
   {
     "transactions": [
       {
         "transaction_type": "expense",
         "amount": 25000,
         "description": "Trà sữa với bạn bè",
         "suggested_category_id": "uuid-here",
         "suggested_category_name": "Ăn uống",
         "suggested_tags": ["#trà_sữa", "#bạn_bè"],
         "confidence_score": 0.9,
         "extracted_merchant": "Gong Cha",
         "extracted_date": null,
         "notes": null
       }
     ],
     "analysis_summary": "Phân tích 1 giao dịch chi tiêu cho đồ uống"
   }

TEXT TO PARSE: "${inputText}"

Remember: Return ONLY the JSON response, no additional text or explanation.`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'AI service not configured. Please contact support.' 
      }, { status: 503 })
    }

    const body = await request.json()
    console.log('Parse text request body:', body)
    const validatedData = parseTextSchema.parse(body)

    // Fetch categories (both expense and income) - these are global categories
    const [expenseCategoriesResult, incomeCategoriesResult] = await Promise.all([
      supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name_vi'),
      supabase
        .from('income_categories')
        .select('*')
        .eq('is_active', true)
        .order('name_vi')
    ])

    if (expenseCategoriesResult.error || incomeCategoriesResult.error) {
      console.error('Category fetch errors:', {
        expense: expenseCategoriesResult.error,
        income: incomeCategoriesResult.error
      })
      return NextResponse.json({ 
        error: 'Failed to fetch categories',
        details: {
          expense_error: expenseCategoriesResult.error?.message,
          income_error: incomeCategoriesResult.error?.message
        }
      }, { status: 500 })
    }

    // Combine categories with type information
    const allCategories = [
      ...expenseCategoriesResult.data.map(cat => ({ ...cat, category_type: 'expense' })),
      ...incomeCategoriesResult.data.map(cat => ({ ...cat, category_type: 'income' }))
    ]

    console.log('Categories loaded:', {
      expense_count: expenseCategoriesResult.data.length,
      income_count: incomeCategoriesResult.data.length,
      total: allCategories.length
    })

    // Fetch user's wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('expense_wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    if (walletsError) {
      console.error('Wallet fetch error:', walletsError)
      return NextResponse.json({ 
        error: 'Failed to fetch user wallets',
        details: walletsError.message
      }, { status: 500 })
    }

    // Check if user has any wallets
    if (!wallets || wallets.length === 0) {
      return NextResponse.json({ 
        error: 'No wallets found. Please create a wallet first.',
        code: 'NO_WALLETS'
      }, { status: 400 })
    }

    // Fetch user's recent corrections (for learning) - optional if table doesn't exist yet
    let userCorrections = []
    try {
      const { data } = await supabase
        .from('user_ai_corrections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      userCorrections = data || []
    } catch (error) {
      console.log('User corrections table not available yet:', error)
      // Continue without corrections - this is not critical
    }

    // Build the AI prompt
    const prompt = await buildAIPrompt(
      validatedData.text, 
      allCategories, 
      wallets, 
      userCorrections
    )

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent parsing
        topK: 1,
        topP: 0.1,
        maxOutputTokens: 2048,
      },
    })

    const response = await result.response
    const aiResponseText = response.text()

    // Parse AI response
    let aiParsedData
    try {
      // Clean the response (remove any markdown formatting)
      const cleanedResponse = aiResponseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      aiParsedData = JSON.parse(cleanedResponse)
      
      // Validate the AI response structure
      const validatedAIResponse = aiResponseSchema.parse(aiParsedData)
      
      // Ensure we have at least one transaction
      if (!validatedAIResponse.transactions || validatedAIResponse.transactions.length === 0) {
        throw new Error('No transactions found in AI response')
      }
      
      // Post-process transactions to ensure all required fields
      const processedTransactions = validatedAIResponse.transactions.map(transaction => {
        // Find the actual category to ensure the ID is valid
        const matchedCategory = allCategories.find(cat => 
          cat.id === transaction.suggested_category_id ||
          cat.name_vi.toLowerCase().includes(transaction.suggested_category_name?.toLowerCase() || '') ||
          cat.name_en.toLowerCase().includes(transaction.suggested_category_name?.toLowerCase() || '')
        )

        return {
          ...transaction,
          suggested_category_id: matchedCategory?.id || null,
          suggested_category_name: matchedCategory?.name_vi || transaction.suggested_category_name,
          suggested_wallet_id: transaction.suggested_wallet_id || wallets[0]?.id || null,
          // Generate additional context
          parsing_context: {
            original_text: validatedData.text,
            processing_timestamp: new Date().toISOString(),
            user_id: user.id
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          transactions: processedTransactions,
          analysis_summary: validatedAIResponse.analysis_summary,
          metadata: {
            total_transactions: processedTransactions.length,
            processing_time: new Date().toISOString(),
            ai_model: "gemini-1.5-flash"
          }
        }
      })

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI Response Text:', aiResponseText)
      
      return NextResponse.json({
        error: 'AI response could not be parsed',
        details: 'The AI service returned an unexpected format. Please try rephrasing your input.',
        debug_info: process.env.NODE_ENV === 'development' ? {
          raw_response: aiResponseText,
          parse_error: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        } : undefined
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Parse from text API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: error.issues 
      }, { status: 400 })
    }

    // Handle Gemini API errors
    if (error instanceof Error && error.message.includes('API_KEY')) {
      return NextResponse.json({ 
        error: 'AI service configuration error' 
      }, { status: 503 })
    }

    return NextResponse.json({ 
      error: 'Failed to process text input',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}