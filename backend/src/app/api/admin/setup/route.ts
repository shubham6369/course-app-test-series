import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const brandingSettings = await prisma.setting.findMany({
      where: {
        category: 'branding',
      },
    });

    const config: Record<string, string> = {
      app_name: 'Webphiser Education System',
      tagline: 'Premier Computer-Based Testing & Learning Platform for NEET & JEE',
      logo_url: 'https://edu.d3vx.in/assets/logo.png',
      brand_color: '#09214b',
      brand_accent: '#e0a028',
      brand_dark: '#061432',
      brand_canvas: '#040e22',
    };

    brandingSettings.forEach((s) => {
      config[s.key] = s.value;
    });

    return NextResponse.json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    console.error('Error fetching branding:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch branding setup' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const updates = Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value), category: 'branding' },
        create: { key, value: String(value), category: 'branding' },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({
      status: 'success',
      message: 'Branding identity updated successfully',
    });
  } catch (error) {
    console.error('Error updating branding setup:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update branding' },
      { status: 500 }
    );
  }
}
