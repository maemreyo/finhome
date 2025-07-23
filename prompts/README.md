# AI Prompt Testing & Optimization System

This directory contains the comprehensive system for testing and optimizing AI prompts used in the Vietnamese transaction parsing feature.

## 📁 Directory Structure

```
prompts/
├── README.md                          # This file
├── changelog.md                       # Version history and changes
└── versions/                          # Prompt version storage
    └── transaction-parser-v1.0.txt    # Version 1.0 of the prompt

scripts/
├── test-ai-prompt.js                  # Main testing engine
└── run-prompt-tests.sh               # Convenient test runner

test-results/                          # Auto-generated test results
├── latest-results.json               # Most recent test results
├── test-results-[timestamp].json    # Detailed results with timestamp  
└── test-summary-[timestamp].json    # Summary reports

prompt-test-suite.json                # Comprehensive test cases
```

## 🚀 Quick Start

### Prerequisites
1. Start the development server: `pnpm dev`
2. Ensure Gemini API key is configured in environment variables

### Running Tests

```bash
# Method 1: Using the convenient wrapper (Recommended)
pnpm test:ai-prompt:run

# Method 2: Direct execution
pnpm test:ai-prompt

# Method 3: Development mode with debug info
pnpm test:ai-prompt:dev
```

## 📊 Test Suite Overview

The test suite includes **25+ comprehensive test cases** covering:

### Test Categories:
- **Basic Transactions** - Simple expense/income scenarios
- **Multiple Transactions** - Complex multi-transaction inputs
- **Slang & Local Terms** - Vietnamese colloquialisms and regional language
- **Ambiguous Cases** - Edge cases requiring intelligent handling
- **Non-Transactions** - Text that should not be parsed as transactions
- **Conditional/Future** - Hypothetical transactions to be ignored
- **Complex Amounts** - Various Vietnamese number formats
- **Merchant & Date Extraction** - Context information parsing
- **Transportation, Shopping, Healthcare** - Category-specific scenarios

### Scoring System:
- **Transaction Detection** (30%) - Correctly identifies transaction vs non-transaction
- **Amount Parsing** (25%) - Accurate numerical extraction
- **Category Matching** (20%) - Appropriate category assignment  
- **Transaction Type** (15%) - Expense/income/transfer classification
- **Context Extraction** (10%) - Merchant, date, and additional details

### Success Criteria:
- **Pass Threshold:** 85% overall accuracy
- **Individual Test:** 70% minimum score
- **Category Coverage:** All major transaction types represented

## 🔧 Test Results & Analysis

### Understanding Results

The testing system generates detailed reports including:

```json
{
  "summary": {
    "total_tests": 25,
    "passed": 22,
    "failed": 3,
    "pass_rate": 88.0,
    "overall_score": 87.5,
    "meets_threshold": true
  },
  "category_breakdown": {
    "basic": { "total": 5, "passed": 5, "passRate": 100.0 },
    "slang_local": { "total": 3, "passed": 2, "passRate": 66.7 }
  },
  "failed_tests": [...],
  "recommendations": [...]
}
```

### Viewing Results

```bash
# View latest summary
cat test-results/latest-results.json | jq '.summary'

# View failed tests only
cat test-results/latest-results.json | jq '.failed_tests'

# View recommendations
cat test-results/latest-results.json | jq '.recommendations'
```

## 🔄 Prompt Optimization Workflow

### 1. Initial Testing
```bash
pnpm test:ai-prompt:run
```

### 2. Analysis
- Review failed test cases in `test-results/latest-results.json`
- Identify common failure patterns
- Check category-specific performance

### 3. Prompt Refinement
- Update the `buildAIPrompt` function in `src/app/api/expenses/parse-from-text/route.ts`
- Save new version in `prompts/versions/transaction-parser-vX.X.txt`
- Update `prompts/changelog.md` with changes

### 4. Validation
- Re-run test suite
- Compare performance metrics
- Iterate until threshold is met

### 5. Version Management
- Commit successful versions to Git
- Document performance improvements
- Update changelog with results

## 📝 Adding New Test Cases

To expand test coverage, edit `prompt-test-suite.json`:

```json
{
  "id": "new_test_001",
  "category": "new_category",
  "input": "Vietnamese text to parse",
  "expected": {
    "transactions": [
      {
        "transaction_type": "expense",
        "amount": 50000,
        "description": "Expected description",
        "suggested_category_name": "Expected category"
      }
    ]
  }
}
```

## 🐛 Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Ensure dev server is running on port 3033
   - Check `http://localhost:3033/api/health`

2. **API Key Errors**  
   - Verify `GEMINI_API_KEY` in environment variables
   - Check Gemini API quota and billing

3. **Test Timeouts**
   - Increase timeout in `scripts/test-ai-prompt.js`
   - Check network connectivity

4. **Authentication Errors**
   - Test script may need user session setup
   - Consider implementing test user authentication

### Debug Mode:
```bash
NODE_ENV=development pnpm test:ai-prompt
```

## 📈 Performance Optimization Tips

### Token Optimization:
- Limit category context to most frequently used categories
- Compress prompt structure while maintaining clarity
- Use abbreviations for internal processing

### Accuracy Improvements:
- Add few-shot examples for challenging cases
- Enhance Vietnamese language pattern matching
- Implement user correction learning system

### Cost Management:
- Monitor token usage in test results
- Optimize prompt length vs accuracy trade-off  
- Consider prompt caching strategies

## 🎯 Goals & Roadmap

### Current Goals:
- ✅ Achieve 85%+ accuracy on test suite
- ✅ Comprehensive test coverage for Vietnamese scenarios  
- ✅ Automated testing and version management
- 🔄 Cost-effective prompt optimization

### Future Enhancements:
- Real user feedback integration
- A/B testing framework for prompt variations
- Continuous integration with automated testing
- Multi-model comparison and selection

---

For questions or issues, refer to the main project documentation or create an issue in the project repository.