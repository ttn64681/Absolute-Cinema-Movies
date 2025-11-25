/**
 * Promotion Client - Facade for promotion API operations
 *
 * Used by: usePromotions hook
 */

import { buildUrl, endpoints } from '@/config/api';
import { BackendPromotion } from '@/types/promotion';
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
    const errorText = await response.text();
    console.error(`API Error [${response.status}]:`, errorText);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('API Response:', path, data);
  return data;
}

/**
 * Promotion Client API
 *
 * Provides methods for all promotion-related operations:
 * - Get all promotions
 * - Get promotion by ID
 * - Create promotion (admin)
 * - Update promotion (admin)
 * - Delete promotion (admin)
 */
export const promotionClient = {
  /**
   * Get all promotions
   *
   * @returns Array of all promotions
   */
  async getAllPromotions(): Promise<BackendPromotion[]> {
    return request<BackendPromotion[]>(endpoints.promotions.getPromotions());
  },

  /**
   * Get promotion by ID
   *
   * @param promotionId - Promotion ID
   * @returns Promotion details
   */
  async getPromotionById(promotionId: number): Promise<BackendPromotion> {
    // Note: getPromotions() returns '/api/promotion/', so we need to append promotionId
    const basePath = endpoints.promotions.getPromotions();
    const path = basePath.endsWith('/') ? `${basePath}${promotionId}` : `${basePath}/${promotionId}`;
    return request<BackendPromotion>(path);
  },

  /**
   * Create a new promotion (admin only)
   *
   * @param promotion - Promotion data (without id)
   * @returns Created promotion
   */
  async createPromotion(promotion: Omit<BackendPromotion, 'id'>): Promise<BackendPromotion> {
    return request<BackendPromotion>(endpoints.promotions.addPromotion(), {
      method: 'POST',
      body: JSON.stringify(promotion),
    });
  },

  /**
   * Update an existing promotion (admin only)
   *
   * @param promotionId - Promotion ID
   * @param promotion - Partial promotion data to update
   * @returns Updated promotion
   */
  async updatePromotion(promotionId: number, promotion: Partial<BackendPromotion>): Promise<BackendPromotion> {
    return request<BackendPromotion>(endpoints.promotions.updatePromotion(promotionId), {
      method: 'PUT',
      body: JSON.stringify(promotion),
    });
  },

  /**
   * Delete a promotion (admin only)
   *
   * @param promotionId - Promotion ID
   */
  async deletePromotion(promotionId: number): Promise<void> {
    try {
      const response = await fetch(buildUrl(endpoints.promotions.deletePromotion(promotionId)), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete promotion error:', errorText);
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while deleting promotion');
    }
  },
};
