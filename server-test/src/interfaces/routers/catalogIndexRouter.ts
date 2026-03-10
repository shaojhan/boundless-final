import express from 'express';
import type { LessonService } from '#service/catalog/LessonService.js';

export function createCatalogIndexRouter(lessonService: LessonService) {
  const router = express.Router();

  // GET / — homepage lesson data (top 4 by sales)
  router.get('/', async (_req, res, next) => {
    try {
      const data = await lessonService.getHomepageLessons();
      if (data.length > 0) {
        return res.json({ status: 'success', data });
      }
      return res.json({ status: 'success', data: [] });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
