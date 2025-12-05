'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/common/navBar/AdminNavBar';
import api, { buildUrl, endpoints } from '@/config/api';
import { BackendUser } from '@/types/user';

interface UserWithStatus extends BackendUser {
  accountStatus: 'active' | 'inactive' | 'suspended';
}

interface Admin {
  id: number;
  email: string;
  profileImageLink?: string;
}

function AdminUsersPage() {
  const [adminList, setAdminList] = useState<Admin[]>([]);
  const [memberList, setMemberList] = useState<UserWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch admins and users from backend
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
      
      let adminsSuccess = false;
      let usersSuccess = false;
        
        // Fetch admins
      try {
        const adminsResponse = await api.get<Admin[]>(endpoints.admin.getAllAdmins);
        console.log('Admins response:', adminsResponse.data);
        setAdminList(adminsResponse.data);
        adminsSuccess = true;
      } catch (adminErr: any) {
        console.error('Error fetching admins:', adminErr);
        console.error('Admin error details:', {
          status: adminErr.response?.status,
          statusText: adminErr.response?.statusText,
          data: adminErr.response?.data,
          message: adminErr.message,
          userMessage: adminErr.userMessage,
        });
        setAdminList([]);
      }
        
        // Fetch users
      try {
        const usersResponse = await api.get<BackendUser[]>(endpoints.users.getAllUsers);
        console.log('Users response:', usersResponse.data);
        const users = usersResponse.data.map((user) => ({
          ...user,
          accountStatus: (user.accountStatus || 'inactive') as 'active' | 'inactive' | 'suspended',
        }));
        setMemberList(users);
        usersSuccess = true;
      } catch (userErr: any) {
        console.error('Error fetching users:', userErr);
        console.error('User error details:', {
          status: userErr.response?.status,
          statusText: userErr.response?.statusText,
          data: userErr.response?.data,
          message: userErr.message,
          userMessage: userErr.userMessage,
        });
        
        // Check if it's an authentication/authorization error
        if (userErr.response?.status === 401 || userErr.response?.status === 403) {
          console.error('Authentication/Authorization error - Admin token may be missing or invalid');
          console.error('Checking for adminToken:', {
            localAdminToken: typeof window !== 'undefined' ? localStorage.getItem('adminToken') : 'N/A',
            sessionAdminToken: typeof window !== 'undefined' ? sessionStorage.getItem('adminToken') : 'N/A',
          });
        }
        
        setMemberList([]);
      }
      
      // Set error only if both failed
      if (!adminsSuccess && !usersSuccess) {
        setError('Failed to load data. Please check your connection and try again.');
      } else if (!adminsSuccess) {
        setError('Failed to load administrators. Users loaded successfully.');
      } else if (!usersSuccess) {
        const errorMsg = 'Failed to load users. Administrators loaded successfully.';
        setError(errorMsg);
        console.error(errorMsg);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Function to suspend/unsuspend a user
  const toggleUserSuspension = async (userId: number, currentStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      const isSuspended = currentStatus === 'suspended';
      const endpoint = isSuspended 
        ? endpoints.admin.unsuspendUser(userId)
        : endpoints.admin.suspendUser(userId);
      
      console.log(`Attempting to ${isSuspended ? 'unsuspend' : 'suspend'} user ${userId} via ${endpoint}`);
      
      const response = await api.put<BackendUser>(endpoint, {});
      const updatedUser = response.data;
      
      console.log('Response received:', updatedUser);
      console.log('Account status from response:', updatedUser.accountStatus);
      
      // Update the user in the list
      setMemberList((prev) =>
        prev.map((user) => {
          if (user.id === userId) {
            const newStatus = updatedUser.accountStatus || (isSuspended ? 'active' : 'suspended');
            console.log(`Updating user ${userId} status from ${user.accountStatus} to ${newStatus}`);
            return {
              ...user,
              accountStatus: newStatus as 'active' | 'inactive' | 'suspended',
            };
          }
          return user;
        })
      );
    } catch (err: any) {
      console.error('Error updating user status:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
      console.error('Full error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: errorMessage
      });
      alert(`Failed to ${currentStatus === 'suspended' ? 'unsuspend' : 'suspend'} user: ${errorMessage}`);
    }
  };


  return (
    <div className="text-white" style={{ backgroundColor: '#1C1C1C', minHeight: '100vh' }}>
      <AdminNavBar />
      <div style={{ height: '120px' }} />

      <div className="flex items-center justify-center gap-10 text-[30px] font-red-rose mt-2 mb-18">
        <Link
          href="/admin/movies"
          className="text-gray-300 hover:text-white transition-colors"
          style={{ fontWeight: 'bold' }}
        >
          Manage Movies
        </Link>
        <Link
          href="/admin/pricing"
          className="text-gray-300 hover:text-white transition-colors"
          style={{ fontWeight: 'bold' }}
        >
          Manage Promotions
        </Link>
        <Link href="/admin/users" className="relative" style={{ color: '#FF478B', fontWeight: 'bold' }}>
          Manage Users
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        </Link>
      </div>

      <div className="max-w-[65rem] mx-auto px-4">
        {/* Administrators */}
        <div className="mb-10">
          <h2 className="text-xl mb-3">Administrators</h2>
          {isLoading ? (
            <div className="text-center py-8 text-white/60">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : (
            <div className="rounded-md overflow-hidden h-48 overflow-y-auto" style={{ backgroundColor: '#242424' }}>
              {adminList.length === 0 ? (
                <div className="text-center py-8 text-white/60">No administrators found</div>
              ) : (
                adminList.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex-1">
                      <span>{admin.email}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Members */}
        <div className="mb-16">
          <h2 className="text-xl mb-3">Members</h2>
          {isLoading ? (
            <div className="text-center py-8 text-white/60">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : (
            <div className="rounded-md overflow-hidden h-48 overflow-y-auto" style={{ backgroundColor: '#242424' }}>
              {memberList.length === 0 ? (
                <div className="text-center py-8 text-white/60">No members found</div>
              ) : (
                memberList.map((user) => (
                  <div key={user.id} className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex-1 flex items-center gap-3">
                      <span>{user.firstName} {user.lastName}</span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          user.accountStatus === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : user.accountStatus === 'suspended'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <button
                        title={user.accountStatus === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                        type="button"
                        onClick={() => toggleUserSuspension(user.id, user.accountStatus)}
                        className="px-4 py-2 rounded-md text-sm font-medium transition-colors border border-white/10 hover:border-white/20 text-white"
                      >
                        {user.accountStatus === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <div style={{ height: '80px' }}></div>
    </div>
  );
}

export default AdminUsersPage;
