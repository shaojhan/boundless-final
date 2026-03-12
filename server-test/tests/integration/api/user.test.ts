/**
 * Integration tests — User HTTP layer
 *
 * 測試範圍：createUserRouter 所有端點的 routing、JWT 驗證、schema 驗證及回應格式。
 * UserService / ArticleService 以 vi.fn() mock。
 * multer avatar upload 也被 mock（避免真正寫檔）。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createUserRouter } from '#interfaces/routers/userRouter.js';
import type { UserService } from '#service/user/UserService.js';
import type { ArticleService } from '#service/article/ArticleService.js';

// Mock multer so file upload tests don't touch the filesystem
vi.mock('multer', () => {
  const multerInstance = {
    single: () => (req: any, _res: any, next: any) => {
      // Simulate a file upload by attaching a mock file to req
      req.file = { filename: 'avatar_user001234567890.jpg', originalname: 'avatar.jpg', mimetype: 'image/jpeg' };
      next();
    },
  };
  const multerFn = Object.assign(vi.fn(() => multerInstance), {
    diskStorage: vi.fn(() => ({})),
  });
  return { default: multerFn };
});

// ── JWT helper ────────────────────────────────────────────────────────────────

const SECRET = 'test-access-secret-for-vitest';

function makeToken(payload: object = { id: 1, uid: 'u-test', name: 'Test', email: 'test@test.com' }) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

// ── Mock service factories ────────────────────────────────────────────────────

function makeUserService(): UserService {
  return {
    getProfile: vi.fn(),
    getProfileByUid: vi.fn(),
    getPublicHomepage: vi.fn(),
    getUserWithJam: vi.fn(),
    updateProfile: vi.fn(),
    updateAvatar: vi.fn(),
    getOrders: vi.fn(),
  } as unknown as UserService;
}

function makeArticleService(): ArticleService {
  return {
    getArticles: vi.fn(),
    getArticleDetail: vi.fn(),
    createArticle: vi.fn(),
    updateArticle: vi.fn(),
    deleteArticle: vi.fn(),
  } as unknown as ArticleService;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProfile = {
  id: 1, uid: 'u-test', name: 'Test', email: 'test@test.com',
  nickname: null, phone: null, birthday: null, postcode: null,
  country: null, township: null, address: null, genreLike: null,
  playInstrument: null, info: null, gender: null, privacy: null,
  googleUid: null, myJam: null, photoUrl: null, myLesson: null,
  img: null, valid: 1,
};

const mockPublicHomepage = {
  email: 'test@test.com', nickname: null, phone: null, birthday: null,
  genre_like: null, play_instrument: null, info: null, gender: null,
  privacy: null, my_jam: null, my_jamState: null, photo_url: null, img: null,
};

const mockArticles = [{ id: 1, title: '文章一', content: 'content' }];

// ── App builder ───────────────────────────────────────────────────────────────

function buildApp(userService: UserService, articleService: ArticleService) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/user', createUserRouter(userService, articleService));
  return app;
}

// ── GET /api/user/user-homepage/:uid ──────────────────────────────────────────

describe('GET /api/user/user-homepage/:uid', () => {
  let userService: UserService;
  let articleService: ArticleService;

  beforeEach(() => {
    userService = makeUserService();
    articleService = makeArticleService();
    vi.clearAllMocks();
  });

  it('找到資料 → 回傳 homepage 資料', async () => {
    vi.mocked(userService.getPublicHomepage).mockResolvedValue(mockPublicHomepage);

    const res = await request(buildApp(userService, articleService))
      .get('/api/user/user-homepage/u-test');

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@test.com');
    expect(userService.getPublicHomepage).toHaveBeenCalledWith('u-test');
  });

  it('找不到 → 回傳訊息字串', async () => {
    vi.mocked(userService.getPublicHomepage).mockResolvedValue(null);

    const res = await request(buildApp(userService, articleService))
      .get('/api/user/user-homepage/u-nobody');

    expect(res.status).toBe(200);
    expect(res.text).toContain('沒有找到');
  });
});

// ── GET /api/user/homepageArticle/:uid ────────────────────────────────────────

describe('GET /api/user/homepageArticle/:uid', () => {
  let userService: UserService;
  let articleService: ArticleService;

  beforeEach(() => {
    userService = makeUserService();
    articleService = makeArticleService();
    vi.clearAllMocks();
  });

  it('有文章 → 回傳文章陣列', async () => {
    vi.mocked(userService.getProfileByUid).mockResolvedValue(mockProfile);
    vi.mocked(articleService.getArticles).mockResolvedValue(mockArticles as any);

    const res = await request(buildApp(userService, articleService))
      .get('/api/user/homepageArticle/u-test');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('uid 不存在 → 回傳訊息字串', async () => {
    vi.mocked(userService.getProfileByUid).mockResolvedValue(null);

    const res = await request(buildApp(userService, articleService))
      .get('/api/user/homepageArticle/u-nobody');

    expect(res.status).toBe(200);
    expect(res.text).toContain('沒有找到');
  });

  it('無文章 → 回傳訊息字串', async () => {
    vi.mocked(userService.getProfileByUid).mockResolvedValue(mockProfile);
    vi.mocked(articleService.getArticles).mockResolvedValue([]);

    const res = await request(buildApp(userService, articleService))
      .get('/api/user/homepageArticle/u-test');

    expect(res.status).toBe(200);
    expect(res.text).toContain('沒有找到');
  });
});

// ── GET /api/user/MyArticle/:id ───────────────────────────────────────────────

describe('GET /api/user/MyArticle/:id', () => {
  let userService: UserService;
  let articleService: ArticleService;

  beforeEach(() => {
    userService = makeUserService();
    articleService = makeArticleService();
    vi.clearAllMocks();
  });

  it('無 token → 401', async () => {
    const res = await request(buildApp(userService, articleService))
      .get('/api/user/MyArticle/1');

    expect(res.status).toBe(401);
    expect(articleService.getArticles).not.toHaveBeenCalled();
  });

  it('token id 與路由 id 不符 → 403', async () => {
    const res = await request(buildApp(userService, articleService))
      .get('/api/user/MyArticle/99')
      .set('Authorization', `Bearer ${makeToken({ id: 1, uid: 'u-test', name: 'Test', email: 'test@test.com' })}`);

    expect(res.status).toBe(403);
  });

  it('有效 token + 有文章 → 200', async () => {
    vi.mocked(articleService.getArticles).mockResolvedValue(mockArticles as any);

    const res = await request(buildApp(userService, articleService))
      .get('/api/user/MyArticle/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('有效 token + 無文章 → 回傳訊息字串', async () => {
    vi.mocked(articleService.getArticles).mockResolvedValue([]);

    const res = await request(buildApp(userService, articleService))
      .get('/api/user/MyArticle/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain('沒有找到');
  });
});

// ── GET /api/user/profile/:id ─────────────────────────────────────────────────

describe('GET /api/user/profile/:id', () => {
  let userService: UserService;
  let articleService: ArticleService;

  beforeEach(() => {
    userService = makeUserService();
    articleService = makeArticleService();
    vi.clearAllMocks();
  });

  it('無 token → 401', async () => {
    const res = await request(buildApp(userService, articleService))
      .get('/api/user/profile/1');

    expect(res.status).toBe(401);
  });

  it('token id 不符 → 403', async () => {
    const res = await request(buildApp(userService, articleService))
      .get('/api/user/profile/99')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(403);
  });

  it('有效 token → 200 + profile', async () => {
    vi.mocked(userService.getProfile).mockResolvedValue(mockProfile);

    const res = await request(buildApp(userService, articleService))
      .get('/api/user/profile/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@test.com');
  });
});

// ── POST /api/user/editProfile/:id ───────────────────────────────────────────

describe('POST /api/user/editProfile/:id', () => {
  let userService: UserService;
  let articleService: ArticleService;

  beforeEach(() => {
    userService = makeUserService();
    articleService = makeArticleService();
    vi.clearAllMocks();
  });

  it('無 token → 401', async () => {
    const res = await request(buildApp(userService, articleService))
      .post('/api/user/editProfile/1')
      .send({ name: 'New Name' });

    expect(res.status).toBe(401);
  });

  it('token id 不符 → 403', async () => {
    const res = await request(buildApp(userService, articleService))
      .post('/api/user/editProfile/99')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'New Name' });

    expect(res.status).toBe(403);
  });

  it('有效 body → 200 + success', async () => {
    vi.mocked(userService.updateProfile).mockResolvedValue(mockProfile);

    const res = await request(buildApp(userService, articleService))
      .post('/api/user/editProfile/1')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'New Name', email: 'new@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(userService.updateProfile).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'New Name' }));
  });

  it('無效 email → 400（schema 驗證）', async () => {
    const res = await request(buildApp(userService, articleService))
      .post('/api/user/editProfile/1')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(userService.updateProfile).not.toHaveBeenCalled();
  });
});

// ── POST /api/user/order/:id ──────────────────────────────────────────────────

describe('POST /api/user/order/:id', () => {
  let userService: UserService;
  let articleService: ArticleService;

  beforeEach(() => {
    userService = makeUserService();
    articleService = makeArticleService();
    vi.clearAllMocks();
  });

  it('無 token → 401', async () => {
    const res = await request(buildApp(userService, articleService))
      .post('/api/user/order/1');

    expect(res.status).toBe(401);
  });

  it('token id 不符 → 403', async () => {
    const res = await request(buildApp(userService, articleService))
      .post('/api/user/order/99')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(403);
  });

  it('使用者不存在 → 404', async () => {
    vi.mocked(userService.getProfile).mockResolvedValue(null);

    const res = await request(buildApp(userService, articleService))
      .post('/api/user/order/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
  });

  it('有效 → 200 + productResult', async () => {
    vi.mocked(userService.getProfile).mockResolvedValue(mockProfile);
    vi.mocked(userService.getOrders).mockResolvedValue([]);

    const res = await request(buildApp(userService, articleService))
      .post('/api/user/order/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(userService.getOrders).toHaveBeenCalledWith(mockProfile.uid);
  });
});

// ── GET /api/user/:id ─────────────────────────────────────────────────────────

describe('GET /api/user/:id', () => {
  let userService: UserService;
  let articleService: ArticleService;

  beforeEach(() => {
    userService = makeUserService();
    articleService = makeArticleService();
    vi.clearAllMocks();
  });

  it('無 token → 401', async () => {
    const res = await request(buildApp(userService, articleService))
      .get('/api/user/1');

    expect(res.status).toBe(401);
  });

  it('token id 不符 → 403', async () => {
    const res = await request(buildApp(userService, articleService))
      .get('/api/user/99')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(403);
  });

  it('有效 → 200 + user with jam data', async () => {
    const mockUserWithJam = { ...mockProfile, my_jam: null, my_jamState: null, my_jamname: null };
    vi.mocked(userService.getUserWithJam).mockResolvedValue(mockUserWithJam as any);

    const res = await request(buildApp(userService, articleService))
      .get('/api/user/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(userService.getUserWithJam).toHaveBeenCalledWith(1);
  });
});
