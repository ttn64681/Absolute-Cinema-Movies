'use client';
import { useState, useEffect } from 'react';
import { BackendUser } from '@/types/user';
import { getUserInfo, updateUserInfo, changePassword } from '@/services/userClient';

// useUser: Hook that translates user data between the frontend and backend.

export function useUser(userId: number) {
  const [user, setUser] = useState<Partial<BackendUser> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches user profile data only when userId changes
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError(null);
      console.log('Fetching user info...');

      // Get user data from backend (using userClient)
      const fetchedInfo = await getUserInfo(userId);

      if (fetchedInfo) {
        setUser(fetchedInfo);
        console.log('User info fetched.');
      } else {
        console.log('Failed to load user data.');
        setError('Failed to load user data');
      }
      setIsLoading(false);
    };
    fetchUserInfo();
  }, [userId]);

  // Updates a user's information
  const updateUser = async (userInfo: Partial<BackendUser>) => {
    console.log('Updating user info...');

    // Call userService to 
    const updatedUser = await updateUserInfo(userId, userInfo);

    if (updatedUser) {
      setUser(updatedUser);
      return true;
    } else {
      console.log('Failed to update user data.');
      return false;
    }
  };

  // Updates a user's password
  const updatePassword = async (passwordInfo: Partial<BackendUser>) => {
    console.log('Updating password info...');
    const updatedUser = await changePassword(userId, passwordInfo);

    if (updatedUser) {
      setUser(updatedUser);
      return true;
    } else {
      console.log('Failed to update password data.');
      return false;
    }
  };

  return { user, isLoading, error, updateUser, updatePassword };
}
