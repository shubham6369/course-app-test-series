import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student!;

    const body = await req.json().catch(() => ({}));
    const postId = Number(body.post_id);

    if (!postId || isNaN(postId)) {
      return mobileError('Valid post_id is required', 400);
    }

    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) {
      return mobileError('Post not found', 404);
    }

    const existing = await prisma.communityLike.findFirst({
      where: { postId, studentId: student.id },
    });

    let isLiked = false;
    let newLikeCount = post.likeCount;

    if (existing) {
      await prisma.communityLike.delete({ where: { id: existing.id } });
      newLikeCount = Math.max(0, post.likeCount - 1);
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likeCount: newLikeCount },
      });
      isLiked = false;
    } else {
      await prisma.communityLike.create({
        data: { postId, studentId: student.id },
      });
      newLikeCount = post.likeCount + 1;
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likeCount: newLikeCount },
      });
      isLiked = true;
    }

    return NextResponse.json({
      status: 'success',
      liked: isLiked,
      like_count: newLikeCount,
      likes_count: newLikeCount,
      message: isLiked ? 'Post liked' : 'Post unliked',
    });
  } catch (error: any) {
    return mobileError(error.message || 'Failed to update like', 500);
  }
}
