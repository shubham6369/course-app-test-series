import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student!;

    const orders = await prisma.order.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    const data = orders.map((o) => ({
      id: o.id,
      order_id: o.orderNumber,
      order_number: o.orderNumber,
      item_type: o.itemType,
      item_id: o.itemId,
      item_name: o.itemName,
      amount: o.amount,
      currency: o.currency,
      status: o.status,
      razorpay_order_id: o.razorpayOrderId,
      razorpay_payment_id: o.razorpayPaymentId,
      created_at: o.createdAt.toISOString(),
    }));

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Failed to fetch student orders', 500);
  }
}
