import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GET /api/journey/path
router.get('/path', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const path = await prisma.practicePath.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { practice: true },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });
    res.json(path);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to fetch path', code: 'FETCH_ERROR' } });
  }
});

// GET /api/journey/history
router.get('/history', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const completions = await prisma.userPractice.findMany({
      where: { userId: req.user!.id, completedAt: { gte: since } },
      include: { practice: true },
      orderBy: { completedAt: 'desc' },
    });

    // Group by week
    const byWeek: Record<string, typeof completions> = {};
    for (const c of completions) {
      const d = new Date(c.completedAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!byWeek[key]) byWeek[key] = [];
      byWeek[key].push(c);
    }

    res.json(byWeek);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to fetch history', code: 'FETCH_ERROR' } });
  }
});

// GET /api/journey/stats
router.get('/stats', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const completions = await prisma.userPractice.findMany({
      where: { userId: req.user!.id },
      include: { practice: true },
      orderBy: { completedAt: 'desc' },
    });

    const totalCompleted = completions.length;

    // Calculate streaks
    const dateSets = new Set(
      completions.map((c) => new Date(c.completedAt).toISOString().split('T')[0])
    );
    const sortedDates = Array.from(dateSets).sort((a, b) => b.localeCompare(a));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < sortedDates.length; i++) {
      const curr = new Date(sortedDates[i]);
      const prev = i > 0 ? new Date(sortedDates[i - 1]) : null;
      const diffDays = prev
        ? Math.round((prev.getTime() - curr.getTime()) / 86400000)
        : null;

      if (i === 0) {
        const diffFromToday = Math.round(
          (new Date(today).getTime() - curr.getTime()) / 86400000
        );
        if (diffFromToday <= 1) {
          tempStreak = 1;
        }
      } else if (diffDays !== null && diffDays <= 2) {
        tempStreak++;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    currentStreak = sortedDates.length > 0 ? tempStreak : 0;

    // Top themes and categories
    const themeCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    for (const c of completions) {
      themeCounts[c.practice.theme] = (themeCounts[c.practice.theme] || 0) + 1;
      categoryCounts[c.practice.category] = (categoryCounts[c.practice.category] || 0) + 1;
    }

    const topThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    res.json({ totalCompleted, currentStreak, longestStreak, topThemes, topCategories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to fetch stats', code: 'FETCH_ERROR' } });
  }
});

// POST /api/journey/reflection
router.post('/reflection', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { practiceId, prompt, response } = req.body;
    if (!prompt || !response) {
      res.status(400).json({ error: { message: 'Prompt and response are required', code: 'MISSING_FIELDS' } });
      return;
    }

    // Extract themes via Claude
    let themes: string[] = [];
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `Extract 2-4 emotional or thematic keywords from this reflection. Return only a JSON array of lowercase strings.\n\nReflection: "${response}"`,
          },
        ],
      });
      const content = message.content[0];
      if (content.type === 'text') {
        const match = content.text.match(/\[.*\]/s);
        if (match) themes = JSON.parse(match[0]);
      }
    } catch (aiErr) {
      console.error('Theme extraction failed', aiErr);
      themes = ['reflection', 'growth'];
    }

    const reflection = await prisma.reflection.create({
      data: {
        userId: req.user!.id,
        practiceId: practiceId || null,
        prompt,
        response,
        themes,
      },
    });

    res.json(reflection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to save reflection', code: 'SAVE_ERROR' } });
  }
});

export default router;
