// src/app/api/expenses/parse-from-text/route.ts
// API endpoint for parsing natural language text into structured transaction data using Gemini AI
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { createGeminiKeyManager } from "@/lib/gemini-key-manager";
import { RateLimiter, RequestCache } from "@/lib/rate-limiter";
import { PromptService } from "@/lib/services/promptService";

// Validation schema for the input
const parseTextSchema = z.object({
  text: z.string().min(1, "Text input is required"),
  user_preferences: z
    .object({
      default_wallet_id: z.string().uuid().optional(),
      timezone: z.string().optional(),
      currency: z.string().default("VND"),
    })
    .optional(),
  stream: z.boolean().default(true), // Enable streaming by default
  disable_cache: z.boolean().default(false), // Allow disabling cache for testing
});

// Schema for the AI response
const aiTransactionSchema = z.object({
  transaction_type: z.enum(["expense", "income", "transfer"]),
  amount: z.number().min(0), // Allow zero amounts for ambiguous cases
  description: z.string(),
  suggested_category_id: z.string().optional(),
  suggested_category_name: z.string().optional(),
  suggested_tags: z.array(z.string()).default([]),
  suggested_wallet_id: z.string().optional(),
  confidence_score: z.number().min(0).max(1).default(0.5),
  extracted_merchant: z.string().nullable().optional(),
  extracted_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_unusual: z.boolean().default(false),
  unusual_reasons: z.array(z.string()).default([]),
});

const aiResponseSchema = z.object({
  transactions: z.array(aiTransactionSchema),
  analysis_summary: z.string().optional(),
});

// Initialize Gemini Key Manager and Rate Limiting
let keyManager: any = null;
let rateLimiter: RateLimiter | null = null;
let requestCache: RequestCache | null = null;

try {
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
  console.log(
    "✅ Gemini Key Manager and Rate Limiter initialized successfully"
  );
} catch (error) {
  console.warn(
    "⚠️ Failed to initialize key manager, falling back to single key:",
    error
  );
  // Fallback to single key
  keyManager = null;
}

// Helper function to make Gemini API calls with key rotation and rate limiting
async function makeGeminiRequest(prompt: string, streaming: boolean = false, disableCache: boolean = false) {
  // Create a better cache key that includes the actual input text, not just the template
  const inputTextMatch = prompt.match(/TEXT TO PARSE: "([^"]+)"/);
  const inputText = inputTextMatch ? inputTextMatch[1] : prompt.substring(0, 100);
  const cacheKey = streaming || disableCache ? null : `cache_${inputText}_${prompt.length}`;

  // Check cache first for non-streaming requests (unless cache is disabled)
  if (!streaming && !disableCache && requestCache && cacheKey) {
    const cached = requestCache.get(cacheKey);
    if (cached) {
      console.log(`🎯 Cache hit for: "${inputText}"`);
      return cached;
    }
  }

  const requestFn = async (apiKey?: string) => {
    const currentKey = apiKey || process.env.GEMINI_API_KEY || "";
    if (!currentKey) {
      throw new Error("No Gemini API key available");
    }

    const genAI = new GoogleGenerativeAI(currentKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const generationConfig = {
      temperature: 0.1,
      topK: 1,
      topP: 0.1,
      maxOutputTokens: 2048,
    };

    if (streaming) {
      return await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });
    } else {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });
      return await result.response;
    }
  };

  let result;

  if (keyManager && rateLimiter) {
    // Use key rotation and rate limiting
    try {
      keyManager.printStatus(); // Log current status

      result = await rateLimiter.throttleRequest(async () => {
        return await keyManager.queueRequest(requestFn);
      });
    } catch (error) {
      console.error("🚫 Key manager request failed:", error);

      // Fallback to single key with rate limiting
      console.log("🔄 Falling back to single key with rate limiting...");
      result = await rateLimiter.throttleRequest(() => requestFn());
    }
  } else {
    // Fallback: single key without advanced rate limiting
    console.log("🔄 Using single key fallback...");
    result = await requestFn();
  }

  // Cache non-streaming results (unless cache is disabled)
  if (!streaming && !disableCache && requestCache && cacheKey && result) {
    console.log(`💾 Caching result for: "${inputText}"`);
    requestCache.set(cacheKey, result);
  }

  return result;
}

// Helper function to get relevant categories based on input text
function getRelevantCategories(inputText: string, allCategories: any[]): any[] {
  const text = inputText.toLowerCase();
  const relevantCategories: any[] = [];

  // Keywords mapping for efficient category selection
  const categoryKeywords = {
    food_dining: [
      "ăn",
      "uống",
      "trà",
      "cà phê",
      "phở",
      "cơm",
      "bún",
      "quán",
      "nhà hàng",
      "food",
      "drink",
    ],
    transportation: [
      "xe",
      "grab",
      "taxi",
      "xăng",
      "gas",
      "uber",
      "bus",
      "metro",
    ],
    shopping: ["mua", "shopping", "shopee", "lazada", "mall", "siêu thị"],
    entertainment: [
      "phim",
      "game",
      "net",
      "nhậu",
      "karaoke",
      "bar",
      "club",
      "giải trí",
    ],
    healthcare: [
      "bệnh viện",
      "khám",
      "thuốc",
      "doctor",
      "hospital",
      "medicine",
    ],
    education: ["học", "trường", "sách", "school", "course", "class"],
    utilities: ["điện", "nước", "internet", "phone", "electric", "water"],
    salary: ["lương", "salary", "thưởng", "bonus"],
    investment: ["đầu tư", "invest", "stock", "crypto", "bitcoin"],
  };

  // Find categories that match keywords in the text
  for (const [categoryKey, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      const matchingCategories = allCategories.filter(
        (cat) =>
          cat.category_key === categoryKey ||
          keywords.some(
            (keyword) =>
              cat.name_vi.toLowerCase().includes(keyword) ||
              cat.name_en.toLowerCase().includes(keyword)
          )
      );
      relevantCategories.push(...matchingCategories);
    }
  }

  // Always include most common categories as fallback
  const commonCategories = allCategories
    .filter((cat) =>
      ["food_dining", "transportation", "shopping", "salary", "other"].includes(
        cat.category_key
      )
    )
    .slice(0, 10);

  // Combine and deduplicate
  const allRelevant = [...relevantCategories, ...commonCategories];
  const uniqueCategories = allRelevant.filter(
    (cat, index, self) => index === self.findIndex((c) => c.id === cat.id)
  );

  // Limit to 15 most relevant categories to reduce prompt size
  return uniqueCategories.slice(0, 15);
}

// Helper function to detect unusual transactions
async function detectUnusualTransactions(
  transactions: any[],
  user: any,
  supabase: any
): Promise<any[]> {
  const LARGE_AMOUNT_THRESHOLD = 5000000; // 5 million VND
  const LOW_CONFIDENCE_THRESHOLD = 0.5;

  return Promise.all(
    transactions.map(async (transaction) => {
      const unusualReasons: string[] = [];
      let isUnusual = false;

      // Check 1: Large amount threshold
      if (transaction.amount > LARGE_AMOUNT_THRESHOLD) {
        unusualReasons.push(
          `Large amount: ${transaction.amount.toLocaleString("vi-VN")} VND exceeds ${LARGE_AMOUNT_THRESHOLD.toLocaleString("vi-VN")} VND threshold`
        );
        isUnusual = true;
      }

      // Check 2: Low confidence score
      if (transaction.confidence_score < LOW_CONFIDENCE_THRESHOLD) {
        unusualReasons.push(
          `Low AI confidence: ${Math.round(transaction.confidence_score * 100)}% confidence is below ${LOW_CONFIDENCE_THRESHOLD * 100}% threshold`
        );
        isUnusual = true;
      }

      // Check 3: Compare with user's spending patterns (if available)
      try {
        if (
          transaction.suggested_category_id &&
          transaction.transaction_type === "expense"
        ) {
          // Get user's average spending for this category over the last 3 months
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

          const { data: recentTransactions, error } = await supabase
            .from("expense_transactions")
            .select("amount")
            .eq("user_id", user.id)
            .eq("expense_category_id", transaction.suggested_category_id)
            .gte("transaction_date", threeMonthsAgo.toISOString().split("T")[0])
            .order("transaction_date", { ascending: false })
            .limit(50);

          if (!error && recentTransactions && recentTransactions.length >= 5) {
            const amounts = recentTransactions.map((t) => t.amount);
            const average =
              amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
            const standardDeviation = Math.sqrt(
              amounts.reduce(
                (sum, amount) => sum + Math.pow(amount - average, 2),
                0
              ) / amounts.length
            );

            // Flag as unusual if more than 2.5 standard deviations above average
            const threshold = average + 2.5 * standardDeviation;
            if (
              transaction.amount > threshold &&
              transaction.amount > average * 3
            ) {
              unusualReasons.push(
                `Unusually high for category: ${transaction.amount.toLocaleString("vi-VN")} VND is ${Math.round(transaction.amount / average)}x your average of ${Math.round(average).toLocaleString("vi-VN")} VND`
              );
              isUnusual = true;
            }
          }
        }
      } catch (error) {
        console.warn("Error analyzing spending patterns:", error);
        // Don't fail the entire process if pattern analysis fails
      }

      // Check 4: Unusual transaction patterns
      const suspiciousPatterns = [
        /\b(test|testing|fake|dummy)\b/i,
        /\b999+\b/, // Repeated 9s often indicate test data
        /\b(lorem|ipsum)\b/i, // Lorem ipsum text
      ];

      const textToCheck = `${transaction.description} ${transaction.notes || ""}`;
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(textToCheck)) {
          unusualReasons.push(
            `Suspicious pattern detected in description: "${transaction.description}"`
          );
          isUnusual = true;
          break;
        }
      }

      return {
        ...transaction,
        is_unusual: isUnusual,
        unusual_reasons: unusualReasons,
      };
    })
  );
}

// Enhanced JSON parsing with fallback strategies
function parseAIResponseWithFallback(responseText: string): any {
  // Strategy 1: Direct JSON parsing
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.warn("🔄 Direct JSON parsing failed, trying fallback strategies...");
  }

  // Strategy 2: Try to fix common JSON issues
  try {
    let fixedResponse = responseText;
    
    // Fix missing closing braces/brackets
    const openBraces = (fixedResponse.match(/\{/g) || []).length;
    const closeBraces = (fixedResponse.match(/\}/g) || []).length;
    const openBrackets = (fixedResponse.match(/\[/g) || []).length;
    const closeBrackets = (fixedResponse.match(/\]/g) || []).length;
    
    // Add missing closing braces
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixedResponse += '}';
    }
    
    // Add missing closing brackets
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixedResponse += ']';
    }
    
    // Remove trailing commas
    fixedResponse = fixedResponse.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix unescaped quotes in strings
    fixedResponse = fixedResponse.replace(/(?<!\\)"/g, '\\"');
    fixedResponse = fixedResponse.replace(/\\"/g, '"');
    
    return JSON.parse(fixedResponse);
  } catch (error) {
    console.warn("🔄 JSON repair strategy failed, trying extraction...");
  }

  // Strategy 3: Extract JSON from partial response
  try {
    // Look for JSON-like patterns
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.warn("🔄 JSON extraction failed");
  }

  // Strategy 4: Return fallback structure
  console.error("❌ All JSON parsing strategies failed, returning fallback");
  return {
    transactions: [],
    analysis_summary: "Failed to parse AI response. The AI may have returned malformed JSON."
  };
}

async function buildAIPrompt(
  inputText: string,
  categories: any[],
  wallets: any[],
  userCorrections: any[] = []
): Promise<string> {
  // Optimize category mapping - only include relevant categories based on input text
  const relevantCategories = getRelevantCategories(inputText, categories);

  // Build user correction context - limit to most recent and relevant
  const relevantCorrections = userCorrections
    .filter((c) => c.input_text && c.corrected_category)
    .slice(0, 5); // Limit to 5 most recent corrections

  const correctionContext =
    relevantCorrections.length > 0
      ? `
Recent Corrections (learn from these patterns):
${relevantCorrections
  .map((c) => `"${c.input_text.substring(0, 50)}" -> ${c.corrected_category}`)
  .join(" ")}`
      : "";

  // Use the prompt service to generate the prompt with enhanced v3.0 features
  return await PromptService.getTransactionParsingPrompt({
    inputText,
    categories: relevantCategories,
    wallets: wallets.slice(0, 5), // Limit to 5 wallets
    correctionContext,
    version: "3.0", // Use the enhanced v3.0 with Vietnamese time recognition
    debugMode: process.env.NODE_ENV === "development" // Enable debug logging in development
  });
}

export async function POST(request: NextRequest) {
  try {
    console.time("gemini_processing");

    // Handle cookie-based authentication
    let supabase = await createClient();
    let user = null;

    // First try to get user from existing session
    const {
      data: { user: sessionUser },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionUser && !sessionError) {
      user = sessionUser;
    } else {
      // If no session user, try to extract from cookie header
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        // Parse the sb-*-auth-token cookie
        const authTokenMatch = cookieHeader.match(
          /sb-[^-]+-[^-]+-auth-token=([^;]+)/
        );
        if (authTokenMatch) {
          try {
            const tokenValue = decodeURIComponent(authTokenMatch[1]);
            // Remove the base64- prefix if present
            const cleanToken = tokenValue.replace(/^base64-/, "");
            const sessionData = JSON.parse(atob(cleanToken));

            if (sessionData.access_token) {
              // Create a new supabase client with the token
              const { createServerClient } = await import("@supabase/ssr");

              supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                  cookies: {
                    getAll() {
                      return [];
                    },
                    setAll() {
                      // No-op for manual token setup
                    },
                  },
                }
              );

              // Set the session manually
              await supabase.auth.setSession({
                access_token: sessionData.access_token,
                refresh_token: sessionData.refresh_token,
              });

              // Get user from the new session
              const {
                data: { user: tokenUser },
                error: tokenError,
              } = await supabase.auth.getUser();
              if (tokenUser && !tokenError) {
                user = tokenUser;
              }
            }
          } catch (error) {
            console.error("Error parsing auth token from cookie:", error);
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - No valid authentication found" },
        { status: 401 }
      );
    }

    // Check if Gemini API key is configured (or key manager is available)
    if (!keyManager && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "AI service not configured. Please contact support.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    console.log("Parse text request body:", body);
    const validatedData = parseTextSchema.parse(body);

    // Check if streaming is requested
    const useStreaming = validatedData.stream !== false; // Default to streaming
    
    // Check if cache should be disabled (useful for testing)
    const disableCache = validatedData.disable_cache || false;

    // Fetch categories (both expense and income) - these are global categories
    const [expenseCategoriesResult, incomeCategoriesResult] = await Promise.all(
      [
        supabase
          .from("expense_categories")
          .select("*")
          .eq("is_active", true)
          .order("name_vi"),
        supabase
          .from("income_categories")
          .select("*")
          .eq("is_active", true)
          .order("name_vi"),
      ]
    );

    if (expenseCategoriesResult.error || incomeCategoriesResult.error) {
      console.error("Category fetch errors:", {
        expense: expenseCategoriesResult.error,
        income: incomeCategoriesResult.error,
      });
      return NextResponse.json(
        {
          error: "Failed to fetch categories",
          details: {
            expense_error: expenseCategoriesResult.error?.message,
            income_error: incomeCategoriesResult.error?.message,
          },
        },
        { status: 500 }
      );
    }

    // Combine categories with type information
    const allCategories = [
      ...expenseCategoriesResult.data.map((cat) => ({
        ...cat,
        category_type: "expense",
      })),
      ...incomeCategoriesResult.data.map((cat) => ({
        ...cat,
        category_type: "income",
      })),
    ];

    console.log("Categories loaded:", {
      expense_count: expenseCategoriesResult.data.length,
      income_count: incomeCategoriesResult.data.length,
      total: allCategories.length,
    });

    // Fetch user's wallets
    const { data: wallets, error: walletsError } = await supabase
      .from("expense_wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (walletsError) {
      console.error("Wallet fetch error:", walletsError);
      return NextResponse.json(
        {
          error: "Failed to fetch user wallets",
          details: walletsError.message,
        },
        { status: 500 }
      );
    }

    // Check if user has any wallets
    if (!wallets || wallets.length === 0) {
      return NextResponse.json(
        {
          error: "No wallets found. Please create a wallet first.",
          code: "NO_WALLETS",
        },
        { status: 400 }
      );
    }

    // Fetch user's recent corrections (for learning) - optional if table doesn't exist yet
    let userCorrections = [];
    try {
      const { data } = await supabase
        .from("user_ai_corrections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      userCorrections = data || [];
    } catch (error) {
      console.log("User corrections table not available yet:", error);
      // Continue without corrections - this is not critical
    }

    // Build the AI prompt
    const prompt = await buildAIPrompt(
      validatedData.text,
      allCategories,
      wallets,
      userCorrections
    );

    // Call Gemini AI with streaming support and key rotation
    if (useStreaming) {
      return handleStreamingResponse(prompt, {
        allCategories,
        wallets,
        validatedData,
        user,
        supabase,
        disableCache, // Pass cache setting to streaming handler
      });
    } else {
      // Non-streaming fallback with key rotation
      const response = await makeGeminiRequest(prompt, false, disableCache);
      const aiResponseText = response.text();
      console.timeEnd("gemini_processing");

      // Parse AI response with enhanced error recovery
      let aiParsedData;
      try {
        // Clean the response (remove any markdown formatting)
        let cleanedResponse = aiResponseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        // Try to parse JSON with multiple fallback strategies
        aiParsedData = parseAIResponseWithFallback(cleanedResponse);

        // Validate the AI response structure
        const validatedAIResponse = aiResponseSchema.parse(aiParsedData);

        // Handle case where no transactions are found (valid for non-transaction text)
        if (
          !validatedAIResponse.transactions ||
          validatedAIResponse.transactions.length === 0
        ) {
          console.log("✅ No transactions detected - this is valid for non-transaction text");
          return NextResponse.json({
            success: true,
            data: {
              transactions: [],
              analysis_summary: validatedAIResponse.analysis_summary || "No financial transactions detected in the provided text.",
              metadata: {
                total_transactions: 0,
                unusual_count: 0,
                processing_time: new Date().toISOString(),
                ai_model: "gemini-2.5-flash",
                parsing_metadata: aiParsedData.parsing_metadata || null
              },
            },
          });
        }

        // Post-process transactions to ensure all required fields
        const processedTransactions = validatedAIResponse.transactions.map(
          (transaction) => {
            // Find the actual category to ensure the ID is valid
            const matchedCategory = allCategories.find(
              (cat) =>
                cat.id === transaction.suggested_category_id ||
                cat.name_vi
                  .toLowerCase()
                  .includes(
                    transaction.suggested_category_name?.toLowerCase() || ""
                  ) ||
                cat.name_en
                  .toLowerCase()
                  .includes(
                    transaction.suggested_category_name?.toLowerCase() || ""
                  )
            );

            return {
              ...transaction,
              suggested_category_id: matchedCategory?.id || null,
              suggested_category_name:
                matchedCategory?.name_vi || transaction.suggested_category_name,
              suggested_wallet_id:
                transaction.suggested_wallet_id || wallets[0]?.id || null,
              // Generate additional context
              parsing_context: {
                original_text: validatedData.text,
                processing_timestamp: new Date().toISOString(),
                user_id: user.id,
              },
            };
          }
        );

        // Detect unusual transactions
        const transactionsWithUnusualFlags = await detectUnusualTransactions(
          processedTransactions,
          user,
          supabase
        );

        return NextResponse.json({
          success: true,
          data: {
            transactions: transactionsWithUnusualFlags,
            analysis_summary: validatedAIResponse.analysis_summary,
            metadata: {
              total_transactions: transactionsWithUnusualFlags.length,
              unusual_count: transactionsWithUnusualFlags.filter(
                (t) => t.is_unusual
              ).length,
              processing_time: new Date().toISOString(),
              ai_model: "gemini-2.5-flash",
            },
          },
        });
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.error("AI Response Text:", aiResponseText);

        // Handle specific Zod validation errors
        if (parseError instanceof z.ZodError) {
          console.error("Zod validation errors:", parseError.issues);
          
          // Check if it's an amount validation error
          const amountErrors = parseError.issues.filter(issue => 
            issue.path.includes('amount') || issue.message.includes('amount')
          );
          
          if (amountErrors.length > 0) {
            return NextResponse.json(
              {
                error: "Invalid transaction amount",
                details: "The AI detected a transaction with an invalid amount. Please provide more specific financial information.",
                suggestions: [
                  "Include specific amounts (e.g., '50,000 VND' instead of 'a little money')",
                  "Be more explicit about the transaction (e.g., 'bought coffee for 25,000 VND')"
                ]
              },
              { status: 400 }
            );
          }
        }

        return NextResponse.json(
          {
            error: "AI response could not be parsed",
            details:
              "The AI service returned an unexpected format. Please try rephrasing your input.",
            debug_info:
              process.env.NODE_ENV === "development"
                ? {
                    raw_response: aiResponseText,
                    parse_error:
                      parseError instanceof Error
                        ? parseError.message
                        : "Unknown parsing error",
                  }
                : undefined,
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.timeEnd("gemini_processing");
    console.error("Parse from text API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Handle Gemini API errors
    if (error instanceof Error && error.message.includes("API_KEY")) {
      return NextResponse.json(
        {
          error: "AI service configuration error",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process text input",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Streaming response handler
async function handleStreamingResponse(
  prompt: string,
  context: {
    allCategories: any[];
    wallets: any[];
    validatedData: any;
    user: any;
    supabase: any;
    disableCache: boolean;
  }
) {
  const { allCategories, wallets, validatedData, user, supabase, disableCache } = context;

  // Create a ReadableStream for server-sent events
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial status
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ type: "status", message: "Starting AI analysis..." })}\n\n`
          )
        );

        // Start streaming from Gemini with key rotation
        const result = await makeGeminiRequest(prompt, true, disableCache);

        let accumulatedText = "";
        let transactionBuffer = "";
        const currentTransaction: any = null;
        let transactionsFound = 0;

        // Process each chunk from the stream
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          accumulatedText += chunkText;
          transactionBuffer += chunkText;

          // Try to parse partial transactions as they come in
          const partialTransactions = extractPartialTransactions(
            transactionBuffer,
            allCategories,
            wallets
          );

          if (partialTransactions.length > transactionsFound) {
            // New complete transaction found
            const newTransactions =
              partialTransactions.slice(transactionsFound);
            transactionsFound = partialTransactions.length;

            for (const transaction of newTransactions) {
              // Send each completed transaction immediately
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    type: "transaction",
                    data: transaction,
                    progress: {
                      current: transactionsFound,
                      estimated: Math.max(
                        transactionsFound,
                        estimateTransactionCount(validatedData.text)
                      ),
                    },
                  })}\n\n`
                )
              );
            }
          }

          // Send progress updates
          if (chunkText.trim()) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  message: "Processing...",
                  chunk:
                    chunkText.substring(0, 50) +
                    (chunkText.length > 50 ? "..." : ""),
                })}\n\n`
              )
            );
          }
        }

        console.timeEnd("gemini_processing");

        // Final processing of complete response
        try {
          const cleanedResponse = accumulatedText
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

          // Use the same robust parsing function for streaming
          const aiParsedData = parseAIResponseWithFallback(cleanedResponse);
          const validatedAIResponse = aiResponseSchema.parse(aiParsedData);

          // Handle case where no transactions are found (valid for non-transaction text)
          if (
            !validatedAIResponse.transactions ||
            validatedAIResponse.transactions.length === 0
          ) {
            console.log("✅ No transactions detected in streaming - this is valid for non-transaction text");
            
            // Send final result with empty transactions
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: "final",
                  data: {
                    transactions: [],
                    analysis_summary: validatedAIResponse.analysis_summary || "No financial transactions detected in the provided text.",
                    metadata: {
                      total_transactions: 0,
                      unusual_count: 0,
                      processing_time: new Date().toISOString(),
                      ai_model: "gemini-2.5-flash",
                      streaming: true,
                      parsing_metadata: aiParsedData.parsing_metadata || null
                    },
                  },
                })}

`
              )
            );
            
            // Send completion signal and close
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }

          // Process any remaining transactions
          const processedTransactions = validatedAIResponse.transactions.map(
            (transaction) => {
              const matchedCategory = allCategories.find(
                (cat) =>
                  cat.id === transaction.suggested_category_id ||
                  cat.name_vi
                    .toLowerCase()
                    .includes(
                      transaction.suggested_category_name?.toLowerCase() || ""
                    ) ||
                  cat.name_en
                    .toLowerCase()
                    .includes(
                      transaction.suggested_category_name?.toLowerCase() || ""
                    )
              );

              return {
                ...transaction,
                suggested_category_id: matchedCategory?.id || null,
                suggested_category_name:
                  matchedCategory?.name_vi ||
                  transaction.suggested_category_name,
                suggested_wallet_id:
                  transaction.suggested_wallet_id || wallets[0]?.id || null,
                parsing_context: {
                  original_text: validatedData.text,
                  processing_timestamp: new Date().toISOString(),
                  user_id: user.id,
                },
              };
            }
          );

          // Detect unusual transactions
          const transactionsWithUnusualFlags = await detectUnusualTransactions(
            processedTransactions,
            user,
            supabase
          );

          // Send final result
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: "final",
                data: {
                  transactions: transactionsWithUnusualFlags,
                  analysis_summary: validatedAIResponse.analysis_summary,
                  metadata: {
                    total_transactions: transactionsWithUnusualFlags.length,
                    unusual_count: transactionsWithUnusualFlags.filter(
                      (t) => t.is_unusual
                    ).length,
                    processing_time: new Date().toISOString(),
                    ai_model: "gemini-2.5-flash",
                    streaming: true,
                  },
                },
              })}\n\n`
            )
          );
        } catch (parseError) {
          console.error("Failed to parse streaming AI response:", parseError);
          
          // Handle specific Zod validation errors in streaming
          if (parseError instanceof z.ZodError) {
            console.error("Streaming Zod validation errors:", parseError.issues);
            
            const amountErrors = parseError.issues.filter(issue => 
              issue.path.includes('amount') || issue.message.includes('amount')
            );
            
            if (amountErrors.length > 0) {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    type: "error",
                    error: "Invalid transaction amount",
                    details: "The AI detected a transaction with an invalid amount. Please provide more specific financial information.",
                    suggestions: [
                      "Include specific amounts (e.g., '50,000 VND' instead of 'a little money')",
                      "Be more explicit about the transaction (e.g., 'bought coffee for 25,000 VND')"
                    ]
                  })}\n\n`
                )
              );
              return;
            }
          }
          
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "AI response could not be parsed",
                details:
                  "The AI service returned an unexpected format. Please try rephrasing your input.",
                debug_info:
                  process.env.NODE_ENV === "development"
                    ? {
                        raw_response: accumulatedText.substring(0, 500),
                        parse_error:
                          parseError instanceof Error
                            ? parseError.message
                            : "Unknown parsing error",
                      }
                    : undefined,
              })}\n\n`
            )
          );
        }

        // Send completion signal
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.timeEnd("gemini_processing");
        console.error("Streaming error:", error);

        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: "error",
              error: "Streaming failed",
              message:
                error instanceof Error
                  ? error.message
                  : "Unknown streaming error",
            })}\n\n`
          )
        );

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Helper function to extract partial transactions from accumulated text
function extractPartialTransactions(
  text: string,
  allCategories: any[],
  wallets: any[]
): any[] {
  try {
    // Look for transaction objects in the accumulated text
    const transactionRegex = /{[^{}]*"transaction_type"[^{}]*}/g;
    const matches = text.match(transactionRegex) || [];

    const validTransactions: any[] = [];

    for (const match of matches) {
      try {
        const transaction = JSON.parse(match);
        if (
          transaction.transaction_type &&
          transaction.amount &&
          transaction.description
        ) {
          // Basic validation passed, add to valid transactions
          validTransactions.push(transaction);
        }
      } catch {
        // Skip invalid JSON
        continue;
      }
    }

    return validTransactions;
  } catch {
    return [];
  }
}

// Helper function to estimate transaction count from input text
function estimateTransactionCount(text: string): number {
  // Simple heuristic: count common transaction indicators
  const indicators = [
    /\d+k/gi, // amounts like "25k"
    /\d+\s*triệu/gi, // amounts like "5 triệu"
    /\d+tr/gi, // amounts like "15tr"
    /tiêu|mua|ăn|uống/gi, // expense keywords
    /nhận|lương|thưởng/gi, // income keywords
    /,\s*(?=\w)/g, // commas separating transactions
  ];

  let count = 0;
  for (const indicator of indicators) {
    const matches = text.match(indicator);
    if (matches) count += matches.length;
  }

  // Return estimated count (minimum 1, maximum based on heuristics)
  return Math.max(1, Math.min(Math.ceil(count / 3), 10));
}
