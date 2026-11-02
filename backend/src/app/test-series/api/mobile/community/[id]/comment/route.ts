import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError, mobileNotFound } from '@/lib/api-response';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);

    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student!;

    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) {
      return mobileNotFound('Post not found');
    }

    const body = await req.json().catch(() => ({}));
    const comment = body.comment;

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return mobileError('Comment text is required', 400);
    }

    const newComment = await prisma.communityComment.create({
      data: {
        postId,
        studentId: student.id,
        authorName: student.name,
        comment: comment.trim(),
      },
    });

    await prisma.communityPost.update({
      where: { id: postId },
      data: { replyCount: { increment: 1 } },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Comment posted successfully',
      data: {
        id: newComment.id,
        post_id: newComment.postId,
        author_name: newComment.authorName,
        comment: newComment.comment,
        created_at: newComment.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    return mobileError(error.message || 'Failed to post comment', 500);
  }
}
