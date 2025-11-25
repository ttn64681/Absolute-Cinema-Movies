'use client';

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'user';
}

export default function RouteProtection({ children, requiredRole }: RouteProtectionProps) {
  // TEMPORARILY DISABLED: Authentication bypassed for testing
  return <>{children}</>;
}
