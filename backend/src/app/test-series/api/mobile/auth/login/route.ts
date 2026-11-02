import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signStudentToken } from '@/lib/auth';
import { formatStudentResponse } from '@/lib/mobile-auth';
import { mobileError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneOrEmail = body.phone_or_email || body.email || body.phone;
    const password = body.password;

    if (!phoneOrEmail || !password) {
      return mobileError('Credentials required', 400);
    }

    const student = await prisma.student.findFirst({
      where: {
        OR: [{ email: phoneOrEmail }, { phone: phoneOrEmail }],
      },
    });

    if (!student) {
      return mobileError('Student account not found', 404);
    }

    let isMatch = false;
    if (student.password.startsWith('$2a$') || student.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, student.password);
    } else {
      isMatch = student.password === password;
    }

    if (!isMatch) {
      return mobileError('Invalid credentials', 401);
    }

    const token = await signStudentToken({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
    });

    const studentFormatted = formatStudentResponse(student, token);

    return NextResponse.json({
      status: 'success',
      token,
      user: studentFormatted,
      data: studentFormatted,
    });
  } catch (error: any) {
    return mobileError(error.message || 'Login failed', 500);
  }
}
