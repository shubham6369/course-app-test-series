import prisma from '@/lib/prisma';
import { EbooksClient } from './ebooks-client';

export const dynamic = 'force-dynamic';

export default async function AdminEbooksPage() {
  const ebooks = await prisma.ebook.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <EbooksClient initialEbooks={ebooks} />;
}
