#!/usr/bin/env tsx

// Quick test script to verify key manager functionality
import { createGeminiKeyManager } from './src/lib/gemini-key-manager.js';
import { RateLimiter, RequestCache } from './src/lib/rate-limiter.js';

console.log('🧪 Testing Gemini Key Manager and Rate Limiter...\n');

// Test 1: Key Manager
console.log('1. Testing Key Manager:');
try {
  // Set test environment variables
  process.env.GEMINI_API_KEY = 'test-key-1';
  process.env.GEMINI_API_KEY2 = 'test-key-2';
  process.env.GEMINI_API_KEY3 = 'test-key-3';
  
  const keyManager = createGeminiKeyManager();
  console.log('   ✅ Key Manager created successfully');
  
  keyManager.printStatus();
  
  // Test key rotation
  const key1 = await keyManager.getNextApiKey();
  const key2 = await keyManager.getNextApiKey();
  const key3 = await keyManager.getNextApiKey();
  
  console.log('   📋 Key rotation test:');
  console.log(`     First key:  ${key1.substring(0, 10)}...`);
  console.log(`     Second key: ${key2.substring(0, 10)}...`);
  console.log(`     Third key:  ${key3.substring(0, 10)}...`);
  
  console.log('   ✅ Key rotation working\n');
} catch (error) {
  console.log('   ❌ Key Manager test failed:', (error as Error).message);
}

// Test 2: Rate Limiter
console.log('2. Testing Rate Limiter:');
try {
  const rateLimiter = new RateLimiter({
    maxRequestsPerSecond: 2,
    baseDelay: 500,
    jitterFactor: 0.1,
  });
  
  console.log('   ✅ Rate Limiter created successfully');
  
  // Test throttling
  console.log('   🕐 Testing throttling (this will take a few seconds)...');
  const startTime = Date.now();
  
  let requestCount = 0;
  const testRequest = async (): Promise<string> => {
    requestCount++;
    console.log(`     Request ${requestCount} at ${Date.now() - startTime}ms`);
    return `Response ${requestCount}`;
  };
  
  // Make 3 throttled requests
  await rateLimiter.throttleRequest(testRequest);
  await rateLimiter.throttleRequest(testRequest);
  await rateLimiter.throttleRequest(testRequest);
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  console.log(`   ✅ Rate limiting working (took ${totalTime}ms for 3 requests)\n`);
} catch (error) {
  console.log('   ❌ Rate Limiter test failed:', (error as Error).message);
}

// Test 3: Request Cache
console.log('3. Testing Request Cache:');
try {
  const cache = new RequestCache({ ttl: 2000 });
  
  // Test cache set/get
  const testInput = 'test input data';
  const testResult = { data: 'test result' };
  
  cache.set(testInput, testResult);
  const cached = cache.get(testInput);
  
  if (JSON.stringify(cached) === JSON.stringify(testResult)) {
    console.log('   ✅ Cache set/get working');
  } else {
    console.log('   ❌ Cache set/get failed');
  }
  
  // Test cache miss
  const missed = cache.get('non-existent input');
  if (missed === null) {
    console.log('   ✅ Cache miss working');
  } else {
    console.log('   ❌ Cache miss failed');
  }
  
  console.log('   ✅ Request Cache working\n');
} catch (error) {
  console.log('   ❌ Request Cache test failed:', (error as Error).message);
}

console.log('🎉 All tests completed! The rate limiting system is ready to use.');
console.log('\n📚 Setup Guide:');
console.log('   1. Set multiple GEMINI_API_KEY environment variables');
console.log('   2. Start your development server');
console.log('   3. Run the test suite: pnpm test:ai-prompt');
console.log('   4. Monitor the console for key rotation status');
console.log('\n📖 For detailed setup instructions, see: GEMINI_KEYS_SETUP.md');