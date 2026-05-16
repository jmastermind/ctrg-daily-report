import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? 'fallback-secret';
  return new TextEncoder().encode(secret);
}

async function getPayload(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { id: string; role: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/api/users');

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/reports') ||
    pathname.startsWith('/api/users');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const payload = await getPayload(request);

  if (!payload) {
    // Unauthenticated
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow any authenticated user to read/update their own profile
  const selfMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (selfMatch && selfMatch[1] === payload.id) {
    return NextResponse.next();
  }

  if (isAdminRoute && payload.role !== 'ADMIN') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/reports',
    '/reports/:path*',
    '/admin',
    '/admin/:path*',
    '/api/reports',
    '/api/reports/:path*',
    '/api/users',
    '/api/users/:path*',
  ],
};
