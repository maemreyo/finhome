# Gemini Key Rotation Design

## GeminiKeyManager Features
- Round-robin key rotation
- Rate limit tracking per key
- Automatic key cooldown management
- Request queuing and throttling
- Health monitoring for each key
- Exponential backoff on failures

## Key Rotation Strategy
1. Maintain pool of API keys
2. Track usage and rate limits per key
3. Automatically switch to next available key
4. Cool down keys that hit rate limits
5. Monitor key health and disable failed keys