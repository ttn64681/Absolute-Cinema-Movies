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
      const errorText = await response.text();
      console.error(`[promotionClient] API Error [${response.status}]:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[promotionClient] Request failed for ${url}:`, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to reach backend at ${url}.... breh`);
    }
    throw error;
  }
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
   */
  async getAllPromotions(): Promise<BackendPromotion[]> {
    return request<BackendPromotion[]>(endpoints.promotions.getPromotions());
  },

  /**
   * Get promotion by ID
   */
  async getPromotionById(promotionId: number): Promise<BackendPromotion> {
    // Note: getPromotions() returns '/api/promotion/', so we need to append promotionId
    const basePath = endpoints.promotions.getPromotions();
    const path = basePath.endsWith('/') ? `${basePath}${promotionId}` : `${basePath}/${promotionId}`;
    return request<BackendPromotion>(path);
  },

  /**
   * Create a new promotion (admin only)
   */
  async createPromotion(promotion: Omit<BackendPromotion, 'id'>): Promise<BackendPromotion> {
    return request<BackendPromotion>(endpoints.promotions.addPromotion(), {
      method: 'POST',
      body: JSON.stringify(promotion),
    });
  },

  /**
   * Update an existing promotion (admin only)
   */
  async updatePromotion(promotionId: number, promotion: Partial<BackendPromotion>): Promise<BackendPromotion> {
    return request<BackendPromotion>(endpoints.promotions.updatePromotion(promotionId), {
      method: 'PUT',
      body: JSON.stringify(promotion),
    });
  },

  /**
   * Delete a promotion (admin only)
   */
  async deletePromotion(promotionId: number): Promise<void> {
    await request<void>(endpoints.promotions.deletePromotion(promotionId), {
      method: 'DELETE',
    });
  },
};
