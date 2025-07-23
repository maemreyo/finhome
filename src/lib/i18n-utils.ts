// src/lib/i18n-utils.ts
// Utilities for i18n namespace management

export interface NamespaceConfig {
  name: string;
  description: string;
  dependencies?: string[];
}

export const AVAILABLE_NAMESPACES: Record<string, NamespaceConfig> = {
  common: {
    name: 'common',
    description: 'Common components and utilities (Index, Layout, Toast)',
  },
  landing: {
    name: 'landing', 
    description: 'Landing page content (LandingPage)',
  },
  auth: {
    name: 'auth',
    description: 'Authentication related content (Auth)',
  },
  dashboard: {
    name: 'dashboard',
    description: 'Dashboard content (Dashboard with all subsections)',
  },
  admin: {
    name: 'admin',
    description: 'Admin panel content (Admin)',
  },
  marketing: {
    name: 'marketing',
    description: 'Marketing pages (Marketing, AboutPage, ContactPage, Privacy, etc)',
  },
  plans: {
    name: 'plans',
    description: 'Financial planning related content (All plan-related namespaces)',
  },
  charts: {
    name: 'charts', 
    description: 'Charts and visualization content (Charts, ScenarioComparison)',
  },
  'financial-laboratory': {
    name: 'financial-laboratory',
    description: 'Financial Laboratory what-if analysis tool (FinancialLaboratory)',
  },
  onboarding: {
    name: 'onboarding',
    description: 'User onboarding tours and tutorials (Onboarding)',
  },
  subscription: {
    name: 'subscription',
    description: 'Subscription and monetization content (SubscriptionPlans, FeatureGates, UpgradePrompts)',
  },
  scenarios: {
    name: 'scenarios',
    description: 'Scenarios and scenario comparison content (Scenario, ScenarioComparison)',
  },
  expenses: {
    name: 'expenses',
    description: 'Expense tracking and budget management content (BudgetManager, ExpenseAnalytics, etc)',
  }
};

/**
 * Load and merge namespace files for a given locale
 */
export async function loadNamespaceMessages(
  locale: string, 
  namespaces: string[] = Object.keys(AVAILABLE_NAMESPACES)
): Promise<Record<string, any>> {
  const messages = {};
  const loadedNamespaces: string[] = [];
  const failedNamespaces: string[] = [];
  
  for (const namespace of namespaces) {
    try {
      const namespaceMessages = (await import(`../../messages/${locale}/${namespace}.json`)).default;
      Object.assign(messages, namespaceMessages);
      loadedNamespaces.push(namespace);
    } catch (error) {
      console.warn(`Failed to load namespace ${namespace} for locale ${locale}:`, error);
      failedNamespaces.push(namespace);
    }
  }
  
  console.log(`Namespace loading summary for ${locale}: loaded ${loadedNamespaces.length}/${namespaces.length} (${loadedNamespaces.join(', ')})`);
  if (failedNamespaces.length > 0) {
    console.warn(`Failed namespaces for ${locale}: ${failedNamespaces.join(', ')}`);
  }
  
  return messages;
}

/**
 * Validate that all required namespaces have been loaded
 */
export function validateNamespaceMessages(
  messages: Record<string, any>, 
  requiredNamespaces: string[]
): { isValid: boolean; missingNamespaces: string[] } {
  const missingNamespaces: string[] = [];
  
  for (const namespace of requiredNamespaces) {
    const config = AVAILABLE_NAMESPACES[namespace];
    if (!config) continue;
    
    // Check if any expected top-level keys from this namespace exist
    // This is a simple validation - you might want to make it more sophisticated
    const hasNamespaceContent = Object.keys(messages).some(key => {
      // Based on the namespace content, check for expected keys
      switch (namespace) {
        case 'common':
          return ['Index', 'Layout', 'Toast'].includes(key);
        case 'landing':
          return key === 'LandingPage';
        case 'auth':
          return key === 'Auth';
        case 'dashboard':
          return key === 'Dashboard';
        case 'admin':
          return key === 'Admin';
        case 'marketing':
          return ['Marketing', 'AboutPage', 'ContactPage', 'CookiePolicyPage', 'PrivacyPolicyPage'].includes(key);
        case 'plans':
          return ['NewPlanPage', 'PlanDetailView', 'CreatePlanForm', 'PlansList'].includes(key);
        case 'charts':
          return ['Charts'].includes(key);
        case 'financial-laboratory':
          return key === 'FinancialLaboratory';
        case 'onboarding':
          return ["OnboardingControls", "OnboardingWelcome", "OnboardingMessages", "OnboardingWelcome", "OnboardingSteps", "OnboardingFinancialPlanning", "OnboardingDashboardFeatures"].includes(key);
        case 'subscription':
          return ['SubscriptionPlans', 'FeatureGates', 'UpgradePrompts', 'BillingPage', 'SubscriptionCommon', 'Features', 'SubscriptionNotifications', 'SubscriptionFaq'].includes(key);
        case 'scenarios':
          return ['ScenarioComparisonTable', 'ScenarioParameterEditor', 'InteractiveParameterSliders', 'ScenarioChart', 'ScenarioComparison', 'CreateScenarioModal', 'ExportScenarios', 'ScenarioCommon', 'SmartScenarios', 'AIAnalysisModal'].includes(key);
        case 'expenses':
          return ['BudgetManager', 'ExpenseAnalytics', 'ExpenseTrackingDashboard', 'GamificationCenter', 'GoalManager', 'UnifiedTransactionForm', 'TransactionsList', 'ExpenseCommon', 'Wallets'].includes(key);
        default:
          return false;
      }
    });
    
    if (!hasNamespaceContent) {
      missingNamespaces.push(namespace);
    }
  }
  
  return {
    isValid: missingNamespaces.length === 0,
    missingNamespaces
  };
}

/**
 * Centralized message loading function used by both request.ts and layout.tsx
 */
export async function loadMessages(locale: string): Promise<Record<string, any>> {
  // Check if namespace loading is enabled via environment variable
  const useNamespaces = process.env.NEXT_PUBLIC_I18N_NAMESPACES === 'true';
  
  if (useNamespaces) {
    console.log(`Loading i18n with namespace mode for locale: ${locale}`);
    
    try {
      // Load all namespace files
      const namespaces = Object.keys(AVAILABLE_NAMESPACES);
      const messages = await loadNamespaceMessages(locale, namespaces);
      
      // In namespace mode, check if we loaded at least some messages
      if (Object.keys(messages).length === 0) {
        throw new Error('No namespace messages loaded');
      }
      
      // Validate namespace messages
      const validation = validateNamespaceMessages(messages, namespaces);
      
      if (!validation.isValid) {
        console.warn(`Missing namespaces for ${locale}:`, validation.missingNamespaces);
        // Continue with partial namespace loading if we have some content
      }
      
      console.log(`Successfully loaded ${namespaces.length - validation.missingNamespaces.length}/${namespaces.length} namespaces for ${locale}`);
      return messages;
    } catch (error) {
      console.error(`Namespace loading failed completely for ${locale}:`, error);
      // Namespace mode failed, but don't fall back to single files
      throw new Error(`Namespace mode enabled but failed to load any namespaces for ${locale}`);
    }
  }
  
  try {
    // Load the single file (default behavior)
    const messages = (await import(`../../messages/${locale}.json`)).default;
    console.log(`Loaded single i18n file for locale: ${locale}`);
    return messages;
  } catch (error) {
    console.error(`Failed to load single file for locale ${locale}:`, error);
    throw new Error(`Failed to load messages for locale ${locale}`);
  }
}

/**
 * Get file size information for namespace analysis
 */
export function getNamespaceStats(): Record<string, { description: string; estimatedSize: string }> {
  return {
    common: { description: AVAILABLE_NAMESPACES.common.description, estimatedSize: '~1.4KB' },
    landing: { description: AVAILABLE_NAMESPACES.landing.description, estimatedSize: '~2.6KB' },
    auth: { description: AVAILABLE_NAMESPACES.auth.description, estimatedSize: '~4.2KB' },
    dashboard: { description: AVAILABLE_NAMESPACES.dashboard.description, estimatedSize: '~21.6KB' },
    admin: { description: AVAILABLE_NAMESPACES.admin.description, estimatedSize: '~2.6KB' },
    marketing: { description: AVAILABLE_NAMESPACES.marketing.description, estimatedSize: '~16.2KB' },
    plans: { description: AVAILABLE_NAMESPACES.plans.description, estimatedSize: '~26.8KB' },
    charts: { description: AVAILABLE_NAMESPACES.charts.description, estimatedSize: '~1.9KB' },
    'financial-laboratory': { description: AVAILABLE_NAMESPACES['financial-laboratory'].description, estimatedSize: '~2.1KB' },
    onboarding: { description: AVAILABLE_NAMESPACES.onboarding.description, estimatedSize: '~3.2KB' },
    subscription: { description: AVAILABLE_NAMESPACES.subscription.description, estimatedSize: '~8.5KB' },
    scenarios: { description: AVAILABLE_NAMESPACES.scenarios.description, estimatedSize: '~7.2KB' },
    expenses: { description: AVAILABLE_NAMESPACES.expenses.description, estimatedSize: '~8.5KB' },
  };
}