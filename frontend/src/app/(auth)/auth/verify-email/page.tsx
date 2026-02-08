'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NavBar from '@/components/common/navBar/NavBar';
import api from '@/config/api';

/**
 * Email Verification Page Content
 *
 * This component handles email verification when users click the link in their verification email.
 * It extracts the token from the URL and calls the backend verification endpoint.
 */
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'registration-success'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');

  const DEMO_VERIFICATION_CODE = '123456';

  useEffect(() => {
    const verifyEmail = async () => {
      // Get token from URL query parameter
      const token = searchParams.get('token');

      if (!token) {
        // Check if this is a redirect from registration (no token but coming from registration flow)
        const fromRegistration = searchParams.get('from') === 'registration';

        if (fromRegistration) {
          setStatus('registration-success');
          setMessage(
            'Registration successful! A verification email has been sent to your inbox. Please check your email and click the verification link to activate your account.'
          );
        } else {
          setStatus('error');
          setMessage(
            'No verification token found. If you clicked a verification link, please try again. Otherwise, use the form below to request a new verification email.'
          );
        }
        return;
      }

      try {
        // Call verification endpoint
        const response = await api.post(`/api/auth/verify-email?token=${token}`);

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');

          // Store JWT tokens
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }

          // Redirect to login page after 2 seconds with redirect parameter if present
          setTimeout(() => {
            const loginUrl = redirectPath ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}` : '/auth/login';
            router.push(loginUrl);
          }, 2000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed.');
        }
      } catch (error) {
        setStatus('error');
        const errorMessage =
          (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Verification failed. The token may be invalid or expired.';

        // Add more helpful context
        if (errorMessage.includes('expired')) {
          setMessage(
            'This verification link has expired (valid for 24 hours). Please request a new verification email below.'
          );
        } else if (errorMessage.includes('Invalid')) {
          setMessage(
            'This verification link is invalid or has already been used. If you already verified your account, you can try logging in. Otherwise, request a new verification email below.'
          );
        } else {
          setMessage(`Verification failed: ${errorMessage}. Please request a new verification email below.`);
        }
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resendEmail.trim()) {
      setResendStatus('error');
      setResendMessage('Please enter your email address.');
      return;
    }

    setResendStatus('loading');
    setResendMessage('Sending verification email...');

    try {
      console.log('Sending resend verification request for:', resendEmail.trim());
      const response = await api.post(`/api/auth/resend-verification?email=${encodeURIComponent(resendEmail.trim())}`);

      console.log('Resend verification response:', response.data);

      if (response.data.success) {
        setResendStatus('success');
        setResendMessage('Verification email has been sent! Please check your inbox and spam folder.');
        setResendEmail(''); // Clear the form
      } else {
        setResendStatus('error');
        setResendMessage(response.data.message || 'Failed to send verification email.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setResendStatus('error');
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Failed to send verification email. Please try again.';
      setResendMessage(errorMessage);
    }
  };

  const handleDemoVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoEmail.trim()) {
      setDemoError('Enter your email address.');
      return;
    }
    setDemoError('');
    setDemoLoading(true);
    try {
      const response = await api.post(
        `/api/auth/verify-email?token=${encodeURIComponent(DEMO_VERIFICATION_CODE)}&email=${encodeURIComponent(demoEmail.trim())}`
      );
      if (response.data.success) {
        if (response.data.token) localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
        if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user));
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        setTimeout(() => {
          const loginUrl = redirectPath ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}` : '/auth/login';
          router.push(loginUrl);
        }, 2000);
      } else {
        setDemoError(response.data.message || 'Verification failed.');
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed.';
      setDemoError(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Email Verification</h1>
              <p className="text-white/70 text-sm mt-1">Verify your email address to continue</p>
            </div>

            {/* Demo disclaimer: sandbox, bypass code for recruiters/guests */}
            <div className="mb-6 p-3 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs">
              <p className="font-medium text-white/70 mb-1">Demo environment</p>
              <p className="mb-1">Emails are trapped in a sandbox. Use this code to bypass verification:</p>
              <p className="font-mono font-semibold text-acm-pink/90">{DEMO_VERIFICATION_CODE}</p>
            </div>

            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {status === 'verifying' && (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-acm-pink"></div>
              )}
              {status === 'success' && (
                <div className="rounded-full h-16 w-16 bg-green-900/40 border border-green-500/60 flex items-center justify-center">
                  <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {status === 'registration-success' && (
                <div className="rounded-full h-16 w-16 bg-green-900/40 border border-green-500/60 flex items-center justify-center">
                  <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="rounded-full h-16 w-16 bg-red-900/40 border border-red-500/60 flex items-center justify-center">
                  <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>

            {/* Message */}
            <div
              className={`text-center mb-6 p-4 rounded-lg ${
                status === 'verifying'
                  ? 'bg-blue-900/40 border border-blue-500/60 text-blue-200'
                  : status === 'success'
                    ? 'bg-green-900/40 border border-green-500/60 text-green-200'
                    : status === 'registration-success'
                      ? 'bg-green-900/40 border border-green-500/60 text-green-200'
                      : 'bg-red-900/40 border border-red-500/60 text-red-200'
              }`}
            >
              <p className="text-lg font-medium">{message}</p>
              {status === 'success' && <p className="text-sm mt-2 text-white/70">Redirecting to login...</p>}
              {status === 'registration-success' && (
                <p className="text-sm mt-2 text-white/70">
                  Check your email inbox and spam folder for the verification link.
                </p>
              )}
            </div>

            {/* Actions */}
            {status === 'error' && (
              <div className="space-y-4">
                {/* Resend Email Form */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-lg font-medium text-white mb-3 text-center">Request New Verification Email</h3>

                  {/* Resend Status Message */}
                  {resendMessage && (
                    <div
                      className={`mb-4 p-3 rounded-lg text-sm ${
                        resendStatus === 'success'
                          ? 'bg-green-900/40 border border-green-500/60 text-green-200'
                          : resendStatus === 'error'
                            ? 'bg-red-900/40 border border-red-500/60 text-red-200'
                            : 'bg-blue-900/40 border border-blue-500/60 text-blue-200'
                      }`}
                    >
                      {resendMessage}
                    </div>
                  )}

                  <form onSubmit={handleResendEmail} className="space-y-3">
                    <div>
                      <label htmlFor="resendEmail" className="block text-sm font-medium text-white mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="resendEmail"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                        placeholder="Enter your email address"
                        required
                        disabled={resendStatus === 'loading'}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={resendStatus === 'loading'}
                      className="w-full inline-flex justify-center bg-gradient-to-r from-acm-pink to-acm-orange text-white px-5 py-2.5 rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendStatus === 'loading' ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send Verification Email'
                      )}
                    </button>
                  </form>
                </div>

                {/* Verify with demo code */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-sm font-medium text-white/80 mb-2 text-center">Or use demo code to bypass</h3>
                  <form onSubmit={handleDemoVerify} className="space-y-3">
                    {demoError && (
                      <div className="p-2 rounded bg-red-900/40 border border-red-500/60 text-red-200 text-sm">
                        {demoError}
                      </div>
                    )}
                    <div>
                      <label htmlFor="demoEmailError" className="block text-sm font-medium text-white mb-1">
                        Your email
                      </label>
                      <input
                        type="email"
                        id="demoEmailError"
                        title="Email used at registration"
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink text-sm"
                        placeholder="Email you registered with"
                        disabled={demoLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      title="Verify with demo code"
                      disabled={demoLoading}
                      className="w-full inline-flex justify-center bg-white/10 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {demoLoading ? 'Verifying...' : `Verify with code ${DEMO_VERIFICATION_CODE}`}
                    </button>
                  </form>
                </div>

                {/* Alternative Actions */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const loginUrl = redirectPath
                        ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
                        : '/auth/login';
                      router.push(loginUrl);
                    }}
                    className="w-full bg-white/10 text-white py-2 px-4 rounded-md hover:bg-white/20 transition-colors font-medium border border-white/20 cursor-pointer"
                  >
                    Go to Login
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/auth/resend-verification')}
                    className="w-full text-acm-pink hover:text-acm-pink/80 text-sm font-medium cursor-pointer"
                  >
                    Use dedicated resend page
                  </button>
                </div>
              </div>
            )}

            {status === 'success' && (
              <button
                onClick={() => {
                  const loginUrl = redirectPath
                    ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
                    : '/auth/login';
                  router.push(loginUrl);
                }}
                className="w-full inline-flex justify-center bg-gradient-to-r from-acm-pink to-acm-orange text-white px-5 py-2.5 rounded-lg font-semibold hover:brightness-110 transition-all cursor-pointer"
              >
                Go to Login
              </button>
            )}

            {status === 'registration-success' && (
              <div className="space-y-4">
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-sm font-medium text-white/80 mb-2 text-center">Bypass with demo code</h3>
                  <form onSubmit={handleDemoVerify} className="space-y-3">
                    {demoError && (
                      <div className="p-2 rounded bg-red-900/40 border border-red-500/60 text-red-200 text-sm">
                        {demoError}
                      </div>
                    )}
                    <div>
                      <label htmlFor="demoEmail" className="block text-sm font-medium text-white mb-1">
                        Your email
                      </label>
                      <input
                        type="email"
                        id="demoEmail"
                        title="Email used at registration"
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink text-sm"
                        placeholder="Email you registered with"
                        disabled={demoLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      title="Verify with demo code"
                      disabled={demoLoading}
                      className="w-full inline-flex justify-center bg-white/10 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {demoLoading ? 'Verifying...' : `Verify with code ${DEMO_VERIFICATION_CODE}`}
                    </button>
                  </form>
                </div>
                <div className="space-y-2">
                  <button
                    title="Go to Login"
                    type="button"
                    onClick={() => {
                      const loginUrl = redirectPath
                        ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
                        : '/auth/login';
                      router.push(loginUrl);
                    }}
                    className="w-full inline-flex justify-center bg-linear-to-r from-acm-pink to-acm-orange text-white px-5 py-2.5 rounded-lg font-semibold hover:brightness-110 transition-all cursor-pointer"
                  >
                    Go to Login
                  </button>
                  <button
                    title="Resend Verification Email"
                    type="button"
                    onClick={() => router.push('/auth/resend-verification')}
                    className="w-full bg-white/10 text-white py-3 rounded-lg hover:bg-white/20 transition-colors font-medium border border-white/20 cursor-pointer"
                  >
                    Resend Verification Email
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Need help?{' '}
              <a href="/support" className="text-acm-pink hover:text-acm-pink/80 underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
