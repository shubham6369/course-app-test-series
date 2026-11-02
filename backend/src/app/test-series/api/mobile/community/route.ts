import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: false });
    const student = auth.student;

    let likedPostIds = new Set<number>();
    if (student) {
      const userLikes = await prisma.communityLike.findMany({
        where: { studentId: student.id },
        select: { postId: true },
      });
      userLikes.forEach((l) => likedPostIds.add(l.postId));
    }

    const posts = await prisma.communityPost.findMany({
      include: {
        comments: true,
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = posts.map((p) => {
      const isLiked = likedPostIds.has(p.id);
      return {
        id: p.id,
        author_id: p.authorId,
        author_name: p.authorName,
        author_avatar: p.authorAvatar,
        content: p.content,
        image_url: p.imageUrl,
        like_count: p.likeCount,
        reply_count: p.replyCount,
        is_liked: isLiked,
        created_at: p.createdAt.toISOString(),

        // Legacy compatibility keys
        student_id: p.authorId,
        student_name: p.authorName,
        student_avatar: p.authorAvatar,
        likes_count: p.likeCount,
        comments_count: p.replyCount,
      };
    });

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch community posts', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student!;

    let content = '';
    let imageUrl: string | null = null;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      content = String(formData.get('content') || '');
      const file = formData.get('image');
      if (file && typeof file === 'object') {
        imageUrl = '/icons/test_series_logo.jpeg';
      }
    } else {
      const body = await req.json().catch(() => ({}));
      content = body.content || '';
      imageUrl = body.image_url || null;
    }

    if (!content) {
      return mobileError('Post content is required', 400);
    }

    const post = await prisma.communityPost.create({
      data: {
        authorId: student.id,
        authorName: student.name,
        authorAvatar: student.avatarUrl,
        content,
        imageUrl,
        likeCount: 0,
        replyCount: 0,
      },
    });

    const data = {
      id: post.id,
      author_id: post.authorId,
      author_name: post.authorName,
      author_avatar: post.authorAvatar,
      content: post.content,
      image_url: post.imageUrl,
      like_count: 0,
      reply_count: 0,
      is_liked: false,
      created_at: post.createdAt.toISOString(),

      student_id: post.authorId,
      student_name: post.authorName,
      student_avatar: post.authorAvatar,
      likes_count: 0,
      comments_count: 0,
    };

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to create post', 500);
  }
}
