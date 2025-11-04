'use client';

import RouteProtection from '@/components/common/auth/RouteProtection';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // TEMPORARILY DISABLED FOR TESTING - Remove this comment and uncomment RouteProtection before production
  return <>{children}</>;
  // return <RouteProtection requiredRole="admin">{children}</RouteProtection>;
}
