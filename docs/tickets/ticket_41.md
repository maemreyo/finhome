# Ticket #41: Improve AI Prompt Flexibility & Create Comprehensive Test Suite

## **Problem Statement**

The current transaction parser prompt (v3.0) is too rigid and restrictive with its few-shot examples, causing the AI to fail at categorizing many real-world transactions that don't perfectly match the predetermined patterns. Users are reporting that the system struggles with natural, varied Vietnamese inputs.

## **Root Cause Analysis**

1. **Over-rigid Few-shot Examples**: The current prompt has only 2 few-shot examples that are too specific and limiting
2. **Restrictive Pattern Matching**: The AI is being too conservative and not generalizing well to new patterns
3. **Insufficient Edge Case Coverage**: Missing examples for complex scenarios, slang, and unconventional inputs
4. **Lack of Comprehensive Testing**: No systematic test suite to validate prompt performance across diverse inputs

## **Issues Identified**

### Current Prompt Problems (`@prompts/versions/transaction-parser-v3.0.txt`):
- **Limited Few-shot Examples**: Only 2 examples (lines 146-185) are too restrictive
- **Over-specified Rules**: 249 lines of rigid rules that constrain AI creativity
- **Conservative Confidence Scoring**: Too many detailed confidence guidelines that make AI overly cautious
- **Missing Variety**: No examples of Vietnamese slang, regional variations, or creative expressions

### Missing Test Coverage:
- **Stress Tests**: No examples with dozens of transactions
- **Vietnamese Slang**: Missing regional terms and informal language
- **Edge Cases**: Destructive inputs, intentionally confusing formats
- **Complex Scenarios**: Mixed transaction types, time-shifted references
- **Real User Patterns**: Actual user inputs that currently fail

## **Proposed Solution**

### Phase 1: Prompt Flexibility Enhancement
1. **Reduce Rule Rigidity**: 
   - Convert absolute rules to guidelines
   - Remove overly specific few-shot examples
   - Emphasize pattern generalization over exact matching

2. **Add Diverse Examples**:
   - Include 10+ varied Vietnamese examples
   - Cover slang terms: "bay màu", "cháy túi", "móc hầu bao"
   - Regional variations: Northern vs Southern terms
   - Complex multi-transaction scenarios

3. **Confidence Score Simplification**:
   - Reduce from 5 confidence tiers to 3 simple ones
   - Focus on "high/medium/low" instead of precise decimal ranges
   - Allow AI to be more confident in pattern recognition

### Phase 2: Comprehensive Test Suite Creation
Create `@prompt-test-suite.json` with:

```json
{
  "test_categories": {
    "basic_transactions": [...],
    "vietnamese_slang": [...],
    "stress_tests": [...],
    "edge_cases": [...],
    "destructive_inputs": [...],
    "time_expressions": [...],
    "multi_transaction": [...],
    "regional_variations": [...]
  },
  "expected_results": {...},
  "performance_benchmarks": {...}
}
```

### Phase 3: Automated Testing Framework
1. **Batch Testing Script**: Test all cases in `prompt-test-suite.json`
2. **Performance Metrics**: Accuracy, recall, precision tracking
3. **Regression Detection**: Prevent prompt changes from breaking existing functionality
4. **A/B Testing**: Compare prompt versions systematically

## **Implementation Plan**

### Step 1: Analyze Current Failures
- [ ] Audit current prompt rigidity issues
- [ ] Collect real user inputs that currently fail
- [ ] Document patterns that need better support

### Step 2: Create Flexible Prompt v3.1
- [ ] Reduce rule count from 249 lines to ~150 lines
- [ ] Replace rigid examples with diverse patterns
- [ ] Add 10+ Vietnamese slang examples
- [ ] Simplify confidence scoring guidelines

### Step 3: Build Comprehensive Test Suite
- [ ] Create `prompt-test-suite.json` with 100+ test cases
- [ ] Include stress tests with 20+ transactions
- [ ] Add Vietnamese slang and regional terms
- [ ] Cover destructive/edge case inputs

### Step 4: Implement Testing Framework
- [ ] Create automated testing script
- [ ] Add performance tracking
- [ ] Set up regression testing
- [ ] Enable A/B prompt comparison

### Step 5: Validation & Deployment
- [ ] Test v3.1 against comprehensive suite
- [ ] Compare performance vs v3.0
- [ ] Deploy if improvement shown
- [ ] Monitor real-world performance

## **Test Cases to Include**

### Vietnamese Slang Examples:
```javascript
"bay màu 50k hôm qua",           // "lost money" (slang)
"cháy túi rồi, vay 100k",        // "broke" (slang)
"móc hầu bao mua cafe 25k",      // "dig into wallet" (slang)
"ném đá giấu tay 200k",          // "sneaky expense" (idiom)
"tiêu xài tè le 500k",           // "spend carelessly" (slang)
```

### Stress Test Examples:
```javascript
"sáng: cf 25k, bánh mì 15k, grab 30k, trưa: cơm 45k, nước 10k, chiều: trà sữa 35k, pizza 120k, tối: bia 60k, nhậu 200k, về: grab 40k, đêm: tăng lực 15k, snack 20k"
```

### Edge Cases:
```javascript
"!@#$%^&*()",                    // Destructive input
"mua mua mua mua 25k",           // Repetitive patterns
"cafe cafe cafe 25k 25k 25k",   // Duplicate amounts
"âm thanh 25k ầm ĩ ồ ào",      // Phonetic confusion
```

## **Success Metrics**

### Quantitative:
- **Accuracy Improvement**: >90% correct categorization (vs current ~70%)
- **Coverage Increase**: Handle 95% of real user inputs (vs current ~80%)
- **Response Flexibility**: Support 50+ Vietnamese slang terms
- **Stress Test Performance**: Handle 20+ transactions in single input

### Qualitative:
- **User Satisfaction**: Reduced complaints about categorization failures
- **Natural Language Support**: Better handling of conversational Vietnamese
- **Edge Case Robustness**: Graceful handling of unusual inputs
- **Developer Experience**: Easier prompt debugging and improvement

## **Files to Modify**

1. **`prompts/versions/transaction-parser-v3.2.txt`** - New flexible prompt
2. **`prompt-test-suite.json`** - Comprehensive test cases
3. **`scripts/test-prompt-performance.js`** - Testing automation
4. **`src/lib/services/promptService.ts`** - Version management
5. **`docs/prompt-engineering-guide.md`** - Documentation

## **Risk Assessment**

### High Risk:
- **Reduced Accuracy**: More flexibility might reduce precision
- **Unpredictable Outputs**: Less rigid rules may cause inconsistency

### Medium Risk:
- **Testing Overhead**: Comprehensive testing takes development time
- **Prompt Engineering Complexity**: Balancing flexibility vs accuracy

### Mitigation:
- **A/B Testing**: Compare old vs new prompt performance
- **Gradual Rollout**: Test with subset of users first
- **Fallback Mechanism**: Keep v3.0 as backup option
- **Monitoring**: Track real-world performance post-deployment

## **Priority: High**

This issue directly impacts core user experience with AI transaction parsing. The current rigid prompt is causing user frustration and limiting the system's ability to handle natural Vietnamese inputs effectively.

## **Estimated Effort: 2-3 days**

- Day 1: Prompt analysis and v3.1 creation
- Day 2: Test suite development and automation
- Day 3: Testing, validation, and deployment

---

**Reporter**: User Feedback  
**Assignee**: AI/Prompt Engineering Team  
**Created**: 2025-07-24  
**Status**: Open  
**Labels**: prompt-engineering, ai-improvement, testing, vietnamese-nlp