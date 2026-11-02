import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
      if (token) {
        const payload = await verifyAdminToken(token);
        if (payload) {
          // Already authenticated, forward to dashboard
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
      return NextResponse.next();
    }

    // Unauthenticated access to protected admin pages
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token validity
    const payload = await verifyAdminToken(token);
    if (!payload) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      // Remove stale/corrupt cookie
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
