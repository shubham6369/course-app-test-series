import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, new_password } = body;
    if (!phone || !new_password) {
      return NextResponse.json({ status: 'error', message: 'Phone and new password required' }, { status: 400 });
    }

    const student = await prisma.student.findFirst({ where: { phone } });
    if (!student) {
      return NextResponse.json({ status: 'error', message: 'Account not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await prisma.student.update({
      where: { id: student.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ status: 'success', message: 'Password reset successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
