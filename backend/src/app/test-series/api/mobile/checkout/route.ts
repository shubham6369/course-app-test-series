import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: true });
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student!;

    const body = await req.json().catch(() => ({}));
    const { item_type, item_id } = body;

    if (!item_type || !item_id) {
      return mobileError('item_type and item_id are required', 400);
    }

    let priceInRupees = 999.0;
    let itemName = 'Educational Item';
    let courseId: number | null = null;
    let testSeriesId: number | null = null;

    if (item_type === 'course') {
      const course = await prisma.course.findUnique({ where: { id: Number(item_id) } });
      if (course) {
        priceInRupees = course.discountPrice !== null ? course.discountPrice : course.price;
        itemName = course.title;
        courseId = course.id;
      }
    } else if (item_type === 'test_series') {
      const series = await prisma.testSeries.findUnique({ where: { id: Number(item_id) } });
      if (series) {
        priceInRupees = series.discountPrice !== null ? series.discountPrice : series.price;
        itemName = series.title;
        testSeriesId = series.id;
      }
    }

    const orderNumber = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Look up Razorpay key from settings or env
    const rzpKeySetting = await prisma.setting.findUnique({ where: { key: 'razorpay_key_id' } });
    const keyId = rzpKeySetting?.value || process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

    await prisma.order.create({
      data: {
        studentId: student.id,
        orderNumber,
        itemName,
        amount: priceInRupees,
        currency: 'INR',
        status: 'pending',
        itemType: item_type,
        itemId: Number(item_id),
        courseId,
        testSeriesId,
        razorpayOrderId: `rzp_${orderNumber}`,
      },
    });

    const data = {
      order_id: orderNumber,
      amount: priceInRupees,
      currency: 'INR',
      key_id: keyId,
      item_name: itemName,
      user_email: student.email,
      user_phone: student.phone,
      item_type,
      item_id: Number(item_id),
    };

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'Checkout failed', 500);
  }
}
