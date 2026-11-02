import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student!;

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id, itemType: 'course', isActive: true },
    });

    const courseIds = enrollments.map((e) => e.itemId);
    if (courseIds.length === 0) {
      return mobileSuccess([]);
    }

    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      include: { folders: { include: { lessons: true } } },
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
        is_enrolled: true,
      };
    });

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch enrolled courses', 500);
  }
}
