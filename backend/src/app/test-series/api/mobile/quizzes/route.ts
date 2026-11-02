import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: false });
    const student = auth.student;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const where: any = { isPublished: true };
    if (type === 'free') where.isFree = true;

    const quizzes = await prisma.quiz.findMany({
      where,
      include: { questions: { select: { id: true } } },
    });

    let attemptedQuizIds = new Set<number>();
    if (student) {
      const attempts = await prisma.quizAttempt.findMany({
        where: { studentId: student.id, quizId: { in: quizzes.map((q) => q.id) } },
        select: { quizId: true },
      });
      attempts.forEach((a) => attemptedQuizIds.add(a.quizId));
    }

    const data = quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      subject: q.subject || 'General',
      duration_minutes: q.durationMinutes,
      total_questions: q.questions.length,
      questions_count: q.questions.length,
      total_marks: q.totalMarks,
      is_free: q.isFree,
      is_attempted: attemptedQuizIds.has(q.id),
    }));

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch quizzes', 500);
  }
}
