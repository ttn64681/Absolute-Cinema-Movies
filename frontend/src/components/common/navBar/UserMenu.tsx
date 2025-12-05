'use client';

import React, { useState, useEffect, useRef } from 'react';
import UserIcon from './UserIcon';
import MenuItem from './MenuItem';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export default function UserMenu({ onMenuToggle }: UserMenuProps) {
  // State for controlling dropdown visibility
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Check if user is admin
  const isAdmin =
    typeof window !== 'undefined' && (localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken'));

  // useRef creates a reference to DOM elements that persists across re-renders
  // Unlike state, changing ref.current doesn't trigger a re-render
  // Used here to access the actual DOM elements for click detection
  const userMenuRef = useRef<HTMLDivElement>(null); // Reference to the dropdown menu div
  const userIconRef = useRef<HTMLDivElement>(null); // Reference to the user icon container div

  // Effect for handling outside clicks to close dropdown
  useEffect(() => {
    const closeMenuOnOutsideClick = (event: MouseEvent) => {
      // Check if click is outside both the menu and the icon button
      // ref.current gives us access to the actual DOM element
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        userIconRef.current &&
        !userIconRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', closeMenuOnOutsideClick);
    return () => {
      document.removeEventListener('mousedown', closeMenuOnOutsideClick);
    };
  }, []);

  // Event handlers
  const handleMenuToggle = () => {
    const newState = !showUserMenu;
    setShowUserMenu(newState);
    onMenuToggle?.(newState);
  };

  const handleMenuItemClick = () => {
    setShowUserMenu(false);
    onMenuToggle?.(false);
  };

  const handleLogout = async () => {
    // Prevent multiple logout calls from this component
    if (isLoggingOut) {
      console.log('🚪 UserMenu: Logout already in progress, ignoring duplicate call');
      return;
    }

    console.log('🚪 UserMenu: Logout button clicked');
    setIsLoggingOut(true);

    try {
      await logout();
      console.log('🚪 UserMenu: Logout completed, closing menu and navigating');
      setShowUserMenu(false);
      onMenuToggle?.(false);

      // Show success toast notification
      showToast('Signed out successfully', 'success');

      // Add a small delay to ensure logout completes before navigation
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('🚪 UserMenu: Logout error:', error);
      // Even if logout fails, close menu and navigate
      setShowUserMenu(false);
      onMenuToggle?.(false);
      router.push('/');
    } finally {
      // Reset the logout state after a delay
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);
    }
  };

  return (
    <div className="relative">
      {/* User icon button - ref allows us to detect clicks on this element */}
      <div ref={userIconRef}>
        <UserIcon onClick={handleMenuToggle} />
      </div>

      {/* Dropdown menu - ref allows us to detect clicks inside this element */}
      {showUserMenu && (
        <div
          ref={userMenuRef}
          className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50 origin-top-right transition-all duration-200"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white font-medium text-sm">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-white/60 text-xs">{user?.email}</p>
          </div>

          <div className="py-1">
            {/* Menu items - Different for admin vs user */}
            {isAdmin ? (
              <>
                <MenuItem href="/admin/users" onClick={handleMenuItemClick}>
                  Manage Users
                </MenuItem>
                <MenuItem href="/admin/movies" onClick={handleMenuItemClick}>
                  Manage Movies
                </MenuItem>
                <MenuItem href="/admin/pricing" onClick={handleMenuItemClick}>
                  Manage Pricing
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem href="/user/orders" onClick={handleMenuItemClick}>
                  Order History
                </MenuItem>
                <MenuItem href="/user/profile" onClick={handleMenuItemClick}>
                  Account Settings
                </MenuItem>
              </>
            )}
            <div className="border-t border-white/10 my-1"></div>
            <MenuItem onClick={isLoggingOut ? undefined : handleLogout}>
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </MenuItem>
          </div>
        </div>
      )}
    </div>
  );
}
