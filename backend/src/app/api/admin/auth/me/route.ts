import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, extractAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = extractAdminToken(request);

    if (!token) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized: No active session' },
        { status: 401 }
      );
    }

    const payload = await verifyAdminToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          ...(payload.id ? [{ id: payload.id }] : []),
          ...(payload.email ? [{ email: payload.email }] : []),
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { status: 'error', message: 'Admin account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      user: admin,
    });
  } catch (error) {
    console.error('Admin /me error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
