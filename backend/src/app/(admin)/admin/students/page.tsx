import prisma from '@/lib/prisma';
import { StudentsClient } from './students-client';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          enrollments: true,
          quizAttempts: true,
          doubts: true,
          orders: true,
        },
      },
    },
  });

  return <StudentsClient initialStudents={students} />;
}
