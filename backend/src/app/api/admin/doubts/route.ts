import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let statusCondition: any = undefined;
    if (status && status !== 'all') {
      if (status === 'open') {
        statusCondition = { in: ['open', 'pending'] };
      } else if (status === 'answered' || status === 'solved') {
        statusCondition = 'solved';
      } else if (status === 'closed') {
        statusCondition = 'closed';
      } else {
        statusCondition = status;
      }
    }

    const doubts = await prisma.doubt.findMany({
      where: {
        ...(statusCondition ? { status: statusCondition } : {}),
        ...(search
          ? {
              OR: [
                { question: { contains: search } },
                { studentName: { contains: search } },
                { subject: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            targetExam: true,
          },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: doubts,
    });
  } catch (error) {
    console.error('Error fetching doubts:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch doubts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    const body = await request.json();
    const {
      doubtId,
      message,
      authorName = session?.name || 'Academic Faculty',
      authorType = 'teacher',
      markSolved = true,
      imageUrl,
    } = body;

    if (!doubtId || !message) {
      return NextResponse.json(
        { status: 'error', message: 'Doubt ID and reply message are required' },
        { status: 400 }
      );
    }

    // Atomic transaction: create reply and update status to solved
    const [reply, updatedDoubt] = await prisma.$transaction([
      prisma.doubtReply.create({
        data: {
          doubtId: parseInt(doubtId, 10),
          authorId: session?.id || 1,
          authorName,
          authorType,
          message,
          imageUrl,
        },
      }),
      prisma.doubt.update({
        where: { id: parseInt(doubtId, 10) },
        data: markSolved ? { status: 'solved' } : {},
        include: {
          replies: true,
        },
      }),
    ]);

    return NextResponse.json(
      { status: 'success', data: { reply, doubt: updatedDoubt } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error replying to doubt:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to post reply' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { status: 'error', message: 'Doubt ID and status are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.doubt.update({
      where: { id: parseInt(id, 10) },
      data: { status },
      include: { replies: true },
    });

    return NextResponse.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating doubt status:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update doubt status' },
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
        { status: 'error', message: 'Doubt ID is required' },
        { status: 400 }
      );
    }

    await prisma.doubt.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Doubt deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting doubt:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete doubt' },
      { status: 500 }
    );
  }
}
