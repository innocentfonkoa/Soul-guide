import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

function generateToken(user: { id: string; email: string; name: string }): string {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, secret, { expiresIn: '30d' });
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: { message: 'Email, password, and name are required', code: 'MISSING_FIELDS' } });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: { message: 'Email already registered', code: 'EMAIL_EXISTS' } });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, onboardingDone: true, createdAt: true },
    });

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err: any) {
  console.error(err);
  res.status(500).json({ error: { message: err.message, code: 'REGISTER_ERROR' } });
}
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: { message: 'Email and password are required', code: 'MISSING_FIELDS' } });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } });
      return;
    }

    const token = generateToken(user);
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Login failed', code: 'LOGIN_ERROR' } });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        transitionType: true,
        transitionDetail: true,
        primaryIntention: true,
        morningOrEvening: true,
        practiceMinutes: true,
        onboardingDone: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: { message: 'User not found', code: 'NOT_FOUND' } });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to fetch user', code: 'FETCH_ERROR' } });
  }
});

// PATCH /api/auth/onboarding
router.patch('/onboarding', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { transitionType, transitionDetail, primaryIntention, morningOrEvening, practiceMinutes, onboardingDone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(transitionType !== undefined && { transitionType }),
        ...(transitionDetail !== undefined && { transitionDetail }),
        ...(primaryIntention !== undefined && { primaryIntention }),
        ...(morningOrEvening !== undefined && { morningOrEvening }),
        ...(practiceMinutes !== undefined && { practiceMinutes }),
        ...(onboardingDone !== undefined && { onboardingDone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        transitionType: true,
        transitionDetail: true,
        primaryIntention: true,
        morningOrEvening: true,
        practiceMinutes: true,
        onboardingDone: true,
      },
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to update onboarding', code: 'UPDATE_ERROR' } });
  }
});

export default router;
