import express from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import type { PrismaClient } from '#generated/prisma/client.js';
import type { RecommendationService } from '#service/recommendation/RecommendationService.js';
import type { JwtPayload } from '../../../types/index.js';

// ── Optional auth — sets req.decoded if valid token present, never blocks ────

function optionalAuth(req: express.Request, _res: express.Response, next: express.NextFunction) {
  const header = req.get('Authorization');
  if (header?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(
        header.slice(7),
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as JwtPayload;
      req.decoded = decoded;
    } catch {
      // invalid / expired — treat as guest
    }
  }
  next();
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const LimitSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

const CopurchaseParamSchema = z.object({ puid: z.string().min(1) });
const CopurchaseQuerySchema = z.object({
  type: z.enum(['instrument', 'lesson']),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

const TrackViewSchema = z.object({ puid: z.string().min(1) });

// ── Factory ───────────────────────────────────────────────────────────────────

export function createRecommendationRouter(recService: RecommendationService, prisma: PrismaClient) {
  const router = express.Router();

  async function resolvePuid(puid: string) {
    return prisma.product.findFirst({ where: { puid }, select: { id: true } });
  }

  // GET /api/recommendation/popular/instruments?limit=4
  router.get('/popular/instruments', async (req, res, next) => {
    const parsed = LimitSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ status: 'error', message: '無效參數' });
    try {
      const data = await recService.getPopularInstruments(parsed.data.limit ?? 4);
      return res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/recommendation/popular/lessons?limit=4
  router.get('/popular/lessons', async (req, res, next) => {
    const parsed = LimitSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ status: 'error', message: '無效參數' });
    try {
      const data = await recService.getPopularLessons(parsed.data.limit ?? 4);
      return res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/recommendation/copurchase/:puid?type=instrument|lesson&limit=5
  router.get('/copurchase/:puid', async (req, res, next) => {
    const paramParsed = CopurchaseParamSchema.safeParse(req.params);
    const queryParsed = CopurchaseQuerySchema.safeParse(req.query);
    if (!paramParsed.success || !queryParsed.success) {
      return res.status(400).json({ status: 'error', message: '無效參數' });
    }
    const { type, limit } = queryParsed.data;
    try {
      const product = await resolvePuid(paramParsed.data.puid);
      if (!product) return res.status(404).json({ status: 'error', message: '找不到商品' });

      const productType: 1 | 2 = type === 'instrument' ? 1 : 2;
      const data = await recService.getCoPurchased(product.id, productType, limit ?? 5);
      return res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/recommendation/similar/:puid?type=instrument|lesson&limit=5
  router.get('/similar/:puid', async (req, res, next) => {
    const paramParsed = CopurchaseParamSchema.safeParse(req.params);
    const queryParsed = CopurchaseQuerySchema.safeParse(req.query);
    if (!paramParsed.success || !queryParsed.success) {
      return res.status(400).json({ status: 'error', message: '無效參數' });
    }
    const { type, limit } = queryParsed.data;
    try {
      const product = await resolvePuid(paramParsed.data.puid);
      if (!product) return res.status(404).json({ status: 'error', message: '找不到商品' });

      const productType: 1 | 2 = type === 'instrument' ? 1 : 2;
      const data = await recService.getSimilar(product.id, productType, limit ?? 5);
      return res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/recommendation/personalized?limit=6  (requires auth)
  router.get('/personalized', optionalAuth, async (req, res, next) => {
    if (!req.decoded) {
      return res.status(401).json({ status: 'error', message: '請先登入', code: 'NO_TOKEN' });
    }
    const parsed = LimitSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ status: 'error', message: '無效參數' });
    try {
      const data = await recService.getPersonalized(req.decoded.id, parsed.data.limit ?? 6);
      return res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/recommendation/view  { puid }  (optional auth)
  router.post('/view', optionalAuth, async (req, res, next) => {
    const parsed = TrackViewSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ status: 'error', message: '無效參數' });
    try {
      const product = await resolvePuid(parsed.data.puid);
      if (!product) return res.status(404).json({ status: 'error', message: '找不到商品' });

      await recService.trackView(product.id, req.decoded?.id ?? null);
      return res.json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
