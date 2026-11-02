import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    const comments = await prisma.videoComment.findMany({
      where: search
        ? {
            OR: [
              { comment: { contains: search } },
              { studentName: { contains: search } },
              { lesson: { title: { contains: search } } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            videoId: true,
            folder: {
              select: {
                title: true,
                course: {
                  select: { id: true, title: true },
                },
              },
            },
          },
        },
        student: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    const body = await request.json();
    const {
      lessonId,
      comment,
      videoId,
      studentName = session?.name ? `${session.name} (Faculty)` : 'Faculty Instructor',
    } = body;

    if (!lessonId || !comment) {
      return NextResponse.json(
        { status: 'error', message: 'Lesson ID and comment are required' },
        { status: 400 }
      );
    }

    const created = await prisma.videoComment.create({
      data: {
        lessonId: parseInt(lessonId, 10),
        comment,
        videoId: videoId || null,
        studentName,
        studentAvatar: session?.avatarUrl || null,
        isTeacherReply: true,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(
      { status: 'success', data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating video comment:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create comment' },
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
        { status: 'error', message: 'Comment ID is required' },
        { status: 400 }
      );
    }

    await prisma.videoComment.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
