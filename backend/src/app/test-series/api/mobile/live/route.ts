import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET() {
  try {
    const classes = await prisma.liveClass.findMany({
      orderBy: { scheduledAt: 'asc' },
    });

    const data = classes.map((c) => ({
      id: c.id,
      title: c.title,
      subject: c.subject || 'General',
      instructor_name: c.instructorName,
      instructor: c.instructorName,
      thumbnail_url: c.thumbnailUrl,
      scheduled_at: c.scheduledAt.toISOString(),
      duration_minutes: c.durationMinutes || 60,
      status: c.status,
      stream_url: c.streamUrl,
    }));

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch live classes', 500);
  }
}
