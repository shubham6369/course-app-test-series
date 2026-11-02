import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ status: 'success', data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
