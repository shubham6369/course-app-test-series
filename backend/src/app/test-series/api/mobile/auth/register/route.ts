import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signStudentToken } from '@/lib/auth';
import { formatStudentResponse } from '@/lib/mobile-auth';
import { mobileError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, class_id } = body;

    if (!name || !email || !phone || !password) {
      return mobileError('All fields are required', 400);
    }

    const existing = await prisma.student.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existing) {
      return mobileError('Account already exists with this phone or email', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        classId: class_id ? String(class_id) : null,
      },
    });

    const token = await signStudentToken({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
    });

    const studentFormatted = formatStudentResponse(student, token);

    return NextResponse.json(
      {
        status: 'success',
        token,
        user: studentFormatted,
        data: studentFormatted,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return mobileError(error.message || 'Registration failed', 500);
  }
}
