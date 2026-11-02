import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all /admin routes
  if (pathname.startsWith('/admin')) {
    // If accessing login page, redirect directly to admin dashboard (auth removed)
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Allow unrestricted access to all admin routes without login checks
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

