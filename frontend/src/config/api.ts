/**
 * API Configuration
 * Centralized endpoint management for all backend API calls
 */

import axios from 'axios';
import { BackendUser } from '@/types/user';

// Get the base URL from environment variables
const getApiUrl = (): string => {
  // Next.js automatically loads .env files from the project root
  // NEXT_PUBLIC_ variables are available on both client and server
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

// API Configuration object
export const apiConfig = {
  baseUrl: getApiUrl(),

  // All API endpoints organized by feature
  endpoints: {
    // MOVIE ENDPOINTS
    movies: {
      nowPlaying: '/api/movies/now-playing',
      upcoming: '/api/movies/upcoming',

      genres: '/api/movies/genres',

      // GET MOVIE BY MOVIE ID
      byId: (movieId: number) => `/api/movies/${movieId}`, // function taking in movieId

      // MOVIE SEARCH ENDPOINTS
      searchNowPlaying: '/api/movies/search-now-playing',
      searchUpcoming: '/api/movies/search-upcoming',

      // SHOW SCHEDULE ENDPOINTS BY MOVIE ID
      dates: (movieId: number) => `/api/movies/${movieId}/dates`, // function taking in movieId
      times: (movieId: number) => `/api/movies/${movieId}/times`, // function taking in movieId
      showId: (movieId: number) => `/api/movies/${movieId}/show-id`, // Get movie_show.id from movie_id, date, and time

      // OPTIMIZED BROWSING ENDPOINTS (Lightweight)
      browseNowPlaying: '/api/movies/browse/now-playing',
      browseUpcoming: '/api/movies/browse/upcoming',

      // UTILITY ENDPOINTS
      test: '/api/movies/test',
      create: '/api/movies/create',
    },

    // USER ENDPOINTS
    users: {
      getUserById: (userId: number) => `/api/users/${userId}`,
      getUserProfile: (userId: number) => `/api/user/profile?userId=${userId}`, // Consolidated endpoint
      getUserInfo: (userId: number) => `/api/user/info?userId=${userId}`,
      updateUser: (userId: number) => `/api/users/${userId}/info`,
      changePassword: (userId: number) => `/api/users/${userId}/change-password`,
      getAllUsers: '/api/users', // Get all users (admin only)
      resetPassword: (userId: number) => `/api/users/${userId}/forgot-password`, // Admin can reset user password
    },

    // ADMIN ENDPOINTS
    admin: {
      getAllAdmins: '/api/admin/all',
      suspendUser: (userId: number) => `/api/admin/users/${userId}/suspend`,
      unsuspendUser: (userId: number) => `/api/admin/users/${userId}/unsuspend`,
    },

    // ADDRESS ENDPOINTS
    addresses: {
      getUserHomeAddress: (userId: number) => `/api/address/user/${userId}/home`,
      getAddressById: (addressId: number) => `/api/address/${addressId}`,
      updateUserAddress: (addressId: number) => `/api/address/${addressId}`,
    },

    // PAYMENT CARD ENDPOINTS
    paymentCards: {
      getUserPaymentCards: (userId: number) => `/api/payment-card/user/${userId}`,
      getUserDefaultCard: (userId: number) => `/api/payment-card/user/${userId}/default`,
      createPaymentCard: () => `/api/payment-card`,
      updatePaymentCard: (cardId: number) => `/api/payment-card/${cardId}`,
      deletePaymentCard: (cardId: number) => `/api/payment-card/${cardId}`,
      setDefaultCard: (userId: number, cardId: number) => `/api/payment-card/user/${userId}/set-default/${cardId}`,
    },

    // PROMOTION ENDPOINTS
    promotions: {
      getPromotions: () => '/api/promotion/',
      addPromotion: () => '/api/promotion/',
      updatePromotion: (promotionId: number) => `/api/promotion/${promotionId}`,
      deletePromotion: (promotionId: number) => `/api/promotion/${promotionId}`,
    },

    // AUTH ENDPOINTS
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      verifyEmail: '/api/auth/verify-email',
      resendVerification: '/api/auth/resend-verification',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      checkEmail: '/api/auth/check-email',
    },

    // SEAT ENDPOINTS
    seats: {
      getSeatsForShow: (showId: number) => `/api/seats/show/${showId}`,
      reserve: '/api/seats/reserve',
      release: '/api/seats/release',
      releaseBySelection: '/api/seats/release-by-selection', // Release by showId + seat row/number
      checkAvailability: '/api/seats/check-availability',
    },

    // BOOKING ENDPOINTS
    bookings: {
      create: '/api/bookings/create',
      getUserOrders: '/api/bookings/user/orders',
    },

    // MOVIE SHOW ENDPOINTS
    movieShows: {
      getAuditorium: (movieShowId: number) => `/api/movie-shows/${movieShowId}/auditorium`,
    },
  },

  // Helper function to build full URLs
  buildUrl: (endpoint: string): string => {
    return `${apiConfig.baseUrl}${endpoint}`;
  },
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: apiConfig.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to validate JWT token format
function isValidJWT(token: string | null): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  // JWT should have 3 parts separated by periods: header.payload.signature
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

// Add request interceptor for JWT tokens
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage for token
    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    const token = localToken || sessionToken;

    if (token) {
      // Validate token format before sending
      if (isValidJWT(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('Invalid JWT token format detected. Token will not be sent.');
        console.warn('Token value:', token.substring(0, 20) + '...');
        // Clear invalid token
        if (localToken) localStorage.removeItem('token');
        if (sessionToken) sessionStorage.removeItem('token');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and ensure error messages are preserved
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Enhance error object with better error message extraction
    if (error.response) {
      const responseData = error.response.data;

      // If response has error message in data, attach it to error object for easier access
      if (responseData && typeof responseData === 'object') {
        if (responseData.error) {
          error.userMessage = responseData.error;
        } else if (responseData.message) {
          error.userMessage = responseData.message;
        }
      }

      // Set default user-friendly messages for common status codes
      if (!error.userMessage) {
        if (error.response.status === 401 || error.response.status === 403) {
          // Check if it's a booking-related endpoint
          const requestUrl = error.config?.url || '';
          if (requestUrl.includes('/bookings/')) {
            error.userMessage = 'Please log in to complete your booking';
          } else {
            error.userMessage = 'You need to be a logged in user to perform this action';
          }
        } else if (error.response.status === 409) {
          error.userMessage = 'Seats have already been booked. Please select different seats.';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Export individual functions for convenience
export const { buildUrl, endpoints } = apiConfig;

// Export the axios instance as default
export default api;
