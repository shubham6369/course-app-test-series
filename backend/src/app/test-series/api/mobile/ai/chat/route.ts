import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStudentFromBearer } from '@/lib/mobile-auth';
import { mobileSuccess, mobileError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const auth = await getStudentFromBearer(req, { required: false });
    const student = auth.student;

    const body = await req.json().catch(() => ({}));
    const message = body.message || '';

    let responseText =
      "That's an excellent question! In academic problem solving, always start by listing given parameters, identifying core formulas, and checking dimensional consistency. Let me know if you would like step-by-step guidance on this topic!";
    let suggestions = [
      'Explain with a real-life example',
      'What are the common exam traps here?',
      'Can you give me a practice question?',
    ];

    const lower = message.toLowerCase();
    if (lower.includes('physics') || lower.includes('newton') || lower.includes('force')) {
      responseText =
        'In Newtonian mechanics, remember that force is the rate of change of momentum (F = dp/dt). When mass is constant, F = m·a. Always draw a Free Body Diagram (FBD) first!';
      suggestions = [
        'How to resolve components on an inclined plane?',
        'State the impulse-momentum theorem',
        'Show a worked numerical on friction',
      ];
    } else if (lower.includes('math') || lower.includes('calculus') || lower.includes('derivative')) {
      responseText =
        'In calculus, differentiation measures the instantaneous rate of change. Common rule: d/dx [x^n] = n·x^(n-1). For composite functions, remember the chain rule: dy/dx = (dy/du)·(du/dx).';
      suggestions = [
        'How to apply product and quotient rules?',
        'Geometric interpretation of derivatives',
        'Find maxima and minima with second derivative test',
      ];
    } else if (lower.includes('chemistry') || lower.includes('reaction') || lower.includes('mole')) {
      responseText =
        "For stoichiometry in chemistry, 1 mole of any gas at STP occupies 22.4 Litres and contains 6.022 × 10²³ particles (Avogadro's number). Balance the chemical equation before calculating yields!";
      suggestions = [
        'How to identify the limiting reagent?',
        'Calculate molarity vs molality',
        'Relate enthalpy change with bond energies',
      ];
    } else if (lower.includes('biology') || lower.includes('cell') || lower.includes('mitochondria')) {
      responseText =
        'Mitochondria are double-membraned semi-autonomous organelles known as the powerhouse of the cell, generating ATP through oxidative phosphorylation and the Krebs cycle.';
      suggestions = [
        'What is the chemiosmotic hypothesis?',
        'Compare mitochondria with chloroplasts',
        'Explain maternal inheritance in mitochondrial DNA',
      ];
    }

    try {
      await prisma.aiAuditLog.create({
        data: {
          studentId: student?.id ?? null,
          query: message,
          response: responseText,
          suggestions: JSON.stringify(suggestions),
        },
      });
    } catch {
      // Non-fatal if audit logging encounters a hiccup
    }

    const data = {
      message: responseText,
      suggestions,
      timestamp: new Date().toISOString(),
    };

    return mobileSuccess(data);
  } catch (error: any) {
    return mobileError(error.message || 'AI tutor service error', 500);
  }
}
