import prisma from '@/lib/prisma';
import { TestSeriesClient } from './test-series-client';

export const dynamic = 'force-dynamic';

export default async function AdminTestSeriesPage() {
  const [testSeriesList, categories, availableQuizzes] = await Promise.all([
    prisma.testSeries.findMany({
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
      },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.quiz.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true, testSeriesId: true },
    }),
  ]);

  return (
    <TestSeriesClient
      initialSeries={testSeriesList}
      categories={categories}
      availableQuizzes={availableQuizzes}
    />
  );
}
