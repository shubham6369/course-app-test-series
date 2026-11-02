import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { id: 'asc' },
    });

    const data = resources.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      file_type: r.type,
      file_url: r.fileUrl,
      file_size: r.fileSize || '2 MB',
      created_at: r.createdAt.toISOString(),
    }));

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch resources', 500);
  }
}
