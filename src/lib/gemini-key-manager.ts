// src/lib/gemini-key-manager.ts
// Reusable Gemini API key rotation and rate limiting manager

interface ApiKeyData {
  key: string;
  requests: number;
  lastReset: number;
  isActive: boolean;
  lastUsed: number;
  cooldownUntil: number;
  failureCount: number;
}

interface GeminiKeyManagerOptions {
  maxRequestsPerMinute?: number;
  cooldownDuration?: number;
  maxFailures?: number;
  resetInterval?: number;
}

interface KeyStatus {
  id: string;
  isActive: boolean;
  requests: number;
  maxRequests: number;
  inCooldown: boolean;
  cooldownRemaining: number;
  failureCount: number;
  lastUsed: number;
}

interface ManagerStatus {
  totalKeys: number;
  activeKeys: number;
  availableKeys: number;
  queuedRequests: number;
  keys: KeyStatus[];
}

interface QueuedRequest {
  requestFn: (apiKey?: string) => Promise<any>;
  maxRetries: number;
  retryCount: number;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

export class GeminiKeyManager {
  private apiKeys: ApiKeyData[];
  private options: Required<GeminiKeyManagerOptions>;
  private currentKeyIndex: number;
  private requestQueue: QueuedRequest[];
  private isProcessingQueue: boolean;

  constructor(apiKeys: string[] = [], options: GeminiKeyManagerOptions = {}) {
    this.apiKeys = apiKeys.map(key => ({
      key,
      requests: 0,
      lastReset: Date.now(),
      isActive: true,
      lastUsed: 0,
      cooldownUntil: 0,
      failureCount: 0
    }));
    
    this.options = {
      maxRequestsPerMinute: 10, // Gemini free tier limit
      cooldownDuration: 70000, // 70 seconds cooldown after rate limit
      maxFailures: 5, // Disable key after this many failures
      resetInterval: 60000, // 1 minute rate limit window
      ...options
    };
    
    this.currentKeyIndex = 0;
    this.requestQueue = [];
    this.isProcessingQueue = false;
    
    // Start periodic cleanup
    this.startCleanupTimer();
  }
  
  // Add multiple API keys
  addKeys(keys: string[]): void {
    const newKeys: ApiKeyData[] = keys.map(key => ({
      key,
      requests: 0,
      lastReset: Date.now(),
      isActive: true,
      lastUsed: 0,
      cooldownUntil: 0,
      failureCount: 0
    }));
    this.apiKeys.push(...newKeys);
  }
  
  // Get current available API key
  getCurrentKey(): ApiKeyData | null {
    const now = Date.now();
    
    // Find next available key
    for (let i = 0; i < this.apiKeys.length; i++) {
      const keyData = this.apiKeys[this.currentKeyIndex];
      
      // Skip if key is disabled or in cooldown
      if (!keyData.isActive || now < keyData.cooldownUntil) {
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
        continue;
      }
      
      // Reset request count if window has passed
      if (now - keyData.lastReset > this.options.resetInterval) {
        keyData.requests = 0;
        keyData.lastReset = now;
      }
      
      // Check if key is under rate limit
      if (keyData.requests < this.options.maxRequestsPerMinute) {
        return keyData;
      }
      
      // Key is at rate limit, move to next
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    }
    
    return null; // No available keys
  }
  
  // Mark key as used and increment request count
  markKeyUsed(keyData: ApiKeyData): void {
    keyData.requests++;
    keyData.lastUsed = Date.now();
    
    console.log(`🔑 Key used: ${keyData.key.substring(0, 10)}... (${keyData.requests}/${this.options.maxRequestsPerMinute})`);
  }
  
  // Handle rate limit error for a key
  handleRateLimit(keyData: ApiKeyData): void {
    const now = Date.now();
    keyData.cooldownUntil = now + this.options.cooldownDuration;
    keyData.requests = this.options.maxRequestsPerMinute; // Mark as exhausted
    
    console.warn(`⏰ Key ${keyData.key.substring(0, 10)}... hit rate limit, cooling down for ${this.options.cooldownDuration/1000}s`);
    
    // Move to next key
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
  }
  
  // Handle API error for a key
  handleError(keyData: ApiKeyData, error: Error): void {
    keyData.failureCount++;
    
    if (keyData.failureCount >= this.options.maxFailures) {
      keyData.isActive = false;
      console.error(`❌ Key ${keyData.key.substring(0, 10)}... disabled after ${this.options.maxFailures} failures`);
    }
    
    console.warn(`⚠️ Key ${keyData.key.substring(0, 10)}... error (${keyData.failureCount}/${this.options.maxFailures}): ${error.message}`);
  }
  
  // Get next available API key with rotation
  async getNextApiKey(): Promise<string> {
    const keyData = this.getCurrentKey();
    
    if (!keyData) {
      const nextAvailable = this.getNextAvailableTime();
      if (nextAvailable > 0) {
        console.log(`⏳ All keys exhausted, waiting ${Math.ceil(nextAvailable/1000)}s for next available key...`);
        await this.sleep(nextAvailable);
        return this.getNextApiKey(); // Retry after waiting
      }
      throw new Error('No available API keys. All keys are disabled or exhausted.');
    }
    
    this.markKeyUsed(keyData);
    return keyData.key;
  }
  
  // Calculate when next key will be available
  getNextAvailableTime(): number {
    const now = Date.now();
    let minWaitTime = Infinity;
    
    for (const keyData of this.apiKeys) {
      if (!keyData.isActive) continue;
      
      if (now >= keyData.cooldownUntil) {
        // Check if rate limit window has reset
        if (now - keyData.lastReset > this.options.resetInterval) {
          return 0; // This key is immediately available
        }
        
        // Calculate when rate limit window resets
        const resetTime = keyData.lastReset + this.options.resetInterval - now;
        minWaitTime = Math.min(minWaitTime, resetTime);
      } else {
        // Key in cooldown
        const cooldownTime = keyData.cooldownUntil - now;
        minWaitTime = Math.min(minWaitTime, cooldownTime);
      }
    }
    
    return minWaitTime === Infinity ? 0 : minWaitTime;
  }
  
  // Queue a request to be processed when keys are available
  async queueRequest<T>(requestFn: (apiKey?: string) => Promise<T>, maxRetries = 3): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        requestFn,
        maxRetries,
        retryCount: 0,
        resolve,
        reject
      });
      
      this.processQueue();
    });
  }
  
  // Process queued requests
  async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (!request) break;
      
      try {
        const apiKey = await this.getNextApiKey();
        const result = await request.requestFn(apiKey);
        request.resolve(result);
      } catch (error) {
        // Handle specific error types
        if (error instanceof Error && (error.message.includes('429') || error.message.includes('quota'))) {
          // Rate limit error - find the key that caused it and mark it
          const currentKey = this.apiKeys[this.currentKeyIndex];
          this.handleRateLimit(currentKey);
          
          // Retry the request if we have retries left
          if (request.retryCount < request.maxRetries) {
            request.retryCount++;
            this.requestQueue.unshift(request); // Put back at front of queue
            console.log(`🔄 Retrying request (${request.retryCount}/${request.maxRetries})`);
            continue;
          }
        }
        
        request.reject(error);
      }
      
      // Small delay between requests to avoid overwhelming
      await this.sleep(100);
    }
    
    this.isProcessingQueue = false;
  }
  
  // Get status of all keys
  getStatus(): ManagerStatus {
    const now = Date.now();
    return {
      totalKeys: this.apiKeys.length,
      activeKeys: this.apiKeys.filter(k => k.isActive).length,
      availableKeys: this.apiKeys.filter(k => k.isActive && now >= k.cooldownUntil).length,
      queuedRequests: this.requestQueue.length,
      keys: this.apiKeys.map(keyData => ({
        id: keyData.key.substring(0, 10) + '...',
        isActive: keyData.isActive,
        requests: keyData.requests,
        maxRequests: this.options.maxRequestsPerMinute,
        inCooldown: now < keyData.cooldownUntil,
        cooldownRemaining: Math.max(0, keyData.cooldownUntil - now),
        failureCount: keyData.failureCount,
        lastUsed: keyData.lastUsed
      }))
    };
  }
  
  // Print status to console
  printStatus(): void {
    const status = this.getStatus();
    console.log('\n📊 Gemini Key Manager Status:');
    console.log(`   Total Keys: ${status.totalKeys} | Active: ${status.activeKeys} | Available: ${status.availableKeys}`);
    console.log(`   Queued Requests: ${status.queuedRequests}`);
    
    status.keys.forEach((key, index) => {
      const prefix = index === this.currentKeyIndex ? '→' : ' ';
      const statusIcon = !key.isActive ? '❌' : key.inCooldown ? '⏰' : '✅';
      const usage = `${key.requests}/${key.maxRequests}`;
      const cooldown = key.inCooldown ? ` (cooldown: ${Math.ceil(key.cooldownRemaining/1000)}s)` : '';
      
      console.log(`  ${prefix} ${statusIcon} ${key.id} - ${usage}${cooldown}`);
    });
  }
  
  // Cleanup timer to reset counters and cooldowns
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      
      this.apiKeys.forEach(keyData => {
        // Reset request counters for expired windows
        if (now - keyData.lastReset > this.options.resetInterval) {
          keyData.requests = 0;
          keyData.lastReset = now;
        }
        
        // Clear expired cooldowns
        if (keyData.cooldownUntil > 0 && now >= keyData.cooldownUntil) {
          keyData.cooldownUntil = 0;
        }
      });
    }, 10000); // Check every 10 seconds
  }
  
  // Utility sleep function
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Factory function to create manager with environment keys
export function createGeminiKeyManager(): GeminiKeyManager {
  const keys: string[] = [];
  
  // Look for multiple environment variables
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GEMINI_API_KEY${i === 1 ? '' : i}`];
    if (key) {
      keys.push(key);
    }
  }
  
  // Also check for comma-separated keys in a single variable
  const multiKeys = process.env.GEMINI_API_KEYS;
  if (multiKeys) {
    keys.push(...multiKeys.split(',').map(k => k.trim()));
  }
  
  if (keys.length === 0) {
    throw new Error('No Gemini API keys found. Set GEMINI_API_KEY, GEMINI_API_KEY2, etc. or GEMINI_API_KEYS');
  }
  
  console.log(`🔧 Initialized Gemini Key Manager with ${keys.length} API key(s)`);
  return new GeminiKeyManager(keys);
}