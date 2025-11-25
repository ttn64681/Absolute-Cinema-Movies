import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Protected Proxy Pattern
 *
 * Intercepts route requests BEFORE page render
 * - Checks JWT token from cookies
 * - Validates user role
 * - Redirects unauthorized users
 *
 * Access Rules:
 * - Non-logged in: Can access all public pages (home, movies, auth)
 * - Logged in users: Can access user pages, checkout, and public pages
 * - Admins: Can ONLY access admin pages and logout (isolated)
 *
 * Benefits:
 * - Runs server-side (no race conditions)
 * - Blocks before render (better UX)
 * - Can access cookies (no localStorage issues)
 * - No hydration problems
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies
  const token = request.cookies.get('token')?.value;
  const adminToken = request.cookies.get('adminToken')?.value;

  const isAdmin = !!(token && adminToken);
  const isLoggedInUser = !!(token && !adminToken);

  // ============================================
  // ADMIN ROUTES - Only admins can access
  // ============================================
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      // Not admin - redirect to login
      return NextResponse.redirect(new URL('/auth/admin-login', request.url));
    }
    // Admin has access
    return NextResponse.next();
  }

  // ============================================
  // ADMIN ISOLATION - Block admins from non-admin pages
  // ============================================
  if (isAdmin) {
    // Allow admins to access auth pages (for logout)
    if (pathname.startsWith('/auth')) {
      return NextResponse.next();
    }

    // Allow admins to access static assets and API
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    // Block admins from all other pages - redirect to admin dashboard
    return NextResponse.redirect(new URL('/admin/users', request.url));
  }

  // ============================================
  // USER PROFILE ROUTES - Only logged in users (not admins)
  // ============================================
  if (pathname.startsWith('/user')) {
    if (!isLoggedInUser) {
      // Not logged in - redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Logged in user has access
    return NextResponse.next();
  }

  // ============================================
  // CHECKOUT ROUTE - Only logged in users (not admins)
  // ============================================
  if (pathname.startsWith('/booking/checkout')) {
    if (!isLoggedInUser) {
      // Not logged in - redirect to login with return path (preserve query params)
      const loginUrl = new URL('/auth/login', request.url);
      const fullPath = request.nextUrl.pathname + request.nextUrl.search;
      loginUrl.searchParams.set('redirect', fullPath);
      return NextResponse.redirect(loginUrl);
    }
    // Logged in user has access
    return NextResponse.next();
  }

  // ============================================
  // AUTH ROUTES - Accessible to all
  // ============================================
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // ============================================
  // PUBLIC ROUTES - Accessible to all non-admins
  // ============================================
  // Home, movies, booking (except checkout), promos, etc.
  // Already handled: admins are blocked above, users have access
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)).*)',
  ],
};
