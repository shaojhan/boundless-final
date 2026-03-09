import express from 'express';
import { rename } from 'fs/promises';
import { dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import type { ArticleService } from '../../service/article/ArticleService.js';
import {
  CreateArticleSchema,
  UpdateArticleSchema,
  AuidParamSchema,
} from '../schemas/articleSchema.js';

const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));
// public/ is two levels up from src/interfaces/routers/
const publicDir = resolve(__dirname, '..', '..', 'public');
const upload = multer({ dest: publicDir });

export function createArticleRouter(articleService: ArticleService) {
  const router = express.Router();

  // GET /api/article — all articles (useNickname=true)
  router.get('/', async (_req, res, next) => {
    try {
      const data = await articleService.getArticles({ useNickname: true });
      return res.status(200).json(data.length ? data : '沒有找到相應的資訊');
    } catch (err) {
      next(err);
    }
  });

  // GET /api/article/comments — category 1, useNickname=false
  router.get('/comments', async (_req, res, next) => {
    try {
      const data = await articleService.getArticles({
        categoryId: 1,
        useNickname: false,
      });
      return res.status(200).json(data.length ? data : '沒有找到相應的資訊');
    } catch (err) {
      next(err);
    }
  });

  // GET /api/article/sharing — category 2, useNickname=false
  router.get('/sharing', async (_req, res, next) => {
    try {
      const data = await articleService.getArticles({
        categoryId: 2,
        useNickname: false,
      });
      return res.status(200).json(data.length ? data : '沒有找到相應的資訊');
    } catch (err) {
      next(err);
    }
  });

  // POST /api/article/upload — create article with image
  router.post('/upload', upload.single('myFile'), async (req, res, next) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ status: 'error', message: '缺少上傳檔案' });
    }

    const parsed = CreateArticleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }

    const newCover = Date.now() + extname(file.originalname);
    await rename(file.path, resolve(publicDir, 'article', newCover)).catch(
      (err) => console.error('更名失敗', err)
    );

    try {
      const auid = await articleService.createArticle({
        ...parsed.data,
        img: newCover,
      });
      return res.status(200).json({ status: 'success', auid });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/article/edit/:auid — update content
  router.put('/edit/:auid', upload.none(), async (req, res, next) => {
    const paramParsed = AuidParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的 auid' });
    }
    const bodyParsed = UpdateArticleSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: bodyParsed.error.issues[0].message });
    }
    try {
      await articleService.updateArticleContent(
        paramParsed.data.auid,
        bodyParsed.data.content
      );
      return res
        .status(200)
        .json({ status: 'success', auid: paramParsed.data.auid });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/article/:auid — article detail (must come after static routes)
  router.get('/:auid', async (req, res, next) => {
    const parsed = AuidParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的 auid' });
    }
    try {
      const data = await articleService.getArticleDetail(parsed.data.auid);
      if (!data) {
        return res.status(400).send('發生錯誤');
      }
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
