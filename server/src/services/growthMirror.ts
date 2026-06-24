import { PrismaClient, GrowthInsight } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateMonthlyInsight(
  userId: string,
  month: number,
  year: number
): Promise<GrowthInsight> {
  // Check if already exists
  const existing = await prisma.growthInsight.findFirst({
    where: { userId, month, year },
  });
  if (existing) return existing;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, transitionType: true, primaryIntention: true },
  });

  if (!user) throw new Error('User not found');

  // Gather month's data
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const practices = await prisma.userPractice.findMany({
    where: { userId, completedAt: { gte: monthStart, lt: monthEnd } },
    include: { practice: true },
  });

  const reflections = await prisma.reflection.findMany({
    where: { userId, createdAt: { gte: monthStart, lt: monthEnd } },
  });

  const practiceCount = practices.length;

  // Count theme frequency
  const themeCounts: Record<string, number> = {};
  for (const p of practices) {
    themeCounts[p.practice.theme] = (themeCounts[p.practice.theme] || 0) + 1;
  }
  for (const r of reflections) {
    for (const t of r.themes) {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    }
  }

  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);

  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });

  let insightText = `Dear ${user.name},\n\n${monthName} was a month of quiet growth. You showed up for yourself ${practiceCount} time${practiceCount !== 1 ? 's' : ''} — and that matters more than you know. The themes that surfaced most were ${topThemes.slice(0, 3).join(', ')}, each one a thread in the larger story you are writing. Keep going. You are becoming.`;

  try {
    const reflectionSummary = reflections
      .slice(0, 5)
      .map((r) => r.response)
      .join('\n\n');

    const practiceNames = [...new Set(practices.map((p) => p.practice.title))].slice(0, 5).join(', ');

    const prompt = `Write a warm, personal monthly growth reflection letter for ${user.name}, who is navigating ${user.transitionType || 'a life transition'}. Their intention: ${user.primaryIntention || 'healing and growth'}.

This month (${monthName} ${year}):
- Completed ${practiceCount} practice sessions
- Top themes: ${topThemes.join(', ')}
- Practices included: ${practiceNames || 'various mindfulness practices'}
${reflectionSummary ? `\nSample reflections:\n${reflectionSummary}` : ''}

Write a 200-word letter that:
1. Opens with "Dear ${user.name},"
2. Acknowledges specific patterns you notice
3. Celebrates small victories
4. Offers one gentle observation about their journey
5. Closes with warm encouragement

Write with the voice of a wise, compassionate friend — not a therapist or coach.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      insightText = content.text;
    }
  } catch (err) {
    console.error('Growth mirror AI failed, using fallback', err);
  }

  const insight = await prisma.growthInsight.create({
    data: {
      userId,
      month,
      year,
      insight: insightText,
      themes: topThemes,
      practiceCount,
    },
  });

  return insight;
}
