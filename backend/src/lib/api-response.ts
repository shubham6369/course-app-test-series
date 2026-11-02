import { NextResponse } from 'next/server';

export function mobileSuccess<T = any>(data: T, init?: { status?: number; extra?: Record<string, any> }) {
  const payload: Record<string, any> = {
    status: 'success',
    data,
    ...(init?.extra || {}),
  };
  return NextResponse.json(payload, { status: init?.status ?? 200 });
}

export function mobileError(message: string, status = 400, details?: any) {
  return NextResponse.json(
    {
      status: 'error',
      message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

export function mobileUnauthorized(message = 'Authentication required') {
  return mobileError(message, 401);
}

export function mobileNotFound(message = 'Resource not found') {
  return mobileError(message, 404);
}
