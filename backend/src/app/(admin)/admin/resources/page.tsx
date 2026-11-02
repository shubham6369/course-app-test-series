import prisma from '@/lib/prisma';
import { ResourcesClient } from './resources-client';

export const dynamic = 'force-dynamic';

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <ResourcesClient initialResources={resources} />;
}
