import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: false });
    const student = auth.student;

    let enrolledCourseIds = new Set<number>();
    if (student) {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id, itemType: 'course', isActive: true },
      });
      enrollments.forEach((e) => enrolledCourseIds.add(e.itemId));
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const where: any = { isPublished: true };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (category) {
      where.category = { name: { contains: category } };
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: true,
        folders: {
          include: { lessons: true },
        },
      },
    });

    const data = courses.map((c) => {
      const totalLessons = c.folders.reduce((acc, f) => acc + f.lessons.length, 0);
      const totalDuration = c.folders.reduce(
        (acc, f) => acc + f.lessons.reduce((lAcc, l) => lAcc + (l.durationMinutes || 0), 0),
        0
      );
      return {
        id: c.id,
        title: c.title,
        slug: c.slug || String(c.id),
        description: c.description,
        thumbnail_url: c.thumbnailUrl,
        price: c.price,
        discount_price: c.discountPrice,
        validity_days: c.validityDays,
        instructor_name: c.instructorName,
        rating: 4.8,
        total_lessons: totalLessons,
        total_duration_minutes: totalDuration,
        is_enrolled: enrolledCourseIds.has(c.id),
      };
    });

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch courses', 500);
  }
}
