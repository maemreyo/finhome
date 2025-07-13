import { getRequestConfig } from 'next-intl/server';
 
export default getRequestConfig(async ({ locale }) => {
  // Provide default locale if not defined
  const resolvedLocale = locale || 'en';
  
  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default
  };
});