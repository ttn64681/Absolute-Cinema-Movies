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

/**
 * Format payment method display string from card type and number
 * @param cardType - Card type (e.g., "mastercard", "visa")
 * @param cardNumber - Last 4 digits of card number
 * @returns Formatted payment method string (e.g., "Mastercard **** **** **** 1234")
 */
export function formatPaymentMethod(cardType: string | null, cardNumber: string | null): string {
  if (!cardType) return '';
  const formattedType = cardType.charAt(0).toUpperCase() + cardType.slice(1).toLowerCase();
  if (cardNumber && cardNumber.length >= 4) {
    return `${formattedType} **** **** **** ${cardNumber.slice(-4)}`;
  }
  return formattedType;
}





