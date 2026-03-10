import express from 'express';
import { z } from 'zod';
import type { CouponService } from '#service/commerce/CouponService.js';

const CreateSchema = z.object({
  user_id: z.number(),
  coupon_template_id: z.number(),
});

const RedeemSchema = z.object({
  user_id: z.number(),
  coupon_code: z.string().min(1),
});

export function createCouponRouter(couponService: CouponService) {
  const router = express.Router();

  // ── GET /api/coupon/FindAll/:user_id ─────────────────────────────────────
  router.get('/FindAll/:user_id', async (req, res) => {
    try {
      const userId = parseInt(req.params.user_id);
      const result = await couponService.findAll(userId);
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json((err as Error).message);
    }
  });

  // ── POST /api/coupon/Create ──────────────────────────────────────────────
  router.post('/Create', async (req, res) => {
    try {
      const parsed = CreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: '缺少必要參數' });
      }
      const result = await couponService.create(parsed.data.user_id, parsed.data.coupon_template_id);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json((err as Error).message);
    }
  });

  // ── POST /api/coupon/Update ──────────────────────────────────────────────
  router.post('/Update', async (req, res) => {
    try {
      const couponId = parseInt(req.body.id as string);
      if (isNaN(couponId)) {
        return res.status(400).json({ success: false, message: '缺少必要參數' });
      }
      const result = await couponService.invalidate(couponId);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json(err);
    }
  });

  // ── POST /api/coupon/Redeem ──────────────────────────────────────────────
  router.post('/Redeem', async (req, res) => {
    try {
      const parsed = RedeemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: '缺少必要參數' });
      }
      const result = await couponService.redeem(parsed.data.user_id, parsed.data.coupon_code);
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
  });

  return router;
}
