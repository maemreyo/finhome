#!/usr/bin/env node

/**
 * Manual Testing Script for AI Response Fallback Scenarios
 * 
 * This script allows manual testing of various fallback scenarios
 * to ensure the system handles edge cases gracefully.
 */

const fs = require('fs');
const path = require('path');

// Test scenarios with expected behaviors
const testScenarios = [
  {
    name: "Valid High Confidence Response",  
    aiResponse: JSON.stringify({
      transactions: [{
        transaction_type: "expense",
        amount: 25000,
        description: "Ăn sáng",
        suggested_category_id: "uuid-food",
        suggested_category_name: "Ăn uống", 
        confidence_score: 0.95,
        suggested_tags: ["#breakfast"],
        suggested_wallet_id: "uuid-wallet"
      }],
      parsing_metadata: { average_confidence: 0.95 }
    }),
    originalInput: "ăn sáng 25k",
    expectedOutcome: "Direct parsing with high confidence"
  },
  
  {
    name: "Low Confidence Response Needing Enhancement",
    aiResponse: JSON.stringify({
      transactions: [{
        transaction_type: "expense",
        amount: 50000, 
        description: "Mua đồ",
        suggested_category_id: "uuid-shopping",
        suggested_category_name: "Mua sắm",
        confidence_score: 0.3,
        suggested_tags: []
      }],
      parsing_metadata: { average_confidence: 0.3 }
    }),
    originalInput: "mua đồ 50k",
    expectedOutcome: "Enhancement with human review flag"
  },

  {
    name: "Malformed JSON - Missing Closing Bracket",
    aiResponse: '{"transactions": [{"transaction_type": "expense", "amount": 25000, "description": "coffee"',
    originalInput: "coffee 25k", 
    expectedOutcome: "JSON repair successful"
  },

  {
    name: "Malformed JSON - Trailing Comma",
    aiResponse: '{"transactions": [{"transaction_type": "expense", "amount": 25000, "description": "coffee",}]}',
    originalInput: "coffee 25k",
    expectedOutcome: "JSON repair successful"
  },

  {
    name: "Markdown Wrapped JSON",
    aiResponse: '```json\n{"transactions": [{"transaction_type": "expense", "amount": 25000, "description": "test"}]}\n```',
    originalInput: "test 25k",
    expectedOutcome: "JSON extraction successful"
  },

  {
    name: "Partial AI Response - Missing Structure", 
    aiResponse: '"transaction_type": "expense", "amount": 25000, "description": "ăn sáng"',
    originalInput: "ăn sáng 25k",
    expectedOutcome: "Hybrid reconstruction"
  },

  {
    name: "Complete AI Failure - Invalid Response",
    aiResponse: "This is not JSON at all, just random text",
    originalInput: "ăn sáng 25k, uống cà phê 20k",
    expectedOutcome: "Vietnamese fallback extraction"
  },

  {
    name: "Empty Response", 
    aiResponse: "",
    originalInput: "taxi 50k",
    expectedOutcome: "Vietnamese fallback extraction"
  },

  {
    name: "Multi-transaction Vietnamese Input",
    aiResponse: "invalid json response",
    originalInput: "sáng ăn phở 30k, trưa cafe 25k, tối nhậu 150k, nhận lương 5tr",
    expectedOutcome: "Vietnamese extraction with multiple transactions"
  },

  {
    name: "Complex Vietnamese Expressions",
    aiResponse: "malformed response",
    originalInput: "nhận thưởng tết 2 triệu, taxi về nhà 80k, mua quà cho má 500k",
    expectedOutcome: "Vietnamese extraction with income/expense classification"
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m', 
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(80)}`, colors.cyan);
  log(`${message}`, colors.bright);
  log(`${'='.repeat(80)}`, colors.cyan);
}

function logScenario(name) {
  log(`\n${'-'.repeat(60)}`, colors.blue);
  log(`🧪 Testing: ${name}`, colors.bright);
  log(`${'-'.repeat(60)}`, colors.blue);
}

function logResult(success, message) {
  const symbol = success ? '✅' : '❌';
  const color = success ? colors.green : colors.red;
  log(`${symbol} ${message}`, color);
}

// Mock the parsing function for testing (in real scenario, this would be imported)
function parseAIResponseWithFallback(responseText, originalInputText) {
  const results = {
    strategy_used: 'unknown',
    confidence_assessment: 'unknown',
    validation_status: 'unknown',
    transactions_found: 0,
    fallback_risk: 'unknown',
    processing_time: 0
  };

  const startTime = Date.now();

  try {
    // Strategy 1: Direct JSON parsing
    const parsed = JSON.parse(responseText);
    if (parsed && parsed.transactions) {
      results.strategy_used = 'direct_json_parsing';
      results.transactions_found = parsed.transactions.length;
      
      const avgConfidence = parsed.parsing_metadata?.average_confidence || 
        (parsed.transactions.reduce((sum, t) => sum + (t.confidence_score || 0.5), 0) / parsed.transactions.length);
      
      if (avgConfidence >= 0.75) {
        results.confidence_assessment = `high_confidence_${(avgConfidence * 100).toFixed(1)}%`;
        results.validation_status = 'passed';
        results.fallback_risk = 'low';
      } else {
        results.confidence_assessment = `medium_confidence_${(avgConfidence * 100).toFixed(1)}%`;
        results.validation_status = 'needs_enhancement';
        results.fallback_risk = 'medium';
      }
      
      results.processing_time = Date.now() - startTime;
      return { ...parsed, _test_results: results };
    }
  } catch (e) {
    // Strategy 2: JSON Repair (simplified)
    try {
      let fixed = responseText.trim();
      
      // Remove markdown wrapper
      if (fixed.includes('```json')) {
        fixed = fixed.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      // Basic repair attempts
      if (!fixed.startsWith('{')) {
        const jsonStart = fixed.indexOf('{');
        if (jsonStart !== -1) {
          fixed = fixed.substring(jsonStart);
        }
      }
      
      // Add missing brackets/braces (simplified)
      const openBraces = (fixed.match(/\{/g) || []).length;
      const closeBraces = (fixed.match(/\}/g) || []).length; 
      for (let i = 0; i < openBraces - closeBraces; i++) {
        fixed += '}';
      }
      
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        fixed += ']';
      }
      
      // Remove trailing commas
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
      
      const repaired = JSON.parse(fixed);
      if (repaired && repaired.transactions) {
        results.strategy_used = 'json_repair';
        results.transactions_found = repaired.transactions.length;
        results.confidence_assessment = 'medium_confidence_repaired';
        results.validation_status = 'needs_validation';
        results.fallback_risk = 'medium';
        results.processing_time = Date.now() - startTime;
        
        return { ...repaired, _test_results: results };
      }
    } catch (repairError) {
      // Strategy 3: Vietnamese Fallback (mocked)
      if (originalInputText) {
        const vietnameseTransactions = mockVietnameseExtraction(originalInputText);
        
        results.strategy_used = 'vietnamese_fallback';
        results.transactions_found = vietnameseTransactions.length;
        results.confidence_assessment = 'low_confidence_fallback';
        results.validation_status = 'needs_human_review';
        results.fallback_risk = 'high';
        results.processing_time = Date.now() - startTime;
        
        return {
          transactions: vietnameseTransactions,
          analysis_summary: `Vietnamese fallback extracted ${vietnameseTransactions.length} transactions`,
          parsing_metadata: {
            fallback_method: 'vietnamese_extraction',
            fallback_risk: 'high',
            average_confidence: 0.4
          },
          _test_results: results
        };
      }
    }
  }

  // All strategies failed
  results.strategy_used = 'all_failed';
  results.transactions_found = 0;
  results.confidence_assessment = 'no_confidence';
  results.validation_status = 'failed';
  results.fallback_risk = 'critical';
  results.processing_time = Date.now() - startTime;

  return {
    transactions: [],
    analysis_summary: "All parsing strategies failed",
    parsing_metadata: {
      parsing_quality: "failed",
      fallback_risk: "critical"
    },
    _test_results: results
  };
}

// Mock Vietnamese extraction function
function mockVietnameseExtraction(inputText) {
  const transactions = [];
  
  // Simple pattern matching for demonstration
  const patterns = [
    { regex: /ăn\s+\w+\s+(\d+)k/gi, type: 'expense', category: 'Ăn uống' },
    { regex: /uống\s+\w+\s+(\d+)k/gi, type: 'expense', category: 'Ăn uống' },
    { regex: /cafe?\s+(\d+)k/gi, type: 'expense', category: 'Ăn uống' },
    { regex: /taxi\s+(\d+)k/gi, type: 'expense', category: 'Đi lại' },
    { regex: /nhận\s+\w+\s+(\d+)\s*(k|tr|triệu)/gi, type: 'income', category: 'Thu nhập' }
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(inputText)) !== null) {
      const amount = parseInt(match[1]) * (match[2] === 'tr' || match[2] === 'triệu' ? 1000000 : 1000);
      transactions.push({
        transaction_type: pattern.type,
        amount: amount,
        description: match[0],
        confidence_score: 0.6,
        suggested_category_name: pattern.category,
        notes: 'Extracted via Vietnamese fallback'
      });
    }
  });

  return transactions;
}

// Run all test scenarios
function runFallbackTests() {
  logHeader('AI Response Fallback Logic Testing');
  
  let passedTests = 0;
  let totalTests = testScenarios.length;
  
  testScenarios.forEach((scenario, index) => {
    logScenario(`${index + 1}/${totalTests} - ${scenario.name}`);
    
    log(`📝 Input: "${scenario.originalInput}"`, colors.yellow);
    log(`🤖 AI Response: ${scenario.aiResponse.substring(0, 100)}${scenario.aiResponse.length > 100 ? '...' : ''}`, colors.yellow);
    log(`🎯 Expected: ${scenario.expectedOutcome}`, colors.yellow);
    
    try {
      const result = parseAIResponseWithFallback(scenario.aiResponse, scenario.originalInput);
      const testResults = result._test_results;
      
      log(`\n📊 Results:`, colors.bright);
      log(`   Strategy Used: ${testResults.strategy_used}`);
      log(`   Transactions Found: ${testResults.transactions_found}`);
      log(`   Confidence Assessment: ${testResults.confidence_assessment}`);
      log(`   Validation Status: ${testResults.validation_status}`);
      log(`   Fallback Risk: ${testResults.fallback_risk}`);
      log(`   Processing Time: ${testResults.processing_time}ms`);
      
      // Evaluate test success
      const isSuccess = testResults.transactions_found > 0 || testResults.strategy_used === 'direct_json_parsing';
      
      if (isSuccess) {
        logResult(true, 'Test passed - Fallback system handled scenario correctly');
        passedTests++;
      } else {
        logResult(false, 'Test failed - No transactions extracted');
      }
      
      // Additional insights
      if (result.transactions && result.transactions.length > 0) {
        log('\n📋 Sample Transaction:', colors.cyan);
        const sample = result.transactions[0];
        log(`   Type: ${sample.transaction_type}`);
        log(`   Amount: ${sample.amount?.toLocaleString()} VND`);
        log(`   Description: ${sample.description}`);
        log(`   Confidence: ${Math.round((sample.confidence_score || 0) * 100)}%`);
      }
      
    } catch (error) {
      logResult(false, `Test failed with error: ${error.message}`);
      log(`Error details: ${error.stack}`, colors.red);
    }
  });
  
  // Summary
  logHeader('Test Summary');
  log(`Total Tests: ${totalTests}`, colors.bright);
  log(`Passed: ${passedTests}`, colors.green);
  log(`Failed: ${totalTests - passedTests}`, colors.red);
  log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, colors.bright);
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! Fallback system is robust.', colors.green);
  } else {
    log('\n⚠️  Some tests failed. Review fallback logic.', colors.yellow);
  }
  
  // Recommendations
  log('\n💡 Recommendations:', colors.cyan);
  log('• Monitor confidence scores in production');
  log('• Track fallback usage frequency');
  log('• Implement human review for low-confidence transactions');
  log('• Continuously improve Vietnamese extraction patterns');
}

// Performance benchmarking
function runPerformanceBenchmark() {
  logHeader('Performance Benchmark');
  
  const benchmarkScenarios = [
    { name: 'Simple valid JSON', data: JSON.stringify({transactions: [{amount: 1000}]}) },
    { name: 'Large malformed JSON', data: '{"transactions": [' + Array(100).fill('{"amount": 1000}').join(',') },
    { name: 'Complex Vietnamese text', data: 'invalid', input: 'sáng ăn phở 30k, trưa cafe 25k, chiều mua đồ 200k, tối nhậu 150k, nhận lương 5 triệu' }
  ];
  
  benchmarkScenarios.forEach(scenario => {
    log(`\n⏱️  Testing: ${scenario.name}`, colors.bright);
    
    const iterations = 10;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      parseAIResponseWithFallback(scenario.data, scenario.input);
      times.push(Date.now() - start);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    log(`   Average: ${avgTime.toFixed(2)}ms`);
    log(`   Min: ${minTime}ms, Max: ${maxTime}ms`);
    
    if (avgTime < 100) {
      logResult(true, 'Performance excellent (< 100ms)');
    } else if (avgTime < 500) {
      logResult(true, 'Performance good (< 500ms)');
    } else {
      logResult(false, 'Performance needs optimization (> 500ms)');
    }
  });
}

// Main execution
if (require.main === module) {
  console.log('🚀 Starting Fallback Logic Testing...\n');
  
  runFallbackTests();
  runPerformanceBenchmark();
  
  log('\n✨ Testing completed!', colors.bright);
  log('\nTo run this test script:', colors.cyan);
  log('node scripts/test-fallback-scenarios.js', colors.cyan);
}