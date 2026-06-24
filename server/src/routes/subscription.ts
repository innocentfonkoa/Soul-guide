import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/subscription/initialize
router.post('/initialize', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: { message: 'User not found', code: 'NOT_FOUND' } });
      return;
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: 6999 * 100,
        currency: 'USD',
        callback_url: `http://localhost:5173/subscription/verify`,
        metadata: { userId: user.id },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ url: response.data.data.authorization_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to initialize payment', code: 'PAYMENT_ERROR' } });
  }
});

// GET /api/subscription/verify/:reference
router.get('/verify/:reference', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const userId = (req as any).user.id;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === 'success') {
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionActive: true,
          subscriptionExpiry: expiry,
        },
      });

      res.json({ success: true, message: 'Subscription activated' });
    } else {
      res.status(400).json({ error: { message: 'Payment not successful', code: 'PAYMENT_FAILED' } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to verify payment', code: 'VERIFY_ERROR' } });
  }
});

// GET /api/subscription/status
router.get('/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionActive: true, subscriptionExpiry: true },
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to get status', code: 'STATUS_ERROR' } });
  }
});

export default router;