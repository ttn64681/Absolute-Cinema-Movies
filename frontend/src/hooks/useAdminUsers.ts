'use client';

import { useState, useEffect, useCallback } from 'react';
import api, { endpoints } from '@/config/api';
import { adminUserClient } from '@/clients/adminUserClient';
import { BackendUser } from '@/types/user';
import { useToast } from '@/contexts/ToastContext';

interface Admin {
  id: number;
  email: string;
  profileImageLink?: string;
}

interface UserWithStatus extends BackendUser {
  accountStatus: 'active' | 'inactive' | 'suspended';
}

/**
 * Hook for admin user management operations
 *
 * Responsibilities:
 * - Fetch admins and users from backend
 * - Suspend/unsuspend users
 * - Delete users with cascade handling
 * - Loading and error state management
 *
 * Delegates to:
 * - api: Admin and user fetching
 * - adminUserClient: User deletion
 * - useToast: User feedback
 *
 * @returns Admin/user lists, loading states, and operations
 */
export function useAdminUsers() {
  const [adminList, setAdminList] = useState<Admin[]>([]);
  const [memberList, setMemberList] = useState<UserWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch admins and users from backend
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let adminsSuccess = false;
    let usersSuccess = false;

    // Fetch admins
    try {
      const adminsResponse = await api.get<Admin[]>(endpoints.admin.getAllAdmins);
      setAdminList(adminsResponse.data);
      adminsSuccess = true;
    } catch (adminErr: any) {
      console.error('Error fetching admins:', adminErr);
      setAdminList([]);
    }

    // Fetch users
    try {
      const usersResponse = await api.get<BackendUser[]>(endpoints.users.getAllUsers);
      const users = usersResponse.data.map((user) => ({
        ...user,
        accountStatus: (user.accountStatus || 'inactive') as 'active' | 'inactive' | 'suspended',
      }));
      setMemberList(users);
      usersSuccess = true;
    } catch (userErr: any) {
      console.error('Error fetching users:', userErr);
      setMemberList([]);
    }

    // Set error only if both failed
    if (!adminsSuccess && !usersSuccess) {
      setError('Failed to load data. Please check your connection and try again.');
    } else if (!adminsSuccess) {
      setError('Failed to load administrators. Users loaded successfully.');
    } else if (!usersSuccess) {
      setError('Failed to load users. Administrators loaded successfully.');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Suspend/unsuspend user
  const toggleUserSuspension = useCallback(
    async (userId: number, currentStatus: 'active' | 'inactive' | 'suspended') => {
      try {
        const isSuspended = currentStatus === 'suspended';
        const endpoint = isSuspended ? endpoints.admin.unsuspendUser(userId) : endpoints.admin.suspendUser(userId);

        const response = await api.put<BackendUser>(endpoint, {});
        const updatedUser = response.data;

        // Update the user in the list
        setMemberList((prev) =>
          prev.map((user) => {
            if (user.id === userId) {
              const newStatus = updatedUser.accountStatus || (isSuspended ? 'active' : 'suspended');
              return {
                ...user,
                accountStatus: newStatus as 'active' | 'inactive' | 'suspended',
              };
            }
            return user;
          })
        );

        showToast(`User ${isSuspended ? 'unsuspended' : 'suspended'} successfully`, 'success');
      } catch (err: any) {
        console.error('Error updating user status:', err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
        showToast(`Failed to ${currentStatus === 'suspended' ? 'unsuspend' : 'suspend'} user: ${errorMessage}`, 'error');
      }
    },
    [showToast]
  );

  // Delete user
  const deleteUser = useCallback(
    async (userId: number) => {
      try {
        await adminUserClient.deleteUser(userId);
        // Remove user from list
        setMemberList((prev) => prev.filter((user) => user.id !== userId));
        showToast('User deleted successfully', 'success');
      } catch (err: any) {
        console.error('Error deleting user:', err);
        const errorMessage = err.message || 'Unknown error';
        showToast(`Failed to delete user: ${errorMessage}`, 'error');
      }
    },
    [showToast]
  );

  return {
    adminList,
    memberList,
    isLoading,
    error,
    toggleUserSuspension,
    deleteUser,
    refetch: fetchData,
  };
}



