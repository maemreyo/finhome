/**
 * Response Processing Service
 * 
 * Handles AI response parsing, fallback strategies, and response enhancement
 * Implements a robust chain of fallback mechanisms to ensure reliable parsing
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
   * Built-in Vietnamese transaction extractor (fallback when no external extractor provided)
   */
  private extractVietnameseTransactions(text: string): any[] {
    try {
      console.log(`🇻🇳 Starting Vietnamese extraction on: "${text}"`);
      const transactions: any[] = [];
      
      // Strategy 1: Parse comma-separated Vietnamese transaction descriptions
      // Clean the text first to remove trailing commas and extra whitespace
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
      if (transactions.length > 0) {
        console.log(`🇻🇳 Extracted transactions:`, transactions.map(t => `${t.description} - ${t.amount} VND (${t.transaction_type})`));
      }
      
      return transactions;
    } catch (error) {
      console.error('Error extracting Vietnamese transactions:', error);
      return [];
    }
  }

  /**
   * Parse AI response with comprehensive fallback strategies
   */
  parseWithFallbacks(responseText: string, originalInputText?: string): ParsedResponse {
    console.log("🔄 Starting enhanced AI response parsing with hybrid fallback approach...");
    console.log(`📏 AI Response length: ${responseText.length} characters`);
    console.log(`📝 AI Response preview: "${responseText.substring(0, 300)}..."`);
    console.log(`📝 Original input text: "${originalInputText}"`);
    
    // Strategy 1: Direct JSON parsing with confidence assessment
    try {
      const parsed = JSON.parse(responseText);
      
      if (parsed && typeof parsed === 'object' && parsed.transactions) {
        console.log("✅ Direct JSON parsing successful");
        
        const avgConfidence = this.calculateAverageConfidence(parsed);
        
        // If confidence is high enough, trust the AI completely
        if (avgConfidence >= 0.75) {
          console.log(`🎯 High confidence AI response (${(avgConfidence * 100).toFixed(1)}%) - using directly`);
          return parsed;
        }
        
        console.log(`⚠️ Medium confidence AI response (${(avgConfidence * 100).toFixed(1)}%) - will validate and enhance`);
        return this.enhanceResponse(parsed, originalInputText);
      }
    } catch (error) {
      console.warn("🔄 Direct JSON parsing failed, trying repair strategies...");
    }

    // Strategy 2: Intelligent JSON repair
    try {
      const repairedJson = this.repairMalformedJson(responseText);
      if (repairedJson) {
        console.log("🔧 JSON repair successful");
        return this.enhanceResponse(repairedJson, originalInputText);
      }
    } catch (error) {
      console.warn("🔄 JSON repair failed, trying extraction...");
    }

    // Strategy 3: Smart JSON extraction from partial response
    try {
      const extractedJson = this.extractJsonFromPartialResponse(responseText);
      if (extractedJson) {
        console.log("📤 JSON extraction successful");
        return this.enhanceResponse(extractedJson, originalInputText);
      }
    } catch (error) {
      console.warn("🔄 JSON extraction failed, trying partial reconstruction...");
    }

    // Strategy 4: Hybrid reconstruction
    try {
      const hybridResult = this.performHybridReconstruction(responseText, originalInputText);
      if (hybridResult && hybridResult.transactions.length > 0) {
        console.log(`🔀 Hybrid reconstruction successful - ${hybridResult.transactions.length} transactions`);
        return hybridResult;
      }
    } catch (error) {
      console.warn("🔄 Hybrid reconstruction failed, falling back to Vietnamese extraction...");
    }

    // Strategy 5: Vietnamese fallback extraction
    try {
      console.log("🇻🇳 Attempting enhanced Vietnamese extraction as final fallback");
      
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
            fallback_method: "vietnamese_extraction"
          }
        };
      }
    } catch (error) {
      console.warn("🔄 Vietnamese extraction failed:", error);
    }

    // Strategy 6: Return structured error
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

  /**
   * Enhance AI response with validation and confidence assessment
   */
  private enhanceResponse(aiResponse: any, originalInputText?: string): ParsedResponse {
    console.log("🔍 Enhancing AI response with hybrid validation...");
    
    if (!aiResponse.transactions || !Array.isArray(aiResponse.transactions)) {
      return aiResponse;
    }

    const enhancedTransactions = aiResponse.transactions.map((transaction: any) => {
      const enhanced = { ...transaction };
      
      // Validate and enhance confidence scores
      if (!enhanced.confidence_score || enhanced.confidence_score < 0.5) {
        enhanced.confidence_score = this.assessTransactionConfidence(enhanced, originalInputText);
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

  /**
   * Repair malformed JSON from AI responses
   */
  private repairMalformedJson(jsonText: string): any | null {
    try {
      let fixedResponse = jsonText.trim();
      
      // Remove markdown wrapper
      if (fixedResponse.includes('```json')) {
        fixedResponse = fixedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      // Find JSON start
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
      
      // Remove trailing commas
      fixedResponse = fixedResponse.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix incomplete string values
      fixedResponse = fixedResponse.replace(/"[^"]*$/g, '""');
      
      return JSON.parse(fixedResponse);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract JSON from partial responses
   */
  private extractJsonFromPartialResponse(responseText: string): any | null {
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

  /**
   * Perform hybrid reconstruction combining AI and rule-based data
   */
  private performHybridReconstruction(aiResponse: string, originalInputText?: string): ParsedResponse | null {
    if (!originalInputText) return null;
    
    try {
      console.log("🔀 Performing hybrid reconstruction...");
      
      // Extract what we can from AI response
      const aiTransactions = this.extractPartialTransactionData(aiResponse);
      
      // Extract transactions using rule-based system
      const ruleBasedTransactions = this.vietnameseExtractor?.extract(originalInputText) || 
                                   this.extractVietnameseTransactions(originalInputText);
      
      // Merge and enhance results
      const hybridTransactions = this.mergeTransactionResults(aiTransactions, ruleBasedTransactions);
      
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
            fallback_risk: "medium",
            high_confidence_count: 0,
            medium_confidence_count: hybridTransactions.length,
            low_confidence_count: 0,
            average_confidence: 0.6,
            validation_checks_passed: 0,
            potential_issues: ["Hybrid reconstruction used"]
          }
        };
      }
      
      return null;
    } catch (error) {
      console.warn("Hybrid reconstruction failed:", error);
      return null;
    }
  }

  /**
   * Calculate average confidence from parsed response
   */
  private calculateAverageConfidence(parsed: any): number {
    return parsed.parsing_metadata?.average_confidence || 
      (parsed.transactions.reduce((sum: number, t: any) => sum + (t.confidence_score || 0.5), 0) / parsed.transactions.length);
  }

  /**
   * Assess transaction confidence using rules
   */
  private assessTransactionConfidence(transaction: any, originalInputText?: string): number {
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

  /**
   * Extract partial transaction data from malformed responses
   */
  private extractPartialTransactionData(responseText: string): any[] {
    const transactions = [];
    
    try {
      const typeMatches = responseText.match(/"transaction_type"\s*:\s*"(expense|income|transfer)"/g);
      const amountMatches = responseText.match(/"amount"\s*:\s*(\d+(?:\.\d+)?)/g);
      const descriptionMatches = responseText.match(/"description"\s*:\s*"([^\"]+)"/g);
      
      if (typeMatches && amountMatches && descriptionMatches) {
        const count = Math.min(typeMatches.length, amountMatches.length, descriptionMatches.length);
        
        for (let i = 0; i < count; i++) {
          const type = typeMatches[i].match(/"(expense|income|transfer)"/)?.[1] || 'expense';
          const amount = parseFloat(amountMatches[i].match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
          const description = descriptionMatches[i].match(/"([^\"]+)"/)?.[1] || 'Unknown transaction';
          
          transactions.push({
            transaction_type: type,
            amount: amount,
            description: description,
            confidence_score: 0.4,
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

  /**
   * Merge AI and rule-based transaction results
   */
  private mergeTransactionResults(aiTransactions: any[], ruleBasedTransactions: any[]): any[] {
    if (aiTransactions.length === 0) return ruleBasedTransactions;
    if (ruleBasedTransactions.length === 0) return aiTransactions;
    
    // If AI has more complete data, prefer AI results
    const aiCompleteness = this.calculateTransactionCompleteness(aiTransactions);
    const ruleBasedCompleteness = this.calculateTransactionCompleteness(ruleBasedTransactions);
    
    if (aiCompleteness >= ruleBasedCompleteness) {
      return aiTransactions.map(t => ({ ...t, confidence_score: Math.min((t.confidence_score || 0.5) + 0.1, 1.0) }));
    } else {
      return ruleBasedTransactions.map(t => ({ ...t, confidence_score: Math.min((t.confidence_score || 0.4) + 0.05, 1.0) }));
    }
  }

  /**
   * Calculate completeness score for transactions
   */
  private calculateTransactionCompleteness(transactions: any[]): number {
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
}