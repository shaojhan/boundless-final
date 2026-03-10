import express from 'express';
import type { InstrumentService } from '#service/catalog/InstrumentService.js';
import { InstrumentQuerySchema, CategoryParamSchema } from '#interfaces/schemas/catalogSchema.js';

export function createInstrumentRouter(instrumentService: InstrumentService) {
  const router = express.Router();

  // GET /api/instrument
  router.get('/', async (req, res, next) => {
    const parsed = InstrumentQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues[0].message });
    }
    try {
      const result = await instrumentService.getProducts(parsed.data);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/instrument/categories
  router.get('/categories', async (_req, res, next) => {
    try {
      const categories = await instrumentService.getCategories();
      return res.status(200).json(categories);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/instrument/category/:category
  router.get('/category/:category', async (req, res, next) => {
    const parsed = CategoryParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的分類' });
    }
    const { category } = parsed.data;
    const categoryId = category === '' || category === '0' ? null : Number(category);
    try {
      const items = await instrumentService.getProductsByCategory(categoryId);
      if (items.length === 0) {
        return res.status(404).json({ message: '沒有找到相應的資訊' });
      }
      return res.status(200).json(items);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/instrument/:id
  router.get('/:id', async (req, res, next) => {
    const puid = req.params.id;
    try {
      const detail = await instrumentService.getProductDetail(puid);
      if (!detail) {
        return res.status(400).send('發生錯誤');
      }
      return res.status(200).json(detail);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
