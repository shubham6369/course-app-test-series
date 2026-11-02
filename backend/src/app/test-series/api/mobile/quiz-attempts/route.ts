import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student!;

    const attempts = await prisma.quizAttempt.findMany({
      where: { studentId: student.id },
      include: { quiz: true },
      orderBy: { createdAt: 'desc' },
    });

    const data = attempts.map((a) => ({
      id: a.id,
      quiz_id: a.quizId,
      quiz_title: a.quiz?.title || `Quiz #${a.quizId}`,
      score: a.score,
      total_marks: a.quiz?.totalMarks || a.totalMarks || 100,
      accuracy: a.accuracy,
      completed_at: a.createdAt.toISOString(),
      date: a.createdAt.toISOString(),
    }));

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch quiz attempts', 500);
  }
}
