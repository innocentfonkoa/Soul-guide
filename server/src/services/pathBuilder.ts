import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface PathDay {
  day: number;
  practiceId: string;
}

const transitionCategoryMap: Record<string, string[]> = {
  divorce: ['healing', 'identity', 'grief', 'connection'],
  loss: ['grief', 'healing', 'faith', 'stillness'],
  'empty-nest': ['identity', 'healing', 'connection', 'joy'],
  retirement: ['identity', 'joy', 'stillness', 'faith'],
  career: ['identity', 'faith', 'healing', 'stillness'],
  health: ['healing', 'stillness', 'faith', 'identity'],
};

async function buildDeterministicPath(
  userId: string,
  transitionType: string | null,
  intention: string
): Promise<void> {
  const categories = transitionType
    ? transitionCategoryMap[transitionType] || ['healing', 'identity', 'stillness', 'faith']
    : ['healing', 'identity', 'stillness', 'faith'];

  const practices = await prisma.practice.findMany({
    where: { category: { in: categories } },
    orderBy: { createdAt: 'asc' },
  });

  if (practices.length === 0) {
    const all = await prisma.practice.findMany({ orderBy: { createdAt: 'asc' } });
    practices.push(...all);
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);

  const path = await prisma.practicePath.create({
    data: {
      userId,
      title: 'Your 30-Day Journey',
      intention,
      startDate,
      endDate,
      items: {
        create: Array.from({ length: 30 }, (_, i) => ({
          practiceId: practices[i % practices.length].id,
          dayNumber: i + 1,
          completed: false,
        })),
      },
    },
  });

  console.log(`Created deterministic path ${path.id} for user ${userId}`);
}

export async function buildPracticePath(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      transitionType: true,
      transitionDetail: true,
      primaryIntention: true,
    },
  });

  if (!user) throw new Error('User not found');

  // Delete existing path if present
  const existing = await prisma.practicePath.findUnique({ where: { userId } });
  if (existing) {
    await prisma.pathItem.deleteMany({ where: { pathId: existing.id } });
    await prisma.practicePath.delete({ where: { userId } });
  }

  const intention = user.primaryIntention || 'healing and growth';
  const allPractices = await prisma.practice.findMany({ select: { id: true, title: true, category: true, theme: true } });

  try {
    const practiceList = allPractices
      .map((p) => `id:${p.id} title:"${p.title}" category:${p.category} theme:${p.theme}`)
      .join('\n');

    const prompt = `Design a 30-day mindfulness practice path for someone named ${user.name} who is going through: ${user.transitionType || 'a life transition'}${user.transitionDetail ? ` (${user.transitionDetail})` : ''}. Their primary intention is: ${intention}.

Available practices:
${practiceList}

Create a thoughtful 30-day sequence. Vary the categories. Start gently, build depth in weeks 2-3, integrate in week 4.

Respond with ONLY valid JSON in this format:
{
  "title": "Path title",
  "days": [
    { "day": 1, "practiceId": "..." },
    ...all 30 days...
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]) as { title: string; days: PathDay[] };

    const validPracticeIds = new Set(allPractices.map((p) => p.id));
    const validDays = parsed.days.filter(
      (d) => d.day >= 1 && d.day <= 30 && validPracticeIds.has(d.practiceId)
    );

    if (validDays.length < 28) throw new Error('Not enough valid days in AI response');

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    await prisma.practicePath.create({
      data: {
        userId,
        title: parsed.title || 'Your 30-Day Journey',
        intention,
        startDate,
        endDate,
        items: {
          create: validDays.map((d) => ({
            practiceId: d.practiceId,
            dayNumber: d.day,
            completed: false,
          })),
        },
      },
    });
  } catch (err) {
    console.error('AI path generation failed, using deterministic fallback', err);
    await buildDeterministicPath(userId, user.transitionType, intention);
  }
}
