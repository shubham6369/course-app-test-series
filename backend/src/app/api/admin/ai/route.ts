import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [config, auditLogs] = await Promise.all([
      prisma.aiConfig.findFirst({
        orderBy: { id: 'asc' },
      }),
      prisma.aiAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const defaultConfig = config || {
      id: 1,
      systemPrompt:
        'You are an expert AI Academic Tutor for NEET & JEE competitive exams in India. Provide conceptual, encouraging, and step-by-step explanations for Physics, Chemistry, and Biology questions.',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1000,
    };

    return NextResponse.json({
      status: 'success',
      data: {
        config: defaultConfig,
        auditLogs,
      },
    });
  } catch (error) {
    console.error('Error fetching AI configuration:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch AI configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemPrompt, model = 'gpt-4o-mini', temperature = 0.7, maxTokens = 1000 } = body;

    if (!systemPrompt) {
      return NextResponse.json(
        { status: 'error', message: 'System prompt is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.aiConfig.findFirst();

    const updated = existing
      ? await prisma.aiConfig.update({
          where: { id: existing.id },
          data: {
            systemPrompt,
            model,
            temperature: parseFloat(temperature),
            maxTokens: parseInt(maxTokens, 10),
          },
        })
      : await prisma.aiConfig.create({
          data: {
            systemPrompt,
            model,
            temperature: parseFloat(temperature),
            maxTokens: parseInt(maxTokens, 10),
          },
        });

    return NextResponse.json({
      status: 'success',
      message: 'AI Tutor configuration saved successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating AI configuration:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update AI configuration' },
      { status: 500 }
    );
  }
}
