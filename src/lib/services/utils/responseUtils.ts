/**
 * Response Utilities
 * 
 * Helper functions for API response formatting and error handling
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export class ResponseUtils {
  /**
   * Create successful API response
   */
  static success<T>(data: T, message?: string, metadata?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      metadata
    };
  }

  /**
   * Create error API response
   */
  static error(error: string, details?: any): ApiResponse {
    return {
      success: false,
      error,
      metadata: details ? { details } : undefined
    };
  }

  /**
   * Create validation error response
   */
  static validationError(errors: ValidationError[]): ApiResponse {
    return {
      success: false,
      error: 'Validation failed',
      metadata: {
        validation_errors: errors,
        error_count: errors.length
      }
    };
  }

  /**
   * Format parsing response with metadata - Compatible with existing frontend
   */
  static formatParsingResponse(
    transactions: any[],
    analysisSummary: string,
    parsingMetadata: any,
    processingTimeMs?: number
  ): ApiResponse {
    return this.success({
      transactions,
      analysis_summary: analysisSummary,
      metadata: {  // Changed from parsing_metadata to metadata for frontend compatibility
        ...parsingMetadata,
        response_generated_at: new Date().toISOString(),
        processing_time_ms: processingTimeMs
      }
    });
  }

  /**
   * Handle and format various error types
   */
  static handleError(error: any): ApiResponse {
    console.error('API Error:', error);

    // Database errors
    if (error?.code && error?.message) {
      return this.error(
        'Database operation failed',
        {
          database_error: error.message,
          error_code: error.code,
          timestamp: new Date().toISOString()
        }
      );
    }

    // AI service errors
    if (error?.message?.includes('API key') || error?.message?.includes('quota')) {
      return this.error(
        'AI service temporarily unavailable',
        {
          service_error: 'AI parsing service quota exceeded or key invalid',
          retry_after: 60,
          timestamp: new Date().toISOString()
        }
      );
    }

    // Rate limiting errors
    if (error?.message?.includes('rate limit') || error?.status === 429) {
      return this.error(
        'Rate limit exceeded',
        {
          retry_after: 30,
          message: 'Too many requests. Please wait before trying again.',
          timestamp: new Date().toISOString()
        }
      );
    }

    // Network/timeout errors
    if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
      return this.error(
        'Network connection failed',
        {
          network_error: 'Connection to external service failed',
          suggestion: 'Please check your internet connection and try again',
          timestamp: new Date().toISOString()
        }
      );
    }

    // Generic error fallback
    return this.error(
      'An unexpected error occurred',
      {
        original_error: error?.message || String(error),
        timestamp: new Date().toISOString(),
        suggestion: 'Please try again or contact support if the problem persists'
      }
    );
  }

  /**
   * Create streaming response headers
   */
  static getStreamingHeaders(): Record<string, string> {
    return {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
  }

  /**
   * Format Server-Sent Events (SSE) data
   */
  static formatSSE(data: any, event?: string): string {
    let output = '';
    
    if (event) {
      output += `event: ${event}\n`;
    }
    
    output += `data: ${JSON.stringify(data)}\n\n`;
    return output;
  }

  /**
   * Create progress update for streaming
   */
  static formatProgressUpdate(
    step: string,
    progress: number,
    message: string,
    details?: any
  ): string {
    return this.formatSSE({
      type: 'progress',
      step,
      progress: Math.min(100, Math.max(0, progress)),
      message,
      details,
      timestamp: new Date().toISOString()
    }, 'progress');
  }

  /**
   * Create transaction result for streaming - Compatible with existing frontend
   */
  static formatTransactionResult(transactions: any[], metadata: any): string {
    return this.formatSSE({
      type: 'final',
      data: {
        transactions,
        analysis_summary: metadata.analysis_summary || '',
        metadata  // Use metadata directly for frontend compatibility
      },
      timestamp: new Date().toISOString()
    }, 'final');
  }

  /**
   * Create error event for streaming
   */
  static formatStreamingError(error: string, details?: any): string {
    return this.formatSSE({
      type: 'error',
      error,
      details,
      timestamp: new Date().toISOString()
    }, 'error');
  }

  /**
   * Create completion event for streaming
   */
  static formatStreamingComplete(summary: any): string {
    return this.formatSSE({
      type: 'complete',
      summary,
      timestamp: new Date().toISOString()
    }, 'complete');
  }

  /**
   * Validate request parameters
   */
  static validateTextParsingRequest(body: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    if (!body.text || typeof body.text !== 'string') {
      errors.push({
        field: 'text',
        message: 'Text field is required and must be a string',
        code: 'REQUIRED_FIELD'
      });
    } else if (body.text.trim().length === 0) {
      errors.push({
        field: 'text',
        message: 'Text field cannot be empty',
        code: 'EMPTY_VALUE'
      });
    } else if (body.text.length > 5000) {
      errors.push({
        field: 'text',
        message: 'Text field exceeds maximum length of 5000 characters',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Optional fields validation
    if (body.streaming !== undefined && typeof body.streaming !== 'boolean') {
      errors.push({
        field: 'streaming',
        message: 'Streaming field must be a boolean',
        code: 'INVALID_TYPE'
      });
    }

    if (body.version !== undefined && typeof body.version !== 'string') {
      errors.push({
        field: 'version',
        message: 'Version field must be a string',
        code: 'INVALID_TYPE'
      });
    }

    if (body.debug !== undefined && typeof body.debug !== 'boolean') {
      errors.push({
        field: 'debug',
        message: 'Debug field must be a boolean',
        code: 'INVALID_TYPE'
      });
    }

    return errors;
  }

  /**
   * Sanitize response data for output
   */
  static sanitizeResponseData(data: any): any {
    if (!data) return data;

    // Remove sensitive information
    const sanitized = JSON.parse(JSON.stringify(data));

    // Recursively clean objects
    function cleanObject(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      }

      if (obj && typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          // Skip sensitive keys
          if (['api_key', 'apiKey', 'password', 'token', 'secret'].includes(key.toLowerCase())) {
            continue;
          }

          // Truncate long debug strings
          if (key === 'debug_info' && typeof value === 'string' && value.length > 500) {
            cleaned[key] = value.substring(0, 500) + '... (truncated)';
          } else {
            cleaned[key] = cleanObject(value);
          }
        }
        return cleaned;
      }

      return obj;
    }

    return cleanObject(sanitized);
  }

  /**
   * Add performance metrics to response
   */
  static addPerformanceMetrics(
    response: ApiResponse,
    startTime: number,
    additionalMetrics?: Record<string, any>
  ): ApiResponse {
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    return {
      ...response,
      metadata: {
        ...response.metadata,
        performance: {
          processing_time_ms: processingTime,
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date(endTime).toISOString(),
          ...additionalMetrics
        }
      }
    };
  }

  /**
   * Create rate limit headers
   */
  static getRateLimitHeaders(
    limit: number,
    remaining: number,
    resetTime: number
  ): Record<string, string> {
    return {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
      'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
    };
  }

  /**
   * Log API request/response for debugging
   */
  static logApiCall(
    method: string,
    path: string,
    duration: number,
    statusCode: number,
    requestSize?: number,
    responseSize?: number
  ): void {
    const logData = {
      method,
      path,
      duration_ms: duration,
      status_code: statusCode,
      request_size_bytes: requestSize,
      response_size_bytes: responseSize,
      timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('API Call:', JSON.stringify(logData, null, 2));
    } else {
      console.log(`API ${method} ${path} ${statusCode} ${duration}ms`);
    }
  }

  /**
   * Extract client info from request headers
   */
  static extractClientInfo(headers: Record<string, string | string[] | undefined>): any {
    return {
      user_agent: headers['user-agent'] || 'unknown',
      ip_address: headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
      accept_language: headers['accept-language'] || 'unknown',
      content_type: headers['content-type'] || 'unknown',
      origin: headers['origin'] || 'unknown',
      timestamp: new Date().toISOString()
    };
  }
}