import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toUpperCase() || '';

    const coupons = await prisma.coupon.findMany({
      where: search
        ? {
            code: {
              contains: search,
            },
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      status: 'success',
      data: coupons,
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      discountType = 'percentage',
      discountValue,
      minOrderAmount = 0,
      maxDiscount,
      validUntil,
      usageLimit = 500,
    } = body;

    if (!code || discountValue === undefined) {
      return NextResponse.json(
        { status: 'error', message: 'Coupon code and discount value are required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        usedCount: 0,
        isActive: true,
      },
    });

    return NextResponse.json(
      { status: 'success', data: coupon },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 'error', message: 'A coupon with this code already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { status: 'error', message: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.coupon.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    await prisma.coupon.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
