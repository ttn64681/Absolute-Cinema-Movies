'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/common/navBar/AdminNavBar';
import { StoredUser } from '@/types/admin';

function AdminUsersPage() {
  const [adminList, setAdminList] = useState([
    { id: 1, name: 'Administrator 1' },
    { id: 2, name: 'Administrator 2' },
  ]);

  const [memberList, setMemberList] = useState([
    { id: 1, name: 'Member 1', status: 'active' },
    { id: 2, name: 'Member 2', status: 'inactive' },
    { id: 3, name: 'Member 3', status: 'suspended' },
    { id: 4, name: 'Member 4', status: 'active' },
    { id: 5, name: 'Member 5', status: 'inactive' },
    { id: 6, name: 'Member 6', status: 'active' },
  ]);

  // load users from storage
  useEffect(() => {
    // Check if we're on the client side before accessing sessionStorage
    if (typeof window === 'undefined') return;

    const storedUsers = sessionStorage.getItem('adminUsers');
    if (storedUsers) {
      const users: StoredUser[] = JSON.parse(storedUsers);
      const admins = users.filter((user) => user.type === 'admin');
      const members = users
        .filter((user) => user.type === 'member')
        .map((member) => ({
          ...member,
          status: member.status || 'active', // Default to 'active' if no status
        }));

      if (admins.length) setAdminList((prev) => [...prev, ...admins]);
      if (members.length) setMemberList((prev) => [...prev, ...members]);
    }
  }, []);

  // Function to toggle member suspension status
  const toggleMemberSuspension = (memberId: number) => {
    setMemberList((prev) =>
      prev.map((member) => {
        if (member.id === memberId) {
          const newStatus = member.status === 'suspended' ? 'active' : 'suspended';
          return { ...member, status: newStatus };
        }
        return member;
      })
    );
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
          <div className="rounded-md overflow-hidden h-48 overflow-y-auto" style={{ backgroundColor: '#242424' }}>
            {adminList.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex-1">
                  <span>{admin.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members */}
        <div className="mb-16">
          <h2 className="text-xl mb-3">Members</h2>
          <div className="rounded-md overflow-hidden h-48 overflow-y-auto" style={{ backgroundColor: '#242424' }}>
            {memberList.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex-1 flex items-center gap-3">
                  <span>{member.name}</span>
                  <span className="text-white">
                    ({(member.status || 'active').charAt(0).toUpperCase() + (member.status || 'active').slice(1)})
                  </span>
                </div>
                <div className="flex items-center">
                  <button
                    title="Suspend"
                    type="button"
                    onClick={() => toggleMemberSuspension(member.id)}
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors border border-white/10 hover:border-white/20 text-white"
                  >
                    {member.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: '80px' }}></div>
    </div>
  );
}

export default AdminUsersPage;
