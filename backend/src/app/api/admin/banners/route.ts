import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      status: 'success',
      data: banners,
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      imageUrl,
      actionType = 'course',
      actionValue = '',
      order = 1,
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { status: 'error', message: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl,
        actionType,
        actionValue,
        order: parseInt(order, 10) || 1,
        isActive: true,
      },
    });

    return NextResponse.json(
      { status: 'success', data: banner },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive, order } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.banner.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(order !== undefined ? { order: parseInt(order, 10) } : {}),
      },
    });

    return NextResponse.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update banner' },
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
        { status: 'error', message: 'Banner ID is required' },
        { status: 400 }
      );
    }

    await prisma.banner.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
