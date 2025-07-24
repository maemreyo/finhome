// src/lib/services/promptService.ts
// Service for managing AI prompts with versioning and templating

import fs from 'fs';
import path from 'path';

export interface PromptTemplate {
  version: string;
  dateCreated: string;
  description: string;
  content: string;
}

export interface PromptReplacementData {
  categories?: any;
  wallets?: any;
  correctionContext?: string;
  inputText?: string;
  [key: string]: any;
}

export class PromptService {
  private static promptsDir = path.join(process.cwd(), 'prompts', 'versions');
  
  /**
   * Load a prompt template from file
   */
  static async loadPromptTemplate(templateName: string): Promise<PromptTemplate> {
    try {
      const filePath = path.join(this.promptsDir, `${templateName}.txt`);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Parse metadata from the template
      const lines = content.split('\n');
      let version = '';
      let dateCreated = '';
      let description = '';
      let contentStart = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('PROMPT VERSION:')) {
          version = line.replace('PROMPT VERSION:', '').trim();
        } else if (line.startsWith('DATE CREATED:')) {
          dateCreated = line.replace('DATE CREATED:', '').trim();
        } else if (line.startsWith('DESCRIPTION:')) {
          description = line.replace('DESCRIPTION:', '').trim();
        } else if (line.trim() === '' && i > 2) {
          contentStart = i + 1;
          break;
        }
      }
      
      const promptContent = lines.slice(contentStart).join('\n');
      
      return {
        version,
        dateCreated,
        description,
        content: promptContent
      };
    } catch (error) {
      console.error(`Failed to load prompt template ${templateName}:`, error);
      throw new Error(`Prompt template not found: ${templateName}`);
    }
  }
  
  /**
   * Calculate relative dates in Vietnamese timezone
   */
  private static calculateDates() {
    const now = new Date();
    const timezone = 'Asia/Ho_Chi_Minh';
    
    // Helper to format date as YYYY-MM-DD in Vietnamese timezone
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    };
    
    // Calculate relative dates
    const today = new Date(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    return {
      CURRENT_DATE: formatDate(today),
      YESTERDAY_DATE: formatDate(yesterday),
      TOMORROW_DATE: formatDate(tomorrow),
      LAST_WEEK_DATE: formatDate(lastWeek)
    };
  }
  
  /**
   * Process a prompt template with replacements
   */
  static processTemplate(template: PromptTemplate, data: PromptReplacementData): string {
    let processedContent = template.content;
    
    // Calculate date values for time-aware prompts
    const dateValues = this.calculateDates();
    
    // Replace placeholders with actual data
    const replacements = {
      CATEGORIES_PLACEHOLDER: data.categories ? JSON.stringify(data.categories, null, 2) : '',
      WALLETS_PLACEHOLDER: data.wallets ? JSON.stringify(data.wallets, null, 2) : '',
      CORRECTION_CONTEXT_PLACEHOLDER: data.correctionContext || '',
      INPUT_TEXT_PLACEHOLDER: data.inputText || '',
      ...dateValues, // Include calculated dates
      ...data // Allow additional custom replacements
    };
    
    for (const [placeholder, value] of Object.entries(replacements)) {
      const regex = new RegExp(`{${placeholder}}`, 'g');
      processedContent = processedContent.replace(regex, String(value));
    }
    
    return processedContent;
  }
  
  /**
   * Get a ready-to-use prompt for transaction parsing
   */
  static async getTransactionParsingPrompt(data: {
    inputText: string;
    categories: any[];
    wallets: any[];
    correctionContext?: string;
    version?: string;
    debugMode?: boolean; // New: Enable debug output
  }): Promise<string> {
    const templateName = `transaction-parser-v${data.version || '1.0'}`;
    
    try {
      const template = await this.loadPromptTemplate(templateName);
      
      // Prepare category mapping for the prompt
      const categoryMapping = data.categories.map(cat => ({
        id: cat.id,
        name: cat.name_vi,
        name_en: cat.name_en,
        category_key: cat.category_key,
        description: cat.description_vi || cat.description_en
      }));
      
      // Prepare wallet mapping for the prompt
      const walletMapping = data.wallets.map(wallet => ({
        id: wallet.id,
        name: wallet.name,
        type: wallet.wallet_type,
        currency: wallet.currency
      }));
      
      const processedPrompt = this.processTemplate(template, {
        categories: categoryMapping,
        wallets: walletMapping,
        correctionContext: data.correctionContext || '',
        inputText: data.inputText
      });
      
      // If debug mode is enabled, log the actual prompt being used
      if (data.debugMode) {
        // console.log('\n🔍 DEBUG: Generated Prompt');
        // console.log('═'.repeat(80));
        // console.log('Template:', templateName);
        // console.log('Version:', template.version);
        // console.log('Description:', template.description);
        // console.log('Date Created:', template.dateCreated);
        // console.log('─'.repeat(80));
        // console.log('FULL PROMPT CONTENT:');
        // console.log('─'.repeat(80));
        // console.log(processedPrompt);
        // console.log('═'.repeat(80));
        // console.log('Date Context:');
        const dates = this.calculateDates();
        Object.entries(dates).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        console.log('═'.repeat(80));
      }
      
      return processedPrompt;
    } catch (error) {
      console.error('Failed to generate transaction parsing prompt:', error);
      throw error;
    }
  }
  
  /**
   * List available prompt templates
   */
  static getAvailableTemplates(): string[] {
    try {
      const files = fs.readdirSync(this.promptsDir);
      return files
        .filter(file => file.endsWith('.txt'))
        .map(file => file.replace('.txt', ''));
    } catch (error) {
      console.error('Failed to list prompt templates:', error);
      return [];
    }
  }
  
  /**
   * Create a new prompt template version
   */
  static async createPromptVersion(
    baseName: string,
    newVersion: string,
    content: string,
    description: string
  ): Promise<void> {
    const fileName = `${baseName}-v${newVersion}.txt`;
    const filePath = path.join(this.promptsDir, fileName);
    
    const templateContent = `PROMPT VERSION: ${newVersion}
DATE CREATED: ${new Date().toISOString().split('T')[0]}
DESCRIPTION: ${description}

${content}`;
    
    fs.writeFileSync(filePath, templateContent, 'utf-8');
    console.log(`Created new prompt template: ${fileName}`);
  }
}