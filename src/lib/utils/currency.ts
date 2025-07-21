// src/lib/utils/currency.ts
// Currency formatting utilities with VND and USD support

export type SupportedCurrency = 'VND' | 'USD';

export interface CurrencyFormatOptions {
  currency: SupportedCurrency;
  locale?: string;
  showSymbol?: boolean;
  compact?: boolean;
}

/**
 * Format price with proper currency formatting for VND and USD
 */
export function formatCurrency(
  amount: number, 
  options: CurrencyFormatOptions = { currency: 'VND', locale: 'vi-VN', showSymbol: true }
): string {
  const { currency, locale = 'vi-VN', showSymbol = true, compact = false } = options;
  
  // Handle VND formatting with dots as thousand separators
  if (currency === 'VND') {
    const vietnameseLocale = locale?.startsWith('vi') ? 'vi-VN' : 'vi-VN';
    
    if (compact && amount >= 1000000) {
      // Format large numbers as 1.5M VND, 2.3M VND, etc.
      const millions = amount / 1000000;
      const formatted = millions % 1 === 0 
        ? millions.toString() 
        : millions.toFixed(1);
      return showSymbol 
        ? `${formatted}M ${currency}` 
        : `${formatted}M`;
    }
    
    // Use Vietnamese number formatting for VND
    const formatter = new Intl.NumberFormat(vietnameseLocale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    const formatted = formatter.format(amount);
    
    // If we want symbol but not using currency style, append VND
    if (showSymbol && !formatted.includes('₫') && !formatted.includes('VND')) {
      return `${formatted} VND`;
    }
    
    return formatted;
  }
  
  // Handle USD formatting
  if (currency === 'USD') {
    const usLocale = locale?.startsWith('en') ? 'en-US' : 'en-US';
    
    if (compact && amount >= 1000) {
      // Format as $1.5K, $2.3M, etc.
      if (amount >= 1000000) {
        const millions = amount / 1000000;
        const formatted = millions % 1 === 0 
          ? millions.toString() 
          : millions.toFixed(1);
        return showSymbol ? `$${formatted}M` : `${formatted}M`;
      } else if (amount >= 1000) {
        const thousands = amount / 1000;
        const formatted = thousands % 1 === 0 
          ? thousands.toString() 
          : thousands.toFixed(1);
        return showSymbol ? `$${formatted}K` : `${formatted}K`;
      }
    }
    
    const formatter = new Intl.NumberFormat(usLocale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  }
  
  // Fallback for unsupported currencies
  return showSymbol ? `${amount} ${currency}` : amount.toString();
}

/**
 * Format price for subscription plans based on locale
 */
export function formatSubscriptionPrice(
  price: number | { monthly: number; yearly: number; currency: string },
  billing: 'monthly' | 'yearly' = 'monthly',
  locale: string = 'vi-VN'
): string {
  let amount: number;
  let currency: SupportedCurrency;
  
  if (typeof price === 'object') {
    amount = billing === 'yearly' ? price.yearly : price.monthly;
    currency = price.currency as SupportedCurrency;
  } else {
    amount = price;
    currency = locale.startsWith('vi') ? 'VND' : 'USD';
  }
  
  return formatCurrency(amount, {
    currency,
    locale,
    showSymbol: true,
    compact: false
  });
}

/**
 * Parse formatted VND price string back to number
 * Handles strings like "199.000", "1.990.000", "199,000 VND"
 */
export function parseVNDPrice(priceString: string): number {
  if (!priceString) return 0;
  
  // Remove currency symbols and text
  let cleaned = priceString
    .replace(/[₫VND\s]/g, '')
    .replace(/,/g, ''); // Remove commas
    
  // For VND, dots are thousand separators, so we need to be careful
  // If there are dots, assume they're thousand separators unless it's clearly a decimal
  if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely a decimal number like "1.99" (USD format)
      return parseFloat(cleaned);
    } else {
      // Likely VND format with dots as thousand separators
      cleaned = cleaned.replace(/\./g, '');
    }
  }
  
  return parseInt(cleaned, 10) || 0;
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  switch (currency) {
    case 'VND':
      return '₫';
    case 'USD':
      return '$';
    default:
      return currency;
  }
}

/**
 * Determine appropriate currency based on locale
 */
export function getCurrencyFromLocale(locale: string): SupportedCurrency {
  if (locale.startsWith('vi')) {
    return 'VND';
  }
  return 'USD';
}

/**
 * Format compact price for UI badges and small displays
 */
export function formatCompactPrice(
  amount: number,
  currency: SupportedCurrency,
  locale: string = 'vi-VN'
): string {
  return formatCurrency(amount, {
    currency,
    locale,
    showSymbol: true,
    compact: true
  });
}

export default {
  formatCurrency,
  formatSubscriptionPrice,
  parseVNDPrice,
  getCurrencySymbol,
  getCurrencyFromLocale,
  formatCompactPrice
};