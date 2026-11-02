import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const requests = await prisma.deletionRequest.findMany({
      where: status && status !== 'all' ? { status } : undefined,
      orderBy: { requestedAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
            targetExam: true,
            _count: {
              select: {
                enrollments: true,
                quizAttempts: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching deletion requests:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch deletion requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body; // action: 'approve' | 'reject'

    if (!id || !action) {
      return NextResponse.json(
        { status: 'error', message: 'Request ID and action are required' },
        { status: 400 }
      );
    }

    const currentReq = await prisma.deletionRequest.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!currentReq) {
      return NextResponse.json(
        { status: 'error', message: 'Deletion request not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Mark as approved and deactivate student account
      const [updatedReq] = await prisma.$transaction([
        prisma.deletionRequest.update({
          where: { id: parseInt(id, 10) },
          data: {
            status: 'approved',
            resolvedAt: new Date(),
          },
        }),
        prisma.student.update({
          where: { id: currentReq.studentId },
          data: { isActive: false },
        }),
      ]);

      return NextResponse.json({
        status: 'success',
        message: 'Account deletion approved and student profile deactivated',
        data: updatedReq,
      });
    } else {
      // Mark as rejected
      const updatedReq = await prisma.deletionRequest.update({
        where: { id: parseInt(id, 10) },
        data: {
          status: 'rejected',
          resolvedAt: new Date(),
        },
      });

      return NextResponse.json({
        status: 'success',
        message: 'Account deletion request rejected',
        data: updatedReq,
      });
    }
  } catch (error) {
    console.error('Error processing deletion request:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update deletion request' },
      { status: 500 }
    );
  }
}
