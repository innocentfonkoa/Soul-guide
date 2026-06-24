import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { sendCompanionMessage } from '../services/aiCompanion';

const router = Router();
const prisma = new PrismaClient();

// GET /api/companion/history
router.get('/history', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await prisma.companionMessage.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to fetch history', code: 'FETCH_ERROR' } });
  }
});

// POST /api/companion/message
router.post('/message', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: { message: 'Content is required', code: 'MISSING_FIELDS' } });
      return;
    }

    const reply = await sendCompanionMessage(req.user!.id, content);
    res.json(reply);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to send message', code: 'SEND_ERROR' } });
  }
});

export default router;
