import express from 'express';
import { z } from 'zod';
import { checkToken } from '#middleware/checkToken.js';
import type { CartService } from '#service/commerce/CartService.js';

const CalculateSchema = z.object({
  cartdata: z.string(),
  lessonCUID: z.string().optional(),
  instrumentCUID: z.string().optional(),
});

const FormSchema = z.object({
  phone: z.string(),
  country: z.string(),
  township: z.string(),
  postcode: z.string(),
  address: z.string(),
  transportationstate: z.string(),
  cartdata: z.string(),
  LessonCUID: z.string().optional(),
  InstrumentCUID: z.string().optional(),
});

export function createCartRouter(cartService: CartService) {
  const router = express.Router();

  // ── POST /api/cart/calculate ─ price preview ─────────────────────────────
  router.post('/calculate', checkToken, async (req, res) => {
    const parsed = CalculateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: 'cartdata is required' });
    }
    const userId = req.decoded.id;
    try {
      const cartEntries = JSON.parse(parsed.data.cartdata);
      const result = await cartService.calcPrice(
        cartEntries,
        userId,
        parsed.data.lessonCUID ?? null,
        parsed.data.instrumentCUID ?? null
      );
      return res.status(200).json({ status: 'success', ...result });
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
      return res.status(statusCode).json({ status: 'error', message: (err as Error).message });
    }
  });

  // ── POST /api/cart/form ─ order submission ───────────────────────────────
  router.post('/form', checkToken, async (req, res) => {
    const parsed = FormSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues[0].message });
    }
    const userId = req.decoded.id;
    const userUid = req.decoded.uid;
    const { LessonCUID, InstrumentCUID, cartdata, ...rest } = parsed.data;
    try {
      const cartEntries = JSON.parse(cartdata);
      await cartService.submitOrder({
        ...rest,
        cartEntries,
        lessonCUID: LessonCUID ?? null,
        instrumentCUID: InstrumentCUID ?? null,
        userId,
        userUid,
      });
      return res.status(200).json({ status: 'success' });
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
      return res.status(statusCode).json({ status: 'error', message: (err as Error).message });
    }
  });

  return router;
}
