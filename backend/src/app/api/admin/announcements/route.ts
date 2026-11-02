import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      status: 'success',
      data: announcements,
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      targetAudience = 'all',
      targetId = null,
      isPublished = true,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { status: 'error', message: 'Title and content are required' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        targetAudience,
        targetId: targetId ? parseInt(targetId, 10) : null,
        isPublished: Boolean(isPublished),
      },
    });

    return NextResponse.json(
      { status: 'success', data: announcement },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isPublished } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.announcement.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
      },
    });

    return NextResponse.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update announcement' },
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
        { status: 'error', message: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    await prisma.announcement.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
