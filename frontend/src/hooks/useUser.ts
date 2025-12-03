'use client';
import { useState, useEffect } from 'react';
import { BackendUser } from '@/types/user';
import { getUserInfo, updateUserInfo, changePassword } from '@/clients/userClient';

/**
 * Hook for user profile operations
 *
 * Responsibilities:
 * - React state management (user data, loading, error)
 * - Fetching user profile data from backend
 * - Updating user profile information
 * - Changing user password
 *
 * Delegates to:
 * - userClient: API calls for user operations
 *
 * @param userId - User ID to fetch/update profile for
 * @returns User state, loading status, error state, and update operations
 */
export function useUser(userId: number) {
  const [user, setUser] = useState<Partial<BackendUser> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches user profile data only when userId changes
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError(null);

      // Get user data from backend (using userClient)
      const fetchedInfo = await getUserInfo(userId);

      if (fetchedInfo) {
        setUser(fetchedInfo);
      } else {
        setError('Failed to load user data');
      }
      setIsLoading(false);
    };
    fetchUserInfo();
  }, [userId]);

  // Updates a user's information
  const updateUser = async (userInfo: Partial<BackendUser>) => {
    const updatedUser = await updateUserInfo(userId, userInfo);

    if (updatedUser) {
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  // Updates a user's password
  const updatePassword = async (passwordInfo: Partial<BackendUser>) => {
    try {
      const updatedUser = await changePassword(userId, passwordInfo);

      if (updatedUser) {
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  };

  return { user, isLoading, error, updateUser, updatePassword };
}
