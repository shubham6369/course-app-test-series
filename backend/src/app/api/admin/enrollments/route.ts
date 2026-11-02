import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const type = searchParams.get('type');

    const enrollments = await prisma.enrollment.findMany({
      where: {
        ...(type && type !== 'all' ? { itemType: type } : {}),
        ...(search
          ? {
              OR: [
                { student: { name: { contains: search } } },
                { student: { email: { contains: search } } },
                { student: { phone: { contains: search } } },
                { course: { title: { contains: search } } },
                { testSeries: { title: { contains: search } } },
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
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
        testSeries: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: enrollments,
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, itemType, itemId, validityDays = 365 } = body;

    if (!studentId || !itemType || !itemId) {
      return NextResponse.json(
        { status: 'error', message: 'Student ID, item type, and item ID are required' },
        { status: 400 }
      );
    }

    const sId = parseInt(studentId, 10);
    const itId = parseInt(itemId, 10);
    const validUntil = new Date(Date.now() + parseInt(validityDays, 10) * 24 * 60 * 60 * 1000);

    const enrollment = await prisma.enrollment.upsert({
      where: {
        studentId_itemType_itemId: {
          studentId: sId,
          itemType,
          itemId: itId,
        },
      },
      update: {
        validUntil,
        isActive: true,
      },
      create: {
        studentId: sId,
        itemType,
        itemId: itId,
        courseId: itemType === 'course' ? itId : null,
        testSeriesId: itemType === 'test_series' ? itId : null,
        validUntil,
        isActive: true,
      },
      include: {
        student: true,
        course: true,
        testSeries: true,
      },
    });

    return NextResponse.json(
      { status: 'success', data: enrollment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.enrollment.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update enrollment' },
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
        { status: 'error', message: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    await prisma.enrollment.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Enrollment revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking enrollment:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to revoke enrollment' },
      { status: 500 }
    );
  }
}
