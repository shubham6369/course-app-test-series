import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (categoryId && categoryId !== 'all') {
      where.categoryId = parseInt(categoryId, 10);
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        folders: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        enrollments: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      thumbnailUrl,
      price,
      discountPrice,
      instructorName,
      categoryId,
      validityDays,
      isPublished = true,
      folders = [],
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Course title is required' },
        { status: 400 }
      );
    }

    // Generate unique slug if not provided or taken
    let safeSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!safeSlug) {
      safeSlug = `course-${Date.now()}`;
    }

    const existingSlug = await prisma.course.findUnique({
      where: { slug: safeSlug },
    });
    if (existingSlug) {
      safeSlug = `${safeSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Parse numeric fields
    const parsedPrice = price !== undefined && price !== '' ? parseFloat(price) : 0;
    const parsedDiscountPrice =
      discountPrice !== undefined && discountPrice !== '' && discountPrice !== null
        ? parseFloat(discountPrice)
        : null;
    const parsedValidity =
      validityDays !== undefined && validityDays !== '' ? parseInt(validityDays, 10) : 365;
    const parsedCategoryId =
      categoryId && categoryId !== 'none' ? parseInt(categoryId, 10) : null;

    // Create course with nested folders and lessons in a single transaction
    const newCourse = await prisma.course.create({
      data: {
        title: title.trim(),
        slug: safeSlug,
        description: description?.trim() || null,
        thumbnailUrl:
          thumbnailUrl?.trim() ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        discountPrice:
          parsedDiscountPrice !== null && !isNaN(parsedDiscountPrice)
            ? parsedDiscountPrice
            : null,
        instructorName: instructorName?.trim() || null,
        categoryId: parsedCategoryId,
        validityDays: isNaN(parsedValidity) ? 365 : parsedValidity,
        isPublished: Boolean(isPublished),
        folders: {
          create: folders.map((f: any, fIdx: number) => ({
            title: f.title?.trim() || `Module ${fIdx + 1}`,
            order: f.order !== undefined ? f.order : fIdx + 1,
            lessons: {
              create: (f.lessons || []).map((l: any, lIdx: number) => ({
                title: l.title?.trim() || `Lesson ${lIdx + 1}`,
                description: l.description?.trim() || null,
                videoId: l.videoId?.trim() || 'M7lc1UVf-VE',
                durationMinutes:
                  l.durationMinutes !== undefined && l.durationMinutes !== ''
                    ? parseInt(l.durationMinutes, 10)
                    : 15,
                isFreePreview: Boolean(l.isFreePreview),
                order: l.order !== undefined ? l.order : lIdx + 1,
                pdfUrl: l.pdfUrl?.trim() || null,
              })),
            },
          })),
        },
      },
      include: {
        category: true,
        folders: {
          include: {
            lessons: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Course created successfully',
        data: newCourse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create course' },
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
        { status: 'error', message: 'Course ID is required' },
        { status: 400 }
      );
    }

    const courseId = parseInt(id, 10);
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Course deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to delete course' },
      { status: 500 }
    );
  }
}
