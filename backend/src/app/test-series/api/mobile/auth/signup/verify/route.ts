import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signStudentToken } from '@/lib/auth';
import { formatStudentResponse } from '@/lib/mobile-auth';
import { mobileError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return mobileError('Phone and OTP required', 400);
    }

    let student = await prisma.student.findFirst({ where: { phone } });
    if (!student) {
      student = await prisma.student.create({
        data: {
          name: `Student ${phone.slice(-4)}`,
          phone,
          email: `${phone}@student.webphiser.local`,
          password: 'default_otp_password',
        },
      });
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
      verified: true,
      token,
      user: studentFormatted,
      data: studentFormatted,
    });
  } catch (error: any) {
    return mobileError(error.message || 'OTP verification failed', 500);
  }
}
