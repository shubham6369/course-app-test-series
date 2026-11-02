import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError, mobileNotFound } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const courseId = parseInt(id, 10);

    const auth = await getStudentFromBearer(req, { required: false });
    const student = auth.student;

    const course = await prisma.course.findFirst({
      where: isNaN(courseId) ? { slug: id } : { id: courseId },
      include: {
        folders: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      return mobileNotFound('Course not found');
    }

    let isEnrolled = false;
    if (student) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: student.id, itemType: 'course', itemId: course.id, isActive: true },
      });
      if (enrollment) isEnrolled = true;
    }

    const totalLessons = course.folders.reduce((acc, f) => acc + f.lessons.length, 0);
    const totalDuration = course.folders.reduce(
      (acc, f) => acc + f.lessons.reduce((lAcc, l) => lAcc + (l.durationMinutes || 0), 0),
      0
    );

    const data = {
      id: course.id,
      title: course.title,
      slug: course.slug || String(course.id),
      description: course.description,
      thumbnail_url: course.thumbnailUrl,
      price: course.price,
      discount_price: course.discountPrice,
      validity_days: course.validityDays,
      instructor_name: course.instructorName,
      rating: 4.8,
      total_lessons: totalLessons,
      total_duration_minutes: totalDuration,
      is_enrolled: isEnrolled,
      folders: course.folders.map((f) => ({
        id: f.id,
        course_id: f.courseId,
        title: f.title,
        order: f.order,
        lessons: f.lessons.map((l) => ({
          id: l.id,
          folder_id: l.folderId,
          title: l.title,
          description: l.description,
          video_id: l.videoId || '',
          video_url: l.videoId || '',
          duration_minutes: l.durationMinutes || 0,
          duration: `${l.durationMinutes || 0}m`,
          is_free_preview: l.isFreePreview,
          order: l.order,
          pdf_url: l.pdfUrl,
        })),
      })),
    };

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch course details', 500);
  }
}
