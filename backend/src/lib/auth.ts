import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'aim_admin';

export const ADMIN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: ADMIN_COOKIE_MAX_AGE,
};

export interface AdminJwtPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  iat?: number;
  exp?: number;
}

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'webphiser_super_secret_jwt_key_2026_aim_edutech';
  return new TextEncoder().encode(secret);
}

/**
 * Signs a JWT token for an authenticated Admin user with a 7-day expiration.
 */
export async function signAdminToken(
  payload: Omit<AdminJwtPayload, 'iat' | 'exp'>
): Promise<string> {
  const secretKey = getJwtSecretKey();
  return await new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    avatarUrl: payload.avatarUrl ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * Verifies an admin JWT token string. Returns the decoded payload or null if invalid.
 */
export async function verifyAdminToken(
  token: string
): Promise<AdminJwtPayload | null> {
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as AdminJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts the admin JWT token from either the HTTP-only cookie or the Authorization header.
 */
export function extractAdminToken(request: Request | NextRequest): string | null {
  // 1. Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Check NextRequest cookies
  if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
    const cookie = (request as NextRequest).cookies.get(ADMIN_COOKIE_NAME);
    if (cookie?.value) return cookie.value;
  }

  // 3. Fallback: Parse raw Cookie header
  const rawCookieHeader = request.headers.get('cookie');
  if (rawCookieHeader) {
    const match = rawCookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${ADMIN_COOKIE_NAME}=`));
    if (match) {
      return decodeURIComponent(match.substring(ADMIN_COOKIE_NAME.length + 1));
    }
  }

  return null;
}

export const DEFAULT_ADMIN_SESSION: AdminJwtPayload = {
  id: 1,
  email: 'admin@aimedutech.com',
  name: 'Administrator',
  role: 'owner',
  avatarUrl: null,
};

/**
 * Reads and verifies the current admin session from Next.js cookie store.
 * Always falls back to DEFAULT_ADMIN_SESSION since authentication is removed.
 */
export async function getAdminSession(): Promise<AdminJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (cookie?.value) {
      const verified = await verifyAdminToken(cookie.value);
      if (verified) return verified;
    }
  } catch {
    // ignore
  }
  return DEFAULT_ADMIN_SESSION;
}

export interface StudentJwtPayload {
  id: number;
  phone: string;
  email?: string | null;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function signStudentToken(payload: { id: number; phone: string; email?: string | null; name: string }): Promise<string> {
  const secretKey = getJwtSecretKey();
  return await new SignJWT({
    id: payload.id,
    phone: payload.phone,
    email: payload.email ?? null,
    name: payload.name,
    role: 'student',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);
}

export async function verifyStudentToken(token: string): Promise<StudentJwtPayload | null> {
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as StudentJwtPayload;
  } catch {
    return null;
  }
}

export function extractBearerToken(request: Request | NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

