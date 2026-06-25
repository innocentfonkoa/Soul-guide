// server/src/services/pathBuilder.ts
// Full replacement — matches your exact Prisma schema

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FOCUS_MAP: Record<string, string[]> = {
  anxiety:       ['breathing', 'calm', 'grounding', 'stress'],
  sleep:         ['sleep', 'rest', 'relaxation', 'stillness'],
  identity:      ['identity', 'self-discovery', 'reflection', 'purpose'],
  energy:        ['energy', 'morning', 'vitality', 'joy'],
  relationships: ['relationships', 'connection', 'healing'],
  confidence:    ['confidence', 'empowerment', 'identity'],
  grief:         ['grief', 'loss', 'healing', 'faith'],
  body:          ['body', 'healing', 'stillness'],
  purpose:       ['purpose', 'identity', 'faith'],
  rest:          ['stillness', 'rest', 'calm'],
  stress:        ['calm', 'breathing', 'grounding'],
};

function getPhase(day: number): string {
  if (day <= 5)  return 'intro';
  if (day <= 14) return 'build';
  if (day <= 24) return 'deepen';
  return 'integrate';
}

export async function buildPracticePath(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User ${userId} not found`);

    // Extract focus from onboarding fields
    const focusKeywords: string[] = [];
    if (user.transitionType) {
      const mapped = FOCUS_MAP[user.transitionType.toLowerCase()];
      if (mapped) focusKeywords.push(...mapped);
    }
    if (user.primaryIntention) {
      const mapped = FOCUS_MAP[user.primaryIntention.toLowerCase()];
      if (mapped) focusKeywords.push(...mapped);
    }
    // Default if nothing matched
    if (focusKeywords.length === 0) {
      focusKeywords.push('healing', 'stillness', 'identity', 'calm', 'reflection');
    }

    const unique = [...new Set(focusKeywords)];
    console.log(`[pathBuilder] User ${userId} keywords:`, unique);

    // Load all practices
    const allPractices = await prisma.practice.findMany();
    if (allPractices.length === 0) throw new Error('No practices found');

    // Score by relevance
    const scored = allPractices.map(p => {
      const text = `${p.title} ${p.category} ${p.theme} ${p.description}`.toLowerCase();
      const score = unique.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
      return { ...p, score };
    }).sort((a, b) => b.score - a.score || Math.random() - 0.5);

    // Delete existing path
    const existing = await prisma.practicePath.findUnique({ where: { userId } });
    if (existing) {
      await prisma.pathItem.deleteMany({ where: { pathId: existing.id } });
      await prisma.practicePath.delete({ where: { userId } });
    }

    // Build intention label from user data
    const intention = user.primaryIntention || user.transitionType || 'Wellbeing & Growth';
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 29);

    // Create path — matches schema exactly (title, intention, startDate, endDate required)
    const path = await prisma.practicePath.create({
      data: {
        userId,
        title: 'Your 30-Day Journey',
        intention,
        startDate,
        endDate,
      },
    });

    // Create 30 path items — uses 'completed' (not isCompleted) per schema
    const items = Array.from({ length: 30 }, (_, i) => ({
      pathId: path.id,
      practiceId: scored[i % scored.length].id,
      dayNumber: i + 1,
      completed: false,
    }));

    await prisma.pathItem.createMany({ data: items });
    console.log(`[pathBuilder] ✅ 30-day path created for user ${userId}`);
  } catch (err) {
    console.error('[pathBuilder] Error:', err);
    throw err;
  }
}

export async function getPathForUser(userId: string) {
  return prisma.practicePath.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { dayNumber: 'asc' },
        include: { practice: true },
      },
    },
  });
}

export async function markDayComplete(userId: string, dayNumber: number) {
  const path = await prisma.practicePath.findUnique({ where: { userId } });
  if (!path) return null;
  return prisma.pathItem.updateMany({
    where: { pathId: path.id, dayNumber },
    data: { completed: true },
  });
}
