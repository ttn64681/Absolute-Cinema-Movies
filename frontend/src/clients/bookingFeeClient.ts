/**
 * Booking Fee Client - Facade for booking fee API operations
 *
 * Used by: Checkout process and admin pricing page
 */

import { buildUrl, endpoints } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

/**
 * Generic request helper - Standardizes all API calls
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export interface BookingFee {
  id: number;
  name: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Booking Fee Client API
 */
export const bookingFeeClient = {
  /**
   * Get all booking fees
   * @returns List of booking fees
   */
  async getAllBookingFees(): Promise<BookingFee[]> {
    return request<BookingFee[]>(endpoints.bookingFees.getAll);
  },

  /**
   * Get booking fee by name
   * @param name - Fee name ('Online Fee' or 'Sales Tax')
   * @returns Booking fee or null if not found
   */
  async getBookingFeeByName(name: string): Promise<BookingFee | null> {
    try {
      return await request<BookingFee>(endpoints.bookingFees.getByName(name));
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Update booking fee price (admin only)
   * @param bookingFeeId - Fee ID
   * @param fee - Updated fee data (at least price)
   * @returns Updated fee
   */
  async updateBookingFee(
    bookingFeeId: number,
    fee: { name?: string; price: number }
  ): Promise<BookingFee> {
    return request<BookingFee>(endpoints.bookingFees.update(bookingFeeId), {
      method: 'PUT',
      body: JSON.stringify(fee),
    });
  },
};


