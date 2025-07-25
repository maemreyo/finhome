/**
 * Type definitions and schemas for transaction parsing API
 * 
 * Centralizes all TypeScript interfaces and Zod schemas
 */

import { z } from 'zod';

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export interface User {
  id: string;
  email?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name_vi: string;
  name_en: string;
  category_key: string;
  description_vi?: string;
  description_en?: string;
  parent_id?: string;
  is_active: boolean;
  user_id: string;
  created_at?: string;
}

export interface Wallet {
  id: string;
  name: string;
  wallet_type: string;
  currency: string;
  balance?: number;
  is_active: boolean;
  user_id: string;
  created_at?: string;
}

export interface Transaction {
  id?: string;
  user_id: string;
  transaction_type: 'expense' | 'income' | 'transfer';
  amount: number;
  description: string;
  transaction_date: string;
  expense_category_id?: string;
  income_category_id?: string;
  wallet_id?: string;
  tags?: string[];
  merchant?: string;
  notes?: string;
  confidence_score?: number;
  is_unusual?: boolean;
  unusual_reasons?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserCorrection {
  id: string;
  user_id: string;
  input_text: string;
  original_category: string;
  corrected_category: string;
  correction_type: string;
  feedback_notes?: string;
  created_at: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ParseTextRequest {
  text: string;
  streaming?: boolean;
  version?: string;
  debug?: boolean;
  save_to_database?: boolean;
}

export interface ParsedTransaction {
  transaction_type: 'expense' | 'income' | 'transfer';
  amount: number;
  description: string;
  suggested_category_id?: string;
  suggested_category_name?: string;
  suggested_tags?: string[];
  suggested_wallet_id?: string;
  confidence_score: number;
  extracted_merchant?: string;
  extracted_date?: string;
  notes?: string;
  validation_passed?: boolean;
  confidence_reasoning?: string;
}

export interface ParsedResponse {
  transactions: ParsedTransaction[];
  analysis_summary: string;
  parsing_metadata: ParsingMetadata;
}

export interface ParsingMetadata {
  total_transactions_found: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  low_confidence_count: number;
  average_confidence: number;
  parsing_quality: 'excellent' | 'good' | 'needs_review' | 'failed';
  validation_checks_passed: number;
  potential_issues: string[];
  fallback_risk: 'low' | 'medium' | 'high' | 'critical';
  fallback_method?: string;
  enhancement_applied?: boolean;
  processing_time_ms?: number;
  debug_info?: {
    response_length: number;
    response_preview: string;
    original_input: string;
    prompt_version?: string;
  };
  time_expressions_found?: string[];
  dates_calculated?: string[];
}

// ============================================================================
// SERVICE CONFIGURATION TYPES
// ============================================================================

export interface AIParsingConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  model?: string;
}

export interface ValidationConfig {
  largeAmountThreshold?: number;
  lowConfidenceThreshold?: number;
  spendingAnalysisMonths?: number;
  standardDeviationMultiplier?: number;
  averageMultiplier?: number;
}

export interface PromptData {
  inputText: string;
  categories: Category[];
  wallets: Wallet[];
  userCorrections?: UserCorrection[];
  version?: string;
  debugMode?: boolean;
  correctionContext?: string;
}

// ============================================================================
// EXTERNAL SERVICE INTERFACES
// ============================================================================

export interface DatabaseClient {
  from(table: string): any;
  auth: {
    getUser(): Promise<{ data: { user: any | null }; error: any }>;
  };
}

export interface CacheManager {
  get(key: string): any;
  set(key: string, value: any, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
}

export interface KeyManager {
  queueRequest<T>(requestFn: (apiKey?: string) => Promise<T>): Promise<T>;
  printStatus(): void;
  getActiveKeyCount(): number;
}

export interface RateLimiter {
  throttleRequest<T>(requestFn: () => Promise<T>): Promise<T>;
  getRemainingRequests(): number;
  getResetTime(): number;
}

export interface VietnameseExtractor {
  extract(text: string): ParsedTransaction[];
  configure(options: any): void;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const TransactionTypeSchema = z.enum(['expense', 'income', 'transfer']);

export const ParsedTransactionSchema = z.object({
  transaction_type: TransactionTypeSchema,
  amount: z.number().positive(),
  description: z.string().min(1).max(200),
  suggested_category_id: z.string().uuid().optional(),
  suggested_category_name: z.string().optional(),
  suggested_tags: z.array(z.string()).optional(),
  suggested_wallet_id: z.string().uuid().optional(),
  confidence_score: z.number().min(0).max(1),
  extracted_merchant: z.string().max(100).optional(),
  extracted_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(500).optional(),
  validation_passed: z.boolean().optional(),
  confidence_reasoning: z.string().optional()
});

export const ParsingMetadataSchema = z.object({
  total_transactions_found: z.number().min(0),
  high_confidence_count: z.number().min(0),
  medium_confidence_count: z.number().min(0),
  low_confidence_count: z.number().min(0),
  average_confidence: z.number().min(0).max(1),
  parsing_quality: z.enum(['excellent', 'good', 'needs_review', 'failed']),
  validation_checks_passed: z.number().min(0),
  potential_issues: z.array(z.string()),
  fallback_risk: z.enum(['low', 'medium', 'high', 'critical']),
  fallback_method: z.string().optional(),
  enhancement_applied: z.boolean().optional(),
  processing_time_ms: z.number().optional(),
  debug_info: z.object({
    response_length: z.number(),
    response_preview: z.string(),
    original_input: z.string(),
    prompt_version: z.string().optional()
  }).optional(),
  time_expressions_found: z.array(z.string()).optional(),
  dates_calculated: z.array(z.string()).optional()
});

export const ParsedResponseSchema = z.object({
  transactions: z.array(ParsedTransactionSchema),
  analysis_summary: z.string(),
  parsing_metadata: ParsingMetadataSchema
});

export const ParseTextRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  streaming: z.boolean().optional(),
  version: z.string().optional(),
  debug: z.boolean().optional(),
  save_to_database: z.boolean().optional()
});

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name_vi: z.string(),
  name_en: z.string(),
  category_key: z.string(),
  description_vi: z.string().optional(),
  description_en: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  is_active: z.boolean(),
  user_id: z.string().uuid(),
  created_at: z.string().optional()
});

export const WalletSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  wallet_type: z.string(),
  currency: z.string(),
  balance: z.number().optional(),
  is_active: z.boolean(),
  user_id: z.string().uuid(),
  created_at: z.string().optional()
});

export const TransactionSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  transaction_type: TransactionTypeSchema,
  amount: z.number().positive(),
  description: z.string().min(1).max(200),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expense_category_id: z.string().uuid().optional(),
  income_category_id: z.string().uuid().optional(),
  wallet_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  merchant: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  is_unusual: z.boolean().optional(),
  unusual_reasons: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ServiceError extends Error {
  code: string;
  service: string;
  details?: any;
  recoverable: boolean;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    timestamp?: string;
    processing_time_ms?: number;
    performance?: any;
    validation_errors?: ValidationError[];
    details?: any;
  };
}

export interface StreamingResponse {
  type: 'progress' | 'transactions' | 'error' | 'complete';
  step?: string;
  progress?: number;
  message?: string;
  transactions?: ParsedTransaction[];
  metadata?: ParsingMetadata;
  error?: string;
  details?: any;
  summary?: any;
  timestamp: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type TransactionType = 'expense' | 'income' | 'transfer';
export type ParsingQuality = 'excellent' | 'good' | 'needs_review' | 'failed';
export type FallbackRisk = 'low' | 'medium' | 'high' | 'critical';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface TransactionSummary {
  total: number;
  by_type: Record<TransactionType, number>;
  total_amount: Record<TransactionType, number>;
  confidence_stats: Record<ConfidenceLevel, number>;
  unusual_count: number;
  average_confidence: number;
  completeness_average: number;
}

export interface SpendingPattern {
  category_id: string;
  average_amount: number;
  standard_deviation: number;
  transaction_count: number;
  frequency_per_month: number;
  last_transaction_date: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isTransactionType(value: string): value is TransactionType {
  return ['expense', 'income', 'transfer'].includes(value);
}

export function isParsingQuality(value: string): value is ParsingQuality {
  return ['excellent', 'good', 'needs_review', 'failed'].includes(value);
}

export function isFallbackRisk(value: string): value is FallbackRisk {
  return ['low', 'medium', 'high', 'critical'].includes(value);
}

export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
}

// ============================================================================
// EXPORTS  
// ============================================================================

// Export commonly used types (schemas and api modules don't exist yet)

// Re-export commonly used types
export type {
  User,
  Category,
  Wallet,
  Transaction,
  ParsedTransaction,
  ParsedResponse,
  ParsingMetadata,
  ApiResponse,
  StreamingResponse
};