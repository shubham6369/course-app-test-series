import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError, mobileNotFound } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const seriesId = parseInt(id, 10);

    const auth = await getStudentFromBearer(req, { required: false });
    const student = auth.student;

    const series = await prisma.testSeries.findUnique({
      where: { id: seriesId },
      include: {
        category: true,
        quizzes: {
          include: {
            questions: { select: { id: true } },
          },
        },
      },
    });

    if (!series) {
      return mobileNotFound('Test series not found');
    }

    let isPurchased = false;
    let attemptedQuizIds = new Set<number>();
    if (student) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: student.id, itemType: 'test_series', itemId: series.id, isActive: true },
      });
      if (enrollment) isPurchased = true;

      const attempts = await prisma.quizAttempt.findMany({
        where: { studentId: student.id, quizId: { in: series.quizzes.map((q) => q.id) } },
        select: { quizId: true },
      });
      attempts.forEach((a) => attemptedQuizIds.add(a.quizId));
    }

    const data = {
      id: series.id,
      title: series.title,
      description: series.description,
      category: series.category?.name || 'General',
      price: series.price,
      discount_price: series.discountPrice,
      total_tests: series.quizzes.length,
      free_tests: series.quizzes.filter((q) => q.isFree).length,
      thumbnail_url: series.thumbnailUrl,
      is_purchased: isPurchased,
      validity_days: series.validityDays,
      quizzes: series.quizzes.map((q) => {
        const isLocked = !isPurchased && !q.isFree;
        const isAttempted = attemptedQuizIds.has(q.id);
        return {
          id: q.id,
          test_series_id: series.id,
          title: q.title,
          duration_minutes: q.durationMinutes,
          total_questions: q.questions.length,
          questions_count: q.questions.length,
          total_marks: q.totalMarks,
          is_free: q.isFree,
          is_locked: isLocked,
          is_attempted: isAttempted,
          best_score: isAttempted ? Math.round(q.totalMarks * 0.85) : null,
          max_attempts: 3,
          attempts_taken: isAttempted ? 1 : 0,
        };
      }),
    };

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch test series details', 500);
  }
}
