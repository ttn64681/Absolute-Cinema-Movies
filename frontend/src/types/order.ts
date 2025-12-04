/**
 * Shared Order Types
 * These interfaces are used for order management
 */

// Ticket information for an order
export interface OrderTickets {
  adult: { count: number; price: number };
  child: { count: number; price: number };
  senior: { count: number; price: number };
}

// Order row interface for order history
export interface OrderRow {
  id: string;
  date: string;
  time: string;
  movie: string;
  bookingNumber: string;
  ticketNumbers: string;
  seats: string[]; // List of seat identifiers (e.g., ["A1", "A2", "B3"])
  showtime: string;
  orderDate: string;
  posterUrl: string;
  tickets: OrderTickets;
  bookingFee: number;
  paymentMethod: string;
  totalAmount?: number; // Final total amount from backend (includes discount)
  promotionName?: string | null; // Promotion name if applied
}
