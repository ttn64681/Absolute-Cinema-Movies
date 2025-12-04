import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Protected Proxy Pattern
 *
 * Intercepts route requests BEFORE page render
 * - Uses lightweight role cookie for routing decisions
 * - Redirects unauthorized users
 *
 * Access Rules:
 * - Non-logged in: Can access all public pages (home, movies, auth)
 * - Logged in users: Can access user pages, checkout, and public pages
 * - Admins: Can ONLY access admin pages and logout (isolated)
 *
 * Backend still validates JWT for APIs; middleware only needs coarse role info.
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get role from cookie set by AuthContext (only source of truth)
  const roleCookie = request.cookies.get('role')?.value;

  let role: 'USER' | 'ADMIN' | null = null;

  if (roleCookie === 'ADMIN' || roleCookie === 'USER') {
    role = roleCookie;
  }

  // Lightweight diagnostics to verify middleware execution and routing decisions
  console.log('[middleware] path:', pathname, '| roleCookie:', roleCookie ?? 'null', '| derived role:', role ?? 'null');

  const isAdmin = role === 'ADMIN';
  const isLoggedInUser = role === 'USER';

  // ============================================
  // ADMIN ROUTES - Only admins can access
  // ============================================
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      // Not admin - redirect to login
      console.log('[middleware] BLOCKING /admin access - redirecting to admin-login');
      return NextResponse.redirect(new URL('/auth/admin-login', request.url));
    }
    // Admin has access
    console.log('[middleware] ALLOWING /admin access - user is admin');
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

    // Block admins from all other pages - redirect to admin home page
    return NextResponse.redirect(new URL('/admin', request.url));
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
      // Not logged in - redirect to login with return path and friendly message
      const loginUrl = new URL('/auth/login', request.url);
      const fullPath = request.nextUrl.pathname + request.nextUrl.search;
      loginUrl.searchParams.set('redirect', fullPath);
      loginUrl.searchParams.set('message', 'Please log in to complete your booking');
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
