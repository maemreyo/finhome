#!/usr/bin/env tsx
// scripts/test-ai-prompt.ts
// Automated testing script for AI prompt optimization

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createGeminiKeyManager } from '../src/lib/gemini-key-manager.js';
import { RateLimiter } from '../src/lib/rate-limiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  TEST_SUITE_PATH: path.join(__dirname, '../prompt-test-suite.json'),
  API_ENDPOINT: 'http://localhost:3033/api/expenses/parse-from-text',
  RESULTS_DIR: path.join(__dirname, '../test-results'),
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  TIMEOUT: 30000, // Increased timeout for rate limiting
  
  // Authentication - Hardcoded cookie for testing
  HARDCODED_COOKIE: 'base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0ltdHBaQ0k2SWpCaVRsRk1ZVzFtTjJSMmVYbEJSbFVpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDJkMmFXWnpaMjUyZG5kbGNYWjJkSGgzY0hKekxuTjFjR0ZpWVhObExtTnZMMkYxZEdodmRqRWlMQ0p6ZFdJaU9pSTBOVGRqWXpFMVl5MDBaRFZrTFRRd1l6WXRPREpsTnkwd09ERTBZamMxWkdSaE1UWWlMQ0poZFdRaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVpYaHdJam94TnpVek1qazBNekkyTENKcFlYUWlPakUzTlRNeU9UQTNNallzSW1WdFlXbHNJam9pYm1kdmJtaDFkR2hoYm1oMGNuVnVaekUwTURsQVoyMWhhV3d1WTI5dElpd2ljR2h2Ym1VaU9pSWlMQ0poY0hCZmJXVjBZV1JoZEdFaU9uc2ljSEp2ZG1sa1pYSWlPaUpsYldGcGJDSXNJbkJ5YjNacFpHVnljeUk2V3lKbGJXRnBiQ0pkZlN3aWRYTmxjbDl0WlhSaFpHRjBZU0k2ZXlKbGJXRnBiQ0k2SW01bmIyNW9kWFJvWVc1b2RISjFibWN4TkRBNVFHZHRZV2xzTG1OdmJTSXNJbVZ0WVdsc1gzWmxjbWxtYVdWa0lqcDBjblZsTENKbWRXeHNYMjVoYldVaU9pSk5ZWFIwYUdWM0lFNW5ieUlzSW5Cb2IyNWxYM1psY21sbWFXVmtJanBtWVd4elpTd2ljM1ZpSWpvaU5EVTNZMk14TldNdE5HUTFaQzAwTUdNMkxUZ3laVGN0TURneE5HSTNOV1JrWVRFMkluMHNJbkp2YkdVaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVlXRnNJam9pWVdGc01TSXNJbUZ0Y2lJNlczc2liV1YwYUc5a0lqb2ljR0Z6YzNkdmNtUWlMQ0owYVcxbGMzUmhiWEFpT2pFM05USTRNemN6TVRsOVhTd2ljMlZ6YzJsdmJsOXBaQ0k2SWpOalkyVTFZMkUxTFRaak5EWXROR1UwTlMwNU9EZzJMVEU1WlRsaE5EZ3daVGxrTnlJc0ltbHpYMkZ1YjI1NWJXOTFjeUk2Wm1Gc2MyVjkuZ3dpQ21peElYTktMcXJRS3lkRDUyalNsbGluLTRYcXdJNnMxSkM5UjMtSSIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzUzMjk0MzI2LCJyZWZyZXNoX3Rva2VuIjoidnZoajR4ZnBiN3FwIiwidXNlciI6eyJpZCI6IjQ1N2NjMTVjLTRkNWQtNDBjNi04MmU3LTA4MTRiNzVkZGExNiIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoibmdvbmh1dGhhbmh0cnVuZzE0MDlAZ21haWwuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNS0wNy0xOFQwMzowNzoyMS44MTE4MVoiLCJwaG9uZSI6IiIsImNvbmZpcm1hdGlvbl9zZW50X2F0IjoiMjAyNS0wNy0xOFQwMzowNzowNC43OTE1NThaIiwiY29uZmlybWVkX2F0IjoiMjAyNS0wNy0xOFQwMzowNzoyMS44MTE4MVoiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI1LTA3LTE5VDA4OjEzOjU1Ljc2ODYxNVoiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6Im5nb25odXRoYW5odHJ1bmcxNDA5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJNYXR0aGV3IE5nbyIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNDU3Y2MxNWMtNGQ1ZC00MGM2LTgyZTctMDgxNGI3NWRkYTE2In0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiYzczZWMzZjUtYWFjYi00MTJhLWJlODAtZDUzZDQ0MDIwZDk5IiwiaWQiOiI0NTdjYzE1Yy00ZDVkLTQwYzYtODJlNy0wODE0Yjc1ZGRhMTYiLCJ1c2VyX2lkIjoiNDU3Y2MxNWMtNGQ1ZC00MGM2LTgyZTctMDgxNGI3NWRkYTE2IiwiaWRlbnRpdHlfZGF0YSI6eyJlbWFpbCI6Im5nb25odXRoYW5odHJ1bmcxNDA5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJNYXR0aGV3IE5nbyIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNDU3Y2MxNWMtNGQ1ZC00MGM2LTgyZTctMDgxNGI3NWRkYTE2In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI1LTA3LTE4VDAzOjA3OjA0Ljc4MjgyMVoiLCJjcmVhdGVkX2F0IjoiMjAyNS0wNy0xOFQwMzowNzowNC43ODI4N1oiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wNy0xOFQwMzowNzowNC43ODI4N1oiLCJlbWFpbCI6Im5nb25odXRoYW5odHJ1bmcxNDA5QGdtYWlsLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjUtMDctMThUMDM6MDc6MDQuNzQzNjI0WiIsInVwZGF0ZWRfYXQiOiIyMDI1LTA3LTIzVDE3OjEyOjA2Ljc4ODM1OFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfX0',
  
  // Rate limiting settings for test script
  RATE_LIMITING: {
    enabled: true, // Enable local rate limiting
    baseDelay: 3000, // 3 seconds between requests
    maxDelay: 60000, // Maximum delay 
    backoffFactor: 1.5, // Exponential backoff multiplier
    jitterFactor: 0.2, // Add randomness to delays
  }
};

// Initialize local rate limiter for test script  
let testRateLimiter: RateLimiter | null = null;
try {
  testRateLimiter = new RateLimiter({
    maxRequestsPerSecond: 0.5, // 0.5 requests per second = 1 request every 2 seconds
    maxConcurrentRequests: 1,
    baseDelay: 2000,
    maxBackoffDelay: 60000,
    jitterFactor: 0.2,
  });
  console.log('✅ Test script rate limiter initialized');
} catch (error) {
  console.warn('⚠️ Failed to initialize test script rate limiter:', error);
}

// Types
interface UserPreferences {
  default_wallet_id?: string;
  timezone?: string;
  currency?: string;
}

interface TestCase {
  id: string;
  category: string;
  input: string;
  expected: {
    transactions?: Array<{
      transaction_type: string;
      amount: number;
      description: string;
      suggested_category_name?: string;
    }>;
  };
}

interface TestSuite {
  test_suite_version: string;
  test_cases: TestCase[];
  pass_threshold: number;
}

interface TestResult {
  id: string;
  category: string;
  input: string;
  expected: any;
  actual: any;
  processing_time: number;
  timestamp: string;
  success: boolean;
  error: string | null;
  pass: boolean;
  score: {
    total: number;
    max: number;
    percentage: number;
    details?: any;
  };
}

// Utility functions
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Function to get authentication headers
const getAuthHeaders = (): Record<string, string> => {
  // Option 1: Use hardcoded cookie (highest priority for testing)
  if (CONFIG.HARDCODED_COOKIE) {
    console.log('Using hardcoded cookie for authentication');
    return { 
      'Cookie': `sb-gvifsgnvvweqvvtxwprs-auth-token=${CONFIG.HARDCODED_COOKIE}` 
    };
  }
  
  // Option 2: Use token from environment variable
  if (process.env.AUTH_TOKEN) {
    return { 'Authorization': `Bearer ${process.env.AUTH_TOKEN}` };
  }
  
  // Option 3: Use cookie from environment variable
  if (process.env.BROWSER_COOKIE) {
    const cookieValue = process.env.BROWSER_COOKIE;
    return { 
      'Cookie': `sb-gvifsgnvvweqvvtxwprs-auth-token=${cookieValue}` 
    };
  }
  
  throw new Error('No authentication token available. Please set AUTH_TOKEN environment variable, BROWSER_COOKIE, or update CONFIG.HARDCODED_COOKIE');
};

const makeApiRequest = async (text: string, userPreferences: UserPreferences = {}): Promise<any> => {
  // Wrap the request in rate limiting if available
  const requestFn = async (): Promise<any> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    try {
      const authHeaders = getAuthHeaders();
      
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          ...authHeaders
        },
        body: JSON.stringify({
          text,
          user_preferences: userPreferences,
          stream: false  // Disable streaming for testing
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore error parsing error body
        }
        
        // Special handling for 401 errors
        if (response.status === 401) {
          errorMessage += '\n\nAuthentication failed. Please:\n1. Update AUTH_TOKEN in config\n2. Set AUTH_TOKEN environment variable\n3. Or pass BROWSER_COOKIE environment variable';
        }
        
        // Special handling for 429 errors
        if (response.status === 429) {
          errorMessage += '\n\n⚠️ Rate limit hit! The server is using key rotation to handle this.';
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Apply rate limiting if available
  if (testRateLimiter) {
    console.log('🔄 Applying test script rate limiting...');
    return await testRateLimiter.throttleRequest(requestFn);
  } else {
    // Fallback: basic delay between requests
    await sleep(1500); // 1.5 second delay
    return await requestFn();
  }
};

const compareTransactions = (expected: any[], actual: any[]): any => {
  const score = {
    total: 0,
    max: 0,
    details: {} as any
  };

  // Check transaction count
  score.max += 10;
  if (expected.length === actual.length) {
    score.total += 10;
    score.details.transaction_count = { pass: true, score: 10, max: 10 };
  } else {
    score.details.transaction_count = { 
      pass: false, 
      score: 0, 
      max: 10,
      message: `Expected ${expected.length} transactions, got ${actual.length}`
    };
  }

  // Compare each transaction
  for (let i = 0; i < Math.max(expected.length, actual.length); i++) {
    const exp = expected[i];
    const act = actual[i];
    const transactionScore = { total: 0, max: 0, details: {} as any };

    if (!exp || !act) {
      score.details[`transaction_${i}`] = {
        pass: false,
        score: 0,
        max: 50,
        message: exp ? 'Missing actual transaction' : 'Unexpected extra transaction'
      };
      score.max += 50;
      continue;
    }

    // Transaction type (15 points)
    transactionScore.max += 15;
    if (exp.transaction_type === act.transaction_type) {
      transactionScore.total += 15;
      transactionScore.details.type = { pass: true, score: 15, max: 15 };
    } else {
      transactionScore.details.type = {
        pass: false,
        score: 0,
        max: 15,
        message: `Expected type: ${exp.transaction_type}, got: ${act.transaction_type}`
      };
    }

    // Amount (20 points)
    transactionScore.max += 20;
    if (exp.amount === act.amount) {
      transactionScore.total += 20;
      transactionScore.details.amount = { pass: true, score: 20, max: 20 };
    } else {
      const diff = Math.abs(exp.amount - act.amount);
      const tolerance = exp.amount * 0.01; // 1% tolerance
      if (diff <= tolerance) {
        transactionScore.total += 18;
        transactionScore.details.amount = { 
          pass: true, 
          score: 18, 
          max: 20,
          message: 'Amount within tolerance'
        };
      } else {
        transactionScore.details.amount = {
          pass: false,
          score: 0,
          max: 20,
          message: `Expected amount: ${exp.amount}, got: ${act.amount}`
        };
      }
    }

    // Category matching (10 points)
    transactionScore.max += 10;
    if (exp.suggested_category_name && act.suggested_category_name) {
      const expCategory = exp.suggested_category_name.toLowerCase();
      const actCategory = act.suggested_category_name.toLowerCase();
      if (expCategory === actCategory || expCategory.includes(actCategory) || actCategory.includes(expCategory)) {
        transactionScore.total += 10;
        transactionScore.details.category = { pass: true, score: 10, max: 10 };
      } else {
        transactionScore.details.category = {
          pass: false,
          score: 0,
          max: 10,
          message: `Expected category: ${exp.suggested_category_name}, got: ${act.suggested_category_name}`
        };
      }
    } else {
      transactionScore.details.category = { pass: true, score: 5, max: 10, message: 'Category not specified' };
      transactionScore.total += 5;
    }

    // Description similarity (5 points)
    transactionScore.max += 5;
    if (exp.description && act.description) {
      const expDesc = exp.description.toLowerCase();
      const actDesc = act.description.toLowerCase();
      if (expDesc === actDesc) {
        transactionScore.total += 5;
        transactionScore.details.description = { pass: true, score: 5, max: 5 };
      } else if (expDesc.includes(actDesc) || actDesc.includes(expDesc)) {
        transactionScore.total += 3;
        transactionScore.details.description = { pass: true, score: 3, max: 5, message: 'Partial match' };
      } else {
        transactionScore.details.description = {
          pass: false,
          score: 0,
          max: 5,
          message: `Expected: "${exp.description}", got: "${act.description}"`
        };
      }
    } else {
      transactionScore.details.description = { pass: true, score: 2, max: 5, message: 'Description not specified' };
      transactionScore.total += 2;
    }

    score.total += transactionScore.total;
    score.max += transactionScore.max;
    score.details[`transaction_${i}`] = transactionScore;
  }

  return {
    ...score,
    percentage: score.max > 0 ? (score.total / score.max) * 100 : 0
  };
};

const runSingleTest = async (testCase: TestCase, retryCount = 0): Promise<TestResult> => {
  try {
    console.log(`Running test: ${testCase.id} (${testCase.category})`);
    
    const startTime = Date.now();
    const response = await makeApiRequest(testCase.input);
    const endTime = Date.now();

    const result: TestResult = {
      id: testCase.id,
      category: testCase.category,
      input: testCase.input,
      expected: testCase.expected,
      actual: response.data || response,
      processing_time: endTime - startTime,
      timestamp: new Date().toISOString(),
      success: true,
      error: null,
      pass: false,
      score: { total: 0, max: 100, percentage: 0 }
    };

    // Compare results
    if (testCase.expected.transactions) {
      const actualTransactions = result.actual.transactions || [];
      result.score = compareTransactions(testCase.expected.transactions, actualTransactions);
      result.pass = result.score.percentage >= 70; // 70% threshold for individual tests
    } else {
      // Test case expects no transactions
      const actualTransactions = result.actual.transactions || [];
      result.pass = actualTransactions.length === 0;
      result.score = {
        total: result.pass ? 100 : 0,
        max: 100,
        percentage: result.pass ? 100 : 0,
        details: {
          no_transactions: {
            pass: result.pass,
            score: result.pass ? 100 : 0,
            max: 100,
            message: result.pass ? 'Correctly identified no transactions' : `Expected no transactions, got ${actualTransactions.length}`
          }
        }
      };
    }

    return result;

  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES && !(error as Error).message.includes('401')) {
      console.log(`Test ${testCase.id} failed, retrying... (${retryCount + 1}/${CONFIG.MAX_RETRIES})`);
      await sleep(CONFIG.RETRY_DELAY);
      return runSingleTest(testCase, retryCount + 1);
    }

    return {
      id: testCase.id,
      category: testCase.category,
      input: testCase.input,
      expected: testCase.expected,
      actual: null,
      success: false,
      error: (error as Error).message,
      pass: false,
      score: { total: 0, max: 100, percentage: 0 },
      processing_time: 0,
      timestamp: new Date().toISOString()
    };
  }
};

const generateReport = (results: TestResult[], testSuite: TestSuite): any => {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.pass).length;
  const failedTests = totalTests - passedTests;
  
  const overallScore = results.reduce((sum, r) => sum + r.score.percentage, 0) / totalTests;
  
  const categoryStats: Record<string, any> = {};
  results.forEach(result => {
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = {
        total: 0,
        passed: 0,
        totalScore: 0
      };
    }
    categoryStats[result.category].total++;
    if (result.pass) categoryStats[result.category].passed++;
    categoryStats[result.category].totalScore += result.score.percentage;
  });

  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category];
    stats.passRate = (stats.passed / stats.total) * 100;
    stats.avgScore = stats.totalScore / stats.total;
  });

  const failedTests_details = results
    .filter(r => !r.pass)
    .map(r => ({
      id: r.id,
      category: r.category,
      input: r.input,
      error: r.error,
      score: r.score.percentage,
      issues: Object.keys(r.score.details || {})
        .filter(key => !r.score.details[key].pass)
        .map(key => ({
          aspect: key,
          message: r.score.details[key].message
        }))
    }));

  return {
    summary: {
      total_tests: totalTests,
      passed: passedTests,
      failed: failedTests,
      pass_rate: (passedTests / totalTests) * 100,
      overall_score: overallScore,
      meets_threshold: overallScore >= testSuite.pass_threshold * 100
    },
    category_breakdown: categoryStats,
    failed_tests: failedTests_details,
    recommendations: generateRecommendations(failedTests_details, categoryStats),
    timestamp: new Date().toISOString()
  };
};

const generateRecommendations = (failedTests: any[], categoryStats: Record<string, any>): any[] => {
  const recommendations: any[] = [];

  // Analyze common failure patterns
  const issueTypes: Record<string, number> = {};
  failedTests.forEach(test => {
    test.issues.forEach((issue: any) => {
      if (!issueTypes[issue.aspect]) issueTypes[issue.aspect] = 0;
      issueTypes[issue.aspect]++;
    });
  });

  // Generate specific recommendations
  if (issueTypes.amount > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Amount Parsing',
      issue: `${issueTypes.amount} tests failed on amount parsing`,
      suggestion: 'Review Vietnamese number format parsing logic. Consider adding more examples for "triệu", "k", "tr" formats.'
    });
  }

  if (issueTypes.type > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Transaction Type',
      issue: `${issueTypes.type} tests failed on transaction type detection`,
      suggestion: 'Improve keyword detection for expense/income/transfer classification. Add more Vietnamese contextual clues.'
    });
  }

  if (issueTypes.category > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'Category Matching',
      issue: `${issueTypes.category} tests failed on category matching`,
      suggestion: 'Enhance category mapping logic. Consider adding category aliases and synonyms.'
    });
  }

  // Category-specific recommendations
  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category];
    if (stats.passRate < 70) {
      recommendations.push({
        priority: 'medium',
        category: `Category: ${category}`,
        issue: `Low pass rate (${stats.passRate.toFixed(1)}%) for ${category} tests`,
        suggestion: `Review and improve handling of ${category} scenarios. Consider adding few-shot examples.`
      });
    }
  });

  return recommendations;
};

const saveResults = async (report: any, results: TestResult[]): Promise<void> => {
  try {
    await fs.mkdir(CONFIG.RESULTS_DIR, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save detailed results
    const resultsFile = path.join(CONFIG.RESULTS_DIR, `test-results-${timestamp}.json`);
    await fs.writeFile(resultsFile, JSON.stringify({
      report,
      detailed_results: results
    }, null, 2));

    // Save summary report
    const summaryFile = path.join(CONFIG.RESULTS_DIR, `test-summary-${timestamp}.json`);
    await fs.writeFile(summaryFile, JSON.stringify(report, null, 2));

    // Save latest results (for easy access)
    const latestFile = path.join(CONFIG.RESULTS_DIR, 'latest-results.json');
    await fs.writeFile(latestFile, JSON.stringify(report, null, 2));

    console.log(`\nResults saved to:`);
    console.log(`- Detailed: ${resultsFile}`);
    console.log(`- Summary: ${summaryFile}`);
    console.log(`- Latest: ${latestFile}`);

  } catch (error) {
    console.error('Failed to save results:', (error as Error).message);
  }
};

const printSummary = (report: any): void => {
  console.log('\n' + '='.repeat(60));
  console.log('AI PROMPT TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\nOverall Performance:`);
  console.log(`  Total Tests: ${report.summary.total_tests}`);
  console.log(`  Passed: ${report.summary.passed} (${report.summary.pass_rate.toFixed(1)}%)`);
  console.log(`  Failed: ${report.summary.failed}`);
  console.log(`  Overall Score: ${report.summary.overall_score.toFixed(1)}%`);
  console.log(`  Threshold Met: ${report.summary.meets_threshold ? '✅ YES' : '❌ NO'}`);

  console.log(`\nCategory Breakdown:`);
  Object.keys(report.category_breakdown).forEach(category => {
    const stats = report.category_breakdown[category];
    console.log(`  ${category}: ${stats.passed}/${stats.total} (${stats.passRate.toFixed(1)}%) - Avg: ${stats.avgScore.toFixed(1)}%`);
  });

  if (report.failed_tests.length > 0) {
    console.log(`\nTop Failed Tests:`);
    report.failed_tests.slice(0, 5).forEach((test: any) => {
      console.log(`  ❌ ${test.id} (${test.category}) - Score: ${test.score.toFixed(1)}%`);
      console.log(`     Input: "${test.input}"`);
      if (test.error) {
        console.log(`     Error: ${test.error}`);
      }
    });
  }

  if (report.recommendations.length > 0) {
    console.log(`\nTop Recommendations:`);
    report.recommendations.slice(0, 3).forEach((rec: any) => {
      console.log(`  🔧 [${rec.priority.toUpperCase()}] ${rec.category}`);
      console.log(`     ${rec.suggestion}`);
    });
  }
};

// Main execution
const main = async (): Promise<void> => {
  try {
    console.log('Starting AI Prompt Test Suite...\n');

    // Load test suite
    const testSuiteContent = await fs.readFile(CONFIG.TEST_SUITE_PATH, 'utf8');
    const testSuite: TestSuite = JSON.parse(testSuiteContent);
    
    console.log(`Loaded ${testSuite.test_cases.length} test cases from ${testSuite.test_suite_version}`);
    console.log(`Pass threshold: ${testSuite.pass_threshold * 100}%\n`);

    // Run tests
    const results: TestResult[] = [];
    for (let i = 0; i < testSuite.test_cases.length; i++) {
      const testCase = testSuite.test_cases[i];
      const result = await runSingleTest(testCase);
      results.push(result);
      
      const status = result.pass ? '✅' : '❌';
      const score = result.score ? result.score.percentage.toFixed(1) : '0.0';
      console.log(`  ${status} ${result.id}: ${score}% ${result.error ? `(Error: ${result.error})` : ''}`);
      
      // Rate limiting is handled in makeApiRequest, no additional delay needed here
      // The test script rate limiter ensures proper spacing between requests
    }

    // Generate and display report
    const report = generateReport(results, testSuite);
    printSummary(report);

    // Save results
    await saveResults(report, results);

    // Exit with appropriate code
    process.exit(report.summary.meets_threshold ? 0 : 1);

  } catch (error) {
    console.error('Test suite failed to run:', (error as Error).message);
    process.exit(1);
  }
};

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, runSingleTest, generateReport };