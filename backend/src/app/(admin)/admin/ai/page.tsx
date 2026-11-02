import prisma from '@/lib/prisma';
import { AiClient } from './ai-client';

export const dynamic = 'force-dynamic';

export default async function AdminAiPage() {
  const [config, auditLogs] = await Promise.all([
    prisma.aiConfig.findFirst({
      orderBy: { id: 'asc' },
    }),
    prisma.aiAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  const activeConfig = config || {
    id: 1,
    systemPrompt:
      'You are an expert AI Academic Tutor for NEET & JEE competitive exams in India. Provide conceptual, encouraging, and step-by-step explanations for Physics, Chemistry, and Biology questions.',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000,
  };

  return <AiClient initialConfig={activeConfig} initialLogs={auditLogs} />;
}
