import prisma from '@/lib/prisma';
import { EnrollmentsClient } from './enrollments-client';

export const dynamic = 'force-dynamic';

export default async function AdminEnrollmentsPage() {
  const [enrollments, students, courses, testSeriesList] = await Promise.all([
    prisma.enrollment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
        testSeries: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    }),
    prisma.student.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
    prisma.testSeries.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  return (
    <EnrollmentsClient
      initialEnrollments={enrollments}
      students={students}
      courses={courses}
      testSeriesList={testSeriesList}
    />
  );
}
