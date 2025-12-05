/**
 * Ticket Category Client - Facade for ticket category API operations
 *
 * Used by: Admin pricing page for managing ticket prices
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

export interface TicketCategory {
  id: number;
  name: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Ticket Category Client API
 */
export const ticketCategoryClient = {
  /**
   * Get all ticket categories
   * @returns List of ticket categories ordered by price
   */
  async getAllTicketCategories(): Promise<TicketCategory[]> {
    return request<TicketCategory[]>(endpoints.ticketCategories.getAll);
  },

  /**
   * Get ticket category by name
   * @param name - Category name ('adult', 'child', 'senior')
   * @returns Ticket category or null if not found
   */
  async getTicketCategoryByName(name: string): Promise<TicketCategory | null> {
    try {
      return await request<TicketCategory>(endpoints.ticketCategories.getByName(name));
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new ticket category (admin only)
   * @param category - Category data with name and price
   * @returns Created category
   */
  async createTicketCategory(category: { name: string; price: number }): Promise<TicketCategory> {
    return request<TicketCategory>(endpoints.ticketCategories.create, {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  /**
   * Update ticket category price (admin only)
   * @param ticketCategoryId - Category ID
   * @param category - Updated category data (at least price)
   * @returns Updated category
   */
  async updateTicketCategory(
    ticketCategoryId: number,
    category: { name?: string; price: number }
  ): Promise<TicketCategory> {
    return request<TicketCategory>(endpoints.ticketCategories.update(ticketCategoryId), {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },

  /**
   * Delete a ticket category (admin only)
   * @param ticketCategoryId - Category ID to delete
   */
  async deleteTicketCategory(ticketCategoryId: number): Promise<void> {
    await request<void>(endpoints.ticketCategories.delete(ticketCategoryId), {
      method: 'DELETE',
    });
  },
};



