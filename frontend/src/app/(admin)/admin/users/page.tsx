'use client';

import Link from 'next/link';
import AdminNavBar from '@/components/common/navBar/AdminNavBar';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useToast } from '@/contexts/ToastContext';
import { PiTrash } from 'react-icons/pi';
import Spinner from '@/components/common/Spinner';

function AdminUsersPage() {
  const { adminList, memberList, isLoading, error, toggleUserSuspension, deleteUser } = useAdminUsers();
  const { showToast } = useToast();

  const handleDeleteUser = async (userId: number, userName: string) => {
    // Use browser confirm for critical delete action (better UX than toast for confirmation)
    if (!confirm(`Are you sure you want to delete ${userName}? This will permanently delete all associated data including bookings, payment cards, and addresses.`)) {
      return;
    }
    await deleteUser(userId);
  };


  return (
    <div className="text-white" style={{ backgroundColor: '#1C1C1C', minHeight: '100vh' }}>
      <AdminNavBar />
      <div style={{ height: '120px' }} />

      <div className="flex items-center justify-center gap-10 text-[30px] font-red-rose mt-2 mb-18">
        <Link
          href="/admin/movies"
          className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          style={{ fontWeight: 'bold' }}
          title="Manage movies and scheduling"
        >
          Manage Movies
        </Link>
        <Link
          href="/admin/pricing"
          className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          style={{ fontWeight: 'bold' }}
          title="Manage pricing, fees, and discounts"
        >
          Manage Pricing
        </Link>
        <Link 
          href="/admin/users" 
          className="relative cursor-pointer" 
          style={{ color: '#FF478B', fontWeight: 'bold' }}
          title="Manage users"
        >
          Manage Users
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Members */}
          <div className="mb-16">
            <h2 className="text-xl font-afacad mb-4">Members</h2>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 bg-[#242424] rounded-md">
                <Spinner size="md" color="pink" />
                <span className="mt-4 text-white/60">Loading members...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400 bg-[#242424] rounded-md">{error}</div>
            ) : (
              <div className="rounded-md overflow-hidden h-[60vh] overflow-y-auto bg-[#242424] border border-white/10">
                {memberList.length === 0 ? (
                  <div className="text-center py-8 text-white/60">No members found</div>
                ) : (
                  memberList.map((user) => (
                    <div key={user.id} className="flex items-center justify-between px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors">
                      <div className="flex-1 flex items-center gap-4 min-w-0">
                        <div className="flex flex-col min-w-0">
                          <span className="font-afacad text-white truncate">{user.firstName} {user.lastName}</span>
                          <span className="text-sm text-white/60 truncate">{user.email}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
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
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <button
                          title={user.accountStatus === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                          type="button"
                          onClick={() => toggleUserSuspension(user.id, user.accountStatus)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-white/10 hover:border-white/20 text-white cursor-pointer whitespace-nowrap"
                        >
                          {user.accountStatus === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        </button>
                        {/* <button
                          title="Delete User"
                          type="button"
                          onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <PiTrash className="text-base" />
                        </button> */}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Administrators */}
          <div className="mb-16">
            <h2 className="text-xl font-afacad mb-4">Administrators</h2>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 bg-[#242424] rounded-md">
                <Spinner size="md" color="pink" />
                <span className="mt-4 text-white/60">Loading administrators...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400 bg-[#242424] rounded-md">{error}</div>
            ) : (
              <div className="rounded-md overflow-hidden h-[60vh] overflow-y-auto bg-[#242424] border border-white/10">
                {adminList.length === 0 ? (
                  <div className="text-center py-8 text-white/60">No administrators found</div>
                ) : (
                  adminList.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="font-afacad text-white truncate block">{admin.email}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ height: '80px' }}></div>
    </div>
  );
}

export default AdminUsersPage;
