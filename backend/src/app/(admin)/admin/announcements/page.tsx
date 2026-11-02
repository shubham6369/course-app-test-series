import prisma from '@/lib/prisma';
import { AnnouncementsClient } from './announcements-client';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <AnnouncementsClient initialAnnouncements={announcements} />;
}
