'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/common/navBar/NavBar';
import AuthFormContainer from '@/components/common/auth/AuthFormContainer';
import { buildUrl, endpoints } from '@/config/api';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token from URL parameters
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);

    try {
      // Call reset password API
      const response = await fetch(buildUrl(endpoints.auth.resetPassword), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Password reset successfully! You can now log in with your new password.');
        setPassword('');
        setConfirmPassword('');
        // Redirect to login page after brief delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-16">
          <div className="w-full max-w-md">
            <AuthFormContainer title="Invalid Reset Link" subtitle="This password reset link is invalid or has expired.">
              <div className="text-center space-y-4">
                <p className="text-white/70">
                  Please request a new password reset link and try again.
                </p>
                <Link
                  href="/auth/forgot-password"
                  className="text-acm-pink hover:text-acm-pink/80 transition-colors cursor-pointer"
                >
                  Request a new password reset
                </Link>
              </div>
            </AuthFormContainer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NavBar />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-16">
        <div className="w-full max-w-md">
          <AuthFormContainer title="Reset Password" subtitle="Enter and confirm your new password">
            {error && (
              <div className="mb-4 p-3 bg-red-900/40 border border-red-500/60 rounded-md">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-900/40 border border-green-500/60 rounded-md">
                <p className="text-green-200 text-sm">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                  placeholder="Enter your new password"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center gap-2 bg-linear-to-r from-acm-pink to-acm-orange text-white px-5 py-3 rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-lg cursor-pointer"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70 text-sm">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="text-acm-pink hover:text-acm-pink/80 transition-colors cursor-pointer"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </AuthFormContainer>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

