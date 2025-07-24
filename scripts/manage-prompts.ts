#!/usr/bin/env tsx
// scripts/manage-prompts.ts
// CLI utility for managing AI prompt templates

import { PromptService } from '../src/lib/services/promptService';
import fs from 'fs';
import path from 'path';

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  switch (command) {
    case 'list':
      await listPrompts();
      break;
    case 'create':
      await createPrompt(args);
      break;
    case 'view':
      await viewPrompt(args[0]);
      break;
    case 'test':
      await testPrompt(args);
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

async function listPrompts() {
  console.log('📋 Available Prompt Templates:');
  console.log('================================');
  
  const templates = PromptService.getAvailableTemplates();
  
  if (templates.length === 0) {
    console.log('No prompt templates found.');
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
    console.error('Usage: pnpm manage-prompts create <base-name> <version> <description>');
    console.error('Example: pnpm manage-prompts create transaction-parser 2.0 "Improved Vietnamese parsing with context"');
    return;
  }
  
  const [baseName, version, description] = args;
  const contentFile = args[3]; // Optional content file path
  
  let content = '';
  
  if (contentFile && fs.existsSync(contentFile)) {
    content = fs.readFileSync(contentFile, 'utf-8');
  } else {
    // Provide a template
    content = `You are an expert Vietnamese financial assistant. Parse the following Vietnamese text and extract transaction information. Follow these rules strictly:

CATEGORIES AVAILABLE:
{CATEGORIES_PLACEHOLDER}

WALLETS AVAILABLE:
{WALLETS_PLACEHOLDER}

{CORRECTION_CONTEXT_PLACEHOLDER}

PARSING RULES:
1. Extract ALL transactions mentioned in the text (there can be multiple)
2. For each transaction, determine:
   - transaction_type: "expense" (chi tiêu), "income" (thu nhập), or "transfer" (chuyển khoản)
   - amount: Extract numerical value (support formats like "25k", "5 triệu", "50,000")
   - description: Clean, concise description of what the transaction is about
   - suggested_category_id: Match to the EXACT ID from categories above (REQUIRED)
   - suggested_category_name: The matched category name
   - suggested_tags: Array of relevant hashtags (e.g., ["#trà_sữa", "#bạn_bè"])
   - confidence_score: Your confidence in this categorization (0.0-1.0)
   - extracted_merchant: Business/place name if mentioned
   - extracted_date: Date if mentioned, format YYYY-MM-DD
   - notes: Additional context or details

3. OUTPUT FORMAT:
   Return ONLY valid JSON matching this exact structure:
   {
     "transactions": [
       {
         "transaction_type": "expense",
         "amount": 25000,
         "description": "Trà sữa với bạn bè",
         "suggested_category_id": "uuid-here",
         "suggested_category_name": "Ăn uống",
         "suggested_tags": ["#trà_sữa", "#bạn_bè"],
         "confidence_score": 0.9,
         "extracted_merchant": "Gong Cha",
         "extracted_date": null,
         "notes": null
       }
     ],
     "analysis_summary": "Phân tích 1 giao dịch chi tiêu cho đồ uống"
   }

TEXT TO PARSE: "{INPUT_TEXT_PLACEHOLDER}"

Remember: Return ONLY the JSON response, no additional text or explanation.`;
  }
  
  try {
    await PromptService.createPromptVersion(baseName, version, content, description);
    console.log(`✅ Created prompt template: ${baseName}-v${version}.txt`);
  } catch (error) {
    console.error(`❌ Error creating prompt: ${error}`);
  }
}

async function viewPrompt(templateName: string) {
  if (!templateName) {
    console.error('Usage: pnpm manage-prompts view <template-name>');
    console.error('Example: pnpm manage-prompts view transaction-parser-v1.0');
    return;
  }
  
  try {
    const template = await PromptService.loadPromptTemplate(templateName);
    
    console.log(`📄 Template: ${templateName}`);
    console.log(`📅 Version: ${template.version}`);
    console.log(`📅 Created: ${template.dateCreated}`);
    console.log(`📝 Description: ${template.description}`);
    console.log('\n📋 Content:');
    console.log('=' .repeat(50));
    console.log(template.content);
    console.log('=' .repeat(50));
  } catch (error) {
    console.error(`❌ Error loading template: ${error}`);
  }
}

async function testPrompt(args: string[]) {
  if (args.length < 2) {
    console.error('Usage: pnpm manage-prompts test <template-name> <test-text>');
    console.error('Example: pnpm manage-prompts test transaction-parser-v1.0 "mua trà sữa 25k"');
    return;
  }
  
  const [templateName, testText] = args;
  
  try {
    // Mock data for testing
    const mockCategories = [
      { id: 'cat-1', name_vi: 'Ăn uống', name_en: 'Food & Dining', category_key: 'food_dining' },
      { id: 'cat-2', name_vi: 'Giao thông', name_en: 'Transportation', category_key: 'transportation' },
      { id: 'cat-3', name_vi: 'Mua sắm', name_en: 'Shopping', category_key: 'shopping' }
    ];
    
    const mockWallets = [
      { id: 'wallet-1', name: 'Ví tiền mặt', wallet_type: 'cash', currency: 'VND' },
      { id: 'wallet-2', name: 'Tài khoản ngân hàng', wallet_type: 'bank', currency: 'VND' }
    ];
    
    const prompt = await PromptService.getTransactionParsingPrompt({
      inputText: testText,
      categories: mockCategories,
      wallets: mockWallets,
      version: templateName.includes('v') ? templateName.split('v')[1] : '1.0',
      debugMode: true // Always show debug info when testing
    });
    
    console.log(`🧪 Testing prompt: ${templateName}`);
    console.log(`📝 Test input: "${testText}"`);
    console.log('\n🤖 Generated Prompt:');
    console.log('=' .repeat(80));
    console.log(prompt);
    console.log('=' .repeat(80));
    
    console.log('\n💡 Note: This shows the complete prompt that would be sent to the AI model.');
    console.log('   To test with actual AI, use the API endpoint /api/expenses/parse-from-text');
    
  } catch (error) {
    console.error(`❌ Error testing prompt: ${error}`);
  }
}

function showHelp() {
  console.log(`
🚀 Prompt Management CLI

Usage: pnpm manage-prompts <command> [args...]

Commands:
  list                           List all available prompt templates
  create <name> <version> <desc> Create a new prompt template version
  view <template-name>           View a specific prompt template
  test <template-name> <text>    Test a prompt with sample data
  help                          Show this help message

Examples:
  pnpm manage-prompts list
  pnpm manage-prompts create transaction-parser 2.0 "Improved parsing"
  pnpm manage-prompts view transaction-parser-v1.0
  pnpm manage-prompts test transaction-parser-v1.0 "mua trà sữa 25k"

Template Structure:
  - Templates are stored in prompts/versions/
  - Use {PLACEHOLDER} syntax for dynamic content
  - Available placeholders: CATEGORIES_PLACEHOLDER, WALLETS_PLACEHOLDER, 
    CORRECTION_CONTEXT_PLACEHOLDER, INPUT_TEXT_PLACEHOLDER
`);
}

main().catch(console.error);