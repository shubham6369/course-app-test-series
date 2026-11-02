import prisma from '@/lib/prisma';
import { DeletionRequestsClient } from './deletion-requests-client';

export const dynamic = 'force-dynamic';

export default async function AdminDeletionRequestsPage() {
  const requests = await prisma.deletionRequest.findMany({
    orderBy: { requestedAt: 'desc' },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          targetExam: true,
          _count: {
            select: {
              enrollments: true,
              quizAttempts: true,
            },
          },
        },
      },
    },
  });

  return <DeletionRequestsClient initialRequests={requests} />;
}
