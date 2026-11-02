import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractBearerToken } from '@/lib/auth';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError, mobileNotFound } from '@/lib/api-response';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doubtId = parseInt(id, 10);

    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    if (!doubt) {
      return mobileNotFound('Doubt not found');
    }

    const token = extractBearerToken(req);
    let authorId = 1;
    let authorName = 'Faculty Tutor';
    let authorAvatar: string | null = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    let authorType = 'teacher';

    if (token) {
      const auth = await getStudentFromBearer(req, { required: true });
      if (auth.errorResponse) return auth.errorResponse;
      authorId = auth.student!.id;
      authorName = auth.student!.name;
      authorAvatar = auth.student!.avatarUrl;
      authorType = 'student';
    }

    let message = '';
    let imageUrl: string | null = null;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      message = String(formData.get('message') || '');
      const file = formData.get('image');
      if (file && typeof file === 'object') {
        imageUrl = '/icons/test_series_logo.jpeg';
      }
    } else {
      const body = await req.json().catch(() => ({}));
      message = body.message || '';
      imageUrl = body.image_url || null;
    }

    if (!message) {
      return mobileError('Message is required', 400);
    }

    const reply = await prisma.doubtReply.create({
      data: {
        doubtId,
        authorId,
        authorName,
        authorAvatar,
        authorType,
        message,
        imageUrl,
      },
    });

    if (authorType === 'teacher') {
      await prisma.doubt.update({
        where: { id: doubtId },
        data: { status: 'solved' },
      });
    }

    const data = {
      id: reply.id,
      doubt_id: reply.doubtId,
      author_id: reply.authorId,
      author_name: reply.authorName,
      author_avatar: reply.authorAvatar,
      author_type: reply.authorType,
      user_name: reply.authorName,
      is_teacher: reply.authorType === 'teacher',
      message: reply.message,
      image_url: reply.imageUrl,
      created_at: reply.createdAt.toISOString(),
    };

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to post reply', 500);
  }
}
