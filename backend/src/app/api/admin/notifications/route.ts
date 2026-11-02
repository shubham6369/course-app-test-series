import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      status: 'success',
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, body: msgBody, studentId, actionUrl } = body;

    if (!title || !msgBody) {
      return NextResponse.json(
        { status: 'error', message: 'Title and message body are required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        body: msgBody,
        studentId: studentId ? parseInt(studentId, 10) : null,
        actionUrl,
        isRead: false,
      },
    });

    return NextResponse.json(
      { status: 'success', data: notification },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error dispatching notification:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to send notification' },
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
        { status: 'error', message: 'Notification ID is required' },
        { status: 400 }
      );
    }

    await prisma.notification.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
