# AI Prompt Version Changelog

## Version 1.0 (2025-07-23)
**Status:** Initial Release  
**File:** `transaction-parser-v1.0.txt`

### Features:
- Basic Vietnamese transaction parsing
- Support for expense/income/transfer classification
- Amount parsing with Vietnamese formats (k, triệu, tr)
- Category matching with Vietnamese keywords
- Tag generation system
- Merchant and date extraction
- Confidence scoring

### Known Issues:
- Limited testing with edge cases
- No formal validation against test suite yet
- May struggle with complex slang and regional variations
- Category matching could be more sophisticated

### Test Results:
- Initial version - no test results available yet
- Baseline testing planned

---

## Future Versions

### Planned Improvements for v1.1:
- Enhanced slang and regional term support
- Improved category matching algorithm
- Better handling of conditional/future transactions
- Optimized token usage for cost reduction
- Few-shot examples integration

### Test Suite Integration:
- Comprehensive test suite with 25+ test cases
- Automated testing script implemented
- Performance threshold: 85% accuracy
- Categories covered: basic, multiple transactions, slang, ambiguous cases, non-transactions, complex amounts

---

## Testing Infrastructure

### Test Suite Components:
1. **prompt-test-suite.json** - Comprehensive test cases
2. **scripts/test-ai-prompt.js** - Automated testing engine  
3. **scripts/run-prompt-tests.sh** - Convenient test runner
4. **test-results/** - Automated result storage

### Usage:
```bash
# Run tests with convenient wrapper
pnpm test:ai-prompt:run

# Run tests directly
pnpm test:ai-prompt

# Development mode with debug info
pnpm test:ai-prompt:dev
```

### Scoring Criteria:
- Transaction Detection (30%)
- Amount Parsing (25%) 
- Category Matching (20%)
- Transaction Type (15%)
- Context Extraction (10%)

---

*This changelog is automatically updated with each prompt version release.*