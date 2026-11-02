import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError, mobileNotFound } from '@/lib/api-response';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const quizId = parseInt(id, 10);
    const body = await req.json().catch(() => ({}));
    const userAnswers: Record<string, any> = body.answers || {};
    const timeTaken = body.time_taken_seconds || 0;

    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student!;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return mobileNotFound('Quiz not found');
    }

    let score = 0;
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    for (const q of quiz.questions) {
      const given = userAnswers[String(q.id)] ?? userAnswers[String(q.questionNumber)];
      if (given === undefined || given === null || given === '') {
        unattempted++;
      } else if (String(given).trim().toLowerCase() === String(q.correctOption).trim().toLowerCase()) {
        correct++;
        score += q.marks;
      } else {
        wrong++;
        score -= q.negativeMarks;
      }
    }

    const totalQuestions = quiz.questions.length;
    const totalAnswered = correct + wrong;
    const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 1000) / 10 : 0;
    const isPassed = score >= (quiz.passingMarks || quiz.totalMarks * 0.4);

    const higherAttempts = await prisma.quizAttempt.count({
      where: { quizId, score: { gt: score } },
    });
    const totalPrevious = await prisma.quizAttempt.count({
      where: { quizId },
    });
    const rank = higherAttempts + 1;
    const totalParticipants = totalPrevious + 1;
    const percentile = totalParticipants > 1
      ? Math.round(((totalParticipants - rank) / totalParticipants) * 1000) / 10
      : 100.0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: student.id,
        quizId,
        score,
        totalMarks: quiz.totalMarks,
        correctAnswers: correct,
        incorrectAnswers: wrong,
        unattempted,
        accuracy,
        percentile,
        rank,
        totalParticipants,
        timeTakenSeconds: timeTaken,
        answers: JSON.stringify(userAnswers),
        isPassed,
        certificateUrl: isPassed ? `/api/certificates/${quiz.id}-${student.id}` : null,
      },
    });

    const data = {
      attempt_id: attempt.id,
      id: attempt.id,
      quiz_id: attempt.quizId,
      quiz_title: quiz.title,
      score: attempt.score,
      total_marks: quiz.totalMarks,
      total_questions: totalQuestions,
      correct_answers: attempt.correctAnswers,
      incorrect_answers: attempt.incorrectAnswers,
      wrong_answers: attempt.incorrectAnswers,
      unattempted: attempt.unattempted,
      unanswered: attempt.unattempted,
      accuracy: attempt.accuracy,
      rank: attempt.rank || rank,
      total_participants: attempt.totalParticipants || totalParticipants,
      percentile: attempt.percentile,
      is_passed: attempt.isPassed,
      certificate_url: attempt.certificateUrl,
      time_taken_seconds: attempt.timeTakenSeconds,
      submitted_at: attempt.createdAt.toISOString(),
    };

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Quiz submission failed', 500);
  }
}
