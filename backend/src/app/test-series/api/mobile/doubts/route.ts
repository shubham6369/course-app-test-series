import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    const where: any = {};
    if (statusParam && statusParam !== 'all') {
      where.status = { equals: statusParam };
    }

    const doubts = await prisma.doubt.findMany({
      where,
      include: {
        replies: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = doubts.map((d) => ({
      id: d.id,
      student_id: d.studentId,
      student_name: d.studentName,
      student_avatar: d.studentAvatar,
      subject: d.subject,
      question: d.question,
      image_url: d.imageUrl,
      status: d.status,
      created_at: d.createdAt.toISOString(),
      replies: d.replies.map((r) => ({
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
    }));

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch doubts', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student!;

    let subject = '';
    let question = '';
    let imageUrl: string | null = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      subject = String(formData.get('subject') || '');
      question = String(formData.get('question') || '');
      const file = formData.get('image');
      if (file && typeof file === 'object') {
        imageUrl = '/icons/test_series_logo.jpeg';
      }
    } else {
      const body = await req.json().catch(() => ({}));
      subject = body.subject || '';
      question = body.question || '';
      imageUrl = body.image_url || null;
    }

    if (!subject || !question) {
      return mobileError('Subject and question are required', 400);
    }

    const doubt = await prisma.doubt.create({
      data: {
        studentId: student.id,
        studentName: student.name,
        studentAvatar: student.avatarUrl,
        subject,
        question,
        imageUrl,
        status: 'open',
      },
    });

    const data = {
      id: doubt.id,
      student_id: doubt.studentId,
      student_name: doubt.studentName,
      student_avatar: doubt.studentAvatar,
      subject: doubt.subject,
      question: doubt.question,
      image_url: doubt.imageUrl,
      status: doubt.status,
      created_at: doubt.createdAt.toISOString(),
      replies: [],
    };

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to create doubt', 500);
  }
}
