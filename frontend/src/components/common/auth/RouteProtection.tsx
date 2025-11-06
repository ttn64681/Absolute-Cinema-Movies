'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'user';
}

export default function RouteProtection({ children, requiredRole }: RouteProtectionProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const hasAdminToken = !!adminToken;

      setIsCheckingToken(false);

      if (requiredRole === 'admin') {
        // Admin routes require admin token
        if (!isAuthenticated || !hasAdminToken) {
          setHasRequiredRole(false);
          router.push(isAuthenticated ? '/' : '/auth/login');
        } else {
          setHasRequiredRole(true);
        }
      } else {
        // User routes require regular user (NO admin token)
        if (!isAuthenticated) {
          setHasRequiredRole(false);
          router.push('/auth/login');
        } else if (hasAdminToken) {
          // Admin trying to access user route - redirect immediately
          setHasRequiredRole(false);
          router.push('/admin/users');
        } else {
          // Regular user accessing user route - allow
          setHasRequiredRole(true);
        }
      }
    }
  }, [isLoading, isAuthenticated, router, requiredRole]);

  if (isLoading || isCheckingToken || !hasRequiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
