#!/usr/bin/env node

/**
 * Automated Testing Framework for Vietnamese Transaction Parsing Prompts
 *
 * This script runs comprehensive tests against the prompt test suite to validate
 * prompt performance, accuracy, and regression detection.
 *
 * Usage:
 *   node scripts/test-prompt-performance.js --prompt v3.1 --suite prompt-test-suite.json
 *   node scripts/test-prompt-performance.js --compare v3.0 v3.1
 *   node scripts/test-prompt-performance.js --category vietnamese_slang
 */

import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

class PromptTestFramework {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.results = {
      total_tests: 0,
      passed: 0,
      failed: 0,
      accuracy: 0,
      precision: 0,
      recall: 0,
      execution_time: 0,
      category_results: {},
      failures: [],
    };
  }

  /**
   * Load test suite from JSON file
   */
  loadTestSuite(suitePath = "./prompt-test-suite.json") {
    try {
      const suiteContent = fs.readFileSync(suitePath, "utf8");
      return JSON.parse(suiteContent);
    } catch (error) {
      console.error(`❌ Failed to load test suite: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Load prompt template from file
   */
  loadPrompt(version = "v3.1") {
    const promptPath = `./prompts/versions/transaction-parser-${version}.txt`;
    try {
      return fs.readFileSync(promptPath, "utf8");
    } catch (error) {
      console.error(`❌ Failed to load prompt ${version}: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Prepare prompt with placeholders filled
   */
  preparePrompt(template, inputText) {
    return template
      .replace("{INPUT_TEXT_PLACEHOLDER}", inputText)
      .replace("{CURRENT_DATE}", new Date().toISOString().split("T")[0])
      .replace("{CATEGORIES_PLACEHOLDER}", "Standard expense categories")
      .replace("{WALLETS_PLACEHOLDER}", "Default wallet")
      .replace("{CORRECTION_CONTEXT_PLACEHOLDER}", "");
  }

  /**
   * Execute single test case
   */
  async executeTest(testCase, promptTemplate, categoryName) {
    const startTime = Date.now();

    try {
      const prompt = this.preparePrompt(promptTemplate, testCase.input);
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse AI response
      let parsedResponse;
      try {
        // Extract JSON from response (handle potential markdown formatting)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.warn(`⚠️  JSON parsing failed for input: "${testCase.input}"`);
        return {
          passed: false,
          error: `JSON parsing failed: ${parseError.message}`,
          execution_time: Date.now() - startTime,
          input: testCase.input,
          expected: testCase.expected,
          actual: response,
        };
      }

      // Validate test result
      const validation = this.validateTestResult(
        parsedResponse,
        testCase.expected,
        testCase.input
      );

      return {
        passed: validation.passed,
        score: validation.score,
        details: validation.details,
        execution_time: Date.now() - startTime,
        input: testCase.input,
        expected: testCase.expected,
        actual: parsedResponse,
        category: categoryName,
      };
    } catch (error) {
      console.warn(`⚠️  Test execution failed for: "${testCase.input}"`);
      return {
        passed: false,
        error: error.message,
        execution_time: Date.now() - startTime,
        input: testCase.input,
        expected: testCase.expected,
        category: categoryName,
      };
    }
  }

  /**
   * Validate test result against expected outcomes
   */
  validateTestResult(actual, expected, input) {
    const validation = {
      passed: true,
      score: 1.0,
      details: [],
    };

    // Check transaction count
    if (expected.transaction_count !== undefined) {
      const actualCount = actual.transactions ? actual.transactions.length : 0;
      if (actualCount !== expected.transaction_count) {
        validation.passed = false;
        validation.score -= 0.3;
        validation.details.push(
          `Transaction count mismatch: expected ${expected.transaction_count}, got ${actualCount}`
        );
      }
    }

    // Check amounts
    if (
      expected.amount !== undefined &&
      actual.transactions &&
      actual.transactions.length > 0
    ) {
      const actualAmount = actual.transactions[0].amount;
      if (actualAmount !== expected.amount) {
        validation.passed = false;
        validation.score -= 0.3;
        validation.details.push(
          `Amount mismatch: expected ${expected.amount}, got ${actualAmount}`
        );
      }
    }

    // Check multiple amounts
    if (expected.amounts && actual.transactions) {
      const actualAmounts = actual.transactions.map((t) => t.amount);
      const expectedAmounts = expected.amounts;

      if (
        JSON.stringify(actualAmounts.sort()) !==
        JSON.stringify(expectedAmounts.sort())
      ) {
        validation.passed = false;
        validation.score -= 0.4;
        validation.details.push(
          `Multiple amounts mismatch: expected ${expectedAmounts}, got ${actualAmounts}`
        );
      }
    }

    // Check transaction type
    if (
      expected.type &&
      actual.transactions &&
      actual.transactions.length > 0
    ) {
      const actualType = actual.transactions[0].transaction_type;
      if (actualType !== expected.type) {
        validation.passed = false;
        validation.score -= 0.2;
        validation.details.push(
          `Type mismatch: expected ${expected.type}, got ${actualType}`
        );
      }
    }

    // Check confidence level
    if (
      expected.confidence &&
      actual.transactions &&
      actual.transactions.length > 0
    ) {
      const actualConfidence = actual.transactions[0].confidence_score;
      const expectedRange = this.getConfidenceRange(expected.confidence);

      if (
        actualConfidence < expectedRange.min ||
        actualConfidence > expectedRange.max
      ) {
        validation.score -= 0.1;
        validation.details.push(
          `Confidence outside expected range: expected ${expected.confidence}, got ${actualConfidence}`
        );
      }
    }

    // Ensure score doesn't go below 0
    validation.score = Math.max(0, validation.score);

    return validation;
  }

  /**
   * Convert confidence text to numeric range
   */
  getConfidenceRange(confidenceText) {
    switch (confidenceText.toLowerCase()) {
      case "high":
        return { min: 0.8, max: 1.0 };
      case "medium":
        return { min: 0.5, max: 0.7 };
      case "low":
        return { min: 0.1, max: 0.4 };
      default:
        return { min: 0.0, max: 1.0 };
    }
  }

  /**
   * Run tests for specific category
   */
  async runCategoryTests(testSuite, promptTemplate, categoryName, testCases) {
    console.log(`\n🧪 Testing category: ${categoryName}`);
    console.log(`📊 Running ${testCases.length} test cases...`);

    const categoryResults = {
      total: testCases.length,
      passed: 0,
      failed: 0,
      average_score: 0,
      execution_time: 0,
      failures: [],
    };

    let totalScore = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      process.stdout.write(`  ${i + 1}/${testCases.length} `);

      const result = await this.executeTest(
        testCase,
        promptTemplate,
        categoryName
      );

      if (result.passed) {
        categoryResults.passed++;
        process.stdout.write("✅");
      } else {
        categoryResults.failed++;
        categoryResults.failures.push(result);
        process.stdout.write("❌");
      }

      totalScore += result.score || 0;
      categoryResults.execution_time += result.execution_time;

      // Brief delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    categoryResults.average_score = totalScore / testCases.length;

    console.log(`\n📋 Category Results:`);
    console.log(
      `   ✅ Passed: ${categoryResults.passed}/${categoryResults.total} (${((categoryResults.passed / categoryResults.total) * 100).toFixed(1)}%)`
    );
    console.log(
      `   📊 Average Score: ${categoryResults.average_score.toFixed(3)}`
    );
    console.log(
      `   ⏱️  Execution Time: ${(categoryResults.execution_time / 1000).toFixed(2)}s`
    );

    return categoryResults;
  }

  /**
   * Run complete test suite
   */
      async runTestSuite(promptVersion = "v3.3", categories = null) {
    const startTime = Date.now();

    console.log(`🚀 Starting Prompt Performance Test`);
    console.log(`📝 Prompt Version: ${promptVersion}`);
    console.log(`📅 Date: ${new Date().toISOString()}`);

    // Load test suite and prompt
    const testSuite = this.loadTestSuite();
    const promptTemplate = this.loadPrompt(promptVersion);

    console.log(
      `📚 Loaded ${testSuite.test_statistics.total_test_cases} total test cases`
    );

    // Run tests by category
    const categoriesToTest =
      categories || Object.keys(testSuite.test_categories);

    for (const categoryName of categoriesToTest) {
      const testCases = testSuite.test_categories[categoryName];
      if (!testCases) {
        console.warn(`⚠️  Category ${categoryName} not found in test suite`);
        continue;
      }

      const categoryResults = await this.runCategoryTests(
        testSuite,
        promptTemplate,
        categoryName,
        testCases
      );

      this.results.category_results[categoryName] = categoryResults;
      this.results.total_tests += categoryResults.total;
      this.results.passed += categoryResults.passed;
      this.results.failed += categoryResults.failed;
      this.results.failures.push(...categoryResults.failures);
    }

    // Calculate overall metrics
    this.results.execution_time = Date.now() - startTime;
    this.results.accuracy =
      this.results.total_tests > 0
        ? this.results.passed / this.results.total_tests
        : 0;

    // Calculate precision and recall (simplified)
    this.results.precision = this.calculatePrecision();
    this.results.recall = this.calculateRecall();

    return this.results;
  }

  /**
   * Calculate precision metric
   */
  calculatePrecision() {
    // Simplified precision: percentage of high-confidence predictions that were correct
    let highConfidenceCorrect = 0;
    let totalHighConfidence = 0;

    // This would need more sophisticated implementation based on actual results
    return this.results.accuracy; // Simplified for now
  }

  /**
   * Calculate recall metric
   */
  calculateRecall() {
    // Simplified recall: percentage of expected transactions that were found
    return this.results.accuracy; // Simplified for now
  }

  /**
   * Generate test report
   */
  generateReport() {
    const report = {
      summary: {
        total_tests: this.results.total_tests,
        passed: this.results.passed,
        failed: this.results.failed,
        accuracy: (this.results.accuracy * 100).toFixed(2) + "%",
        precision: (this.results.precision * 100).toFixed(2) + "%",
        recall: (this.results.recall * 100).toFixed(2) + "%",
        execution_time: (this.results.execution_time / 1000).toFixed(2) + "s",
      },
      category_breakdown: {},
      failures: this.results.failures.map((f) => ({
        input: f.input,
        category: f.category,
        error: f.error || f.details?.join(", "),
        expected: f.expected,
        actual: f.actual,
      })),
    };

    // Add category breakdown
    for (const [category, results] of Object.entries(
      this.results.category_results
    )) {
      report.category_breakdown[category] = {
        accuracy: ((results.passed / results.total) * 100).toFixed(1) + "%",
        average_score: results.average_score.toFixed(3),
        execution_time: (results.execution_time / 1000).toFixed(2) + "s",
      };
    }

    return report;
  }

  /**
   * Save results to file
   */
  saveResults(filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      filename = `test-results-${timestamp}.json`;
    }

    const report = this.generateReport();
    const resultsPath = path.join("./test-results", filename);

    // Ensure directory exists
    const dir = path.dirname(resultsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(resultsPath, JSON.stringify(report, null, 2));
    console.log(`📄 Results saved to: ${resultsPath}`);

    return resultsPath;
  }

  /**
   * Print summary report to console
   */
  printSummary() {
    const report = this.generateReport();

    console.log(`\n📊 FINAL TEST RESULTS`);
    console.log(`${"=".repeat(50)}`);
    console.log(`📈 Overall Performance:`);
    console.log(`   Tests Run: ${report.summary.total_tests}`);
    console.log(
      `   Passed: ${report.summary.passed} (${report.summary.accuracy})`
    );
    console.log(`   Failed: ${report.summary.failed}`);
    console.log(`   Precision: ${report.summary.precision}`);
    console.log(`   Recall: ${report.summary.recall}`);
    console.log(`   Execution Time: ${report.summary.execution_time}`);

    console.log(`\n📋 Category Breakdown:`);
    for (const [category, results] of Object.entries(
      report.category_breakdown
    )) {
      console.log(
        `   ${category}: ${results.accuracy} (avg score: ${results.average_score})`
      );
    }

    if (report.failures.length > 0) {
      console.log(`\n❌ Failed Test Cases (${report.failures.length}):`);
      report.failures.slice(0, 5).forEach((failure, index) => {
        console.log(`   ${index + 1}. "${failure.input}" - ${failure.error}`);
      });

      if (report.failures.length > 5) {
        console.log(`   ... and ${report.failures.length - 5} more failures`);
      }
    }

    console.log(
      `\n${this.results.accuracy >= 0.9 ? "🎉" : "⚠️"} Test ${this.results.accuracy >= 0.9 ? "PASSED" : "NEEDS IMPROVEMENT"}`
    );
  }
}

/**
 * Compare two prompt versions
 */
async function comparePrompts(version1, version2) {
  console.log(`🔄 Comparing Prompt Versions: ${version1} vs ${version2}`);

  const framework1 = new PromptTestFramework();
  const framework2 = new PromptTestFramework();

  console.log(`\n🧪 Testing ${version1}...`);
  const results1 = await framework1.runTestSuite(version1);

  console.log(`\n🧪 Testing ${version2}...`);
  const results2 = await framework2.runTestSuite(version2);

  // Generate comparison
  console.log(`\n📊 COMPARISON RESULTS`);
  console.log(`${"=".repeat(50)}`);
  console.log(
    `Metric                ${version1.padEnd(12)} ${version2.padEnd(12)} Improvement`
  );
  console.log(`${"─".repeat(50)}`);

  const accuracy1 = results1.accuracy;
  const accuracy2 = results2.accuracy;
  const accImprovement = (((accuracy2 - accuracy1) / accuracy1) * 100).toFixed(
    1
  );

  console.log(
    `Accuracy              ${(accuracy1 * 100).toFixed(1)}%        ${(accuracy2 * 100).toFixed(1)}%        ${accImprovement}%`
  );

  const time1 = results1.execution_time / 1000;
  const time2 = results2.execution_time / 1000;
  const timeImprovement = (((time1 - time2) / time1) * 100).toFixed(1);

  console.log(
    `Execution Time        ${time1.toFixed(1)}s        ${time2.toFixed(1)}s        ${timeImprovement}%`
  );

  console.log(
    `\n${accuracy2 > accuracy1 ? "✅" : "❌"} ${version2} ${accuracy2 > accuracy1 ? "OUTPERFORMS" : "UNDERPERFORMS"} ${version1}`
  );

  // Save comparison results
  const comparisonResults = {
    version1: { version: version1, results: framework1.generateReport() },
    version2: { version: version2, results: framework2.generateReport() },
    comparison: {
      accuracy_improvement: accImprovement + "%",
      time_improvement: timeImprovement + "%",
      better_version: accuracy2 > accuracy1 ? version2 : version1,
    },
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const comparisonPath = `./test-results/comparison-${version1}-vs-${version2}-${timestamp}.json`;
  fs.writeFileSync(comparisonPath, JSON.stringify(comparisonResults, null, 2));
  console.log(`📄 Comparison saved to: ${comparisonPath}`);
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
📚 Prompt Performance Testing Framework

Usage:
  node scripts/test-prompt-performance.js [options]

Options:
  --prompt <version>        Test specific prompt version (default: v3.1)
  --category <name>         Test specific category only
  --compare <v1> <v2>       Compare two prompt versions
  --suite <path>            Custom test suite path
  --help, -h                Show this help message

Examples:
  node scripts/test-prompt-performance.js --prompt v3.1
  node scripts/test-prompt-performance.js --category vietnamese_slang
  node scripts/test-prompt-performance.js --compare v3.0 v3.1
    `);
    return;
  }

  try {
    if (args.includes("--compare")) {
      const compareIndex = args.indexOf("--compare");
      const version1 = args[compareIndex + 1];
      const version2 = args[compareIndex + 2];

      if (!version1 || !version2) {
        console.error("❌ --compare requires two version arguments");
        process.exit(1);
      }

      await comparePrompts(version1, version2);
      return;
    }

        const promptVersion = args.includes("--prompt")
      ? args[args.indexOf("--prompt") + 1]
      : "v3.4";
    const category = args.includes("--category")
      ? args[args.indexOf("--category") + 1]
      : null;
    const categories = category ? [category] : null;

    const framework = new PromptTestFramework();
    await framework.runTestSuite(promptVersion, categories);

    framework.printSummary();
    framework.saveResults();
  } catch (error) {
    console.error(`❌ Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], "file://").href) {
  main().catch(console.error);
}

export { PromptTestFramework, comparePrompts };
