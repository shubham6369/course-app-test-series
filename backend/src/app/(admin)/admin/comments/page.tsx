import prisma from '@/lib/prisma';
import { CommentsClient } from './comments-client';

export const dynamic = 'force-dynamic';

export default async function AdminCommentsPage() {
  const comments = await prisma.videoComment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          videoId: true,
          folder: {
            select: {
              title: true,
              course: {
                select: { id: true, title: true },
              },
            },
          },
        },
      },
    },
  });

  return <CommentsClient initialComments={comments} />;
}
