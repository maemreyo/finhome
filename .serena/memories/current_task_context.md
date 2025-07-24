# Current Task: Gemini API Rate Limiting

## User Request
- Build mechanism to rotate multiple Gemini API keys
- Make it reusable
- Integrate into test-ai-prompt.js
- Suggest and implement additional solutions to avoid 429 errors

## Files to Modify
- scripts/test-ai-prompt.js
- Create new: lib/gemini-key-manager.js
- Modify: src/app/api/expenses/parse-from-text/route.ts

## Implementation Strategy
1. Create reusable GeminiKeyManager class
2. Add to test script
3. Add rate limiting to API route
4. Implement intelligent retry logic