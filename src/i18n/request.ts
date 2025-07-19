import { getRequestConfig } from 'next-intl/server';
import { loadMessages } from '@/lib/i18n-utils';
 
export default getRequestConfig(async ({ locale }) => {
  // Provide default locale if not defined
  const resolvedLocale = locale || 'en';
  
  try {
    const messages = await loadMessages(resolvedLocale);
    return {
      locale: resolvedLocale,
      messages
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${resolvedLocale}:`, error);
    throw new Error(`Failed to load messages for locale ${resolvedLocale}`);
  }
});