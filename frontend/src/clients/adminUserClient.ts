/**
 * Admin User Client - Facade for admin user management API operations
 *
 * Used by: Admin users page for managing users
 */

import { buildUrl, endpoints } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

/**
 * Generic request helper - Standardizes all API calls
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  const tokenToUse = adminToken || token;

  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(tokenToUse && { Authorization: `Bearer ${tokenToUse}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Admin User Client API
 */
export const adminUserClient = {
  /**
   * Delete a user and all associated data (cascade deletion)
   * @param userId - User ID to delete
   */
  async deleteUser(userId: number): Promise<void> {
    await request<void>(endpoints.admin.deleteUser(userId), {
      method: 'DELETE',
    });
  },
};



