import { GoogleGenerativeAI } from '@google/generative-ai';
import { PromptService } from './promptService';

/**
 * AI Parsing Service
 * 
 * Handles all AI-related operations for transaction parsing including:
 * - Gemini API interactions
 * - Prompt building and optimization
 * - Streaming and non-streaming responses
 * - Key rotation and rate limiting integration
 */

export interface AIParsingConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  model?: string;
}

export interface PromptData {
  inputText: string;
  categories: any[];
  wallets: any[];
  userCorrections?: any[];
  version?: string;
  debugMode?: boolean;
}

export interface CacheManager {
  get(key: string): any;
  set(key: string, value: any): void;
}

export interface KeyManager {
  queueRequest<T>(requestFn: (apiKey?: string) => Promise<T>): Promise<T>;
  printStatus(): void;
}

export interface RateLimiter {
  throttleRequest<T>(requestFn: () => Promise<T>): Promise<T>;
}

export class AIParsingService {
  private defaultConfig: AIParsingConfig = {
    temperature: 0.1,
    topK: 1,
    topP: 0.1,
    maxOutputTokens: 2048,
    model: "gemini-2.5-flash"
  };

  constructor(
    private keyManager?: KeyManager,
    private rateLimiter?: RateLimiter,
    private requestCache?: CacheManager
  ) {}

  /**
   * Build optimized AI prompt for transaction parsing
   */
  async buildPrompt(data: PromptData): Promise<string> {
    // Optimize category mapping - only include relevant categories based on input text
    const relevantCategories = this.getRelevantCategories(data.inputText, data.categories);

    // Build user correction context - limit to most recent and relevant
    const relevantCorrections = (data.userCorrections || [])
      .filter((c) => c.input_text && c.corrected_category)
      .slice(0, 5); // Limit to 5 most recent corrections

    const correctionContext = relevantCorrections.length > 0
      ? `\nRecent Corrections (learn from these patterns):\n${relevantCorrections
          .map((c) => `"${c.input_text.substring(0, 50)}" -> ${c.corrected_category}`)
          .join(" ")}`
      : "";

    // Use the prompt service to generate the prompt
    return await PromptService.getTransactionParsingPrompt({
      inputText: data.inputText,
      categories: relevantCategories,
      wallets: data.wallets.slice(0, 5), // Limit to 5 wallets
      correctionContext,
      version: data.version || "3.6",
      debugMode: data.debugMode || process.env.NODE_ENV === "development"
    });
  }

  /**
   * Make request to Gemini API with caching and rate limiting
   */
  async makeRequest(
    prompt: string, 
    options: {
      streaming?: boolean;
      disableCache?: boolean;
      config?: AIParsingConfig;
    } = {}
  ) {
    const { streaming = false, disableCache = false, config = {} } = options;
    const finalConfig = { ...this.defaultConfig, ...config };

    // Create cache key
    const inputTextMatch = prompt.match(/TEXT TO PARSE: "([^"]+)"/);
    const inputText = inputTextMatch ? inputTextMatch[1] : prompt.substring(0, 100);
    const cacheKey = streaming || disableCache ? null : `ai_cache_${inputText}_${prompt.length}`;

    // Check cache first for non-streaming requests
    if (!streaming && !disableCache && this.requestCache && cacheKey) {
      const cached = this.requestCache.get(cacheKey);
      if (cached) {
        console.log(`🎯 AI Cache hit for: "${inputText}"`);
        return cached;
      }
    }

    // Create request function
    const requestFn = async (apiKey?: string) => {
      const currentKey = apiKey || process.env.GEMINI_API_KEY || "";
      if (!currentKey) {
        throw new Error("No Gemini API key available");
      }

      const genAI = new GoogleGenerativeAI(currentKey);
      const model = genAI.getGenerativeModel({ model: finalConfig.model! });

      const generationConfig = {
        temperature: finalConfig.temperature,
        topK: finalConfig.topK,
        topP: finalConfig.topP,
        maxOutputTokens: finalConfig.maxOutputTokens,
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

    // Execute request with rate limiting and key rotation
    let result;

    if (this.keyManager && this.rateLimiter) {
      try {
        this.keyManager.printStatus();
        result = await this.rateLimiter.throttleRequest(async () => {
          return await this.keyManager!.queueRequest(requestFn);
        });
      } catch (error) {
        console.error("🚫 Key manager request failed:", error);
        console.log("🔄 Falling back to single key with rate limiting...");
        result = await this.rateLimiter.throttleRequest(() => requestFn());
      }
    } else {
      console.log("🔄 Using single key fallback...");
      result = await requestFn();
    }

    // Cache non-streaming results
    if (!streaming && !disableCache && this.requestCache && cacheKey && result) {
      console.log(`💾 Caching AI result for: "${inputText}"`);
      this.requestCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Get relevant categories based on input text to optimize prompt size
   */
  private getRelevantCategories(inputText: string, categories: any[]): any[] {
    if (!categories || categories.length === 0) return [];

    const text = inputText.toLowerCase();
    const relevantCategories = [];

    // Always include common categories that are frequently used
    const commonCategories = categories.filter(cat => 
      ['ăn uống', 'đi lại', 'mua sắm', 'lương', 'thưởng'].some(common =>
        cat.name_vi?.toLowerCase().includes(common) || 
        cat.name_en?.toLowerCase().includes(common)
      )
    );
    relevantCategories.push(...commonCategories);

    // Add categories that match keywords in the input text
    const keywordMatches = categories.filter(cat => {
      const categoryKeywords = [
        cat.name_vi?.toLowerCase(),
        cat.name_en?.toLowerCase(),
        cat.category_key?.toLowerCase(),
        cat.description_vi?.toLowerCase(),
        cat.description_en?.toLowerCase()
      ].filter(Boolean);

      return categoryKeywords.some(keyword => 
        keyword && (text.includes(keyword) || keyword.includes(text.split(' ')[0]))
      );
    });
    relevantCategories.push(...keywordMatches);

    // Remove duplicates and limit to reasonable number
    const uniqueCategories = Array.from(
      new Map(relevantCategories.map(cat => [cat.id, cat])).values()
    );

    // If we have too few relevant categories, add some random ones to ensure AI has options
    if (uniqueCategories.length < 5) {
      const remaining = categories.filter(cat => 
        !uniqueCategories.some(relevant => relevant.id === cat.id)
      );
      uniqueCategories.push(...remaining.slice(0, 10 - uniqueCategories.length));
    }

    return uniqueCategories.slice(0, 15); // Limit to 15 categories max
  }

  /**
   * Estimate number of transactions in input text for progress tracking
   */
  estimateTransactionCount(inputText: string): number {
    if (!inputText || inputText.trim().length === 0) return 0;

    const text = inputText.toLowerCase();
    
    // Count explicit transaction indicators
    const transactionPatterns = [
      /(?:^|[,\.]|\s)(?:ăn|uống|mua|chi|tiêu|nhận|được|trả|nộp|đóng|taxi|grab|bơm)\s/g,
      /\d+(?:k|tr|triệu|đồng|vnd)/g,
      /(?:sáng|trưa|chiều|tối|đêm)\s/g,
      /(?:hôm\s+qua|hôm\s+nay|ngày\s+mai)/g
    ];

    let totalMatches = 0;
    transactionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) totalMatches += matches.length;
    });

    // Estimate based on separators and context
    const separators = text.match(/[,;]/g);
    const separatorCount = separators ? separators.length : 0;
    
    // Use heuristic: more separators usually mean more transactions
    const estimatedFromSeparators = separatorCount > 0 ? separatorCount + 1 : 1;
    const estimatedFromPatterns = Math.max(1, Math.ceil(totalMatches / 2));
    
    // Take average but ensure minimum of 1
    return Math.max(1, Math.ceil((estimatedFromSeparators + estimatedFromPatterns) / 2));
  }

  /**
   * Configure the service with new settings
   */
  configure(config: AIParsingConfig) {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIParsingConfig {
    return { ...this.defaultConfig };
  }
}