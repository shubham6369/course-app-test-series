import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status');

    const orders = await prisma.order.findMany({
      where: {
        ...(status && status !== 'all' ? { status } : {}),
        ...(search
          ? {
              OR: [
                { orderNumber: { contains: search } },
                { itemName: { contains: search } },
                { razorpayOrderId: { contains: search } },
                { razorpayPaymentId: { contains: search } },
                { student: { name: { contains: search } } },
                { student: { email: { contains: search } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
        testSeries: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { status: 'error', message: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(id, 10) },
      data: { status },
      include: {
        student: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update order' },
      { status: 500 }
    );
  }
}
