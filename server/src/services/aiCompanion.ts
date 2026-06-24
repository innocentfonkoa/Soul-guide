import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function buildSystemPrompt(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      transitionType: true,
      transitionDetail: true,
      primaryIntention: true,
      morningOrEvening: true,
      practiceMinutes: true,
    },
  });

  const recentPractices = await prisma.userPractice.findMany({
    where: { userId },
    include: { practice: { select: { title: true, category: true } } },
    orderBy: { completedAt: 'desc' },
    take: 5,
  });

  const recentReflections = await prisma.reflection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { prompt: true, response: true, themes: true },
  });

  const practiceList = recentPractices
    .map((p) => `- ${p.practice.title} (${p.practice.category})`)
    .join('\n');

  const reflectionContext = recentReflections
    .map((r) => `Prompt: ${r.prompt}\nResponse: ${r.response}\nThemes: ${r.themes.join(', ')}`)
    .join('\n\n');

  const transitionContext = user?.transitionType
    ? `${user.name} is navigating: ${user.transitionType}${user.transitionDetail ? `, specifically: ${user.transitionDetail}` : ''}.`
    : `${user?.name ?? 'This person'} is going through a life transition.`;

  const intentionContext = user?.primaryIntention
    ? `Their primary intention is: ${user.primaryIntention}.`
    : '';

  return `You are SoulGuide's compassionate AI companion, a warm and emotionally intelligent presence for someone navigating a significant life transition. You are not a therapist or life coach.

${transitionContext} ${intentionContext}

${recentPractices.length > 0 ? `Recent practices they have completed:\n${practiceList}` : ''}

${recentReflections.length > 0 ? `Recent reflections:\n${reflectionContext}` : ''}

Guidelines:
- Speak warmly and directly, as if sitting across from them over tea
- Keep responses concise: 2-4 sentences unless they need more
- Ask one gentle follow-up question when appropriate
- Never diagnose, prescribe, or give medical/legal/financial advice
- If they seem in crisis, gently encourage professional support
- Draw on their practice history to make connections when relevant
- Use their name occasionally, but not every message
- Never use em-dashes or dashes of any kind. Use commas or periods instead.
- Never use bullet points in your responses. Write in natural flowing sentences only.`;
}

export async function sendCompanionMessage(
  userId: string,
  message: string
): Promise<{ id: string; role: string; content: string; createdAt: Date }> {
  await prisma.companionMessage.create({
    data: { userId, role: 'user', content: message },
  });

  const history = await prisma.companionMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  const messages = history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  let replyContent = "I'm here. Take your time. What would you like to share?";

  try {
    const systemPrompt = await buildSystemPrompt(userId);
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0];
    if (content.type === 'text') {
      replyContent = content.text;
    }
  } catch (err) {
    console.error('AI companion error, using fallback', err);
  }

  const saved = await prisma.companionMessage.create({
    data: { userId, role: 'assistant', content: replyContent },
  });

  return saved;
}