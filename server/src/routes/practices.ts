import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GET /api/practices
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, theme, duration, search, page = '1' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const take = 20;
    const skip = (pageNum - 1) * take;

    const where: Record<string, unknown> = {};
    if (category && category !== 'all') where.category = category;
    if (theme) where.theme = theme;
    if (duration) where.durationMin = { lte: parseInt(duration as string, 10) };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [practices, total] = await Promise.all([
      prisma.practice.findMany({ where, skip, take, orderBy: { createdAt: 'asc' } }),
      prisma.practice.count({ where }),
    ]);

    res.json({ practices, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to fetch practices', code: 'FETCH_ERROR' } });
  }
});

// GET /api/practices/daily
router.get('/daily', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const dailyPractices = await prisma.practice.findMany({ where: { isDaily: true } });
    if (dailyPractices.length === 0) {
      res.status(404).json({ error: { message: 'No daily practices found', code: 'NOT_FOUND' } });
      return;
    }
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const practice = dailyPractices[dayOfYear % dailyPractices.length];
    res.json(practice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to fetch daily practice', code: 'FETCH_ERROR' } });
  }
});

// GET /api/practices/for-you
router.get('/for-you', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ error: { message: 'User not found', code: 'NOT_FOUND' } });
      return;
    }

    const categoryMap: Record<string, string[]> = {
      divorce: ['healing', 'identity', 'grief'],
      loss: ['grief', 'healing', 'faith'],
      'empty-nest': ['identity', 'healing', 'connection'],
      retirement: ['identity', 'purpose', 'joy'],
      career: ['identity', 'faith', 'stillness'],
      health: ['healing', 'stillness', 'faith'],
    };

    const preferredCategories = user.transitionType
      ? categoryMap[user.transitionType] || ['healing', 'identity', 'stillness']
      : ['healing', 'identity', 'stillness'];

    const practices = await prisma.practice.findMany({
      where: { category: { in: preferredCategories } },
      take: 20,
    });

    // Shuffle and take 6
    const shuffled = practices.sort(() => Math.random() - 0.5).slice(0, 6);
    res.json(shuffled);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to fetch recommendations', code: 'FETCH_ERROR' } });
  }
});

// GET /api/practices/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const practice = await prisma.practice.findUnique({ where: { id: req.params.id } });
    if (!practice) {
      res.status(404).json({ error: { message: 'Practice not found', code: 'NOT_FOUND' } });
      return;
    }
    res.json(practice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to fetch practice', code: 'FETCH_ERROR' } });
  }
});

// POST /api/practices/:id/complete
router.post('/:id/complete', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { mood } = req.body;
    const practice = await prisma.practice.findUnique({ where: { id: req.params.id } });
    if (!practice) {
      res.status(404).json({ error: { message: 'Practice not found', code: 'NOT_FOUND' } });
      return;
    }

    const userPractice = await prisma.userPractice.create({
      data: { userId: req.user!.id, practiceId: practice.id, mood },
    });

    // Mark path item as complete if applicable
    await prisma.pathItem.updateMany({
      where: { practiceId: practice.id, path: { userId: req.user!.id }, completed: false },
      data: { completed: true },
    });

    // Generate reflection prompt via Claude
    let reflectionPrompt = `How did "${practice.title}" land for you today?`;
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `Create a single warm, open-ended reflection question for someone who just completed a ${practice.durationMin}-minute practice called "${practice.title}" focused on ${practice.theme}. The question should invite gentle introspection. Just the question, no preamble.`,
          },
        ],
      });
      const content = message.content[0];
      if (content.type === 'text') {
        reflectionPrompt = content.text.trim();
      }
    } catch (aiErr) {
      console.error('AI reflection prompt failed, using default', aiErr);
    }

    res.json({ userPractice, reflectionPrompt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to complete practice', code: 'COMPLETE_ERROR' } });
  }
});

export default router;
