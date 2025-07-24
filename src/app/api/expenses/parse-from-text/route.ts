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
  suggested_category_id: z.string().nullable().optional(),
  suggested_category_name: z.string().nullable().optional(),
  suggested_tags: z.array(z.string()).default([]),
  suggested_wallet_id: z.string().nullable().optional(),
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
function parseAIResponseWithFallback(responseText: string, originalInputText?: string): any {
  console.log("🔄 Starting enhanced AI response parsing with hybrid fallback approach...");
  
  // Strategy 1: Direct JSON parsing with confidence assessment
  try {
    const parsed = JSON.parse(responseText);
    
    // Validate that we have a valid structure
    if (parsed && typeof parsed === 'object' && parsed.transactions) {
      console.log("✅ Direct JSON parsing successful");
      
      // Check if AI provided confidence metadata
      const avgConfidence = parsed.parsing_metadata?.average_confidence || 
        (parsed.transactions.reduce((sum: number, t: any) => sum + (t.confidence_score || 0.5), 0) / parsed.transactions.length);
      
      // If confidence is high enough, trust the AI completely
      if (avgConfidence >= 0.75) {
        console.log(`🎯 High confidence AI response (${(avgConfidence * 100).toFixed(1)}%) - using directly`);
        return parsed;
      }
      
      console.log(`⚠️ Medium confidence AI response (${(avgConfidence * 100).toFixed(1)}%) - will validate and enhance`);
      return enhanceAIResponse(parsed, originalInputText);
    }
  } catch (error) {
    console.warn("🔄 Direct JSON parsing failed, trying repair strategies...");
  }

  // Strategy 2: Intelligent JSON repair
  try {
    const repairedJson = repairMalformedJson(responseText);
    if (repairedJson) {
      console.log("🔧 JSON repair successful");
      return enhanceAIResponse(repairedJson, originalInputText);
    }
  } catch (error) {
    console.warn("🔄 JSON repair failed, trying extraction...");
  }

  // Strategy 3: Smart JSON extraction from partial response
  try {
    const extractedJson = extractJsonFromPartialResponse(responseText);
    if (extractedJson) {
      console.log("📤 JSON extraction successful");
      return enhanceAIResponse(extractedJson, originalInputText);
    }
  } catch (error) {
    console.warn("🔄 JSON extraction failed, trying partial reconstruction...");
  }

  // Strategy 4: Hybrid reconstruction - combine AI partial data with rule-based extraction
  try {
    const hybridResult = performHybridReconstruction(responseText, originalInputText);
    if (hybridResult && hybridResult.transactions.length > 0) {
      console.log(`🔀 Hybrid reconstruction successful - ${hybridResult.transactions.length} transactions`);
      return hybridResult;
    }
  } catch (error) {
    console.warn("🔄 Hybrid reconstruction failed, falling back to Vietnamese extraction...");
  }

  // Strategy 5: Enhanced Vietnamese fallback with confidence tracking
  try {
    console.log("🇻🇳 Attempting enhanced Vietnamese extraction as final fallback");
    
    const textToExtract = originalInputText || responseText;
    const vietnameseTransactions = extractVietnameseTransactions(textToExtract);
    
    if (vietnameseTransactions.length > 0) {
      console.log(`✅ Vietnamese extraction successful - ${vietnameseTransactions.length} transactions`);
      
      // Enhance Vietnamese results with metadata
      return {
        transactions: vietnameseTransactions.map(t => ({
          ...t,
          confidence_score: t.confidence_score || 0.4, // Lower confidence for fallback
          notes: t.notes ? `${t.notes} (Extracted via fallback)` : 'Extracted via Vietnamese fallback system',
          validation_passed: false // Mark as needing validation
        })),
        analysis_summary: `Extracted ${vietnameseTransactions.length} transaction(s) using Vietnamese rule-based fallback system.`,
        parsing_metadata: {
          total_transactions_found: vietnameseTransactions.length,
          high_confidence_count: 0,
          medium_confidence_count: vietnameseTransactions.length,
          low_confidence_count: 0,
          average_confidence: 0.4,
          parsing_quality: "needs_review",
          validation_checks_passed: 0,
          potential_issues: ["AI parsing failed", "Using rule-based fallback"],
          fallback_risk: "high",
          fallback_method: "vietnamese_extraction"
        }
      };
    }
  } catch (error) {
    console.warn("🔄 Vietnamese extraction failed:", error);
  }

  // Strategy 6: Return structured error with debugging info
  console.error("❌ All parsing strategies failed, returning error structure");
  
  return {
    transactions: [],
    analysis_summary: "Failed to parse AI response. Multiple parsing strategies attempted but none succeeded.",
    parsing_metadata: {
      total_transactions_found: 0,
      high_confidence_count: 0,
      medium_confidence_count: 0,
      low_confidence_count: 0,
      average_confidence: 0,
      parsing_quality: "failed",
      validation_checks_passed: 0,
      potential_issues: [
        "Direct JSON parsing failed",
        "JSON repair failed", 
        "JSON extraction failed",
        "Hybrid reconstruction failed",
        "Vietnamese fallback failed"
      ],
      fallback_risk: "critical",
      debug_info: {
        response_length: responseText.length,
        response_preview: responseText.substring(0, 200),
        original_input: originalInputText?.substring(0, 100) || "not_provided"
      }
    }
  };
}

// Enhanced AI response validation and improvement
function enhanceAIResponse(aiResponse: any, originalInputText?: string): any {
  console.log("🔍 Enhancing AI response with hybrid validation...");
  
  if (!aiResponse.transactions || !Array.isArray(aiResponse.transactions)) {
    return aiResponse;
  }

  const enhancedTransactions = aiResponse.transactions.map((transaction: any, index: number) => {
    const enhanced = { ...transaction };
    
    // Validate and enhance confidence scores
    if (!enhanced.confidence_score || enhanced.confidence_score < 0.5) {
      // Use rule-based confidence assessment
      enhanced.confidence_score = assessTransactionConfidence(enhanced, originalInputText);
      enhanced.confidence_reasoning = "Enhanced by hybrid validation system";
    }
    
    // Flag for human review if confidence is low
    if (enhanced.confidence_score < 0.6) {
      enhanced.validation_passed = false;
      enhanced.notes = enhanced.notes ? 
        `${enhanced.notes} (Low confidence - review recommended)` : 
        'Low confidence - human review recommended';
    } else {
      enhanced.validation_passed = true;
    }
    
    return enhanced;
  });

  // Update metadata
  const confidenceScores = enhancedTransactions.map((t: any) => t.confidence_score);
  const avgConfidence = confidenceScores.reduce((sum: number, score: number) => sum + score, 0) / confidenceScores.length;
  
  return {
    ...aiResponse,
    transactions: enhancedTransactions,
    parsing_metadata: {
      ...aiResponse.parsing_metadata,
      average_confidence: avgConfidence,
      high_confidence_count: confidenceScores.filter(s => s >= 0.8).length,
      medium_confidence_count: confidenceScores.filter(s => s >= 0.6 && s < 0.8).length,
      low_confidence_count: confidenceScores.filter(s => s < 0.6).length,
      parsing_quality: avgConfidence >= 0.8 ? "excellent" : avgConfidence >= 0.6 ? "good" : "needs_review",
      fallback_risk: avgConfidence >= 0.8 ? "low" : avgConfidence >= 0.6 ? "medium" : "high",
      enhancement_applied: true
    }
  };
}

// Intelligent JSON repair
function repairMalformedJson(jsonText: string): any | null {
  try {
    let fixedResponse = jsonText.trim();
    
    // Fix common streaming issues
    if (!fixedResponse.startsWith('{')) {
      const jsonStart = fixedResponse.indexOf('{');
      if (jsonStart !== -1) {
        fixedResponse = fixedResponse.substring(jsonStart);
      }
    }
    
    // Fix missing closing braces/brackets
    const openBraces = (fixedResponse.match(/\{/g) || []).length;
    const closeBraces = (fixedResponse.match(/\}/g) || []).length;
    const openBrackets = (fixedResponse.match(/\[/g) || []).length;
    const closeBrackets = (fixedResponse.match(/\]/g) || []).length;
    
    // Add missing closing brackets first
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixedResponse += ']';
    }
    
    // Add missing closing braces
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixedResponse += '}';
    }
    
    // Remove trailing commas before closing brackets/braces
    fixedResponse = fixedResponse.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix incomplete string values
    fixedResponse = fixedResponse.replace(/"[^"]*$/g, '""');
    
    return JSON.parse(fixedResponse);
  } catch (error) {
    return null;
  }
}

// Smart JSON extraction from partial responses
function extractJsonFromPartialResponse(responseText: string): any | null {
  try {
    // Look for complete transaction structures
    const transactionPattern = /"transactions"\s*:\s*\[([^\]]+)\]/;
    const match = responseText.match(transactionPattern);
    
    if (match) {
      const transactionsText = match[1];
      const transactions = [];
      
      // Extract individual transaction objects
      const transactionMatches = transactionsText.match(/\{[^}]+\}/g);
      if (transactionMatches) {
        for (const transMatch of transactionMatches) {
          try {
            const transaction = JSON.parse(transMatch);
            transactions.push(transaction);
          } catch (e) {
            // Skip malformed transactions
          }
        }
      }
      
      return {
        transactions,
        analysis_summary: `Extracted ${transactions.length} transactions from partial AI response`,
        parsing_metadata: {
          extraction_method: "partial_json_extraction",
          partial_response_length: responseText.length
        }
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Hybrid reconstruction combining AI partial data with rule-based extraction
function performHybridReconstruction(aiResponse: string, originalInputText?: string): any | null {
  if (!originalInputText) return null;
  
  try {
    console.log("🔀 Performing hybrid reconstruction...");
    
    // Extract what we can from AI response
    const aiTransactions = extractPartialTransactionData(aiResponse);
    
    // Extract transactions using rule-based system
    const ruleBasedTransactions = extractVietnameseTransactions(originalInputText);
    
    // Merge and enhance results
    const hybridTransactions = mergeTransactionResults(aiTransactions, ruleBasedTransactions);
    
    if (hybridTransactions.length > 0) {
      return {
        transactions: hybridTransactions,
        analysis_summary: `Hybrid analysis found ${hybridTransactions.length} transactions combining AI and rule-based extraction`,
        parsing_metadata: {
          total_transactions_found: hybridTransactions.length,
          ai_extracted: aiTransactions.length,
          rule_based_extracted: ruleBasedTransactions.length,
          hybrid_merged: hybridTransactions.length,
          parsing_quality: "hybrid_reconstruction",
          fallback_risk: "medium"
        }
      };
    }
    
    return null;
  } catch (error) {
    console.warn("Hybrid reconstruction failed:", error);
    return null;
  }
}

// Assess transaction confidence using rules
function assessTransactionConfidence(transaction: any, originalInputText?: string): number {
  let confidence = 0.5; // Base confidence
  
  // Amount confidence
  if (transaction.amount && transaction.amount > 0) {
    confidence += 0.2;
  }
  
  // Description confidence
  if (transaction.description && transaction.description.length > 5) {
    confidence += 0.1;
  }
  
  // Category confidence
  if (transaction.suggested_category_id && transaction.suggested_category_name) {
    confidence += 0.15;
  }
  
  // Transaction type confidence
  if (transaction.transaction_type && ['expense', 'income', 'transfer'].includes(transaction.transaction_type)) {
    confidence += 0.05;
  }
  
  return Math.min(confidence, 1.0);
}

// Extract partial transaction data from malformed AI responses
function extractPartialTransactionData(responseText: string): any[] {
  const transactions = [];
  
  try {
    // Look for transaction_type patterns
    const typeMatches = responseText.match(/"transaction_type"\s*:\s*"(expense|income|transfer)"/g);
    const amountMatches = responseText.match(/"amount"\s*:\s*(\d+(?:\.\d+)?)/g);
    const descriptionMatches = responseText.match(/"description"\s*:\s*"([^"]+)"/g);
    
    if (typeMatches && amountMatches && descriptionMatches) {
      const count = Math.min(typeMatches.length, amountMatches.length, descriptionMatches.length);
      
      for (let i = 0; i < count; i++) {
        const type = typeMatches[i].match(/"(expense|income|transfer)"/)?.[1] || 'expense';
        const amount = parseFloat(amountMatches[i].match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
        const description = descriptionMatches[i].match(/"([^"]+)"/)?.[1] || 'Unknown transaction';
        
        transactions.push({
          transaction_type: type,
          amount: amount,
          description: description,
          confidence_score: 0.4, // Medium-low confidence for partial extraction
          suggested_category_id: null,
          suggested_category_name: null,
          suggested_tags: [],
          suggested_wallet_id: null,
          extracted_merchant: null,
          extracted_date: null,
          notes: 'Reconstructed from partial AI response'
        });
      }
    }
  } catch (error) {
    console.warn("Partial transaction extraction failed:", error);
  }
  
  return transactions;
}

// Merge AI and rule-based transaction results intelligently
function mergeTransactionResults(aiTransactions: any[], ruleBasedTransactions: any[]): any[] {
  if (aiTransactions.length === 0) return ruleBasedTransactions;
  if (ruleBasedTransactions.length === 0) return aiTransactions;
  
  // If AI has more complete data, prefer AI results
  const aiCompleteness = calculateTransactionCompleteness(aiTransactions);
  const ruleBasedCompleteness = calculateTransactionCompleteness(ruleBasedTransactions);
  
  if (aiCompleteness >= ruleBasedCompleteness) {
    return aiTransactions.map(t => ({ ...t, confidence_score: Math.min((t.confidence_score || 0.5) + 0.1, 1.0) }));
  } else {
    return ruleBasedTransactions.map(t => ({ ...t, confidence_score: Math.min((t.confidence_score || 0.4) + 0.05, 1.0) }));
  }
}

// Calculate how complete transaction data is
function calculateTransactionCompleteness(transactions: any[]): number {
  if (transactions.length === 0) return 0;
  
  const completenessScores = transactions.map(t => {
    let score = 0;
    if (t.amount > 0) score += 0.3;
    if (t.description) score += 0.2;
    if (t.transaction_type) score += 0.2;
    if (t.suggested_category_id) score += 0.2;
    if (t.suggested_category_name) score += 0.1;
    return score;
  });
  
  return completenessScores.reduce((sum, score) => sum + score, 0) / completenessScores.length;
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
    version: "3.6",
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
    console.log("Generated AI prompt:", prompt);
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
        const cleanedResponse = aiResponseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        // Try to parse JSON with multiple fallback strategies
        aiParsedData = parseAIResponseWithFallback(cleanedResponse, validatedData.text);

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
        const streamedTransactions: any[] = []; // Collect successfully streamed transactions

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
              // Store the successfully parsed transaction
              streamedTransactions.push(transaction);
              
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
                  })}

`
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
          let finalTransactions = [];
          let analysisMessage = "";
          
          // Priority 1: Use successfully streamed transactions if we have them
          if (streamedTransactions.length > 0) {
            console.log(`✅ Using ${streamedTransactions.length} successfully streamed transactions`);
            finalTransactions = streamedTransactions;
            analysisMessage = `Successfully processed ${streamedTransactions.length} transaction(s) via streaming.`;
          } else {
            // Priority 2: Fall back to parsing accumulated text
            console.log("🔄 No streamed transactions, attempting to parse accumulated text");
            const cleanedResponse = accumulatedText
              .replace(/```json\n?/g, "")
              .replace(/```\n?/g, "")
              .trim();

            const aiParsedData = parseAIResponseWithFallback(cleanedResponse, validatedData.text);
            const validatedAIResponse = aiResponseSchema.parse(aiParsedData);
            finalTransactions = validatedAIResponse.transactions || [];
            analysisMessage = validatedAIResponse.analysis_summary || "AI parsing completed.";
          }

          // Priority 3: Check if we have fewer transactions than expected and use Vietnamese fallback
          const expectedCount = estimateTransactionCount(validatedData.text);
          if (finalTransactions.length > 0 && finalTransactions.length < expectedCount) {
            console.log(`⚠️  Found ${finalTransactions.length} transactions but expected ${expectedCount}, trying Vietnamese fallback`);
            
            try {
              const vietnameseTransactions = extractVietnameseTransactions(validatedData.text);
              
              if (vietnameseTransactions.length > finalTransactions.length) {
                console.log(`✅ Vietnamese fallback found ${vietnameseTransactions.length} transactions, using fallback`);
                
                // Process Vietnamese transactions with proper formatting
                const processedVietnameseTransactions = vietnameseTransactions.map((transaction, index) => {
                  // Find matching category
                  const matchedCategory = allCategories.find(cat => 
                    cat.name_vi.toLowerCase().includes(transaction.suggested_category_name?.toLowerCase() || '') ||
                    cat.name_en.toLowerCase().includes(transaction.suggested_category_name?.toLowerCase() || '')
                  );
                  
                  return {
                    ...transaction,
                    suggested_category_id: matchedCategory?.id || null,
                    suggested_category_name: matchedCategory?.name_vi || transaction.suggested_category_name,
                    suggested_wallet_id: wallets[0]?.id || null,
                    parsing_context: {
                      original_text: validatedData.text,
                      processing_timestamp: new Date().toISOString(),
                      user_id: user.id,
                    },
                  };
                });
                
                finalTransactions = processedVietnameseTransactions;
                analysisMessage = `Extracted ${vietnameseTransactions.length} transaction(s) using Vietnamese fallback after streaming detected only ${streamedTransactions.length}.`;
              }
            } catch (vietnameseError) {
              console.warn("Vietnamese fallback failed:", vietnameseError);
            }
          }

          // Handle case where no transactions are found (valid for non-transaction text)
          if (!finalTransactions || finalTransactions.length === 0) {
            console.log("✅ No transactions detected in streaming - this is valid for non-transaction text");
            
            // Send final result with empty transactions
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: "final",
                  data: {
                    transactions: [],
                    analysis_summary: "No financial transactions detected in the provided text.",
                    metadata: {
                      total_transactions: 0,
                      unusual_count: 0,
                      processing_time: new Date().toISOString(),
                      ai_model: "gemini-2.5-flash",
                      streaming: true,
                      parsing_metadata: null
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
          const processedTransactions = finalTransactions.map(
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
                  analysis_summary: analysisMessage,
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
  // Strategy 1: Count monetary amounts (most reliable indicator)
  const amountPatterns = [
    /\d+k\b/gi,           // amounts like "25k", "30k"
    /\d+\s*triệu\b/gi,    // amounts like "5 triệu"
    /\d+tr\b/gi,          // amounts like "15tr"
    /\d+\s*đồng\b/gi,     // amounts like "1000 đồng"
    /\d+\s*vnd\b/gi,      // amounts like "50000 VND"
  ];
  
  let amountCount = 0;
  for (const pattern of amountPatterns) {
    const matches = text.match(pattern);
    if (matches) amountCount += matches.length;
  }
  
  // Strategy 2: Count comma separators (reliable for list format)
  // Count all commas, but exclude trailing commas that don't separate transactions
  const allCommas = text.match(/,/g) || [];
  let separatorCount = allCommas.length;
  
  // If text ends with comma and optional whitespace, subtract 1 as it's not a separator
  if (/,\s*$/.test(text.trim())) {
    separatorCount = Math.max(0, separatorCount - 1);
  }
  
  // Strategy 3: Count transaction keywords
  const expenseKeywords = /tiêu|mua|ăn|uống|đi|taxi|grab|xem|chơi/gi;
  const incomeKeywords = /nhận|lương|thưởng|bán|thu/gi;
  
  const expenseMatches = text.match(expenseKeywords) || [];
  const incomeMatches = text.match(incomeKeywords) || [];
  const keywordCount = expenseMatches.length + incomeMatches.length;
  
  // Use the most reliable indicator
  let estimate = amountCount; // Start with amount count as it's most reliable
  
  // If we have comma separators, there are likely separatorCount + 1 transactions
  if (separatorCount > 0) {
    const commaBasedEstimate = separatorCount + 1;
    // Use the higher of amount count or comma-based estimate
    estimate = Math.max(estimate, commaBasedEstimate);
  }
  
  // Sanity check with keyword count
  if (keywordCount > estimate) {
    estimate = Math.min(estimate + 1, keywordCount);
  }
  
  // Return estimated count (minimum 1, maximum 10)
  return Math.max(1, Math.min(estimate, 10));
}

// Helper function to extract transactions directly from Vietnamese text as fallback
function extractVietnameseTransactions(text: string): any[] {
  try {
    const transactions: any[] = [];
    
    // Strategy 1: Parse comma-separated Vietnamese transaction descriptions
    // Clean the text first to remove trailing commas and extra whitespace
    const cleanedText = text.trim().replace(/,\s*$/, '');
    const segments = cleanedText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const segment of segments) {
      // Look for amount patterns in Vietnamese
      const amountMatch = segment.match(/(\d+(?:\.\d+)?)\s*(k|triệu|tr|đồng|vnd|000)?/i);
      
      if (amountMatch) {
        let amount = parseFloat(amountMatch[1]);
        const unit = amountMatch[2]?.toLowerCase();
        
        // Convert to VND
        if (unit === 'k') {
          amount *= 1000;
        } else if (unit === 'triệu') {
          amount *= 1000000;
        } else if (unit === 'tr') {
          amount *= 1000000;
        }
        
        // Extract description (everything before the amount)
        const description = segment.replace(/\d+(?:\.\d+)?\s*(k|triệu|tr|đồng|vnd|000)?\s*$/i, '').trim();
        
        if (description && amount > 0) {
          // Determine category based on Vietnamese keywords
          let suggestedCategory = 'Khác'; // Default to "Other"
          
          if (/ăn|uống|trà|cà phê|phở|cơm|bún|quán|nhà hàng|food|drink/i.test(description)) {
            suggestedCategory = 'Ăn uống';
          } else if (/xe|grab|taxi|xăng|gas|uber|bus|metro/i.test(description)) {
            suggestedCategory = 'Di chuyển';
          } else if (/mua|shopping|shopee|lazada|mall|siêu thị/i.test(description)) {
            suggestedCategory = 'Mua sắm';
          } else if (/phim|game|net|nhậu|karaoke|bar|club|giải trí/i.test(description)) {
            suggestedCategory = 'Giải trí';
          }
          
          let transactionType: 'expense' | 'income' | 'transfer' = 'expense'; // Default to expense

          // Determine transaction type based on keywords
          if (/nhận|lương|thưởng|bán|thu/i.test(description)) {
            transactionType = 'income';
          } else if (/chuyển|gửi/i.test(description)) {
            transactionType = 'transfer';
          }

          transactions.push({
            transaction_type: transactionType,
            amount: amount,
            description: description,
            confidence_score: 0.6, // Medium confidence for direct extraction
            suggested_category_id: null,
            suggested_category_name: suggestedCategory,
            suggested_tags: [],
            suggested_wallet_id: null,
            extracted_merchant: null,
            extracted_date: null,
            notes: 'Extracted directly from Vietnamese text',
            is_unusual: false,
            unusual_reasons: []
          });
        }
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error extracting Vietnamese transactions:', error);
    return [];
  }
}
