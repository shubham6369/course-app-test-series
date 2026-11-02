import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
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

    const invoices = [
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
    ];

    return NextResponse.json({
      status: 'success',
      data: {
        plan: {
          name: 'Webphiser Enterprise Unlimited Tier',
          status: 'Active',
          renewalDate: '2027-10-31',
          storageQuota: 'Unlimited Cloud Storage',
          seatsAllowed: 'Unlimited Student Seats',
        },
        metrics: {
          totalRevenue,
          paidOrdersCount: paidCount,
          activeSeats: enrollmentCount,
          registeredStudents: studentCount,
        },
        invoices,
      },
    });
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}
