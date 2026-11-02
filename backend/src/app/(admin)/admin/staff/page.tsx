import prisma from '@/lib/prisma';
import { StaffClient } from './staff-client';

export const dynamic = 'force-dynamic';

export default async function AdminStaffPage() {
  const staff = await prisma.admin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return <StaffClient initialStaff={staff} />;
}
