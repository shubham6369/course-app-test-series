import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    const posts = await prisma.communityPost.findMany({
      where: search
        ? {
            OR: [
              { content: { contains: search } },
              { authorName: { contains: search } },
            ],
          }
        : undefined,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            student: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch community posts' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isPinned } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Post ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.communityPost.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(isPinned !== undefined ? { isPinned: Boolean(isPinned) } : {}),
      },
    });

    return NextResponse.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating community post:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update community post' },
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
        { status: 'error', message: 'Post ID is required' },
        { status: 400 }
      );
    }

    await prisma.communityPost.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting community post:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete community post' },
      { status: 500 }
    );
  }
}
