/**
 * Refactored Transaction Parsing API Route
 * 
 * Clean implementation using Separation of Concerns with service layer architecture
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGeminiKeyManager } from "@/lib/gemini-key-manager";
import { RateLimiter, RequestCache } from "@/lib/rate-limiter";

// Import our service layer
import { AIParsingService } from "@/lib/services/aiParsingService";
import { ResponseProcessingService } from "@/lib/services/responseProcessingService";
import { TransactionValidationService } from "@/lib/services/transactionValidationService";
import { DataAccessService } from "@/lib/services/dataAccessService";
import { TransactionUtils } from "@/lib/services/utils/transactionUtils";
import { ResponseUtils } from "@/lib/services/utils/responseUtils";

// Import types and schemas
import {
  ParseTextRequestSchema,
  ParsedResponseSchema,
  type ParseTextRequest,
  type User,
  type Category,
  type Wallet,
  type ParsedResponse
} from "@/lib/services/types";

// Initialize services (singleton pattern for performance)
let aiParsingService: AIParsingService | null = null;
let responseProcessingService: ResponseProcessingService | null = null;
let transactionValidationService: TransactionValidationService | null = null;

// Initialize external dependencies
let keyManager: any = null;
let rateLimiter: RateLimiter | null = null;
let requestCache: RequestCache | null = null;

// Service initialization
function initializeServices() {
  if (!aiParsingService) {
    try {
      // Initialize external dependencies
      keyManager = createGeminiKeyManager();
      rateLimiter = new RateLimiter({
        maxRequestsPerSecond: 1,
        maxConcurrentRequests: 2,
        baseDelay: 3000,
        maxBackoffDelay: 30000,
      });
      requestCache = new RequestCache({
        maxSize: 500,
        ttl: 600000, // 10 minutes
      });

      // Initialize service layer
      aiParsingService = new AIParsingService(keyManager, rateLimiter, requestCache);
      responseProcessingService = new ResponseProcessingService();
      transactionValidationService = new TransactionValidationService();

      console.log("✅ Service layer initialized successfully");
    } catch (error) {
      console.warn("⚠️ Failed to initialize some services, using fallbacks:", error);
      
      // Fallback initialization
      aiParsingService = new AIParsingService();
      responseProcessingService = new ResponseProcessingService();
      transactionValidationService = new TransactionValidationService();
    }
  }
}

/**
 * POST /api/expenses/parse-from-text
 * Parse natural language text into structured transaction data
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    const timingLabel = `transaction_parsing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.time(timingLabel);
    
    // Initialize services
    initializeServices();
    
    // 1. AUTHENTICATION - Using DataAccessService
    const supabase = await createClient();
    const dataAccessService = new DataAccessService(supabase);
    
    const { user, error: authError } = await dataAccessService.getCurrentUser();
    if (!user || authError) {
      return NextResponse.json(
        ResponseUtils.error("Unauthorized - No valid authentication found"),
        { status: 401 }
      );
    }

    // 2. REQUEST VALIDATION
    const body = await request.json();
    const validationErrors = ResponseUtils.validateTextParsingRequest(body);
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        ResponseUtils.validationError(validationErrors),
        { status: 400 }
      );
    }

    const validatedData = ParseTextRequestSchema.parse(body);

    // 3. SERVICE AVAILABILITY CHECK
    if (!process.env.GEMINI_API_KEY && !keyManager) {
      return NextResponse.json(
        ResponseUtils.error("AI service not configured. Please contact support."),
        { status: 503 }
      );
    }

    // 4. DATA LOADING - Using DataAccessService
    const [expenseCategories, incomeCategories, wallets, userCorrections] = await Promise.all([
      dataAccessService.getExpenseCategories(user.id),
      dataAccessService.getIncomeCategories(user.id),
      dataAccessService.getWallets(user.id),
      dataAccessService.getRecentUserCorrections(user.id, 10)
    ]);

    // Check for critical data loading errors (categories and wallets are required)
    if (expenseCategories.error || incomeCategories.error || wallets.error) {
      return NextResponse.json(
        ResponseUtils.error("Failed to load user data", {
          expense_categories_error: expenseCategories.error?.message,
          income_categories_error: incomeCategories.error?.message,
          wallets_error: wallets.error?.message
        }),
        { status: 500 }
      );
    }
    
    // User corrections error is not critical - log but continue
    if (userCorrections.error) {
      console.log("Note: User corrections not available:", userCorrections.error?.message);
    }

    // Validate user has wallets
    if (!wallets.data || wallets.data.length === 0) {
      return NextResponse.json(
        ResponseUtils.error("No wallets found. Please create a wallet first.", "NO_WALLETS"),
        { status: 400 }
      );
    }

    // Combine categories with type assertion to handle service interface mismatch
    const allCategories: Category[] = [
      ...expenseCategories.data.map(cat => ({ ...cat, category_type: 'expense', user_id: user.id } as Category)),
      ...incomeCategories.data.map(cat => ({ ...cat, category_type: 'income', user_id: user.id } as Category))
    ];

    console.log("📊 Data loaded:", {
      expense_categories: expenseCategories.data.length,
      income_categories: incomeCategories.data.length,
      wallets: wallets.data.length,
      user_corrections: userCorrections.data.length,
      total_categories: allCategories.length
    });

    // 5. DETERMINE PROCESSING MODE
    const useStreaming = validatedData.streaming !== false;
    const debugMode = validatedData.debug || process.env.NODE_ENV === 'development';

    if (useStreaming) {
      return handleStreamingResponse(
        validatedData,
        user,
        allCategories,
        wallets.data.map(wallet => ({ ...wallet, user_id: user.id } as Wallet)),
        userCorrections.data,
        debugMode,
        startTime,
        supabase
      );
    } else {
      return handleNonStreamingResponse(
        validatedData,
        user,
        allCategories,
        wallets.data.map(wallet => ({ ...wallet, user_id: user.id } as Wallet)),
        userCorrections.data,
        debugMode,
        startTime,
        supabase
      );
    }

  } catch (error) {
    console.timeEnd("");
    console.error("❌ Transaction parsing API error:", error);

    return NextResponse.json(
      ResponseUtils.handleError(error),
      { status: 500 }
    );
  }
}

/**
 * Handle non-streaming response processing
 */
async function handleNonStreamingResponse(
  requestData: ParseTextRequest,
  user: User,
  categories: Category[],
  wallets: Wallet[],
  userCorrections: any[],
  debugMode: boolean,
  startTime: number,
  supabase: any
): Promise<NextResponse> {
  
  try {
    // 1. BUILD AI PROMPT - Using AIParsingService
    const prompt = await aiParsingService!.buildPrompt({
      inputText: requestData.text,
      categories,
      wallets,
      userCorrections,
      version: requestData.version || "3.6",
      debugMode
    });

    if (debugMode) {
      console.log("🤖 Generated AI prompt:", prompt.substring(0, 500) + "...");
    }

    // 2. MAKE AI REQUEST - Using AIParsingService
    const aiResponse = await aiParsingService!.makeRequest(prompt, {
      streaming: false,
      disableCache: false
    });

    const aiResponseText = aiResponse.text();
    
    if (debugMode) {
      console.log("🔄 AI Response received:", aiResponseText.substring(0, 200) + "...");
    }

    // 3. PARSE AI RESPONSE - Using ResponseProcessingService
    const parsedResponse = responseProcessingService!.parseWithFallbacks(
      aiResponseText,
      requestData.text
    ) as ParsedResponse;

    // 4. VALIDATE STRUCTURE
    const validatedResponse = ParsedResponseSchema.parse(parsedResponse);

    // Handle case where no transactions are found
    if (!validatedResponse.transactions || validatedResponse.transactions.length === 0) {
      console.log("✅ No transactions detected - valid for non-transaction text");
      
      const response = ResponseUtils.formatParsingResponse(
        [],
        validatedResponse.analysis_summary || "No financial transactions detected in the provided text.",
        {
          ...validatedResponse.parsing_metadata,
          total_transactions_found: 0,
          processing_time_ms: Date.now() - startTime
        }
      );

      return NextResponse.json(
        ResponseUtils.addPerformanceMetrics(response, startTime)
      );
    }

    // 5. POST-PROCESS TRANSACTIONS - Using TransactionUtils
    const processedTransactions = validatedResponse.transactions.map(transaction => {
      // Find matching category
      const matchedCategory = categories.find(cat =>
        cat.id === transaction.suggested_category_id ||
        cat.name_vi.toLowerCase().includes(transaction.suggested_category_name?.toLowerCase() || "") ||
        cat.name_en.toLowerCase().includes(transaction.suggested_category_name?.toLowerCase() || "")
      );

      // Normalize description
      const normalizedDescription = TransactionUtils.normalizeDescription(transaction.description);

      // Generate tags
      const generatedTags = TransactionUtils.generateTags({
        ...transaction,
        description: normalizedDescription
      });

      return {
        ...transaction,
        description: normalizedDescription,
        suggested_category_id: matchedCategory?.id || null,
        suggested_category_name: matchedCategory?.name_vi || transaction.suggested_category_name,
        suggested_wallet_id: transaction.suggested_wallet_id || wallets[0]?.id || null,
        suggested_tags: [...(transaction.suggested_tags || []), ...generatedTags].slice(0, 5),
        parsing_context: {
          original_text: requestData.text,
          processing_timestamp: new Date().toISOString(),
          user_id: user.id,
          prompt_version: requestData.version || "3.6"
        }
      };
    });

    // 6. DETECT UNUSUAL TRANSACTIONS - Using TransactionValidationService
    const transactionsWithFlags = await transactionValidationService!.detectUnusualTransactions(
      processedTransactions as any,
      user,
      supabase // Use actual Supabase client instead of mock
    );

    // 7. SORT BY RELEVANCE - Using TransactionUtils
    const sortedTransactions = TransactionUtils.sortTransactionsByRelevance(transactionsWithFlags as any);

    // 8. MERGE DUPLICATES - Using TransactionUtils
    const finalTransactions = TransactionUtils.mergeDuplicateTransactions(sortedTransactions as any);

    // 9. GENERATE SUMMARY - Using TransactionUtils
    const transactionSummary = TransactionUtils.generateTransactionSummary(finalTransactions as any);

    // 10. SAVE TO DATABASE (if requested)
    if (requestData.save_to_database) {
      const saveDataAccessService = new DataAccessService(supabase);
      const saveResult = await saveDataAccessService.saveTransactions(
        finalTransactions.map(t => ({
          ...t,
          user_id: user.id,
          transaction_date: t.extracted_date || new Date().toISOString().split('T')[0]
        }))
      );

      if (saveResult.error) {
        console.warn("⚠️ Failed to save transactions to database:", saveResult.error);
      } else {
        console.log("✅ Transactions saved to database successfully");
      }
    }

    // 11. PREPARE FINAL RESPONSE
    const finalResponse = ResponseUtils.formatParsingResponse(
      finalTransactions,
      validatedResponse.analysis_summary,
      {
        ...validatedResponse.parsing_metadata,
        transaction_summary: transactionSummary,
        processing_time_ms: Date.now() - startTime,
        service_version: "2.0.0-soc"
      }
    );

    console.timeEnd("");
    console.log("✅ Transaction parsing completed successfully");

    return NextResponse.json(
      ResponseUtils.addPerformanceMetrics(finalResponse, startTime, {
        ai_model: "gemini-2.5-flash",
        service_architecture: "soc-refactored",
        transactions_processed: finalTransactions.length,
        unusual_transactions: finalTransactions.filter(t => t.is_unusual).length
      })
    );

  } catch (error) {
    console.error("❌ Non-streaming processing error:", error);
    throw error;
  }
}

/**
 * Handle streaming response processing
 */
async function handleStreamingResponse(
  requestData: ParseTextRequest,
  user: User,
  categories: Category[],
  wallets: Wallet[],
  userCorrections: any[],
  debugMode: boolean,
  startTime: number,
  supabase: any
): Promise<NextResponse> {

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial progress
        controller.enqueue(
          encoder.encode(
            ResponseUtils.formatProgressUpdate("initializing", 0, "Starting AI processing...")
          )
        );

        // 1. Build prompt
        controller.enqueue(
          encoder.encode(
            ResponseUtils.formatProgressUpdate("prompt_building", 20, "Building AI prompt...")
          )
        );

        const prompt = await aiParsingService!.buildPrompt({
          inputText: requestData.text,
          categories,
          wallets,
          userCorrections,
          version: requestData.version || "3.6",
          debugMode
        });

        // 2. Make AI request with streaming
        controller.enqueue(
          encoder.encode(
            ResponseUtils.formatProgressUpdate("ai_processing", 40, "Processing with AI...")
          )
        );

        const aiStreamResponse = await aiParsingService!.makeRequest(prompt, {
          streaming: true,
          disableCache: false
        });

        let accumulatedText = "";
        
        // 3. Process streaming chunks
        for await (const chunk of aiStreamResponse.stream) {
          const chunkText = chunk.text();
          accumulatedText += chunkText;
          
          controller.enqueue(
            encoder.encode(
              ResponseUtils.formatProgressUpdate(
                "ai_streaming", 
                60, 
                `Receiving AI response... (${accumulatedText.length} chars)`
              )
            )
          );
        }

        // 4. Parse complete response
        controller.enqueue(
          encoder.encode(
            ResponseUtils.formatProgressUpdate("parsing", 80, "Parsing AI response...")
          )
        );

        const parsedResponse = responseProcessingService!.parseWithFallbacks(
          accumulatedText,
          requestData.text
        );

        // 5. Process and validate transactions
        controller.enqueue(
          encoder.encode(
            ResponseUtils.formatProgressUpdate("validation", 90, "Validating transactions...")
          )
        );

        // Apply same processing as non-streaming
        const processedTransactions = parsedResponse.transactions.map(transaction => {
          const matchedCategory = categories.find(cat =>
            cat.id === transaction.suggested_category_id ||
            cat.name_vi.toLowerCase().includes(transaction.suggested_category_name?.toLowerCase() || "")
          );

          return {
            ...transaction,
            description: TransactionUtils.normalizeDescription(transaction.description),
            suggested_category_id: matchedCategory?.id || null,
            suggested_category_name: matchedCategory?.name_vi || transaction.suggested_category_name,
            suggested_wallet_id: transaction.suggested_wallet_id || wallets[0]?.id || null,
            suggested_tags: TransactionUtils.generateTags(transaction)
          };
        });

        const transactionsWithFlags = await transactionValidationService!.detectUnusualTransactions(
          processedTransactions as any,
          user,
          supabase
        );

        const finalTransactions = TransactionUtils.mergeDuplicateTransactions(
          TransactionUtils.sortTransactionsByRelevance(transactionsWithFlags as any) as any
        );

        // 6. Send final results
        controller.enqueue(
          encoder.encode(
            ResponseUtils.formatTransactionResult(finalTransactions, {
              analysis_summary: parsedResponse.analysis_summary,
              ...parsedResponse.parsing_metadata,
              processing_time_ms: Date.now() - startTime,
              transaction_summary: TransactionUtils.generateTransactionSummary(finalTransactions as any)
            })
          )
        );

        // 7. Send completion
        controller.enqueue(
          encoder.encode(
            ResponseUtils.formatStreamingComplete({
              total_transactions: finalTransactions.length,
              processing_time_ms: Date.now() - startTime,
              success: true
            })
          )
        );

        controller.close();

      } catch (error) {
        console.error("❌ Streaming processing error:", error);
        
        controller.enqueue(
          encoder.encode(
            ResponseUtils.formatStreamingError(
              "Processing failed",
              { error: error instanceof Error ? error.message : "Unknown error" }
            )
          )
        );
        
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    headers: ResponseUtils.getStreamingHeaders()
  });
}

/**
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "healthy",
    version: "2.0.0-soc",
    services: {
      ai_parsing: !!aiParsingService,
      response_processing: !!responseProcessingService,
      transaction_validation: !!transactionValidationService,
      external_dependencies: {
        key_manager: !!keyManager,
        rate_limiter: !!rateLimiter,
        request_cache: !!requestCache
      }
    },
    timestamp: new Date().toISOString()
  });
}