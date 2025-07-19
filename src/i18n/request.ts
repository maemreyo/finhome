import { getRequestConfig } from 'next-intl/server';
import { loadNamespaceMessages, validateNamespaceMessages, AVAILABLE_NAMESPACES } from '@/lib/i18n-utils';
 
export default getRequestConfig(async ({ locale }) => {
  // Provide default locale if not defined
  const resolvedLocale = locale || 'en';
  
  // Check if namespace loading is enabled via environment variable
  const useNamespaces = process.env.NEXT_PUBLIC_I18N_NAMESPACES === 'true';
  
  if (useNamespaces) {
    console.log(`Loading i18n with namespace mode for locale: ${resolvedLocale}`);
    
    try {
      // Load all namespace files
      const namespaces = Object.keys(AVAILABLE_NAMESPACES);
      const messages = await loadNamespaceMessages(resolvedLocale, namespaces);
      
      // Validate that we have the expected content
      const validation = validateNamespaceMessages(messages, namespaces);
      
      if (!validation.isValid) {
        console.warn(`Missing namespaces for ${resolvedLocale}:`, validation.missingNamespaces);
        // Fallback to single file if validation fails
        throw new Error(`Missing required namespaces: ${validation.missingNamespaces.join(', ')}`);
      }
      
      console.log(`Successfully loaded ${namespaces.length} namespaces for ${resolvedLocale}`);
      return {
        locale: resolvedLocale,
        messages
      };
    } catch (error) {
      console.error(`Namespace loading failed for ${resolvedLocale}, falling back to single file:`, error);
    }
  }
  
  try {
    // Load the single file (default behavior)
    const messages = (await import(`../../messages/${resolvedLocale}.json`)).default;
    console.log(`Loaded single i18n file for locale: ${resolvedLocale}`);
    return {
      locale: resolvedLocale,
      messages
    };
  } catch (error) {
    console.error(`Failed to load any messages for locale ${resolvedLocale}:`, error);
    
    // Final fallback - return empty messages to prevent crash
    return {
      locale: resolvedLocale,
      messages: {}
    };
  }
});