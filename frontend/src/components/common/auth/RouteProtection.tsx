'use client';

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'user';
}

// Temporarily disabled: route protection handled elsewhere / not enforced
export default function RouteProtection({ children }: RouteProtectionProps) {
  return <>{children}</>;
}
