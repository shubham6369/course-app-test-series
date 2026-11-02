import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'all' | 'series' | 'standalone' | 'free'
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (filter === 'series') {
      where.testSeriesId = { not: null };
    } else if (filter === 'standalone') {
      where.testSeriesId = null;
    } else if (filter === 'free') {
      where.isFree = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subject: { contains: search } },
      ];
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        testSeries: {
          select: { id: true, title: true },
        },
        questions: {
          select: {
            id: true,
            questionNumber: true,
            questionText: true,
            options: true,
            correctOption: true,
            explanation: true,
            marks: true,
            negativeMarks: true,
            subject: true,
            topic: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: quizzes,
    });
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subject,
      durationMinutes = 60,
      totalMarks = 40.0,
      negativeMarks = 1.0,
      passingMarks = 16.0,
      isFree = false,
      isLocked = false,
      maxAttempts = 3,
      testSeriesId,
      isPublished = true,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Quiz title is required' },
        { status: 400 }
      );
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        title: title.trim(),
        subject: subject?.trim() || null,
        durationMinutes: parseInt(durationMinutes, 10) || 60,
        totalMarks: !isNaN(parseFloat(totalMarks)) ? parseFloat(totalMarks) : 40.0,
        negativeMarks: !isNaN(parseFloat(negativeMarks)) ? parseFloat(negativeMarks) : 1.0,
        passingMarks: !isNaN(parseFloat(passingMarks)) ? parseFloat(passingMarks) : 16.0,
        isFree: Boolean(isFree),
        isLocked: Boolean(isLocked),
        maxAttempts: parseInt(maxAttempts, 10) || 3,
        testSeriesId: testSeriesId ? parseInt(testSeriesId, 10) : null,
        isPublished: Boolean(isPublished),
      },
      include: {
        testSeries: true,
        questions: true,
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Quiz created successfully',
        data: newQuiz,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
