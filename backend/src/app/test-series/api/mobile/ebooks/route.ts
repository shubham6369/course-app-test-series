import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET() {
  try {
    const ebooks = await prisma.ebook.findMany({
      orderBy: { id: 'asc' },
    });

    const data = ebooks.map((e) => ({
      id: e.id,
      title: e.title,
      author: e.author,
      description: e.description,
      cover_url: e.coverUrl,
      thumbnail_url: e.coverUrl,
      pdf_url: e.pdfUrl,
      page_count: e.pageCount,
      pages_count: e.pageCount,
      file_size: e.fileSize || '12 MB',
      is_free: e.isFree,
    }));

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch ebooks', 500);
  }
}
