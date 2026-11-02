import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const phone = body.phone;
  if (!phone) {
    return NextResponse.json({ status: 'error', message: 'Phone is required' }, { status: 400 });
  }
  return NextResponse.json({ status: 'success', message: 'OTP sent successfully', otp: '123456' });
}
