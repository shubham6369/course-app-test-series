import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    const resources = await prisma.resource.findMany({
      where: search
        ? {
            title: {
              contains: search,
            },
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      status: 'success',
      data: resources,
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type = 'pdf', fileUrl, fileSize = '0 MB' } = body;

    if (!title || !fileUrl) {
      return NextResponse.json(
        { status: 'error', message: 'Title and file URL are required' },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        type,
        fileUrl,
        fileSize,
      },
    });

    return NextResponse.json(
      { status: 'success', data: resource },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create resource' },
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
        { status: 'error', message: 'Resource ID is required' },
        { status: 400 }
      );
    }

    await prisma.resource.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
