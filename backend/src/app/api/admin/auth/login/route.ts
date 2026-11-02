import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  signAdminToken,
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_OPTIONS,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Query admin account by email
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare bcrypt password
    const isPasswordValid = await bcrypt.compare(String(password), admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Sign admin JWT
    const token = await signAdminToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatarUrl: admin.avatarUrl,
    });

    const user = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatarUrl: admin.avatarUrl,
    };

    const response = NextResponse.json({
      status: 'success',
      user,
      token, // Also return token in body for mobile/programmatic clients
    });

    // Set HTTP-only aim_admin session cookie
    response.cookies.set(ADMIN_COOKIE_NAME, token, ADMIN_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
