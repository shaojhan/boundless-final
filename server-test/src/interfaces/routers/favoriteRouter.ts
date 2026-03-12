import express from 'express';
import { z } from 'zod';
import { checkToken } from '#middleware/checkToken.js';
import type { FavoriteService } from '#service/catalog/FavoriteService.js';

const PidParamSchema = z.object({
  pid: z.coerce.number().int().positive(),
});

export function createFavoriteRouter(favoriteService: FavoriteService) {
  const router = express.Router();

  // GET /api/favorite — get current user's favorites
  router.get('/', checkToken, async (req, res, next) => {
    try {
      const userId = req.decoded.id;
      const items = await favoriteService.getUserFavorites(userId);
      return res.status(200).json(items);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/favorite/status/:pid — check if a product is favorited
  router.get('/status/:pid', checkToken, async (req, res, next) => {
    const parsed = PidParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的商品 ID' });
    }
    try {
      const userId = req.decoded.id;
      const isFavorited = await favoriteService.getStatus(userId, parsed.data.pid);
      return res.status(200).json({ isFavorited });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/favorite/:pid — add to favorites
  router.post('/:pid', checkToken, async (req, res, next) => {
    const parsed = PidParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的商品 ID' });
    }
    try {
      const userId = req.decoded.id;
      await favoriteService.add(userId, parsed.data.pid);
      return res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/favorite/:pid — remove from favorites
  router.delete('/:pid', checkToken, async (req, res, next) => {
    const parsed = PidParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的商品 ID' });
    }
    try {
      const userId = req.decoded.id;
      await favoriteService.remove(userId, parsed.data.pid);
      return res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
