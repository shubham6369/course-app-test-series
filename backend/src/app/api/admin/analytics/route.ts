import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            targetExam: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            totalMarks: true,
          },
        },
      },
    });

    const totalAttempts = attempts.length;
    const uniqueStudents = new Set(attempts.map((a) => a.studentId)).size;

    const avgAccuracy =
      totalAttempts > 0
        ? Math.round(
            attempts.reduce((acc, a) => acc + (a.accuracy || 0), 0) / totalAttempts
          )
        : 0;

    const passedCount = attempts.filter((a) => a.isPassed).length;
    const passRate =
      totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

    const avgScore =
      totalAttempts > 0
        ? Math.round(
            (attempts.reduce((acc, a) => acc + a.score, 0) / totalAttempts) * 10
          ) / 10
        : 0;

    // Score distribution calculation
    const distribution = {
      range0to25: 0,
      range26to50: 0,
      range51to75: 0,
      range76to100: 0,
    };

    attempts.forEach((a) => {
      const percentage = a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0;
      if (percentage <= 25) distribution.range0to25 += 1;
      else if (percentage <= 50) distribution.range26to50 += 1;
      else if (percentage <= 75) distribution.range51to75 += 1;
      else distribution.range76to100 += 1;
    });

    // Top rankers sorted by score / accuracy
    const leaderboard = [...attempts]
      .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy)
      .slice(0, 10);

    return NextResponse.json({
      status: 'success',
      data: {
        totalAttempts,
        uniqueStudents,
        avgAccuracy,
        passRate,
        avgScore,
        distribution,
        leaderboard,
        recentAttempts: attempts.slice(0, 10),
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
