# Prompt Testing Framework

Automated testing framework for validating Vietnamese transaction parsing prompts.

## Quick Start

```bash
# Test current prompt version (v3.1)
pnpm test-prompt

# Test specific category
pnpm test-prompt-category vietnamese_slang

# Compare two prompt versions
pnpm compare-prompts v3.0 v3.1
```

## Usage Examples

### Test All Categories
```bash
node scripts/test-prompt-performance.js --prompt v3.1
```

### Test Specific Category
```bash
node scripts/test-prompt-performance.js --category stress_tests
```

### Compare Prompt Versions
```bash
node scripts/test-prompt-performance.js --compare v3.0 v3.1
```

### Custom Test Suite
```bash
node scripts/test-prompt-performance.js --suite custom-test-suite.json
```

## Features

### 🧪 **Comprehensive Testing**
- 40+ test cases across 10 categories
- Vietnamese slang and regional variations
- Stress tests with 20+ transactions
- Edge cases and destructive inputs

### 📊 **Performance Metrics**
- Accuracy measurement
- Precision and recall calculation
- Execution time tracking
- Category-specific results

### 🔄 **A/B Testing**
- Compare prompt versions side-by-side
- Regression detection
- Performance improvement tracking

### 📈 **Detailed Reporting**
- JSON result exports
- Console summary reports
- Failure analysis
- Category breakdowns

## Test Categories

1. **basic_transactions** - Standard Vietnamese transactions
2. **vietnamese_slang** - Regional slang and informal expressions
3. **stress_tests** - Complex multi-transaction inputs
4. **time_expressions** - Date and time parsing
5. **multi_transaction** - Multiple transactions in single input
6. **regional_variations** - Northern vs Southern Vietnamese
7. **edge_cases** - Boundary conditions and special cases
8. **destructive_inputs** - Invalid and malformed inputs
9. **amount_variations** - Different number formats
10. **cultural_context** - Vietnamese cultural expressions

## Output

### Console Summary
```
📊 FINAL TEST RESULTS
==================================================
📈 Overall Performance:
   Tests Run: 40
   Passed: 36 (90.0%)
   Failed: 4
   Precision: 90.0%
   Recall: 90.0%
   Execution Time: 45.2s

📋 Category Breakdown:
   basic_transactions: 100.0% (avg score: 0.952)
   vietnamese_slang: 83.3% (avg score: 0.847)
   stress_tests: 66.7% (avg score: 0.723)
   ...
```

### JSON Report Structure
```json
{
  "summary": {
    "total_tests": 40,
    "passed": 36,
    "failed": 4,
    "accuracy": "90.00%",
    "precision": "90.00%",
    "recall": "90.00%",
    "execution_time": "45.2s"
  },
  "category_breakdown": {
    "basic_transactions": {
      "accuracy": "100.0%",
      "average_score": "0.952",
      "execution_time": "5.4s"
    }
  },
  "failures": [
    {
      "input": "complex test case",
      "category": "stress_tests",
      "error": "Transaction count mismatch",
      "expected": {...},
      "actual": {...}
    }
  ]
}
```

## Environment Setup

Ensure you have the following environment variable:
```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

## File Structure

```
scripts/
├── test-prompt-performance.js    # Main testing framework
├── README.md                     # This documentation
prompt-test-suite.json           # Test cases and expectations
prompts/versions/                # Prompt versions
├── transaction-parser-v3.0.txt
├── transaction-parser-v3.1.txt
test-results/                    # Generated reports
├── test-results-2025-07-24.json
├── comparison-v3.0-vs-v3.1.json
```

## Performance Benchmarks

Target metrics for prompt performance:

- **Accuracy**: ≥90% overall
- **Coverage**: ≥95% of real user inputs
- **Response Time**: ≤3 seconds per test
- **Slang Support**: 50+ Vietnamese terms
- **Max Transactions**: 20 per input

## Debugging Failed Tests

When tests fail, check the generated JSON report for detailed failure information:

1. **Input**: The original Vietnamese text
2. **Expected**: What the test expected
3. **Actual**: What the AI actually returned
4. **Error**: Specific failure reason

Common failure patterns:
- Transaction count mismatches
- Amount parsing errors
- Confidence score issues
- Category assignment problems

## Contributing

To add new test cases:

1. Edit `prompt-test-suite.json`
2. Add to appropriate category or create new category
3. Include expected results with confidence levels
4. Run tests to validate

Example test case:
```json
{
  "input": "bay màu 50k hôm qua",
  "expected": {
    "transaction_count": 1,
    "type": "expense",
    "amount": 50000,
    "confidence": "medium",
    "note": "Vietnamese slang for losing money"
  }
}
```