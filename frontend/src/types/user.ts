/**
 * Shared User Types
 * These interfaces match the backend data structure exactly
 */

// Backend user data interface (matches your Java backend)
// Note: Address information comes from UserProfileDTO.homeAddress separately
export interface BackendUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  currentPassword: string;
  newPassword: string;
  // Home address fields (from UserProfileDTO.homeAddress)
  homeStreet?: string;
  homeCity?: string;
  homeState?: string;
  homeZip?: string;
  homeCountry?: string;
  enrolledForPromotions?: boolean;
  profileImageLink?: string;
}
