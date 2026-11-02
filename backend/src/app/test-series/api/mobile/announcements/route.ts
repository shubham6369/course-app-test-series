import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });

    const data = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      target_audience: a.targetAudience,
      target_id: a.targetId,
      is_published: a.isPublished,
      created_at: a.createdAt.toISOString(),
    }));

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch announcements', 500);
  }
}
