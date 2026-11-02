import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: false });
    const student = auth.student;

    const notifications = await prisma.notification.findMany({
      where: student
        ? { OR: [{ studentId: student.id }, { studentId: null }] }
        : { studentId: null },
      orderBy: { createdAt: 'desc' },
    });

    const data = notifications.map((n) => ({
      id: n.id,
      student_id: n.studentId,
      title: n.title,
      body: n.body,
      action_url: n.actionUrl,
      is_read: n.isRead,
      created_at: n.createdAt.toISOString(),
    }));

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch notifications', 500);
  }
}
