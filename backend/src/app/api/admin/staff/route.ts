import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
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

    return NextResponse.json({
      status: 'success',
      data: staff,
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch staff members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = 'staff', avatarUrl } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { status: 'success', data: newStaff },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating staff member:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 'error', message: 'An admin or staff account with this email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { status: 'error', message: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, role, name } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Staff ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.admin.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(role ? { role } : {}),
        ...(name ? { name } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update staff member' },
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
        { status: 'error', message: 'Staff ID is required' },
        { status: 400 }
      );
    }

    const staffId = parseInt(id, 10);
    const staff = await prisma.admin.findUnique({ where: { id: staffId } });

    if (staff?.role === 'owner') {
      return NextResponse.json(
        { status: 'error', message: 'Cannot delete the system owner account' },
        { status: 403 }
      );
    }

    await prisma.admin.delete({
      where: { id: staffId },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Staff member removed successfully',
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
