import prisma from '@/lib/prisma';
import { CommunityClient } from './community-client';

export const dynamic = 'force-dynamic';

export default async function AdminCommunityPage() {
  const posts = await prisma.communityPost.findMany({
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    include: {
      comments: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return <CommunityClient initialPosts={posts} />;
}
