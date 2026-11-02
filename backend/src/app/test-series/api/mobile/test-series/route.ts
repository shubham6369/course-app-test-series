import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: false });
    const student = auth.student;

    let purchasedSeriesIds = new Set<number>();
    if (student) {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id, itemType: 'test_series', isActive: true },
      });
      enrollments.forEach((e) => purchasedSeriesIds.add(e.itemId));
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where: any = { isPublished: true };
    if (category) {
      where.category = { name: { contains: category } };
    }

    const series = await prisma.testSeries.findMany({
      where,
      include: { category: true, quizzes: true },
    });

    const data = series.map((t) => ({
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

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch test series', 500);
  }
}
