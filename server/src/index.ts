import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import practicesRoutes from './routes/practices';
import journeyRoutes from './routes/journey';
import companionRoutes from './routes/companion';
import insightsRoutes from './routes/insights';
import subscriptionRoutes from './routes/subscription';
import { errorHandler } from './middleware/errorHandler';
import { buildPracticePath } from './services/pathBuilder';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/practices', practicesRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/companion', companionRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/subscription', subscriptionRoutes);

// POST /api/onboarding/complete — trigger path building
app.post('/api/onboarding/complete', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: { message: 'userId required', code: 'MISSING_FIELDS' } });
      return;
    }
    await prisma.user.update({ where: { id: userId }, data: { onboardingDone: true } });
    buildPracticePath(userId).catch((err) => console.error('Path build error', err));
    res.json({ message: 'Onboarding complete, path building started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Failed to complete onboarding', code: 'ERROR' } });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SoulGuide server running on port ${PORT}`);
});

export default app;