import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() || '';

    const liveClasses = await prisma.liveClass.findMany({
      where: {
        ...(status && status !== 'all' ? { status } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { subject: { contains: search } },
                { instructorName: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json({
      status: 'success',
      data: liveClasses,
    });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch live classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subject,
      instructorName,
      thumbnailUrl,
      scheduledAt,
      durationMinutes = 60,
      streamUrl,
    } = body;

    if (!title || !subject || !instructorName || !scheduledAt) {
      return NextResponse.json(
        { status: 'error', message: 'Required fields missing' },
        { status: 400 }
      );
    }

    const liveClass = await prisma.liveClass.create({
      data: {
        title,
        subject,
        instructorName,
        thumbnailUrl:
          thumbnailUrl ||
          'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500',
        scheduledAt: new Date(scheduledAt),
        durationMinutes: parseInt(durationMinutes, 10) || 60,
        status: 'upcoming',
        streamUrl,
      },
    });

    return NextResponse.json(
      { status: 'success', data: liveClass },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating live class:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create live class' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, streamUrl } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Live class ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.liveClass.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(status ? { status } : {}),
        ...(streamUrl !== undefined ? { streamUrl } : {}),
      },
    });

    return NextResponse.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating live class:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update live class' },
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
        { status: 'error', message: 'Live class ID is required' },
        { status: 400 }
      );
    }

    await prisma.liveClass.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Live class deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting live class:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete live class' },
      { status: 500 }
    );
  }
}
