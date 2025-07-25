/**
 * Response Processing Service
 * 
 * Handles parsing and processing of AI responses using proven jsonrepair library
 * with Vietnamese text extraction fallback
 */

export interface ParsedResponse {
  transactions: any[];
  analysis_summary: string;
  parsing_metadata: {
    total_transactions_found: number;
    high_confidence_count: number;
    medium_confidence_count: number;
    low_confidence_count: number;
    average_confidence: number;
    parsing_quality: string;
    validation_checks_passed: number;
    potential_issues: string[];
    fallback_risk: string;
    fallback_method?: string;
    debug_info?: {
      response_length: number;
      response_preview: string;
      original_input: string;
    };
  };
}

export interface VietnameseExtractor {
  extract(text: string): any[];
}

export class ResponseProcessingService {
  constructor(private vietnameseExtractor?: VietnameseExtractor) {}

  /**
   * Parse AI response with jsonrepair - Proven solution for LLM JSON parsing
   */
  parseWithFallbacks(responseText: string, originalInputText?: string): ParsedResponse {
    console.log("🔧 Using jsonrepair for AI response parsing...");
    console.log(`📏 AI Response length: ${responseText.length} characters`);
    console.log(`📝 AI Response preview: "${responseText.substring(0, 300)}..."`);
    console.log(`📝 Original input text: "${originalInputText}"`);
    
    // Import jsonrepair dynamically to handle ESM/CommonJS issues
    const { jsonrepair } = require('jsonrepair');
    
    // Strategy 1: Direct JSON repair with jsonrepair - let it handle everything!
    try {
      console.log("🔧 Attempting JSON repair with jsonrepair (no pre-cleaning)...");
      
      // Debug: Log original response
      console.log(`🔍 Original response (first 500 chars): "${responseText.substring(0, 500)}"`);
      
      // Check if response is empty
      if (!responseText || responseText.trim().length === 0) {
        console.warn("⚠️ Empty response, cannot use jsonrepair");
        throw new Error("Empty response");
      }
      
      // Let jsonrepair handle ALL the cleaning automatically
      const repairedJson = jsonrepair(responseText);
      console.log(`🔧 jsonrepair completed, result length: ${repairedJson.length}`);
      console.log(`🔧 Repaired JSON preview: "${repairedJson.substring(0, 300)}..."`);
      
      // Additional validation: check if repaired JSON is valid
      if (!repairedJson || repairedJson.trim().length === 0) {
        console.warn("⚠️ jsonrepair returned empty result");
        throw new Error("jsonrepair returned empty result");
      }
      
      const parsed = JSON.parse(repairedJson);
      
      if (parsed && typeof parsed === 'object' && parsed.transactions && Array.isArray(parsed.transactions)) {
        console.log(`✅ jsonrepair success! Found ${parsed.transactions.length} transactions`);
        
        // Calculate confidence and enhance metadata
        const avgConfidence = this.calculateAverageConfidence(parsed);
        
        return {
          ...parsed,
          parsing_metadata: {
            ...parsed.parsing_metadata,
            repair_method: "jsonrepair_library",
            average_confidence: avgConfidence,
            total_transactions_found: parsed.transactions.length,
            high_confidence_count: parsed.transactions.filter((t: any) => (t.confidence_score || 0.5) >= 0.8).length,
            medium_confidence_count: parsed.transactions.filter((t: any) => (t.confidence_score || 0.5) >= 0.6 && (t.confidence_score || 0.5) < 0.8).length,
            low_confidence_count: parsed.transactions.filter((t: any) => (t.confidence_score || 0.5) < 0.6).length,
            parsing_quality: avgConfidence >= 0.8 ? "excellent" : avgConfidence >= 0.6 ? "good" : "needs_review",
            validation_checks_passed: parsed.transactions.length,
            potential_issues: [],
            fallback_risk: "low"
          }
        };
      } else {
        console.warn("⚠️ jsonrepair succeeded but no valid transactions found in parsed result");
        throw new Error("No transactions in parsed result");
      }
    } catch (error) {
      console.warn("⚠️ jsonrepair failed:", error);
      console.warn("⚠️ Full error details:", {
        message: error instanceof Error ? error.message : String(error),
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 200)
      });
    }

    // Strategy 2: Vietnamese fallback extraction (for non-JSON responses)
    try {
      console.log("🇻🇳 Attempting Vietnamese extraction as fallback...");
      
      const textToExtract = originalInputText || responseText;
      const vietnameseTransactions = this.vietnameseExtractor?.extract(textToExtract) || 
                                    this.extractVietnameseTransactions(textToExtract);
      
      if (vietnameseTransactions.length > 0) {
        console.log(`✅ Vietnamese extraction successful - ${vietnameseTransactions.length} transactions`);
        
        return {
          transactions: vietnameseTransactions.map(t => ({
            ...t,
            confidence_score: t.confidence_score || 0.4,
            notes: t.notes ? `${t.notes} (Extracted via fallback)` : 'Extracted via Vietnamese fallback system',
            validation_passed: false
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
            fallback_method: "vietnamese_extraction",
            repair_method: "vietnamese_rules"
          }
        };
      }
    } catch (error) {
      console.warn("🔄 Vietnamese extraction failed:", error);
    }

    // Strategy 3: Return structured error (should rarely happen with jsonrepair)
    console.error("❌ All parsing strategies failed, returning error structure");
    
    return {
      transactions: [],
      analysis_summary: "Failed to parse AI response. Both jsonrepair and Vietnamese extraction failed.",
      parsing_metadata: {
        total_transactions_found: 0,
        high_confidence_count: 0,
        medium_confidence_count: 0,
        low_confidence_count: 0,
        average_confidence: 0,
        parsing_quality: "failed",
        validation_checks_passed: 0,
        potential_issues: [
          "jsonrepair failed",
          "Vietnamese fallback failed"
        ],
        fallback_risk: "critical",
        repair_method: "failed",
        debug_info: {
          response_length: responseText.length,
          response_preview: responseText.substring(0, 200),
          original_input: originalInputText?.substring(0, 100) || "not_provided"
        }
      }
    };
  }

  /**
   * Built-in Vietnamese transaction extractor (fallback when no external extractor provided)
   */
  private extractVietnameseTransactions(text: string): any[] {
    try {
      console.log(`🇻🇳 Starting Vietnamese extraction on: "${text}"`);
      const transactions: any[] = [];
      
      // Strategy 1: Parse comma-separated Vietnamese transaction descriptions
      const cleanedText = text.trim().replace(/,\s*$/, '');
      const segments = cleanedText.split(',').map(s => s.trim()).filter(s => s.length > 0);
      console.log(`🇻🇳 Split into ${segments.length} segments:`, segments);
      
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
      
      console.log(`🇻🇳 Vietnamese extraction completed: ${transactions.length} transactions found`);
      return transactions;
    } catch (error) {
      console.error('Error extracting Vietnamese transactions:', error);
      return [];
    }
  }

  /**
   * Calculate average confidence from parsed response
   */
  private calculateAverageConfidence(parsed: any): number {
    if (parsed.parsing_metadata?.average_confidence) {
      return parsed.parsing_metadata.average_confidence;
    }
    
    if (!parsed.transactions || parsed.transactions.length === 0) {
      return 0;
    }
    
    const total = parsed.transactions.reduce((sum: number, t: any) => sum + (t.confidence_score || 0.5), 0);
    return total / parsed.transactions.length;
  }
}