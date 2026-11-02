import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = req
      ? await getStudentFromBearer(req, { required: false })
      : { student: null, errorResponse: null };
    const student = auth.student;

    let enrolledCourseIds = new Set<number>();
    let purchasedSeriesIds = new Set<number>();

    if (student) {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id, isActive: true },
      });
      for (const e of enrollments) {
        if (e.itemType === 'course') enrolledCourseIds.add(e.itemId);
        if (e.itemType === 'test_series') purchasedSeriesIds.add(e.itemId);
      }
    }

    const [banners, categories, courses, testSeriesList, freeQuizzes, recentAttemptsRaw] = await Promise.all([
      prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
      prisma.category.findMany({ orderBy: { order: 'asc' } }),
      prisma.course.findMany({
        where: { isPublished: true },
        take: 6,
        include: { folders: { include: { lessons: true } } },
      }),
      prisma.testSeries.findMany({
        where: { isPublished: true },
        take: 6,
        include: { category: true, quizzes: true },
      }),
      prisma.quiz.findMany({
        where: { isFree: true, isPublished: true },
        take: 6,
        include: { questions: true },
      }),
      prisma.quizAttempt.findMany({
        where: student ? { studentId: student.id } : undefined,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { quiz: true },
      }),
    ]);

    const formattedBanners = banners.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      image_url: b.imageUrl,
      action_type: b.actionType || 'course',
      action_value: b.actionValue ? String(b.actionValue) : '',
      order: b.order,
      target_type: b.actionType || 'course',
      target_id: b.actionValue ? String(b.actionValue) : null,
      action_url: b.actionValue || '',
      sort_order: b.order,
    }));

    const formattedCategories = categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      order: c.order,
    }));

    const formattedCourses = courses.map((c) => {
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

    const formattedSeries = testSeriesList.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category?.name || 'General',
      price: t.price,
      discount_price: t.discountPrice,
      total_tests: t.quizzes.length,
      free_tests: t.quizzes.filter((q) => q.isFree).length,
      thumbnail_url: t.thumbnailUrl,
      is_purchased: purchasedSeriesIds.has(t.id),
      validity_days: t.validityDays,
    }));

    const formattedFreeQuizzes = freeQuizzes.map((q) => ({
      id: q.id,
      title: q.title,
      subject: q.subject || 'General',
      duration_minutes: q.durationMinutes,
      total_questions: q.questions.length,
      questions_count: q.questions.length,
      total_marks: q.totalMarks,
      is_attempted: false,
    }));

    const formattedRecentAttempts = recentAttemptsRaw.map((a) => ({
      attempt_id: a.id,
      id: a.id,
      quiz_id: a.quizId,
      title: a.quiz?.title || 'Quiz Attempt',
      score: a.score,
      total_marks: a.quiz?.totalMarks || 100,
      date: a.createdAt.toISOString(),
    }));

    return mobileSuccess({
      banners: formattedBanners,
      categories: formattedCategories,
      popular_courses: formattedCourses,
      featured_courses: formattedCourses,
      featured_test_series: formattedSeries,
      popular_test_series: formattedSeries,
      free_quizzes: formattedFreeQuizzes,
      recent_attempts: formattedRecentAttempts,
    });
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch home feed', 500);
  }
}
