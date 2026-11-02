import prisma from '@/lib/prisma';
import { QuizzesClient } from './quizzes-client';

export const dynamic = 'force-dynamic';

export default async function AdminQuizzesPage() {
  const [quizzes, testSeriesList] = await Promise.all([
    prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        testSeries: {
          select: { id: true, title: true },
        },
        questions: {
          orderBy: { questionNumber: 'asc' },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    }),
    prisma.testSeries.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    }),
  ]);

  return <QuizzesClient initialQuizzes={quizzes} testSeriesList={testSeriesList} />;
}
