import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Protected Proxy Pattern
 * Intercepts route requests BEFORE page render
 * - Checks JWT token from cookies
 * - Validates user role
 * - Redirects unauthorized users
 * - Can access cookies (no localStorage issues)
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie (set by login)
  const token = request.cookies.get('token')?.value;
  const adminToken = request.cookies.get('adminToken')?.value;

  // Public routes - allow all
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/'];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Admin routes - require admin token
  if (pathname.startsWith('/admin')) {
    if (!token || !adminToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // TODO: Validate token and role (decode JWT)
    return NextResponse.next();
  }

  // User routes - require user token (but NOT admin token)
  if (pathname.startsWith('/user')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (adminToken) {
      // Admin trying to access user route - redirect to admin
      return NextResponse.redirect(new URL('/admin/users', request.url));
    }
    // TODO: Validate token (decode JWT)
    return NextResponse.next();
  }

  // Booking routes - require user token
  if (pathname.startsWith('/booking')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  // Allow all other routes
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
