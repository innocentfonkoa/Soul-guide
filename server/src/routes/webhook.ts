// server/src/routes/webhook.ts
// Handles both monthly ($9.99) and annual ($69.99) Selar payments

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

function isMonthly(amount: number): boolean {
  return Math.abs(amount - 9.99) < 1;
}
function isAnnual(amount: number): boolean {
  return Math.abs(amount - 69.99) < 2;
}

router.post('/selar', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[webhook] Selar payload:', JSON.stringify(req.body));
    const body = req.body;

    // Extract email — Selar uses different field names
    const email =
      body.email ||
      body.buyer_email ||
      body.customer_email ||
      body.buyer?.email ||
      body.customer?.email ||
      null;

    if (!email) {
      console.error('[webhook] No email in payload');
      res.status(200).json({ received: true, error: 'No email found' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const amount = parseFloat(body.amount || body.total || body.price || '0');
    console.log(`[webhook] Email: ${normalizedEmail}, Amount: $${amount}`);

    // Determine plan
    let months = 12;
    let planName = 'Annual';
    if (isMonthly(amount)) {
      months = 1;
      planName = 'Monthly';
    } else if (isAnnual(amount)) {
      months = 12;
      planName = 'Annual';
    } else {
      months = 1;
      planName = 'Unknown';
      console.warn(`[webhook] Unrecognised amount $${amount}, defaulting to 1 month`);
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      console.warn(`[webhook] No user found for: ${normalizedEmail}`);
      res.status(200).json({ received: true, error: 'User not found' });
      return;
    }

    // Extend from existing expiry if still active, otherwise from today
    const base = user.subscriptionExpiry && user.subscriptionExpiry > new Date()
      ? new Date(user.subscriptionExpiry)
      : new Date();

    const expiry = new Date(base);
    expiry.setMonth(expiry.getMonth() + months);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { subscriptionActive: true, subscriptionExpiry: expiry },
    });

    console.log(`[webhook] ✅ ${planName} activated for ${normalizedEmail} until ${expiry.toISOString()}`);
    res.status(200).json({ received: true, success: true, plan: planName, expiry });
  } catch (err) {
    console.error('[webhook] Error:', err);
    res.status(200).json({ received: true, error: 'Internal error' });
  }
});

export default router;
