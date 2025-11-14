'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthFormContainer from '@/components/common/auth/AuthFormContainer';
import AuthButtonGroup from '@/components/common/auth/AuthButtonGroup';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { adminLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await adminLogin(email, password, false);

      if (response.success) {
        // Redirect to admin home page
        router.push('/admin/');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Admin login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/auth/login');
  };

  return (
    <AuthFormContainer
      title="Admin Login"
      subtitle="Sign in to access the admin portal"
      maxWidth="md"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-md">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-white text-sm mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-white text-sm mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>

        <AuthButtonGroup
          primaryText={isLoading ? 'Signing In...' : 'Sign In'}
          primaryType="submit"
          primaryLoading={isLoading}
          primaryDisabled={isLoading}
          secondaryText="Back to Login"
          secondaryOnClick={handleGoBack}
          secondaryDisabled={isLoading}
          className="pt-4"
        />
      </form>
    </AuthFormContainer>
  );
}
