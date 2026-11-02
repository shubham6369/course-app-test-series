import prisma from '@/lib/prisma';
import { OrdersClient } from './orders-client';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
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

  return <OrdersClient initialOrders={orders} />;
}
