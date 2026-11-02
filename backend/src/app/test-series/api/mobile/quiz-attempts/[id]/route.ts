import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError, mobileNotFound } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const attemptId = parseInt(id, 10);

    const auth = await getStudentFromBearer(req, { required: false });
    const student = auth.student;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { questionNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!attempt || !attempt.quiz) {
      return mobileNotFound('Attempt not found');
    }

    let savedAnswers: Record<string, any> = {};
    try {
      savedAnswers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers;
    } catch {
      savedAnswers = {};
    }

    const questionsReview = attempt.quiz.questions.map((q, idx) => {
      const userAnswer = savedAnswers[String(q.id)] ?? savedAnswers[String(q.questionNumber)] ?? null;
      const isCorrect =
        userAnswer !== null &&
        String(userAnswer).trim().toLowerCase() === String(q.correctOption).trim().toLowerCase();
      let marks = 0;
      if (isCorrect) marks = q.marks;
      else if (userAnswer !== null) marks = -q.negativeMarks;

      let optionsArray: string[] = [];
      try {
        optionsArray = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      } catch {
        optionsArray = ['A', 'B', 'C', 'D'];
      }

      let optionImagesArray: string[] | undefined;
      if (q.optionImages) {
        try {
          optionImagesArray = typeof q.optionImages === 'string' ? JSON.parse(q.optionImages) : q.optionImages;
        } catch {
          optionImagesArray = undefined;
        }
      }

      const questionObj = {
        id: q.id,
        question_number: q.questionNumber || idx + 1,
        question_text: q.questionText,
        question_image_url: q.questionImageUrl,
        options: optionsArray,
        option_images: optionImagesArray,
        correct_option: q.correctOption,
        explanation: q.explanation,
        subject: q.subject,
        topic: q.topic,
        marks: q.marks,
        negative_marks: q.negativeMarks,
      };

      return {
        // Nested question required by Flutter QuestionReview.fromJson
        question: questionObj,
        selected_option: userAnswer !== null && !isNaN(Number(userAnswer)) ? Number(userAnswer) : null,
        user_answer: userAnswer,
        is_correct: isCorrect,
        time_spent_seconds: 40 + idx * 5,
        marked_for_review: false,
        marks_awarded: marks,

        // Flat keys for backwards compatibility with tests
        id: q.id,
        question_text: q.questionText,
        options: optionsArray,
        correct_answer: q.correctOption,
        explanation: q.explanation,
      };
    });

    const result = {
      attempt_id: attempt.id,
      id: attempt.id,
      quiz_id: attempt.quizId,
      quiz_title: attempt.quiz.title,
      score: attempt.score,
      total_marks: attempt.totalMarks,
      total_questions: attempt.quiz.questions.length,
      correct_answers: attempt.correctAnswers,
      incorrect_answers: attempt.incorrectAnswers,
      wrong_answers: attempt.incorrectAnswers,
      unattempted: attempt.unattempted,
      unanswered: attempt.unattempted,
      accuracy: attempt.accuracy,
      rank: attempt.rank || 1,
      total_participants: attempt.totalParticipants || 1,
      percentile: attempt.percentile,
      is_passed: attempt.isPassed,
      certificate_url: attempt.certificateUrl,
      time_taken_seconds: attempt.timeTakenSeconds,
      submitted_at: attempt.createdAt.toISOString(),
    };

    return mobileSuccess({
      result,
      questions: questionsReview,
    });
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch attempt details', 500);
  }
}
