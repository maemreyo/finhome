#!/usr/bin/env node
// scripts/i18n-migrate.js
// Script to help migrate between single file and namespace-based i18n

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MESSAGES_DIR = path.join(__dirname, '../messages');
const ENV_FILE = path.join(__dirname, '../.env.local');

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    return {};
  }
  
  const content = fs.readFileSync(ENV_FILE, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      env[key] = valueParts.join('=');
    }
  });
  
  return env;
}

function writeEnvFile(env) {
  const content = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(ENV_FILE, content);
}

function enableNamespaces() {
  console.log('🔄 Enabling namespace-based i18n...');
  
  // Check if namespace files exist
  const locales = ['en', 'vi'];
  const namespaces = ['common', 'landing', 'auth', 'dashboard', 'admin', 'marketing', 'plans', 'charts'];
  
  for (const locale of locales) {
    const namespaceDir = path.join(MESSAGES_DIR, locale);
    if (!fs.existsSync(namespaceDir)) {
      console.error(`❌ Namespace directory ${namespaceDir} does not exist`);
      return false;
    }
    
    for (const namespace of namespaces) {
      const namespacePath = path.join(namespaceDir, `${namespace}.json`);
      if (!fs.existsSync(namespacePath)) {
        console.error(`❌ Namespace file ${namespacePath} does not exist`);
        return false;
      }
    }
  }
  
  // Update environment variable
  const env = readEnvFile();
  env.NEXT_PUBLIC_I18N_NAMESPACES = 'true';
  writeEnvFile(env);
  
  console.log('✅ Namespace mode enabled! Restart your development server.');
  console.log('📁 Using namespace files in:', path.join(MESSAGES_DIR, '{en,vi}/'));
  return true;
}

function disableNamespaces() {
  console.log('🔄 Disabling namespace-based i18n...');
  
  // Check if single files exist
  const locales = ['en', 'vi'];
  for (const locale of locales) {
    const singleFile = path.join(MESSAGES_DIR, `${locale}.json`);
    if (!fs.existsSync(singleFile)) {
      console.error(`❌ Single file ${singleFile} does not exist`);
      return false;
    }
  }
  
  // Update environment variable
  const env = readEnvFile();
  env.NEXT_PUBLIC_I18N_NAMESPACES = 'false';
  writeEnvFile(env);
  
  console.log('✅ Single file mode enabled! Restart your development server.');
  console.log('📄 Using single files:', locales.map(l => path.join(MESSAGES_DIR, `${l}.json`)).join(', '));
  return true;
}

function showStatus() {
  const env = readEnvFile();
  const isNamespaceMode = env.NEXT_PUBLIC_I18N_NAMESPACES === 'true';
  
  console.log('📊 I18n Configuration Status:');
  console.log(`Mode: ${isNamespaceMode ? 'Namespace-based' : 'Single file'}`);
  console.log(`Environment variable: NEXT_PUBLIC_I18N_NAMESPACES=${env.NEXT_PUBLIC_I18N_NAMESPACES || 'undefined'}`);
  
  // Check file sizes
  const locales = ['en', 'vi'];
  for (const locale of locales) {
    const singleFile = path.join(MESSAGES_DIR, `${locale}.json`);
    const namespaceDir = path.join(MESSAGES_DIR, locale);
    
    if (fs.existsSync(singleFile)) {
      const singleSize = fs.statSync(singleFile).size;
      console.log(`📄 ${locale}.json: ${(singleSize / 1024).toFixed(1)}KB`);
    }
    
    if (fs.existsSync(namespaceDir)) {
      const namespaceFiles = fs.readdirSync(namespaceDir).filter(f => f.endsWith('.json'));
      const totalNamespaceSize = namespaceFiles.reduce((total, file) => {
        const filePath = path.join(namespaceDir, file);
        return total + fs.statSync(filePath).size;
      }, 0);
      console.log(`📁 ${locale}/ (${namespaceFiles.length} files): ${(totalNamespaceSize / 1024).toFixed(1)}KB`);
    }
  }
}

function showHelp() {
  console.log(`
🌐 I18n Migration Helper

Commands:
  enable     Enable namespace-based i18n loading
  disable    Disable namespace-based i18n loading (use single files)
  status     Show current configuration and file sizes
  help       Show this help message

Examples:
  node scripts/i18n-migrate.js enable
  node scripts/i18n-migrate.js status
`);
}

// Main command handling
const command = process.argv[2];

switch (command) {
  case 'enable':
    enableNamespaces();
    break;
  case 'disable':
    disableNamespaces();
    break;
  case 'status':
    showStatus();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.log('❌ Unknown command. Use "help" to see available commands.');
    showHelp();
    process.exit(1);
}