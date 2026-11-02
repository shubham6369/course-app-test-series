import prisma from '@/lib/prisma';
import { BillingClient } from './billing-client';

export const dynamic = 'force-dynamic';

export default async function AdminBillingPage() {
  const [revenueAgg, paidCount, studentCount, enrollmentCount] = await Promise.all([
    prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'paid' },
    }),
    prisma.order.count({ where: { status: 'paid' } }),
    prisma.student.count(),
    prisma.enrollment.count({ where: { isActive: true } }),
  ]);

  const totalRevenue = revenueAgg._sum.amount || 0;

  const billingData = {
    plan: {
      name: 'Webphiser Enterprise Unlimited Tier',
      status: 'Active',
      renewalDate: '31 Oct 2027',
      storageQuota: 'Unlimited Cloud Storage',
      seatsAllowed: 'Unlimited Student Seats',
    },
    metrics: {
      totalRevenue,
      paidOrdersCount: paidCount,
      activeSeats: enrollmentCount,
      registeredStudents: studentCount,
    },
    invoices: [
      {
        id: 'INV-AIM-2026-003',
        period: 'October 2026',
        tier: 'Enterprise Dedicated Tier',
        amount: 4999.0,
        status: 'paid',
        date: '2026-10-31',
        receiptUrl: '#',
      },
      {
        id: 'INV-AIM-2026-002',
        period: 'September 2026',
        tier: 'Enterprise Dedicated Tier',
        amount: 4999.0,
        status: 'paid',
        date: '2026-09-30',
        receiptUrl: '#',
      },
      {
        id: 'INV-AIM-2026-001',
        period: 'August 2026',
        tier: 'Enterprise Dedicated Tier',
        amount: 4999.0,
        status: 'paid',
        date: '2026-08-31',
        receiptUrl: '#',
      },
    ],
  };

  return <BillingClient initialData={billingData} />;
}
