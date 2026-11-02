import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    const data = banners.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      image_url: b.imageUrl,
      action_type: b.actionType || 'course',
      action_value: b.actionValue ? String(b.actionValue) : '',
      order: b.order,
      target_type: b.actionType || 'course',
      target_id: b.actionValue ? String(b.actionValue) : null,
      action_url: b.actionValue || '',
      sort_order: b.order,
    }));

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch banners', 500);
  }
}
