# 🤖 AI Prompt Management System

This document explains the structured prompt management system implemented for the FinHome expense parsing API.

## 📁 System Overview

### Architecture
```
src/
├── lib/services/promptService.ts    # Core prompt management service
├── app/api/expenses/parse-from-text/ # API route using prompt service
scripts/
├── manage-prompts.ts               # CLI tool for prompt management
prompts/
└── versions/                      # Versioned prompt templates
    ├── transaction-parser-v1.0.txt
    ├── transaction-parser-v2.0.txt
    └── ...
```

### Key Principles
1. **Separation of Concerns (SoC)**: Prompts are separated from business logic
2. **Version Control**: All prompts are versioned for tracking and rollback
3. **Template System**: Dynamic content injection via placeholders
4. **CLI Management**: Easy prompt creation, testing, and management

## 🔧 Using the Prompt System

### 1. List Available Prompts
```bash
pnpm prompts:list
```

### 2. View a Specific Prompt
```bash
pnpm prompts:view transaction-parser-v1.0
```

### 3. Test a Prompt
```bash
pnpm prompts:test transaction-parser-v2.0 "mua trà sữa 25k với bạn"
```

### 4. Create New Prompt Version
```bash
pnpm prompts:create transaction-parser 3.0 "Added support for crypto transactions"
```

## 📝 Prompt Template Structure

### Template Format
```
PROMPT VERSION: 2.0
DATE CREATED: 2025-07-24
DESCRIPTION: Enhanced Vietnamese transaction parsing

[Prompt content with placeholders]
```

### Available Placeholders
- `{CATEGORIES_PLACEHOLDER}` - Injected with available expense/income categories
- `{WALLETS_PLACEHOLDER}` - Injected with user's wallet information
- `{CORRECTION_CONTEXT_PLACEHOLDER}` - User's recent AI corrections for learning
- `{INPUT_TEXT_PLACEHOLDER}` - The actual text to be parsed

## 🚀 Integration in API Routes

### Before (Inline Prompt)
```typescript
// Bad: Hardcoded prompt in API route
const prompt = `You are an expert...
CATEGORIES: ${JSON.stringify(categories)}
TEXT: ${inputText}`
```

### After (Prompt Service)
```typescript
// Good: Using prompt service
const prompt = await PromptService.getTransactionParsingPrompt({
  inputText,
  categories,
  wallets,
  correctionContext,
  version: '2.0'
});
```

## 📊 Prompt Versions

### v1.0 (Initial)
- Basic Vietnamese transaction parsing
- Standard category matching
- Simple tag generation

### v2.0 (Enhanced)
- Improved context handling
- Better confidence scoring
- Enhanced amount parsing (tỷ, mixed formats)
- Semantic category matching
- Quality assurance checks

### Future Versions
- v3.0: Multi-currency support
- v4.0: Advanced context understanding
- v5.0: Personalized parsing based on user history

## 🛠️ Development Workflow

### Adding New Features
1. **Create new prompt version** with enhanced rules
2. **Test thoroughly** using the CLI tool
3. **Update API route** to use new version
4. **A/B test** between versions if needed
5. **Deploy gradually** with feature flags

### Testing Strategy
```bash
# Test individual prompts
pnpm prompts:test transaction-parser-v2.0 "test input"

# Run full API tests
pnpm test:ai-prompt

# Performance testing
pnpm test:streaming
```

## 🔍 Best Practices

### Prompt Engineering
1. **Be Specific**: Clear, detailed instructions
2. **Use Examples**: Show desired output format
3. **Handle Edge Cases**: Account for unusual inputs
4. **Version Thoughtfully**: Incremental improvements
5. **Document Changes**: Clear version descriptions

### Code Integration
1. **Error Handling**: Graceful fallbacks for missing templates
2. **Caching**: Cache frequently used prompts
3. **Monitoring**: Track prompt performance metrics
4. **Rollback Ready**: Easy version switching

### Testing
1. **Unit Tests**: Test prompt service functions
2. **Integration Tests**: Test with actual AI models
3. **Performance Tests**: Monitor response times
4. **Quality Tests**: Validate output accuracy

## 📈 Monitoring and Analytics

### Metrics to Track
- Prompt processing time
- AI response accuracy
- Confidence score distribution
- Error rates by prompt version
- User correction frequency

### A/B Testing
```typescript
// Example: Split traffic between prompt versions
const promptVersion = user.id % 2 === 0 ? '1.0' : '2.0';
const prompt = await PromptService.getTransactionParsingPrompt({
  // ... parameters
  version: promptVersion
});
```

## 🚨 Troubleshooting

### Common Issues

**1. Template Not Found**
```bash
Error: Prompt template not found: transaction-parser-v3.2
```
Solution: Check available templates with `pnpm prompts:list`

**2. Placeholder Not Replaced**
```bash
Output contains: {CATEGORIES_PLACEHOLDER}
```
Solution: Ensure placeholder is properly defined in PromptService

**3. API Errors**
```bash
TypeError: PromptService.getTransactionParsingPrompt is not a function
```
Solution: Check import path and ensure service is properly exported

## 🔮 Future Enhancements

### Planned Features
1. **Dynamic Prompt Generation**: AI-assisted prompt optimization
2. **Multi-language Support**: Automatic prompt translation
3. **User-specific Prompts**: Personalized based on user behavior
4. **Prompt Analytics Dashboard**: Visual prompt performance metrics
5. **Auto-versioning**: Automatic prompt version creation based on performance

### Research Areas
1. **Prompt Compression**: Reducing token usage while maintaining quality
2. **Context Optimization**: Smarter category and wallet selection
3. **Feedback Integration**: Automatic prompt improvement from user corrections
4. **Performance Prediction**: Predicting prompt success before deployment

---

## 📚 Additional Resources

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google AI Prompt Design Guidelines](https://ai.google.dev/gemini-api/docs/prompting-intro)
- [Best Practices for LLM Applications](https://www.anthropic.com/research/best-practices-for-llm-applications)

---

*This system enables maintainable, version-controlled, and testable AI prompts for the FinHome application.*