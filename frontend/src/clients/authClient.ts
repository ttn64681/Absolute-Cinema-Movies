/**
 * Authentication Client - Facade for authentication API operations
 *
 * Centralizes all auth-related API calls w/ standardized error handling
 * and request configuration.
 *
 * Responsibilities:
 * - HTTP requests to auth endpoints
 * - Request/response formatting
 * - Basic error handling
 *
 * Delegates to:
 * - /utils/auth.ts for token retrieval/parsing
 * - AuthContext for state management
 *
 * Used by: useLogin, useRegister, useLogout, useCheckEmail, useAdminLogin
 *
 * Usage:
 *   const response = await authClient.login({ email, password });
 *   const refreshed = await authClient.refreshToken();
 */

import { getRefreshToken } from '@/utils/auth';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PaymentCardInfo {
  cardType: string;
  cardNumber: string;
  expirationDate: string;
  cardholderName: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  isDefault: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  enrolledForPromotions?: boolean;
  paymentCards?: PaymentCardInfo[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  role?: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/** Parse JSON from response; on failure return a fallback error payload. */
async function parseJsonOrError(response: Response, fallbackMessage: string): Promise<AuthResponse> {
  const text = await response.text();
  try {
    const data = text ? JSON.parse(text) : {};
    if (data && typeof data.success === 'boolean') return data as AuthResponse;
    return { success: false, message: (data as { message?: string })?.message || fallbackMessage };
  } catch {
    return { success: false, message: fallbackMessage };
  }
}

/**
 * Authentication Client API
 *
 * Provides methods for all authN operations:
 * - Login (user & admin)
 * - Registration
 * - Token refresh
 * - Logout
 * - Email validation
 */
export const authClient = {
  /**
   * User login
   *
   * @param credentials - Email, password, and rememberMe flag
   * @returns AuthResponse with token and user info
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return parseJsonOrError(response, 'Network error. Please try again.');
    } catch (error) {
      console.error('authClient.login - Login API error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  },

  /**
   * User registration
   *
   * @param userData - Registration data including user info and optional payment cards
   * @returns AuthResponse with token and user info
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return parseJsonOrError(response, 'Network error. Please try again.');
    } catch (error) {
      console.error('Registration API error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  },

  /**
   * Refresh access token using refresh token
   *
   * @returns AuthResponse with new token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = getRefreshToken();
      console.log('authClient.refreshToken - refreshToken found:', refreshToken ? 'exists' : 'null');

      if (!refreshToken) {
        console.log('authClient.refreshToken - No refresh token found');
        return {
          success: false,
          message: 'No refresh token found',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return parseJsonOrError(response, 'Token refresh failed');
    } catch (error) {
      console.error('authClient.refreshToken - Token refresh error:', error);
      return {
        success: false,
        message: 'Token refresh failed',
      };
    }
  },

  /**
   * Logout (currently client-side only, no backend call needed for JWT)
   *
   * @returns AuthResponse
   */
  async logout(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return parseJsonOrError(response, 'Logout failed');
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  },

  /**
   * Check if email already exists
   *
   * @param email - Email to check
   * @returns AuthResponse indicating if email is available
   */
  async checkEmail(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `email=${encodeURIComponent(email)}`,
      });
      return parseJsonOrError(response, 'Network error. Please try again.');
    } catch (error) {
      console.error('Email check error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  },

  /**
   * Admin login
   *
   * @param credentials - Email, password, and rememberMe flag
   * @returns AuthResponse with admin token and user info
   */
  async adminLogin(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return parseJsonOrError(response, 'Network error. Please try again.');
    } catch (error) {
      console.error('authClient.adminLogin - Admin login API error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  },
};

/**
 * Validation Utilities
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};
