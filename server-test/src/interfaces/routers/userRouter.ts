import express from 'express';
import multer from 'multer';
import { dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { checkToken } from '../../../middleware/checkToken.js';
import { UpdateProfileSchema } from '../schemas/userSchema.js';
import type { UserService } from '../../service/user/UserService.js';
import type { ArticleService } from '../../service/article/ArticleService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── multer avatar storage ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, resolve(__dirname, '../../../../public/user'));
  },
  filename(req, file, cb) {
    const ts = (req as express.Request & { timestamp?: number }).timestamp ?? Date.now();
    cb(null, 'avatar_user00' + ts + extname(file.originalname));
  },
});
const uploadAvatar = multer({ storage });

const setTimestamp: express.RequestHandler = (req, _res, next) => {
  (req as express.Request & { timestamp?: number }).timestamp = Date.now();
  next();
};

// ── Factory ──────────────────────────────────────────────────────────────────

export function createUserRouter(
  userService: UserService,
  articleService: ArticleService
) {
  const router = express.Router();

  // ── POST /api/user/upload1 ─ avatar upload ──────────────────────────────
  router.post(
    '/upload1',
    setTimestamp,
    checkToken,
    uploadAvatar.single('myFile'),
    async (req, res) => {
      const id = parseInt(req.body.name as string);
      if (req.decoded.id !== id) {
        return res.status(403).json({ status: 'error', message: '無權限修改此頭像' });
      }
      const ts = (req as express.Request & { timestamp?: number }).timestamp ?? Date.now();
      const newName = 'avatar_user00' + ts + '.jpg';
      await userService.updateAvatar(id, newName);
      res.redirect('http://localhost:3000/user/user-info-edit');
    }
  );

  // ── GET /api/user/user-homepage/:uid ─ public profile ──────────────────
  router.get('/user-homepage/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
      const data = await userService.getPublicHomepage(uid);
      if (!data) return res.json('沒有找到相應的資訊');
      return res.json(data);
    } catch (err) {
      console.error(err);
      return res.json('發生錯誤');
    }
  });

  // ── GET /api/user/homepageArticle/:uid ─ articles by uid (public) ──────
  router.get('/homepageArticle/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
      const userProfile = await userService.getProfileByUid(uid);
      if (!userProfile) return res.json('沒有找到相應的資訊');
      const articles = await articleService.getArticles({ userId: userProfile.id, useNickname: true });
      return res.json(articles.length ? articles : '沒有找到相應的資訊');
    } catch (err) {
      console.error(err);
      return res.json('發生錯誤' + err);
    }
  });

  // ── GET /api/user/MyArticle/:id ─ my articles (protected) ──────────────
  router.get('/MyArticle/:id', checkToken, async (req, res) => {
    const id = parseInt(req.params.id as string);
    if (req.decoded.id !== id) {
      return res.status(403).json({ status: 'error', message: '無權限存取此資料' });
    }
    try {
      const articles = await articleService.getArticles({ userId: id, useNickname: true });
      return res.json(articles.length ? articles : '沒有找到相應的資訊');
    } catch (err) {
      console.error(err);
      return res.json('發生錯誤' + err);
    }
  });

  // ── GET /api/user/profile/:id ─ private profile (no jam state) ─────────
  router.get('/profile/:id', checkToken, async (req, res) => {
    const id = parseInt(req.params.id as string);
    if (req.decoded.id !== id) {
      return res.status(403).json({ status: 'error', message: '無權限存取此資料' });
    }
    const profile = await userService.getProfile(id);
    return res.json(profile);
  });

  // ── POST /api/user/editProfile/:id ─ update profile (protected) ─────────
  router.post('/editProfile/:id', checkToken, async (req, res) => {
    const id = parseInt(req.params.id as string);
    if (req.decoded.id !== id) {
      return res.status(403).json({ status: 'error', message: '無權限修改此資料' });
    }
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues[0].message });
    }
    const { genre_like, play_instrument, ...rest } = parsed.data;
    const result = await userService.updateProfile(id, {
      ...rest,
      genreLike: genre_like,
      playInstrument: play_instrument,
    });
    return res.json({ status: 'success', data: { result } });
  });

  // ── POST /api/user/order/:id ─ get user orders (protected) ─────────────
  router.post('/order/:id', checkToken, async (req, res) => {
    const id = parseInt(req.params.id as string);
    if (req.decoded.id !== id) {
      return res.status(403).json({ status: 'error', message: '無權限存取此訂單' });
    }
    const userProfile = await userService.getProfile(id);
    if (!userProfile) {
      return res.status(404).json({ status: 'error', message: '使用者不存在' });
    }
    const productResult = await userService.getOrders(userProfile.uid);
    return res.json({ status: 'success', data: { productResult } });
  });

  // ── GET /api/user/:id ─ private profile with jam state ──────────────────
  // Must be LAST to avoid shadowing other routes
  router.get('/:id', checkToken, async (req, res) => {
    const id = parseInt(req.params.id as string);
    if (req.decoded.id !== id) {
      return res.status(403).json({ status: 'error', message: '無權限存取此資料' });
    }
    const data = await userService.getUserWithJam(id);
    return res.json(data);
  });

  return router;
}
