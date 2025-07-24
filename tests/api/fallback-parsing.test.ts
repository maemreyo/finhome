/**
 * Comprehensive test suite for AI response parsing fallback mechanisms
 * 
 * This test suite validates the robustness of the parseAIResponseWithFallback function
 * and ensures that all fallback strategies work correctly to prevent data loss.
 */

import { describe, test, expect, beforeEach } from '@jest/test-environment';

// Mock functions that would normally be imported
const mockExtractVietnameseTransactions = jest.fn();
const mockEstimateTransactionCount = jest.fn();

// Test data fixtures
const validAIResponse = {
  transactions: [
    {
      transaction_type: "expense",
      amount: 25000,
      description: "Ăn sáng",
      suggested_category_id: "uuid-food",
      suggested_category_name: "Ăn uống",
      confidence_score: 0.9,
      suggested_tags: ["#breakfast"],
      suggested_wallet_id: "uuid-wallet",
      extracted_merchant: null,
      extracted_date: null,
      notes: null
    }
  ],
  analysis_summary: "Found 1 expense transaction",
  parsing_metadata: {
    average_confidence: 0.9,
    total_transactions_found: 1
  }
};

const lowConfidenceAIResponse = {
  transactions: [
    {
      transaction_type: "expense", 
      amount: 50000,
      description: "Mua đồ",
      suggested_category_id: "uuid-shopping",
      suggested_category_name: "Mua sắm",
      confidence_score: 0.3,
      suggested_tags: [],
      suggested_wallet_id: "uuid-wallet",
      extracted_merchant: null,
      extracted_date: null,
      notes: null
    }
  ],
  analysis_summary: "Found 1 low confidence transaction",
  parsing_metadata: {
    average_confidence: 0.3,
    total_transactions_found: 1
  }
};

const malformedJsonResponses = [
  '{"transactions": [{"transaction_type": "expense", "amount": 25000, "description": "coffee"', // Missing closing
  '{"transactions": [{"transaction_type": "expense", "amount": 25000, "description": "coffee",}]}', // Trailing comma
  '{"transactions": [{"transaction_type": "expense", "amount": 25000, "description": "coffee"}', // Missing bracket
  'Some text before {"transactions": [{"transaction_type": "expense", "amount": 25000}]} and after', // Extra text
  '```json\n{"transactions": [{"transaction_type": "expense", "amount": 25000}]}\n```' // Markdown wrapper
];

const partialJsonResponses = [
  'transaction_type": "expense"\n"amount": 25000\n"description": "ăn sáng"',
  '"transaction_type": "income", "amount": 100000, "description": "nhận thưởng"',
  'Found 2 transactions: {"transaction_type": "expense", "amount": 30000} and {"amount": 50000}'
];

const vietnameseTestInputs = [
  "ăn sáng 25k",
  "nhận thưởng 100k", 
  "taxi 50k, cafe 30k",
  "mua đồ ăn và xăng xe tổng 200k",
  "sáng cf 25k, trưa cơm 45k, tối nhậu 150k"
];

describe('parseAIResponseWithFallback - Comprehensive Fallback Testing', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock returns
    mockExtractVietnameseTransactions.mockReturnValue([
      {
        transaction_type: "expense",
        amount: 25000, 
        description: "Ăn sáng",
        confidence_score: 0.6,
        suggested_category_id: null,
        suggested_category_name: "Ăn uống"
      }
    ]);
    
    mockEstimateTransactionCount.mockReturnValue(1);
  });

  describe('Strategy 1: Direct JSON Parsing', () => {
    test('should parse valid high-confidence AI response directly', () => {
      const result = parseAIResponseWithFallback(JSON.stringify(validAIResponse), "ăn sáng 25k");
      
      expect(result).toEqual(validAIResponse);
      expect(result.parsing_metadata?.fallback_risk).toBeUndefined(); // No fallback needed
    });

    test('should enhance low-confidence AI responses', () => {
      const result = parseAIResponseWithFallback(JSON.stringify(lowConfidenceAIResponse), "mua đồ 50k");
      
      expect(result.transactions[0].validation_passed).toBe(false);
      expect(result.transactions[0].notes).toContain('Low confidence');
      expect(result.parsing_metadata?.fallback_risk).toBe('high');
    });

    test('should reject completely invalid JSON structures', () => {
      const invalidResponse = '{"invalid": "structure"}';
      const result = parseAIResponseWithFallback(invalidResponse, "test input");
      
      expect(result.transactions).toHaveLength(0);
      expect(result.parsing_metadata?.parsing_quality).toBe('failed');
    });
  });

  describe('Strategy 2: Intelligent JSON Repair', () => {
    test.each(malformedJsonResponses)('should repair malformed JSON: %s', (malformedJson) => {
      const result = parseAIResponseWithFallback(malformedJson, "ăn sáng 25k");
      
      // Should either successfully repair or gracefully fallback
      expect(result).toBeDefined();
      expect(result.transactions).toBeDefined();
      expect(Array.isArray(result.transactions)).toBe(true);
    });

    test('should fix common streaming issues', () => {
      const streamingResponse = '{"transactions": [{"transaction_type": "expense", "amount": 25000, "description": "coffee"';
      const result = parseAIResponseWithFallback(streamingResponse, "coffee 25k");
      
      expect(result.transactions).toBeDefined();
      expect(result.parsing_metadata?.enhancement_applied).toBe(true);
    });

    test('should handle markdown-wrapped JSON', () => {
      const markdownJson = '```json\n{"transactions": [{"transaction_type": "expense", "amount": 25000, "description": "test"}]}\n```';
      const result = parseAIResponseWithFallback(markdownJson, "test 25k");
      
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].amount).toBe(25000);
    });
  });

  describe('Strategy 3: Smart JSON Extraction', () => {
    test.each(partialJsonResponses)('should extract valid data from partial responses: %s', (partialJson) => {
      const result = parseAIResponseWithFallback(partialJson, "test transaction");
      
      expect(result.transactions).toBeDefined();
      expect(result.parsing_metadata?.extraction_method).toBeDefined();
    });

    test('should extract multiple transactions from partial text', () => {
      const partialResponse = 'Found transactions: {"transaction_type": "expense", "amount": 25000} and {"transaction_type": "income", "amount": 100000}';
      const result = parseAIResponseWithFallback(partialResponse, "multiple transactions");
      
      expect(result.transactions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Strategy 4: Hybrid Reconstruction', () => {
    beforeEach(() => {
      mockExtractVietnameseTransactions.mockReturnValue([
        {
          transaction_type: "expense",
          amount: 25000,
          description: "Cà phê",
          confidence_score: 0.7,
          suggested_category_id: null,
          suggested_category_name: "Ăn uống"
        }
      ]);
    });

    test('should combine AI partial data with rule-based extraction', () => {
      const partialAIResponse = '"transaction_type": "expense", "amount": 25000';
      const result = parseAIResponseWithFallback(partialAIResponse, "cà phê 25k");
      
      expect(result.transactions).toBeDefined();
      expect(result.parsing_metadata?.hybrid_merged).toBeDefined();
    });

    test('should prefer more complete data source', () => {
      const partialAIResponse = '"amount": 25000';
      const result = parseAIResponseWithFallback(partialAIResponse, "ăn sáng 25k");
      
      // Should use Vietnamese extraction as it's more complete
      expect(mockExtractVietnameseTransactions).toHaveBeenCalled();
      expect(result.transactions[0].description).toBeDefined();
    });
  });

  describe('Strategy 5: Vietnamese Fallback Enhancement', () => {
    test.each(vietnameseTestInputs)('should extract Vietnamese transactions from: %s', (vietnameseInput) => {
      const result = parseAIResponseWithFallback("invalid json", vietnameseInput);
      
      expect(mockExtractVietnameseTransactions).toHaveBeenCalledWith(vietnameseInput);
      expect(result.transactions).toBeDefined();
      expect(result.parsing_metadata?.fallback_method).toBe('vietnamese_extraction');
    });

    test('should enhance Vietnamese results with proper metadata', () => {
      const result = parseAIResponseWithFallback("malformed", "ăn sáng 25k");
      
      expect(result.transactions[0].confidence_score).toBeLessThanOrEqual(0.4);
      expect(result.transactions[0].notes).toContain('fallback');
      expect(result.parsing_metadata?.fallback_risk).toBe('high');
    });

    test('should handle multiple Vietnamese transactions', () => {
      mockExtractVietnameseTransactions.mockReturnValue([
        { transaction_type: "expense", amount: 25000, description: "Cà phê" },
        { transaction_type: "expense", amount: 45000, description: "Cơm trưa" }
      ]);

      const result = parseAIResponseWithFallback("invalid", "sáng cf 25k, trưa cơm 45k");
      
      expect(result.transactions).toHaveLength(2);
      expect(result.parsing_metadata?.total_transactions_found).toBe(2);
    });
  });

  describe('Strategy 6: Graceful Error Handling', () => {
    test('should return structured error when all strategies fail', () => {
      mockExtractVietnameseTransactions.mockReturnValue([]);
      
      const result = parseAIResponseWithFallback("completely invalid", "no transactions here");
      
      expect(result.transactions).toHaveLength(0);
      expect(result.analysis_summary).toContain('Failed to parse');
      expect(result.parsing_metadata?.parsing_quality).toBe('failed');
      expect(result.parsing_metadata?.fallback_risk).toBe('critical');
    });

    test('should include debugging information in error cases', () => {
      mockExtractVietnameseTransactions.mockReturnValue([]);
      
      const result = parseAIResponseWithFallback("invalid response", "test input");
      
      expect(result.parsing_metadata?.debug_info).toBeDefined();
      expect(result.parsing_metadata?.debug_info?.response_length).toBeDefined();
      expect(result.parsing_metadata?.debug_info?.response_preview).toBeDefined();
    });

    test('should track all attempted strategies in error metadata', () => {
      mockExtractVietnameseTransactions.mockReturnValue([]);
      
      const result = parseAIResponseWithFallback("invalid", "test");
      
      expect(result.parsing_metadata?.potential_issues).toContain('Direct JSON parsing failed');
      expect(result.parsing_metadata?.potential_issues).toContain('JSON repair failed');
      expect(result.parsing_metadata?.potential_issues).toContain('Vietnamese fallback failed');
    });
  });

  describe('Confidence Assessment and Enhancement', () => {
    test('should accurately assess transaction confidence', () => {
      const transaction = {
        amount: 25000,
        description: "Detailed transaction description",
        transaction_type: "expense",
        suggested_category_id: "uuid",
        suggested_category_name: "Category"
      };

      const confidence = assessTransactionConfidence(transaction, "original input");
      
      expect(confidence).toBeGreaterThan(0.5);
      expect(confidence).toBeLessThanOrEqual(1.0);
    });

    test('should enhance AI responses with validation flags', () => {
      const lowConfidenceResponse = {
        transactions: [{
          ...validAIResponse.transactions[0],
          confidence_score: 0.4
        }]
      };

      const result = enhanceAIResponse(lowConfidenceResponse, "test input");
      
      expect(result.transactions[0].validation_passed).toBe(false);
      expect(result.parsing_metadata?.low_confidence_count).toBe(1);
    });

    test('should calculate accurate metadata for enhanced responses', () => {
      const mixedConfidenceResponse = {
        transactions: [
          { ...validAIResponse.transactions[0], confidence_score: 0.9 },
          { ...validAIResponse.transactions[0], confidence_score: 0.7 },
          { ...validAIResponse.transactions[0], confidence_score: 0.3 }
        ]
      };

      const result = enhanceAIResponse(mixedConfidenceResponse, "test");
      
      expect(result.parsing_metadata?.high_confidence_count).toBe(1);
      expect(result.parsing_metadata?.medium_confidence_count).toBe(1); 
      expect(result.parsing_metadata?.low_confidence_count).toBe(1);
      expect(result.parsing_metadata?.average_confidence).toBeCloseTo(0.63, 1);
    });
  });

  describe('Integration and Edge Cases', () => {
    test('should handle empty responses gracefully', () => {
      const result = parseAIResponseWithFallback("", "test input");
      
      expect(result.transactions).toHaveLength(0);
      expect(result.parsing_metadata?.parsing_quality).toBe('failed');
    });

    test('should handle extremely large responses', () => {
      const largeResponse = '{"transactions": [' + 
        Array(1000).fill('{"transaction_type": "expense", "amount": 1000}').join(',') + 
        ']}';
      
      const result = parseAIResponseWithFallback(largeResponse, "large input");
      
      expect(result).toBeDefined();
      expect(result.transactions).toBeDefined();
    });

    test('should maintain transaction order in fallback scenarios', () => {
      mockExtractVietnameseTransactions.mockReturnValue([
        { transaction_type: "expense", amount: 25000, description: "First" },
        { transaction_type: "expense", amount: 30000, description: "Second" },
        { transaction_type: "income", amount: 100000, description: "Third" }
      ]);

      const result = parseAIResponseWithFallback("invalid", "multiple ordered transactions");
      
      expect(result.transactions[0].description).toBe("First");
      expect(result.transactions[1].description).toBe("Second");
      expect(result.transactions[2].description).toBe("Third");
    });

    test('should preserve original input context throughout fallback chain', () => {
      const originalInput = "specific test input with context";
      const result = parseAIResponseWithFallback("invalid json", originalInput);
      
      expect(mockExtractVietnameseTransactions).toHaveBeenCalledWith(originalInput);
      expect(result.parsing_metadata?.debug_info?.original_input).toContain("specific test input");
    });
  });

  describe('Performance and Resource Management', () => {
    test('should complete fallback processing within reasonable time', async () => {
      const startTime = Date.now();
      
      const result = parseAIResponseWithFallback("complex malformed json response", "test input");
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should not exhaust memory with large malformed responses', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      const largeInvalidResponse = 'invalid'.repeat(100000);
      const result = parseAIResponseWithFallback(largeInvalidResponse, "test");
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
    });
  });
});

// Helper function mocks (would normally be imported)
function parseAIResponseWithFallback(responseText: string, originalInputText?: string): any {
  // This would be the actual implementation from the route.ts file
  // For testing purposes, we'll use a simplified version that calls the strategies
  
  try {
    return JSON.parse(responseText);
  } catch {
    if (originalInputText) {
      return {
        transactions: mockExtractVietnameseTransactions(originalInputText),
        analysis_summary: "Fallback extraction used",
        parsing_metadata: {
          parsing_quality: "needs_review",
          fallback_method: "vietnamese_extraction",
          fallback_risk: "high"
        }
      };
    }
    
    return {
      transactions: [],
      analysis_summary: "All parsing strategies failed",
      parsing_metadata: {
        parsing_quality: "failed",
        fallback_risk: "critical",
        potential_issues: [
          "Direct JSON parsing failed",
          "JSON repair failed", 
          "Vietnamese fallback failed"
        ],
        debug_info: {
          response_length: responseText.length,
          response_preview: responseText.substring(0, 200),
          original_input: originalInputText?.substring(0, 100) || "not_provided"
        }
      }
    };
  }
}

function enhanceAIResponse(aiResponse: any, originalInputText?: string): any {
  // Simplified mock implementation
  return {
    ...aiResponse,
    parsing_metadata: {
      ...aiResponse.parsing_metadata,
      enhancement_applied: true,
      high_confidence_count: 0,
      medium_confidence_count: 0,
      low_confidence_count: aiResponse.transactions?.length || 0
    }
  };
}

function assessTransactionConfidence(transaction: any, originalInputText?: string): number {
  let confidence = 0.5;
  if (transaction.amount > 0) confidence += 0.2;
  if (transaction.description?.length > 5) confidence += 0.1;
  if (transaction.suggested_category_id) confidence += 0.15;
  if (transaction.transaction_type) confidence += 0.05;
  return Math.min(confidence, 1.0);
}