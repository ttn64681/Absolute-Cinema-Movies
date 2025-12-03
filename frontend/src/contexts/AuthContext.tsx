'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { authClient, AuthResponse } from '@/clients/authClient';
import { getAuthToken } from '@/utils/auth';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  adminLogin: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // CACHES: Function reference (not behavior) - persists across AuthProvider re-renders
  // CHANGES: Never (empty deps) - BUT will recreate if AuthProvider component unmounts/remounts
  // WITHOUT useCallback: New reference every AuthProvider re-render -> useMemo recreates context → all auth consumers re-render
  // WHY MATTERS: Prevents context recreation cascade
  const checkAuthStatus = useCallback(() => {
    console.log('checkAuthStatus called');
    setIsLoading(true);

    // Check localStorage first, then sessionStorage
    const token = getAuthToken();
    const localToken = localStorage.getItem('token'); // For logging only
    const sessionToken = sessionStorage.getItem('token'); // For logging only
    const rememberMe = localStorage.getItem('rememberMe') === 'true';

    // Check for refresh token
    const localRefreshToken = localStorage.getItem('refreshToken');
    const sessionRefreshToken = sessionStorage.getItem('refreshToken');
    const refreshToken = localRefreshToken || sessionRefreshToken;

    console.log('checkAuthStatus - localToken:', localToken ? 'exists' : 'null');
    console.log('checkAuthStatus - sessionToken:', sessionToken ? 'exists' : 'null');
    console.log('checkAuthStatus - localRefreshToken:', localRefreshToken ? 'exists' : 'null');
    console.log('checkAuthStatus - sessionRefreshToken:', sessionRefreshToken ? 'exists' : 'null');
    console.log(
      'checkAuthStatus - token found:',
      !!token,
      'refreshToken found:',
      !!refreshToken,
      'rememberMe:',
      rememberMe
    );
    console.log('checkAuthStatus - localStorage rememberMe:', localStorage.getItem('rememberMe'));

    if (token && refreshToken) {
      console.log('Attempting to refresh token...');
      // Try to refresh token to validate it
      authClient
        .refreshToken()
        .then((response) => {
          console.log('refreshToken response:', response);
          if (response.success && response.user) {
            console.log('Token refresh successful, setting user:', response.user.email);
            setUser(response.user);
            // Update tokens if refresh was successful
            if (response.token) {
              if (rememberMe) {
                localStorage.setItem('token', response.token);
                if (response.refreshToken) {
                  localStorage.setItem('refreshToken', response.refreshToken);
                }
                console.log('Updated tokens in localStorage');
              } else {
                sessionStorage.setItem('token', response.token);
                if (response.refreshToken) {
                  sessionStorage.setItem('refreshToken', response.refreshToken);
                }
                console.log('Updated tokens in sessionStorage');
              }

              // Trigger custom event to notify other tabs about token refresh
              window.dispatchEvent(
                new CustomEvent('authStateChanged', {
                  detail: { action: 'refresh', rememberMe },
                })
              );
            }
          } else {
            console.log('Token refresh failed, clearing tokens');
            console.log('Refresh failed reason:', response.message);
            // Token is invalid, clear it
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('rememberMe');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('rememberMe');
            setUser(null);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('refreshToken error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('rememberMe');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('rememberMe');
          setUser(null);
          setIsLoading(false);
        });
    } else if (token && !refreshToken) {
      console.log('Access token found but no refresh token, clearing all tokens');
      // Clear all tokens if we have access token but no refresh token
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('rememberMe');
      setUser(null);
      setIsLoading(false);
    } else {
      console.log('No tokens found, user not authenticated');
      setIsLoading(false);
    }
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Removed cross-tab communication to fix logout issues
  // CACHES: Function reference (not behavior) - persists across AuthProvider re-renders
  // CHANGES: Never (empty deps) - BUT will recreate if AuthProvider component unmounts/remounts
  // WITHOUT useCallback: New reference every AuthProvider re-render -> useMemo recreates context → all auth consumers re-render
  // WHY MATTERS: Prevents context recreation cascade
  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<AuthResponse> => {
    console.log('Login attempt - rememberMe:', rememberMe);
    const response = await authClient.login({ email, password, rememberMe });
    console.log('Login response:', response);

    if (response.success && response.user && response.token) {
      console.log('Login successful, storing tokens...');
      setUser(response.user);
      // Store JWT tokens client-side only (stateless - server doesn't store sessions)
      // Remember me = localStorage (persistent), otherwise = sessionStorage (session-only)
      if (rememberMe) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('rememberMe', 'true');
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        // Also set cookie for potential middleware-based protection
        document.cookie = `token=${response.token}; path=/; SameSite=Lax`;
        console.log('Stored tokens in localStorage for remember me');
        console.log('localStorage token after storage:', localStorage.getItem('token') ? 'exists' : 'null');
        console.log('localStorage rememberMe after storage:', localStorage.getItem('rememberMe'));

        // Removed cross-tab communication
      } else {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('rememberMe', 'false');
        if (response.refreshToken) {
          sessionStorage.setItem('refreshToken', response.refreshToken);
        }
        // Also set cookie for potential middleware-based protection
        document.cookie = `token=${response.token}; path=/; SameSite=Lax`;
        console.log('Stored tokens in sessionStorage for session only');
        console.log('sessionStorage token after storage:', sessionStorage.getItem('token') ? 'exists' : 'null');
        console.log('sessionStorage rememberMe after storage:', sessionStorage.getItem('rememberMe'));

        // Removed cross-tab communication
      }

      // Ensure no stale admin markers remain when logging in as a regular user
      localStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminToken');
      document.cookie = `adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    } else {
      console.log('Login failed:', response.message);
    }

    return response;
  }, []);

  const adminLogin = useCallback(async (email: string, password: string, rememberMe = false): Promise<AuthResponse> => {
    console.log('Admin login attempt - rememberMe:', rememberMe);
    const response = await authClient.adminLogin({ email, password, rememberMe });
    console.log('Admin login response:', response);

    if (response.success && response.user && response.token) {
      console.log('Admin login successful, storing tokens...');
      setUser(response.user);
      // Store JWT tokens client-side only (stateless - server doesn't store sessions)
      // Remember me = localStorage (persistent), otherwise = sessionStorage (session-only)
      if (rememberMe) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('adminToken', response.token); // Mark as admin
        localStorage.setItem('rememberMe', 'true');
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        // Also set cookies for potential middleware-based admin protection
        document.cookie = `token=${response.token}; path=/; SameSite=Lax`;
        document.cookie = `adminToken=${response.token}; path=/; SameSite=Lax`;
        console.log('Stored admin tokens in localStorage for remember me');
      } else {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('adminToken', response.token); // Mark as admin
        sessionStorage.setItem('rememberMe', 'false');
        if (response.refreshToken) {
          sessionStorage.setItem('refreshToken', response.refreshToken);
        }
        // Also set cookies for potential middleware-based admin protection
        document.cookie = `token=${response.token}; path=/; SameSite=Lax`;
        document.cookie = `adminToken=${response.token}; path=/; SameSite=Lax`;
        console.log('Stored admin tokens in sessionStorage for session only');
      }
    } else {
      console.log('Admin login failed:', response.message);
    }

    return response;
  }, []);

  // CACHES: Function reference (not behavior) - persists across AuthProvider re-renders
  // CHANGES: Never (empty deps) - BUT will recreate if AuthProvider component unmounts/remounts
  // WITHOUT useCallback: New reference every AuthProvider re-render -> useMemo recreates context → all auth consumers re-render
  // WHY MATTERS: Prevents context recreation cascade
  const logout = useCallback(async (): Promise<void> => {
    console.log('Logout initiated - INSTANT LOGOUT');

    // Clear reservation when user logs out (stop timer and release seats)
    // Dispatch event to clear reservation - ReservationContext will listen for this
    window.dispatchEvent(new CustomEvent('userLogout'));

    // Clear everything immediately - no delays, no complex logic
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();

    // Clear cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    console.log('Logout completed - user logged out instantly');
  }, []);

  // CACHES: Context value object { user, isAuthenticated, isLoading, login, logout, checkAuthStatus } - persists across AuthProvider re-renders
  // CHANGES: When user, isLoading, or function references change - BUT will recreate if AuthProvider component unmounts/remounts
  // WITHOUT useMemo: New object every AuthProvider re-render -> all auth consumers re-render (NavBar, protected routes, etc.)
  // WHY MATTERS: Prevents cascading re-renders across entire auth component tree
  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      adminLogin,
      logout,
      checkAuthStatus,
    }),
    [user, isLoading, login, adminLogin, logout, checkAuthStatus]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
