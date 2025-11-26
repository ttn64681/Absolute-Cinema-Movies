/**
 * Payment formatting utilities
 */

/**
 * Display card number (server already returns masked format)
 * @param cardNumber - Masked card number from server (e.g., "**** **** **** 1234")
 * @returns Display string or default masked format
 */
export function displayCardNumber(cardNumber: string | undefined): string {
  return cardNumber || '**** **** **** ****';
}

/**
 * Format expiration date to MM/YY format
 * @param dateString - Date string (may be MM/YY or ISO format)
 * @returns Formatted date string (MM/YY) or "--/--" if invalid
 */
export function formatExpirationDate(dateString: string | undefined): string {
  if (!dateString) return '--/--';
  if (dateString.includes('/')) return dateString;
  
  try {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
  } catch {
    return '--/--';
  }
}





