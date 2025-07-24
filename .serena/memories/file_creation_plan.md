# File Creation Plan

## 1. lib/gemini-key-manager.js
- GeminiKeyManager class
- Key rotation logic
- Rate limit tracking
- Health monitoring

## 2. lib/rate-limiter.js  
- Request throttling
- Exponential backoff
- Queue management
- Response header parsing

## 3. Update route.ts
- Integrate key manager
- Add rate limiting middleware
- Improve error handling

## 4. Update test-ai-prompt.js
- Better retry logic
- Rate limit awareness
- Progress tracking