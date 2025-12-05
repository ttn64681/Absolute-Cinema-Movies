'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Checkbox from '@/components/common/forms/Checkbox';
import AuthFormContainer from '@/components/common/auth/AuthFormContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { validateEmail } from '@/clients/authClient';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();

  // Get redirect path and message from query params
  const redirectPath = searchParams.get('redirect') || '/';
  const message = searchParams.get('message');

  // Show message if provided (e.g., "Please log in to checkout")
  useEffect(() => {
    if (message) {
      showToast(message, 'info');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]); // showToast is stable, don't need it in deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate email format
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Call AuthContext login function
      const response = await login(email, password, rememberMe);

      if (response.success) {
        // Show toast notification and redirect to intended page
        showToast('Welcome! Login successful', 'success');
        router.push(redirectPath);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormContainer title="Login" subtitle="Welcome back to ACM">
      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-500/60 rounded-md">
          <p className="text-red-200 text-sm">{error}</p>
          {error.includes('verify your email') && (
            <div className="mt-2">
              <Link href="/auth/resend-verification" className="text-blue-300 hover:text-blue-200 text-sm underline">
                Resend verification email
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-white text-sm mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-white text-sm mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            id="rememberMe"
            label="Remember Me"
            checked={rememberMe}
            onChange={setRememberMe}
            disabled={isLoading}
          />
          <Link
            href="/auth/forgot-password"
            className="text-sm text-acm-pink hover:text-acm-pink/80 transition-colors cursor-pointer"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          title={isLoading ? 'Logging in...' : 'Login'}
          className="w-full inline-flex justify-center items-center gap-2 bg-linear-to-r from-acm-pink to-acm-orange text-white px-5 py-3 rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-lg cursor-pointer"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-white/70 text-sm">
          Don&apos;t have an account?{' '}
          <Link 
            href={redirectPath !== '/' ? `/auth/register?redirect=${encodeURIComponent(redirectPath)}` : '/auth/register'} 
            className="text-acm-pink hover:text-acm-pink/80 transition-colors cursor-pointer"
          >
            Sign up
          </Link>
        </p>

        <div className="border-t border-white/10 pt-4">
          <p className="text-white/60 text-sm mb-3">Administrator Access</p>
          <Link
            href="/auth/admin-login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-acm-orange/60 text-acm-orange text-sm font-semibold hover:bg-acm-orange/10 hover:border-acm-orange transition-all cursor-pointer"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    </AuthFormContainer>
  );
}

// Wrap in Suspense for useSearchParams
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthFormContainer title="Login" subtitle="Welcome back to ACM">
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-2 border-white/30 border-t-acm-pink rounded-full animate-spin"></div>
            <p className="mt-4 text-white/60">Loading...</p>
          </div>
        </AuthFormContainer>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
