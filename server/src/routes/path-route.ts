// server/src/routes/path-route.ts
// Full replacement — matches your exact schema (completed, not isCompleted)

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { buildPracticePath, getPathForUser, markDayComplete } from '../services/pathBuilder';

const router = Router();

// GET /api/path
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const path = await getPathForUser(userId);

    if (!path) {
      res.status(404).json({ error: 'No path found' });
      return;
    }

    const startDate = new Date(path.startDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const currentDay = Math.min(
      Math.max(1, Math.floor((Date.now() - startDate.getTime()) / msPerDay) + 1),
      30
    );

    const completed = path.items.filter(i => i.completed).length;

    res.json({ path, currentDay, progress: { completed, total: path.items.length } });
  } catch (err) {
    console.error('[path] GET error:', err);
    res.status(500).json({ error: 'Failed to fetch path' });
  }
});

// POST /api/path/generate
router.post('/generate', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    await buildPracticePath(userId);
    const path = await getPathForUser(userId);

    const startDate = new Date(path!.startDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const currentDay = Math.min(
      Math.max(1, Math.floor((Date.now() - startDate.getTime()) / msPerDay) + 1),
      30
    );

    const completed = path!.items.filter(i => i.completed).length;
    res.json({ success: true, path, currentDay, progress: { completed, total: path!.items.length } });
  } catch (err) {
    console.error('[path] generate error:', err);
    res.status(500).json({ error: 'Failed to generate path' });
  }
});

// POST /api/path/complete/:day
router.post('/complete/:day', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const dayNumber = parseInt(req.params.day, 10);
    if (isNaN(dayNumber)) { res.status(400).json({ error: 'Invalid day' }); return; }
    await markDayComplete(userId, dayNumber);
    res.json({ success: true });
  } catch (err) {
    console.error('[path] complete error:', err);
    res.status(500).json({ error: 'Failed to mark complete' });
  }
});

export default router;
