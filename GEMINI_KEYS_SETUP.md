# Gemini API Key Rotation Setup

This guide explains how to set up multiple Gemini API keys to avoid rate limiting (429 errors) when testing the AI prompt system.

## Overview

The system now supports automatic key rotation with the following features:
- ✅ **Key Rotation**: Automatically switches between multiple API keys
- ✅ **Rate Limiting**: Intelligent delays and backoff strategies
- ✅ **Error Handling**: Automatic retry with different keys on 429 errors
- ✅ **Request Caching**: Reduces duplicate API calls
- ✅ **Monitoring**: Real-time status of all keys

## Environment Variable Setup

### Method 1: Individual Keys (Recommended)
Set multiple environment variables for your API keys:

```bash
# Primary key
export GEMINI_API_KEY="your-first-api-key-here"

# Additional keys
export GEMINI_API_KEY2="your-second-api-key-here"
export GEMINI_API_KEY3="your-third-api-key-here"
export GEMINI_API_KEY4="your-fourth-api-key-here"
# ... up to GEMINI_API_KEY10
```

### Method 2: Comma-Separated Keys
Alternatively, use a single variable with comma-separated keys:

```bash
export GEMINI_API_KEYS="key1,key2,key3,key4"
```

### Method 3: .env File
Add to your `.env` file:

```env
GEMINI_API_KEY=your-first-api-key-here
GEMINI_API_KEY2=your-second-api-key-here
GEMINI_API_KEY3=your-third-api-key-here
GEMINI_API_KEY4=your-fourth-api-key-here
```

## Getting Multiple API Keys

1. **Visit Google AI Studio**: https://aistudio.google.com/
2. **Create multiple projects** (each can have its own API key)
3. **Generate API keys** for each project
4. **Different Google accounts** can also be used for additional keys

## Key Manager Configuration

The system automatically detects and uses all available keys. You can customize the behavior:

### Rate Limiting Settings
- **Free Tier Limit**: 10 requests per minute per key
- **Cooldown Period**: 70 seconds after hitting rate limit
- **Max Failures**: 5 failures before disabling a key
- **Reset Interval**: 60 seconds (rate limit window)

### Advanced Configuration
Modify the key manager settings in `/src/lib/gemini-key-manager.js`:

```javascript
const keyManager = new GeminiKeyManager(keys, {
  maxRequestsPerMinute: 10,     // Gemini free tier limit
  cooldownDuration: 70000,      // 70 seconds cooldown
  maxFailures: 5,               // Disable key after failures
  resetInterval: 60000,         // 1 minute rate limit window
})
```

## Testing the Setup

### 1. Check Key Detection
Start your development server and look for this log message:
```
🔧 Initialized Gemini Key Manager with X API key(s)
```

### 2. Run the Test Suite
```bash
node scripts/test-ai-prompt.js
```

### 3. Monitor Key Usage
The system logs key rotation status:
```
🔑 Key used: AIzaSyBxxx... (3/10)
⏰ Key AIzaSyBxxx... hit rate limit, cooling down for 70s
→ ✅ AIzaSyByyy... - 1/10
  ⏰ AIzaSyBxxx... - 10/10 (cooldown: 65s)
```

## Troubleshooting

### No Keys Detected
```
⚠️ Failed to initialize key manager, falling back to single key
```
**Solution**: Check your environment variables are set correctly.

### Rate Limit Errors Still Occurring
```
🚫 All keys exhausted, waiting 45s for next available key...
```
**Solution**: Add more API keys or wait for the cooldown period to expire.

### Key Disabled Due to Errors
```
❌ Key AIzaSyBxxx... disabled after 5 failures
```
**Solution**: Check if the API key is valid and has proper permissions.

## Best Practices

1. **Use 4-6 API Keys**: This provides good coverage for testing without hitting limits
2. **Monitor Usage**: Watch the console logs to understand key rotation patterns
3. **Respect Rate Limits**: The system is designed to work within Gemini's free tier limits
4. **Test Gradually**: Start with fewer test cases when setting up new keys
5. **Rotate Keys Regularly**: Consider regenerating API keys periodically for security

## Integration with CI/CD

For automated testing environments, set up keys as secrets:

### GitHub Actions
```yaml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  GEMINI_API_KEY2: ${{ secrets.GEMINI_API_KEY2 }}
  GEMINI_API_KEY3: ${{ secrets.GEMINI_API_KEY3 }}
```

### Docker
```dockerfile
ENV GEMINI_API_KEY=${GEMINI_API_KEY}
ENV GEMINI_API_KEY2=${GEMINI_API_KEY2}
ENV GEMINI_API_KEY3=${GEMINI_API_KEY3}
```

## Architecture Overview

The system uses three layers of rate limiting:

1. **Key Manager**: Rotates between available keys
2. **API Route**: Server-side rate limiting and caching
3. **Test Script**: Client-side delays to prevent overwhelming

This multi-layered approach ensures robust handling of rate limits while maintaining good performance.

## Status Monitoring

Check the current status of all keys:
```javascript
// In your code or browser console
keyManager.printStatus()
```

This shows:
- Total keys available
- Active vs disabled keys
- Current usage per key
- Cooldown status
- Queued requests