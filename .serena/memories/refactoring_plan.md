# API Refactoring Plan - Separation of Concerns

## Current Issues
- 920+ line route.ts file with mixed concerns
- 33 functions handling different responsibilities
- HTTP logic mixed with business logic

## Service Architecture Plan

### 1. Core Services
- **AIParsingService**: Handles all AI-related operations
- **TransactionValidationService**: Validates and processes transactions  
- **ResponseProcessingService**: Handles parsing and fallback logic
- **DataAccessService**: Database operations

### 2. Utilities
- **TransactionUtils**: Common transaction operations
- **ResponseUtils**: Response formatting utilities

### 3. Types & Schemas
- **types/transactions.ts**: All transaction-related types
- **schemas/validation.ts**: Zod schemas

## Implementation Steps
1. Extract AI service (makeGeminiRequest, buildAIPrompt, etc.)
2. Extract validation service (detectUnusualTransactions, etc.)
3. Extract response processing (parseAIResponseWithFallback, etc.)
4. Create clean route.ts using services
5. Test functionality