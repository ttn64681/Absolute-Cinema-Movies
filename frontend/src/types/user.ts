/**
 * Shared User Types
 * These interfaces match the backend data structure exactly
 */

// Backend user data interface (matches your Java backend)
export interface BackendUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  currentPassword: string;
  newPassword: string;
  address: string;
  state: string;
  country: string;
  homeStreet?: string;
  homeCity?: string;
  homeState?: string;
  homeZip?: string;
  homeCountry?: string;
  enrolledForPromotions?: boolean;
  profileImageLink?: string;
  accountStatus?: 'active' | 'inactive' | 'suspended';
}
