import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    const ebooks = await prisma.ebook.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search } },
              { author: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      status: 'success',
      data: ebooks,
    });
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch ebooks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      author,
      description,
      coverUrl,
      pdfUrl,
      pageCount = 0,
      fileSize = '0 MB',
      isFree = true,
    } = body;

    if (!title || !pdfUrl) {
      return NextResponse.json(
        { status: 'error', message: 'Title and PDF URL are required' },
        { status: 400 }
      );
    }

    const ebook = await prisma.ebook.create({
      data: {
        title,
        author: author || 'Academic Panel',
        description,
        coverUrl,
        pdfUrl,
        pageCount: parseInt(pageCount, 10) || 0,
        fileSize,
        isFree: Boolean(isFree),
      },
    });

    return NextResponse.json(
      { status: 'success', data: ebook },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating ebook:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create ebook' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'E-Book ID is required' },
        { status: 400 }
      );
    }

    await prisma.ebook.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'E-Book deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting ebook:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete ebook' },
      { status: 500 }
    );
  }
}
