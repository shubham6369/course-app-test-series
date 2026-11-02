import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    if (!quizId) {
      return NextResponse.json(
        { status: 'error', message: 'quizId parameter is required' },
        { status: 400 }
      );
    }

    const questions = await prisma.question.findMany({
      where: { quizId: parseInt(quizId, 10) },
      orderBy: { questionNumber: 'asc' },
    });

    return NextResponse.json({
      status: 'success',
      data: questions,
    });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      quizId,
      questionText,
      options,
      correctOption = 0,
      marks = 4.0,
      negativeMarks = 1.0,
      explanation,
      subject,
      topic,
      questionImageUrl,
    } = body;

    if (!quizId) {
      return NextResponse.json(
        { status: 'error', message: 'quizId is required' },
        { status: 400 }
      );
    }

    if (!questionText || !questionText.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'questionText is required' },
        { status: 400 }
      );
    }

    // Standardize options array into JSON string
    let optionsJson: string;
    if (Array.isArray(options)) {
      optionsJson = JSON.stringify(options);
    } else if (typeof options === 'string') {
      try {
        JSON.parse(options);
        optionsJson = options;
      } catch {
        optionsJson = JSON.stringify([options]);
      }
    } else {
      optionsJson = JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']);
    }

    const parsedQuizId = parseInt(quizId, 10);
    const parsedMarks = !isNaN(parseFloat(marks)) ? parseFloat(marks) : 4.0;
    const parsedNegativeMarks = !isNaN(parseFloat(negativeMarks)) ? parseFloat(negativeMarks) : 1.0;
    const parsedCorrectOption = !isNaN(parseInt(correctOption, 10)) ? parseInt(correctOption, 10) : 0;

    let question;
    if (id) {
      // Update existing question
      question = await prisma.question.update({
        where: { id: parseInt(id, 10) },
        data: {
          questionText: questionText.trim(),
          options: optionsJson,
          correctOption: parsedCorrectOption,
          marks: parsedMarks,
          negativeMarks: parsedNegativeMarks,
          explanation: explanation?.trim() || null,
          subject: subject?.trim() || null,
          topic: topic?.trim() || null,
          questionImageUrl: questionImageUrl?.trim() || null,
        },
      });
    } else {
      // Auto-assign question number
      const existingCount = await prisma.question.count({
        where: { quizId: parsedQuizId },
      });

      question = await prisma.question.create({
        data: {
          quizId: parsedQuizId,
          questionNumber: existingCount + 1,
          questionText: questionText.trim(),
          options: optionsJson,
          correctOption: parsedCorrectOption,
          marks: parsedMarks,
          negativeMarks: parsedNegativeMarks,
          explanation: explanation?.trim() || null,
          subject: subject?.trim() || null,
          topic: topic?.trim() || null,
          questionImageUrl: questionImageUrl?.trim() || null,
        },
      });

      // Update quiz total marks if desired
      const allQuizQuestions = await prisma.question.findMany({
        where: { quizId: parsedQuizId },
        select: { marks: true },
      });
      const newTotal = allQuizQuestions.reduce((acc, q) => acc + q.marks, 0);
      await prisma.quiz.update({
        where: { id: parsedQuizId },
        data: { totalMarks: newTotal },
      });
    }

    return NextResponse.json(
      {
        status: 'success',
        message: id ? 'Question updated' : 'Question added to bank',
        data: question,
      },
      { status: id ? 200 : 201 }
    );
  } catch (error: any) {
    console.error('Error saving question:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to save question' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Question ID is required' },
        { status: 400 }
      );
    }

    await prisma.question.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Question deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to delete question' },
      { status: 500 }
    );
  }
}
