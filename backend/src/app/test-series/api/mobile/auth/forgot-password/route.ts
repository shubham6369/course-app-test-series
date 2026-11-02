import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ status: 'success', message: 'Reset code sent if account exists' });
}
