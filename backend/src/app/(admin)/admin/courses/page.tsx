import prisma from '@/lib/prisma';
import { CoursesClient } from './courses-client';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
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
      },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return <CoursesClient initialCourses={courses} categories={categories} />;
}
