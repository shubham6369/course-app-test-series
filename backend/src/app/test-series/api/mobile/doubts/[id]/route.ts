import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mobileSuccess, mobileError, mobileNotFound } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doubtId = parseInt(id, 10);

    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
      include: {
        student: { select: { id: true, name: true, avatarUrl: true } },
        replies: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!doubt) {
      return mobileNotFound('Doubt not found');
    }

    const data = {
      id: doubt.id,
      student_id: doubt.studentId,
      student_name: doubt.student?.name || doubt.studentName || 'Student',
      student_avatar: doubt.student?.avatarUrl || doubt.studentAvatar,
      subject: doubt.subject,
      question: doubt.question,
      image_url: doubt.imageUrl,
      status: doubt.status,
      created_at: doubt.createdAt.toISOString(),
      replies: doubt.replies.map((r) => ({
        id: r.id,
        doubt_id: r.doubtId,
        author_id: r.authorId,
        author_name: r.authorName,
        author_avatar: r.authorAvatar,
        author_type: r.authorType || 'teacher',
        user_name: r.authorName,
        is_teacher: r.authorType === 'teacher',
        message: r.message,
        image_url: r.imageUrl,
        created_at: r.createdAt.toISOString(),
      })),
    };

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch doubt detail', 500);
  }
}
