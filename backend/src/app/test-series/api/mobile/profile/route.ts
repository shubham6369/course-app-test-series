import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer, formatStudentResponse } from '@/lib/mobile-auth';
import { mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student!;

    const formatted = formatStudentResponse(student);
    return NextResponse.json({
      status: 'success',
      data: formatted,
      user: formatted,
    });
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch profile', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const currentStudent = auth.student!;

    const body = await req.json().catch(() => ({}));
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.avatar_url !== undefined) updateData.avatarUrl = body.avatar_url;
    if (body.class_id !== undefined) updateData.classId = String(body.class_id);
    if (body.target_exam !== undefined) updateData.targetExam = body.target_exam;

    const student = await prisma.student.update({
      where: { id: currentStudent.id },
      data: updateData,
    });

    const formatted = formatStudentResponse(student);
    return NextResponse.json({
      status: 'success',
      data: formatted,
      user: formatted,
    });
  } catch (error: any) {
    return mobileError(error.message || 'Failed to update profile', 500);
  }
}
