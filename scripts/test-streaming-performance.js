#!/usr/bin/env node
// scripts/test-streaming-performance.js
// Performance testing script for streaming vs non-streaming AI API

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  API_ENDPOINT: 'http://localhost:3033/api/expenses/parse-from-text',
  TEST_CASES: [
    'ăn trưa 50k',
    'ăn sáng phở 40k, đổ xăng 100k, nhận lương 18tr',
    'hôm nay tiêu hơi nhiều: uống cà phê 45k ở Highlands, mua sách 120k, và được hoàn tiền 150k từ shopee',
    'sáng ăn phở 35k ở quán Hà Nội, chiều uống trà sữa Gong Cha 55k với bạn, tối về Grab 90k',
    'nhậu với mấy đứa bạn hết 2 xị, bay 5 lít tiền net, chuyển khoản 1tr550 cho mẹ'
  ],
  ITERATIONS: 3,
  TIMEOUT: 30000, // 30 seconds
};

// Performance metrics
const metrics = {
  streaming: {
    total_time: [],
    first_response_time: [],
    completion_times: [],
    token_counts: [],
    errors: 0
  },
  non_streaming: {
    total_time: [],
    first_response_time: [],
    completion_times: [],
    token_counts: [],
    errors: 0
  }
};

// Test streaming endpoint
async function testStreaming(text, iteration) {
  console.log(`\n🌊 Testing Streaming - Iteration ${iteration + 1}: "${text.substring(0, 30)}..."`);
  
  const startTime = performance.now();
  let firstResponseTime = null;
  let completionTime = null;
  let transactionCount = 0;
  
  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        user_preferences: {
          currency: 'VND',
        },
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              completionTime = performance.now() - startTime;
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'transaction' && firstResponseTime === null) {
                firstResponseTime = performance.now() - startTime;
                console.log(`  ⚡ First transaction received in ${firstResponseTime.toFixed(2)}ms`);
              }
              
              if (parsed.type === 'transaction') {
                transactionCount++;
                console.log(`  📝 Transaction ${transactionCount}: ${parsed.data.description} (${parsed.data.amount} VND)`);
              }
              
              if (parsed.type === 'final') {
                completionTime = performance.now() - startTime;
                console.log(`  ✅ Final result received in ${completionTime.toFixed(2)}ms`);
                console.log(`  📊 Total transactions: ${parsed.data.transactions.length}`);
                break;
              }
              
            } catch (parseError) {
              // Skip parsing errors for streaming chunks
            }
          }
        }
      }
      
      reader.releaseLock();
    }

    const totalTime = performance.now() - startTime;
    
    metrics.streaming.total_time.push(totalTime);
    metrics.streaming.first_response_time.push(firstResponseTime || totalTime);
    metrics.streaming.completion_times.push(completionTime || totalTime);
    
    console.log(`  🏁 Total time: ${totalTime.toFixed(2)}ms`);
    
  } catch (error) {
    console.error(`  ❌ Streaming error:`, error.message);
    metrics.streaming.errors++;
  }
}

// Test non-streaming endpoint
async function testNonStreaming(text, iteration) {
  console.log(`\n📄 Testing Non-Streaming - Iteration ${iteration + 1}: "${text.substring(0, 30)}..."`);
  
  const startTime = performance.now();
  
  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        user_preferences: {
          currency: 'VND',
        },
        stream: false, // Disable streaming
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const totalTime = performance.now() - startTime;
    
    if (result.success && result.data) {
      console.log(`  📊 Found ${result.data.transactions.length} transactions`);
      result.data.transactions.forEach((t, i) => {
        console.log(`  📝 Transaction ${i + 1}: ${t.description} (${t.amount} VND)`);
      });
    }
    
    metrics.non_streaming.total_time.push(totalTime);
    metrics.non_streaming.first_response_time.push(totalTime); // Same as total for non-streaming
    metrics.non_streaming.completion_times.push(totalTime);
    
    console.log(`  🏁 Total time: ${totalTime.toFixed(2)}ms`);
    
  } catch (error) {
    console.error(`  ❌ Non-streaming error:`, error.message);
    metrics.non_streaming.errors++;
  }
}

// Calculate statistics
function calculateStats(times) {
  if (times.length === 0) return { avg: 0, min: 0, max: 0, median: 0 };
  
  const sorted = [...times].sort((a, b) => a - b);
  return {
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: sorted[Math.floor(sorted.length / 2)]
  };
}

// Generate performance report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('STREAMING PERFORMANCE TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log('\n📊 STREAMING RESULTS:');
  console.log(`  Tests run: ${metrics.streaming.total_time.length}`);
  console.log(`  Errors: ${metrics.streaming.errors}`);
  
  const streamingTotal = calculateStats(metrics.streaming.total_time);
  const streamingFirst = calculateStats(metrics.streaming.first_response_time);
  
  console.log(`  Total time - Avg: ${streamingTotal.avg.toFixed(2)}ms, Min: ${streamingTotal.min.toFixed(2)}ms, Max: ${streamingTotal.max.toFixed(2)}ms`);
  console.log(`  First response - Avg: ${streamingFirst.avg.toFixed(2)}ms, Min: ${streamingFirst.min.toFixed(2)}ms, Max: ${streamingFirst.max.toFixed(2)}ms`);
  
  console.log('\n📄 NON-STREAMING RESULTS:');
  console.log(`  Tests run: ${metrics.non_streaming.total_time.length}`);
  console.log(`  Errors: ${metrics.non_streaming.errors}`);
  
  const nonStreamingTotal = calculateStats(metrics.non_streaming.total_time);
  
  console.log(`  Total time - Avg: ${nonStreamingTotal.avg.toFixed(2)}ms, Min: ${nonStreamingTotal.min.toFixed(2)}ms, Max: ${nonStreamingTotal.max.toFixed(2)}ms`);
  
  console.log('\n⚡ PERFORMANCE COMPARISON:');
  if (streamingFirst.avg > 0 && nonStreamingTotal.avg > 0) {
    const improvementRatio = nonStreamingTotal.avg / streamingFirst.avg;
    const totalTimeComparison = nonStreamingTotal.avg / streamingTotal.avg;
    
    console.log(`  Time to first result: ${improvementRatio.toFixed(2)}x faster with streaming`);
    console.log(`  Total completion time: ${totalTimeComparison > 1 ? 'Streaming slower' : 'Streaming faster'} by ${Math.abs(1 - totalTimeComparison).toFixed(2)}x`);
    
    if (improvementRatio > 1.5) {
      console.log('  🎉 SIGNIFICANT IMPROVEMENT: Streaming provides substantial UX benefits!');
    } else if (improvementRatio > 1.2) {
      console.log('  ✅ GOOD IMPROVEMENT: Streaming provides noticeable UX benefits');
    } else {
      console.log('  ⚠️  MARGINAL IMPROVEMENT: Consider optimizing streaming implementation');
    }
  }
  
  // Save detailed results
  const reportData = {
    timestamp: new Date().toISOString(),
    test_cases: CONFIG.TEST_CASES,
    iterations: CONFIG.ITERATIONS,
    metrics: {
      streaming: {
        ...metrics.streaming,
        stats: {
          total_time: streamingTotal,
          first_response: streamingFirst
        }
      },
      non_streaming: {
        ...metrics.non_streaming,
        stats: {
          total_time: nonStreamingTotal
        }
      }
    },
    conclusions: {
      first_response_improvement: streamingFirst.avg > 0 && nonStreamingTotal.avg > 0 ? 
        nonStreamingTotal.avg / streamingFirst.avg : null,
      total_time_comparison: streamingTotal.avg > 0 && nonStreamingTotal.avg > 0 ? 
        nonStreamingTotal.avg / streamingTotal.avg : null
    }
  };
  
  return reportData;
}

// Main execution
async function main() {
  console.log('🚀 Starting Streaming Performance Test Suite...\n');
  console.log(`Test cases: ${CONFIG.TEST_CASES.length}`);
  console.log(`Iterations per case: ${CONFIG.ITERATIONS}`);
  console.log(`Total tests: ${CONFIG.TEST_CASES.length * CONFIG.ITERATIONS * 2} (streaming + non-streaming)\n`);
  
  // Test both streaming and non-streaming for each case
  for (let i = 0; i < CONFIG.ITERATIONS; i++) {
    console.log(`\n📋 ITERATION ${i + 1}/${CONFIG.ITERATIONS}`);
    console.log('='.repeat(40));
    
    for (const testCase of CONFIG.TEST_CASES) {
      // Test streaming first
      await testStreaming(testCase, i);
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test non-streaming
      await testNonStreaming(testCase, i);
      
      // Wait between test cases
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Generate and save report
  const report = generateReport();
  
  const resultsDir = path.join(__dirname, '../test-results');
  await fs.mkdir(resultsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(resultsDir, `streaming-performance-${timestamp}.json`);
  
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📁 Detailed results saved to: ${reportFile}`);
  
  // Return success/failure based on results
  const hasSignificantImprovement = report.conclusions.first_response_improvement > 1.5;
  process.exit(hasSignificantImprovement ? 0 : 1);
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { main };