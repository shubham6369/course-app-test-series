import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
    const data = categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      order: c.order,
    }));
    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch categories', 500);
  }
}
