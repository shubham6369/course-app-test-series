import prisma from '@/lib/prisma';
import { DoubtsClient } from './doubts-client';

export const dynamic = 'force-dynamic';

export default async function AdminDoubtsPage() {
  const doubts = await prisma.doubt.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          targetExam: true,
        },
      },
      replies: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return <DoubtsClient initialDoubts={doubts} />;
}
