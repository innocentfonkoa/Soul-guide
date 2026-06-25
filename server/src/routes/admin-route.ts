// server/src/routes/admin.ts
// NEW FILE — admin API routes

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const ADMIN_KEY = 'Innocent@12345';

// Middleware to check admin key
function adminAuth(req: Request, res: Response, next: Function) {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

// GET /api/admin/users
router.get('/users', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        onboardingDone: true,
        subscriptionActive: true,
        subscriptionExpiry: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUsers = users.length;
    const activeSubscribers = users.filter(u => u.subscriptionActive).length;
    const freeUsers = totalUsers - activeSubscribers;

    res.json({ users, stats: { totalUsers, activeSubscribers, freeUsers } });
  } catch (err) {
    console.error('[admin] users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/subscription
router.post('/subscription', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, activate } = req.body;
    if (!userId) { res.status(400).json({ error: 'userId required' }); return; }

    const expiry = activate ? (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d;
    })() : null;

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionActive: activate, subscriptionExpiry: expiry },
    });

    res.json({ success: true, expiry });
  } catch (err) {
    console.error('[admin] subscription error:', err);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

export default router;
