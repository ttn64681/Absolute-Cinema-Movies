/**
 * Promotion Utility Functions
 * Pure functions for promotion formatting and transformations
 */

import { BackendPromotion, DiscountType } from '@/types/promotion';

/**
 * Format discount value based on discount type
 * @param promotion - Promotion object
 * @returns Formatted discount string (e.g., "20% OFF" or "$10 OFF")
 */
export function formatDiscount(promotion: BackendPromotion): string {
  if (promotion.discountType === DiscountType.percentage) {
    return `${promotion.discountValue}% OFF`;
  }
  return `$${promotion.discountValue} OFF`;
}

/**
 * Format discount for small promo display (uppercase)
 * @param promotion - Promotion object
 * @returns Formatted discount string in uppercase (e.g., "20% DISCOUNT" or "$10 OFF")
 */
export function formatDiscountForSmallPromo(promotion: BackendPromotion): string {
  if (promotion.discountType === DiscountType.percentage) {
    return `${promotion.discountValue}% DISCOUNT`;
  }
  return `$${promotion.discountValue} OFF`;
}

/**
 * Format expiration date as MM/DD/YYYY
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "12/30/2025")
 */
export function formatExpirationDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}




