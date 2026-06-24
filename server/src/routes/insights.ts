import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { generateMonthlyInsight } from '../services/growthMirror';

const router = Router();
const prisma = new PrismaClient();

// GET /api/insights/monthly
router.get('/monthly', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const month = parseInt((req.query.month as string) || String(now.getMonth() + 1), 10);
    const year = parseInt((req.query.year as string) || String(now.getFullYear()), 10);

    const existing = await prisma.growthInsight.findFirst({
      where: { userId: req.user!.id, month, year },
    });

    if (existing) {
      res.json(existing);
      return;
    }

    // Auto-generate if month is in the past
    const requestedDate = new Date(year, month - 1, 1);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (requestedDate < currentMonthStart) {
      const insight = await generateMonthlyInsight(req.user!.id, month, year);
      res.json(insight);
      return;
    }

    res.json(null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to fetch insight', code: 'FETCH_ERROR' } });
  }
});

// POST /api/insights/generate
router.post('/generate', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const month = parseInt((req.body.month as string) || String(now.getMonth() + 1), 10);
    const year = parseInt((req.body.year as string) || String(now.getFullYear()), 10);

    const insight = await generateMonthlyInsight(req.user!.id, month, year);
    res.json(insight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to generate insight', code: 'GENERATE_ERROR' } });
  }
});

export default router;
