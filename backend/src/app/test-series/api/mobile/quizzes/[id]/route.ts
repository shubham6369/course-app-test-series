import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mobileSuccess, mobileError, mobileNotFound } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const quizId = parseInt(id, 10);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { questionNumber: 'asc' },
        },
      },
    });

    if (!quiz) {
      return mobileNotFound('Quiz not found');
    }

    let parsedInstructions: string[] = [];
    if (quiz.instructions) {
      try {
        parsedInstructions = JSON.parse(quiz.instructions);
      } catch {
        parsedInstructions = [quiz.instructions];
      }
    }
    if (!parsedInstructions || parsedInstructions.length === 0) {
      parsedInstructions = [
        `Total Questions: ${quiz.questions.length}`,
        `Duration: ${quiz.durationMinutes} minutes`,
        `Total Marks: ${quiz.totalMarks}`,
        `Negative Marking: -${quiz.negativeMarks} marks for incorrect answers`,
      ];
    }

    const data = {
      id: quiz.id,
      title: quiz.title,
      duration_minutes: quiz.durationMinutes,
      total_marks: quiz.totalMarks,
      passing_marks: quiz.totalMarks * 0.4,
      negative_marks: quiz.negativeMarks,
      negative_marking: quiz.negativeMarks > 0,
      instructions: parsedInstructions,
      questions: quiz.questions.map((q, idx) => {
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

        return {
          id: q.id,
          question_number: q.questionNumber || idx + 1,
          question_text: q.questionText,
          question_image_url: q.questionImageUrl,
          question_image: q.questionImageUrl,
          options: optionsArray,
          option_images: optionImagesArray,
          correct_option: q.correctOption,
          correct_answer: q.correctOption,
          marks: q.marks,
          positive_marks: q.marks,
          negative_marks: q.negativeMarks,
          explanation: q.explanation,
          subject: q.subject,
          topic: q.topic,
        };
      }),
    };

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch quiz paper', 500);
  }
}
