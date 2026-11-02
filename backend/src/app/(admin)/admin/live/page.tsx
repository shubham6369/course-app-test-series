import prisma from '@/lib/prisma';
import { LiveClient } from './live-client';

export const dynamic = 'force-dynamic';

export default async function AdminLivePage() {
  const liveClasses = await prisma.liveClass.findMany({
    orderBy: { scheduledAt: 'asc' },
  });

  return <LiveClient initialClasses={liveClasses} />;
}
