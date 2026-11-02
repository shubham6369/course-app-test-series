import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status');

    const students = await prisma.student.findMany({
      where: {
        ...(status === 'active'
          ? { isActive: true }
          : status === 'inactive'
          ? { isActive: false }
          : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { targetExam: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            enrollments: true,
            quizAttempts: true,
            doubts: true,
            orders: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      password = 'password123',
      targetExam = 'NEET 2026',
      classId = 'Class 12',
    } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { status: 'error', message: 'Name, email and phone are required' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        targetExam,
        classId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            quizAttempts: true,
            doubts: true,
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(
      { status: 'success', data: student },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating student:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 'error', message: 'A student with this email or phone already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { status: 'error', message: 'Failed to create student' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive, name, targetExam, classId } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Student ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.student.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(name ? { name } : {}),
        ...(targetExam !== undefined ? { targetExam } : {}),
        ...(classId !== undefined ? { classId } : {}),
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            quizAttempts: true,
            doubts: true,
            orders: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update student' },
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
        { status: 'error', message: 'Student ID is required' },
        { status: 400 }
      );
    }

    await prisma.student.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Student account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
