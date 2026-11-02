import prisma from '@/lib/prisma';
import { NotificationsClient } from './notifications-client';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const [notifications, students] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <NotificationsClient
      initialNotifications={notifications}
      students={students}
    />
  );
}
