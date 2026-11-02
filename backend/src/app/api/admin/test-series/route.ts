import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const testSeries = await prisma.testSeries.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        quizzes: {
          select: {
            id: true,
            title: true,
            subject: true,
            durationMinutes: true,
            totalMarks: true,
            isFree: true,
            _count: {
              select: { questions: true, attempts: true },
            },
          },
        },
        enrollments: true,
        _count: {
          select: {
            enrollments: true,
            quizzes: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: testSeries,
    });
  } catch (error: any) {
    console.error('Error fetching test series:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch test series' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      thumbnailUrl,
      price = 0,
      discountPrice,
      validityDays = 365,
      isPublished = true,
      quizIds = [],
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Test series title is required' },
        { status: 400 }
      );
    }

    const parsedPrice = price !== undefined && price !== '' ? parseFloat(price) : 0;
    const parsedDiscountPrice =
      discountPrice !== undefined && discountPrice !== '' && discountPrice !== null
        ? parseFloat(discountPrice)
        : null;
    const parsedValidity =
      validityDays !== undefined && validityDays !== '' ? parseInt(validityDays, 10) : 365;
    const parsedCategoryId =
      categoryId && categoryId !== 'none' ? parseInt(categoryId, 10) : null;

    const newSeries = await prisma.testSeries.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        categoryId: parsedCategoryId,
        thumbnailUrl:
          thumbnailUrl?.trim() ||
          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500',
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        discountPrice:
          parsedDiscountPrice !== null && !isNaN(parsedDiscountPrice)
            ? parsedDiscountPrice
            : null,
        validityDays: isNaN(parsedValidity) ? 365 : parsedValidity,
        isPublished: Boolean(isPublished),
      },
      include: {
        category: true,
        quizzes: true,
      },
    });

    // If quizIds are provided, associate them to this test series
    if (Array.isArray(quizIds) && quizIds.length > 0) {
      const ids = quizIds.map((id: any) => parseInt(id, 10)).filter((n) => !isNaN(n));
      await prisma.quiz.updateMany({
        where: { id: { in: ids } },
        data: { testSeriesId: newSeries.id },
      });
    }

    const refreshed = await prisma.testSeries.findUnique({
      where: { id: newSeries.id },
      include: {
        category: true,
        quizzes: true,
        enrollments: true,
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Test series package created successfully',
        data: refreshed,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating test series:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create test series' },
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
        { status: 'error', message: 'Test series ID is required' },
        { status: 400 }
      );
    }

    await prisma.testSeries.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Test series deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting test series:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to delete test series' },
      { status: 500 }
    );
  }
}
