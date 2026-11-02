import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = (body.code || '').trim();
    const orderAmount = Number(body.order_amount ?? body.amount ?? 0);

    if (!code) {
      return mobileError('Coupon code is required', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return mobileError('Invalid or inactive coupon code', 404);
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return mobileError('Coupon has expired', 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return mobileError('Coupon usage limit reached', 400);
    }

    if (orderAmount < coupon.minOrderAmount) {
      return mobileError(
        `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`,
        400
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderAmount);
    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return mobileSuccess({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discountType,
      discount_value: coupon.discountValue,
      discount_amount: Math.round(discountAmount * 100) / 100,
      final_amount: Math.round(finalAmount * 100) / 100,
    });
  } catch (error: any) {
    return mobileError(error.message || 'Coupon validation failed', 500);
  }
}
