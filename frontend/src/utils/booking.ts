/**
 * Booking calculation utilities
 */

export const TICKET_PRICES = {
  adult: 18.5,
  child: 12.0,
  senior: 10.0,
} as const;

export const TAX_RATE = 0.0875;
export const BOOKING_FEE = 4.5;

/**
 * Calculate booking total from ticket counts
 */
export function calculateBookingTotal(adultCount: number, childCount: number, seniorCount: number) {
  const subtotal = 
    adultCount * TICKET_PRICES.adult +
    childCount * TICKET_PRICES.child +
    seniorCount * TICKET_PRICES.senior;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + BOOKING_FEE;
  
  return { subtotal, tax, bookingFee: BOOKING_FEE, total };
}

/**
 * Generate placeholder ticket IDs
 * TODO: Replace with actual ticket IDs from database
 */
export function generateTicketIds(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `TKT-${i + 1}`);
}

