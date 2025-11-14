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
