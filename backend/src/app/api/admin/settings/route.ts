import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      status: 'success',
      data: settingsMap,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { status: 'error', message: 'Settings object is required' },
        { status: 400 }
      );
    }

    const updates = Object.entries(settings).map(([key, value]) => {
      const strVal = String(value);
      let category = 'general';
      if (key.startsWith('razorpay')) category = 'razorpay';
      else if (key.startsWith('brand') || key.startsWith('site_') || key.startsWith('logo'))
        category = 'branding';
      else if (key.startsWith('ai_')) category = 'ai';

      return prisma.setting.upsert({
        where: { key },
        update: { value: strVal, category },
        create: { key, value: strVal, category },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({
      status: 'success',
      message: 'Platform settings saved successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
