// src/lib/rate-limiter.ts
// Advanced rate limiting and request management utilities

interface RateLimiterOptions {
  maxRequestsPerSecond?: number;
  maxConcurrentRequests?: number;
  baseDelay?: number;
  maxBackoffDelay?: number;
  jitterFactor?: number;
}

interface RateLimiterStatus {
  activeRequests: number;
  maxConcurrentRequests: number;
  consecutiveErrors: number;
  lastRequestTime: number;
  queuedRequests: number;
  estimatedDelay: number;
}

interface RateLimitHeaders {
  limit: number | null;
  remaining: number | null;
  reset: number | null;
  retryAfter: number | null;
}

interface BatchRequest<T> {
  request: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
}

interface BatchData<T> {
  requests: BatchRequest<T>[];
  timer: NodeJS.Timeout | null;
  promise: Promise<any> | null;
}

export class RateLimiter {
  private options: Required<RateLimiterOptions>;
  private activeRequests: number;
  private requestQueue: any[];
  private lastRequestTime: number;
  private consecutiveErrors: number;

  constructor(options: RateLimiterOptions = {}) {
    this.options = {
      maxRequestsPerSecond: 2, // Conservative rate
      maxConcurrentRequests: 3,
      baseDelay: 1000, // Base delay between requests
      maxBackoffDelay: 30000, // Maximum backoff delay
      jitterFactor: 0.1, // Add randomness to delays
      ...options
    };
    
    this.activeRequests = 0;
    this.requestQueue = [];
    this.lastRequestTime = 0;
    this.consecutiveErrors = 0;
  }
  
  // Calculate dynamic delay based on current state
  calculateDelay(): number {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.options.maxRequestsPerSecond;
    
    // Base delay with exponential backoff for errors
    let delay = this.options.baseDelay;
    
    if (this.consecutiveErrors > 0) {
      delay = Math.min(
        this.options.baseDelay * Math.pow(2, this.consecutiveErrors),
        this.options.maxBackoffDelay
      );
    }
    
    // Ensure minimum interval between requests
    if (timeSinceLastRequest < minInterval) {
      delay = Math.max(delay, minInterval - timeSinceLastRequest);
    }
    
    // Add jitter to avoid thundering herd
    const jitter = delay * this.options.jitterFactor * (Math.random() - 0.5);
    delay += jitter;
    
    return Math.max(0, Math.floor(delay));
  }
  
  // Throttle a request with intelligent delays
  async throttleRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    // Wait for available slot
    while (this.activeRequests >= this.options.maxConcurrentRequests) {
      await this.sleep(100);
    }
    
    // Calculate and apply delay
    const delay = this.calculateDelay();
    if (delay > 0) {
      console.log(`⏱️ Rate limiting: waiting ${delay}ms`);
      await this.sleep(delay);
    }
    
    this.activeRequests++;
    this.lastRequestTime = Date.now();
    
    try {
      const result = await requestFn();
      this.consecutiveErrors = 0; // Reset error count on success
      return result;
    } catch (error) {
      this.consecutiveErrors++;
      
      // Handle specific rate limit errors
      if (this.isRateLimitError(error)) {
        console.warn(`🚫 Rate limit detected, backing off...`);
        await this.sleep(this.calculateDelay());
      }
      
      throw error;
    } finally {
      this.activeRequests--;
    }
  }
  
  // Check if error is a rate limit error
  isRateLimitError(error: any): boolean {
    const errorStr = error?.message?.toLowerCase() || '';
    return errorStr.includes('429') ||
           errorStr.includes('too many requests') ||
           errorStr.includes('rate limit') ||
           errorStr.includes('quota');
  }
  
  // Extract rate limit info from response headers
  parseRateLimitHeaders(headers: Record<string, string>): RateLimitHeaders {
    return {
      limit: parseInt(headers['x-ratelimit-limit']) || null,
      remaining: parseInt(headers['x-ratelimit-remaining']) || null,
      reset: parseInt(headers['x-ratelimit-reset']) || null,
      retryAfter: parseInt(headers['retry-after']) || null
    };
  }
  
  // Batch similar requests to reduce API calls
  createBatcher<T>(
    keyFn: (request: any) => string, 
    batchSize = 5, 
    maxWaitTime = 2000
  ): (request: () => Promise<T>) => Promise<T> {
    const batches = new Map<string, BatchData<T>>();
    
    return async (request: () => Promise<T>): Promise<T> => {
      const key = keyFn(request);
      
      if (!batches.has(key)) {
        batches.set(key, {
          requests: [],
          timer: null,
          promise: null
        });
      }
      
      const batch = batches.get(key)!;
      
      return new Promise<T>((resolve, reject) => {
        batch.requests.push({ request, resolve, reject });
        
        // Process batch when full or after timeout
        if (batch.requests.length >= batchSize) {
          this.processBatch(batch, key, batches);
        } else if (!batch.timer) {
          batch.timer = setTimeout(() => {
            this.processBatch(batch, key, batches);
          }, maxWaitTime);
        }
      });
    };
  }
  
  // Process a batch of requests
  private async processBatch<T>(
    batch: BatchData<T>, 
    key: string, 
    batches: Map<string, BatchData<T>>
  ): Promise<void> {
    if (batch.timer) {
      clearTimeout(batch.timer);
    }
    
    const requests = batch.requests.splice(0);
    batches.delete(key);
    
    try {
      // Execute all requests in the batch
      const results = await Promise.allSettled(
        requests.map(({ request }) => request())
      );
      
      // Resolve individual promises
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          requests[index].resolve(result.value);
        } else {
          requests[index].reject(result.reason);
        }
      });
    } catch (error) {
      // If batch processing fails, reject all requests
      requests.forEach(({ reject }) => reject(error));
    }
  }
  
  // Get current rate limiter status
  getStatus(): RateLimiterStatus {
    return {
      activeRequests: this.activeRequests,
      maxConcurrentRequests: this.options.maxConcurrentRequests,
      consecutiveErrors: this.consecutiveErrors,
      lastRequestTime: this.lastRequestTime,
      queuedRequests: this.requestQueue.length,
      estimatedDelay: this.calculateDelay()
    };
  }
  
  // Reset error counters
  reset(): void {
    this.consecutiveErrors = 0;
    this.activeRequests = 0;
    this.requestQueue = [];
  }
  
  // Utility sleep function
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface RequestCacheOptions {
  maxSize?: number;
  ttl?: number;
}

interface CacheEntry<T> {
  result: T;
  expiresAt: number;
  createdAt: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
}

// Create a cache for repeated requests
export class RequestCache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private options: Required<RequestCacheOptions>;
  private hitCount: number;
  private missCount: number;

  constructor(options: RequestCacheOptions = {}) {
    this.cache = new Map();
    this.options = {
      maxSize: 1000,
      ttl: 300000, // 5 minutes default TTL
      ...options
    };
    this.hitCount = 0;
    this.missCount = 0;
  }
  
  // Generate cache key from request
  generateKey(input: any): string {
    // Create a stable hash of the input
    return JSON.stringify(input).replace(/\s+/g, ' ').trim().toLowerCase();
  }
  
  // Get cached result
  get(input: any): T | null {
    const key = this.generateKey(input);
    const cached = this.cache.get(key);
    
    if (!cached) {
      this.missCount++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }
    
    this.hitCount++;
    console.log(`💾 Cache hit for input: ${String(input).substring(0, 50)}...`);
    return cached.result;
  }
  
  // Set cached result
  set(input: any, result: T): void {
    const key = this.generateKey(input);
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.options.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + this.options.ttl,
      createdAt: Date.now()
    });
    
    console.log(`💾 Cached result for input: ${String(input).substring(0, 50)}...`);
  }
  
  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
  
  // Get cache statistics
  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }
}