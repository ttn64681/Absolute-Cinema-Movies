/**
 * Payment Card Client - API Facade for payment card operations
 * 
 * Responsibilities:
 * - HTTP requests to payment card endpoints
 * - Authentication headers
 * - Error handling
 * - JSON parsing
 * 
 * Used by: usePaymentCards hook
 * 
 * Follows the same pattern as movieClient.ts
 */

import { buildUrl, endpoints } from '@/config/api';
import { getAuthToken } from '@/utils/auth';
import { PaymentCard, PaymentCardFormData } from '@/types/payment';

/**
 * Shared request helper for payment card API calls
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  if (!text) return null as T;

  return JSON.parse(text);
}

export const paymentClient = {
  /**
   * Get all payment cards for a user
   */
  async getCards(userId: number): Promise<PaymentCard[]> {
    const cards = await request<PaymentCard[]>(endpoints.paymentCards.getUserPaymentCards(userId));
    return Array.isArray(cards) ? cards : [];
  },

  /**
   * Create a new payment card
   */
  async createCard(userId: number, formData: PaymentCardFormData): Promise<void> {
    const payload = {
      userId,
      cardType: formData.cardType,
      cardNumber: formData.cardNumber.replace(/\s+/g, ''),
      expirationDate: formData.expirationDate,
      cardholderName: formData.cardholderName,
      billingStreet: formData.billingStreet,
      billingCity: formData.billingCity,
      billingState: formData.billingState,
      billingZip: formData.billingZip,
      billingCountry: formData.billingCountry,
      isDefault: formData.isDefault,
    };

    await request(endpoints.paymentCards.createPaymentCard(), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update an existing payment card
   */
  async updateCard(userId: number, cardId: number, formData: PaymentCardFormData): Promise<void> {
    const payload = {
      userId,
      cardType: formData.cardType,
      cardNumber: formData.cardNumber.replace(/\s+/g, ''),
      expirationDate: formData.expirationDate,
      cardholderName: formData.cardholderName,
      billingStreet: formData.billingStreet,
      billingCity: formData.billingCity,
      billingState: formData.billingState,
      billingZip: formData.billingZip,
      billingCountry: formData.billingCountry,
      isDefault: formData.isDefault,
    };

    await request(endpoints.paymentCards.updatePaymentCard(cardId), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a payment card
   */
  async deleteCard(cardId: number): Promise<void> {
    await request(endpoints.paymentCards.deletePaymentCard(cardId), {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
        },
    });
  },
};

