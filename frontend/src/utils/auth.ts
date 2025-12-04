/**
 * Auth utilities for token handling
 * Centralized auth functions - use these instead of duplicating token retrieval logic
 */

/**
 * Get auth token from localStorage or sessionStorage
 * @returns Token string or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

/**
 * Decode user ID from JWT token
 * @returns User ID or null if token invalid/missing
 */
export function getUserIdFromToken(): number | null {
  if (typeof window === 'undefined') return null; // SSR safety

  const token = getAuthToken();
  if (!token) return null;

  try {
    const [, payloadBase64] = token.split('.');
    if (!payloadBase64) return null;

    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const userData = JSON.parse(decodedPayload);
    return userData.userId || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Get refresh token from localStorage or sessionStorage
 * @returns Refresh token string or null if not found
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
}

/**
 * Cookie utilities for middleware-based role management
 * These functions handle role cookies used by Next.js middleware for route protection
 */

/**
 * Set role cookie for middleware-based routing
 * @param role - User role ('USER' or 'ADMIN')
 */
export function setRoleCookie(role: 'USER' | 'ADMIN'): void {
  if (typeof window === 'undefined') return;
  document.cookie = `role=${role}; path=/; SameSite=Lax`;
}

/**
 * Clear role cookie (used on logout or when tokens invalid)
 * Tries multiple methods to ensure cookie is cleared (handles different cookie attributes)
 */
export function clearRoleCookie(): void {
  if (typeof window === 'undefined') return;
  // Try multiple clearing methods to handle different cookie attributes
  const pastDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `role=; path=/; expires=${pastDate}; SameSite=Lax`;
  document.cookie = `role=; path=/; expires=${pastDate}`;
  document.cookie = `role=; expires=${pastDate}; path=/`;
  document.cookie = `role=; expires=${pastDate}`;
  // Also try with domain if set
  const hostname = window.location.hostname;
  if (hostname !== 'localhost') {
    document.cookie = `role=; domain=${hostname}; path=/; expires=${pastDate}`;
    document.cookie = `role=; domain=.${hostname}; path=/; expires=${pastDate}`;
  }
}

/**
 * Clear admin token cookie
 * Tries multiple methods to ensure cookie is cleared
 */
export function clearAdminTokenCookie(): void {
  if (typeof window === 'undefined') return;
  const pastDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `adminToken=; path=/; expires=${pastDate}; SameSite=Lax`;
  document.cookie = `adminToken=; path=/; expires=${pastDate}`;
  document.cookie = `adminToken=; expires=${pastDate}; path=/`;
  document.cookie = `adminToken=; expires=${pastDate}`;
  const hostname = window.location.hostname;
  if (hostname !== 'localhost') {
    document.cookie = `adminToken=; domain=${hostname}; path=/; expires=${pastDate}`;
    document.cookie = `adminToken=; domain=.${hostname}; path=/; expires=${pastDate}`;
  }
}

/**
 * Clear all auth-related cookies (role, adminToken)
 * Used during logout
 * Note: token cookie removed - not used by middleware
 */
export function clearAllAuthCookies(): void {
  if (typeof window === 'undefined') return;
  clearRoleCookie();
  clearAdminTokenCookie();
}
