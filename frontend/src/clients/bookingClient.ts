/**
 * Booking Client - Facade for booking API operations
 *
 * Centralizes all booking-related API calls with standardized error handling,
 * authentication, and request configuration.
 *
 * Follows Facade pattern: Single interface to complex booking API subsystem
 */

import { buildUrl, endpoints } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

/**
 * Generic request helper - Standardizes all API calls
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const url = buildUrl(path);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw with more context if it's already an Error
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Network error: Unable to reach server at ${url}. Please check if the backend is running.`);
      }
      throw error;
    }
    throw new Error(`Request failed: ${String(error)}`);
  }
}

export interface CreateBookingRequest {
  showId: number;
  seats: Array<{ seatRow: string; seatNumber: string }>;
  ticketTypes: { adult: number; child: number; senior: number };
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  bookingId: string;
  totalAmount: number;
}

/**
 * Booking Client API
 *
 * Provides methods for all booking-related operations
 */
export const bookingClient = {
  /**
   * Create a new booking
   *
   * @param bookingRequest - Booking request with showId, seats, and ticket types
   * @returns Booking response with bookingId and totalAmount
   */
  async createBooking(bookingRequest: CreateBookingRequest): Promise<CreateBookingResponse> {
    return request<CreateBookingResponse>(endpoints.bookings.create, {
      method: 'POST',
      body: JSON.stringify(bookingRequest),
    });
  },
};

