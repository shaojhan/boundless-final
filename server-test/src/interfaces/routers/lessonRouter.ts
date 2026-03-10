import express from 'express';
import type { LessonService } from '#service/catalog/LessonService.js';
import { LessonQuerySchema, CategoryParamSchema } from '#interfaces/schemas/catalogSchema.js';

export function createLessonRouter(lessonService: LessonService) {
  const router = express.Router();

  // GET /api/lesson
  router.get('/', async (req, res, next) => {
    const parsed = LessonQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues[0].message });
    }
    try {
      const items = await lessonService.getProducts(parsed.data);
      if (items.length === 0) {
        return res.status(404).json({ message: '沒有找到相應的資訊' });
      }
      return res.status(200).json(items);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/lesson/categories
  router.get('/categories', async (_req, res, next) => {
    try {
      const categories = await lessonService.getCategories();
      return res.status(200).json(categories);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/lesson/category/:category
  router.get('/category/:category', async (req, res, next) => {
    const parsed = CategoryParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的分類' });
    }
    const { category } = parsed.data;
    const categoryId = category === '' || category === '0' ? null : Number(category);
    try {
      const items = await lessonService.getProductsByCategory(categoryId);
      if (items.length === 0) {
        return res.status(404).json({ message: '沒有找到相應的資訊' });
      }
      return res.status(200).json(items);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/lesson/:id
  router.get('/:id', async (req, res, next) => {
    const puid = req.params.id;
    try {
      const detail = await lessonService.getProductDetail(puid);
      if (!detail) {
        return res.status(404).send('沒有找到相應的資訊');
      }
      return res.status(200).json(detail);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
