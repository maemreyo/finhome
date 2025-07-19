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
};

/**
 * Load and merge namespace files for a given locale
 */
export async function loadNamespaceMessages(
  locale: string, 
  namespaces: string[] = Object.keys(AVAILABLE_NAMESPACES)
): Promise<Record<string, any>> {
  const messages = {};
  
  for (const namespace of namespaces) {
    try {
      const namespaceMessages = (await import(`../../messages/${locale}/${namespace}.json`)).default;
      Object.assign(messages, namespaceMessages);
    } catch (error) {
      console.warn(`Failed to load namespace ${namespace} for locale ${locale}:`, error);
    }
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
          return ['Charts', 'ScenarioComparisonTable'].includes(key);
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
  };
}