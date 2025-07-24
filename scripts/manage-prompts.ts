#!/usr/bin/env tsx
// scripts/manage-prompts.ts
// CLI utility for managing AI prompt templates

import { PromptService } from "../src/lib/services/promptService";
import fs from "fs";
import path from "path";

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  switch (command) {
    case "list":
      await listPrompts();
      break;
    case "create":
      await createPrompt(args);
      break;
    case "view":
      await viewPrompt(args[0]);
      break;
    case "test":
      await testPrompt(args);
      break;
    case "help":
    default:
      showHelp();
      break;
  }
}

async function listPrompts() {
  console.log("📋 Available Prompt Templates:");
  console.log("================================");

  const templates = PromptService.getAvailableTemplates();

  if (templates.length === 0) {
    console.log("No prompt templates found.");
    return;
  }

  for (const templateName of templates) {
    try {
      const template = await PromptService.loadPromptTemplate(templateName);
      console.log(`\n🔤 ${templateName}`);
      console.log(`   Version: ${template.version}`);
      console.log(`   Created: ${template.dateCreated}`);
      console.log(`   Description: ${template.description}`);
    } catch (error) {
      console.log(`\n❌ ${templateName} (Error loading: ${error})`);
    }
  }
}

async function createPrompt(args: string[]) {
  if (args.length < 3) {
    console.error(
      "Usage: pnpm manage-prompts create <base-name> <version> <description>"
    );
    console.error(
      'Example: pnpm manage-prompts create transaction-parser 2.0 "Improved Vietnamese parsing with context"'
    );
    return;
  }

  const [baseName, version, description] = args;
  const contentFile = args[3]; // Optional content file path

  let content = "";

  if (contentFile && fs.existsSync(contentFile)) {
    content = fs.readFileSync(contentFile, "utf-8");
  } else {
    // Provide a template
    content = `You are an expert Vietnamese financial assistant. Parse the following Vietnamese text and extract transaction information. Follow these rules strictly:\n\nCATEGORIES AVAILABLE:\n{CATEGORIES_PLACEHOLDER}\n\nWALLETS AVAILABLE:\n{WALLETS_PLACEHOLDER}\n\n{CORRECTION_CONTEXT_PLACEHOLDER}\n\nPARSING RULES:\n1. Extract ALL transactions mentioned in the text (there can be multiple)\n2. For each transaction, determine:\n   - transaction_type: "expense" (chi tiêu), "income" (thu nhập), or "transfer" (chuyển khoản)\n   - amount: Extract numerical value (support formats like "25k", "5 triệu", "50,000")\n   - description: Clean, concise description of what the transaction is about\n   - suggested_category_id: Match to the EXACT ID from categories above (REQUIRED)\n   - suggested_category_name: The matched category name\n   - suggested_tags: Array of relevant hashtags (e.g., ["#trà_sữa", "#bạn_bè"])\n   - confidence_score: Your confidence in this categorization (0.0-1.0)\n   - extracted_merchant: Business/place name if mentioned\n   - extracted_date: Date if mentioned, format YYYY-MM-DD\n   - notes: Additional context or details\n\n3. OUTPUT FORMAT:\n   Return ONLY valid JSON matching this exact structure:\n   {\n     "transactions": [\n       {\n         "transaction_type": "expense",\n         "amount": 25000,\n         "description": "Trà sữa với bạn bè",\n         "suggested_category_id": "uuid-here",\n         "suggested_category_name": "Ăn uống",\n         "suggested_tags": ["#trà_sữa", "#bạn_bè"],\n         "confidence_score": 0.9,\n         "extracted_merchant": "Gong Cha",\n         "extracted_date": null,\n         "notes": null\n       }\n     ],\n     "analysis_summary": "Phân tích 1 giao dịch chi tiêu cho đồ uống"\n   }\n\nTEXT TO PARSE: "{INPUT_TEXT_PLACEHOLDER}"\n\nRemember: Return ONLY the JSON response, no additional text or explanation.`;
  }

  try {
    await PromptService.createPromptVersion(
      baseName,
      version,
      content,
      description
    );
    console.log(`✅ Created prompt template: ${baseName}-v${version}.txt`);
  } catch (error) {
    console.error(`❌ Error creating prompt: ${error}`);
  }
}

async function viewPrompt(templateName: string) {
  if (!templateName) {
    console.error("Usage: pnpm manage-prompts view <template-name>");
    console.error("Example: pnpm manage-prompts view transaction-parser-v3.2");
    return;
  }

  try {
    const template = await PromptService.loadPromptTemplate(templateName);

    console.log(`📄 Template: ${templateName}`);
    console.log(`📅 Version: ${template.version}`);
    console.log(`📅 Created: ${template.dateCreated}`);
    console.log(`📝 Description: ${template.description}`);
    console.log("\n📋 Content:");
    console.log("=".repeat(50));
    console.log(template.content);
    console.log("=".repeat(50));
  } catch (error) {
    console.error(`❌ Error loading template: ${error}`);
  }
}

async function testPrompt(args: string[]) {
  if (args.length < 2) {
    console.error(
      "Usage: pnpm manage-prompts test <template-name> <test-text>"
    );
    console.error(
      'Example: pnpm manage-prompts test transaction-parser-v3.2 "mua trà sữa 25k"'
    );
    return;
  }

  const [templateName, testText] = args;

  try {
    // Mock data for testing
    const mockCategories = [
      {
        id: "cat-1",
        name_vi: "Ăn uống",
        name_en: "Food & Dining",
        category_key: "food_dining",
      },
      {
        id: "cat-2",
        name_vi: "Giao thông",
        name_en: "Transportation",
        category_key: "transportation",
      },
      {
        id: "cat-3",
        name_vi: "Mua sắm",
        name_en: "Shopping",
        category_key: "shopping",
      },
    ];

    const mockWallets = [
      {
        id: "wallet-1",
        name: "Ví tiền mặt",
        wallet_type: "cash",
        currency: "VND",
      },
      {
        id: "wallet-2",
        name: "Tài khoản ngân hàng",
        wallet_type: "bank",
        currency: "VND",
      },
    ];

    const prompt = await PromptService.getTransactionParsingPrompt({
      inputText: testText,
      categories: mockCategories,
      wallets: mockWallets,
      version: templateName.includes("v") ? templateName.split("v")[1] : "3.2",
      debugMode: true, // Always show debug info when testing
    });

    console.log(`🧪 Testing prompt: ${templateName}`);
    console.log(`📝 Test input: "${testText}"`);
    console.log("\n🤖 Generated Prompt:");
    console.log("=".repeat(80));
    console.log(prompt);
    console.log("=".repeat(80));

    console.log(
      "\n💡 Note: This shows the complete prompt that would be sent to the AI model."
    );
    console.log(
      "   To test with actual AI, use the API endpoint /api/expenses/parse-from-text"
    );
  } catch (error) {
    console.error(`❌ Error testing prompt: ${error}`);
  }
}

function showHelp() {
  console.log(
    `\n🚀 Prompt Management CLI\n\nUsage: pnpm manage-prompts <command> [args...]\n\nCommands:\n  list                           List all available prompt templates\n  create <name> <version> <desc> Create a new prompt template version\n  view <template-name>           View a specific prompt template\n  test <template-name> <text>    Test a prompt with sample data\n  help                          Show this help message\n\nExamples:\n  pnpm manage-prompts list\n  pnpm manage-prompts create transaction-parser 2.0 "Improved parsing"\n  pnpm manage-prompts view transaction-parser-v3.2\n  pnpm manage-prompts test transaction-parser-v3.2 "mua trà sữa 25k"\n\nTemplate Structure:\n  - Templates are stored in prompts/versions/\n  - Use {PLACEHOLDER} syntax for dynamic content\n  - Available placeholders: CATEGORIES_PLACEHOLDER, WALLETS_PLACEHOLDER, \n    CORRECTION_CONTEXT_PLACEHOLDER, INPUT_TEXT_PLACEHOLDER\n`
  );
}

main().catch(console.error);
