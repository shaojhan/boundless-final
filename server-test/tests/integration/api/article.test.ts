/**
 * Integration tests — Article HTTP layer
 *
 * 測試範圍：createArticleRouter 的路由、schema 驗證及回應格式。
 * ArticleService 以 vi.fn() mock。
 * POST /upload（multer 檔案上傳）屬 E2E 範疇，此處略過。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createArticleRouter } from '#interfaces/routers/articleRouter.js';
import type { ArticleService } from '#service/article/ArticleService.js';
import type { ArticleListItem, ArticleDetailRow } from '#domain/article/Article.js';

// ── Mock service factory ──────────────────────────────────────────────────────

function makeService(): ArticleService {
  return {
    getArticles: vi.fn(),
    getArticleDetail: vi.fn(),
    createArticle: vi.fn(),
    updateArticleContent: vi.fn(),
  } as unknown as ArticleService;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const articleItem: ArticleListItem = {
  auid: 'a-001',
  title: '測試文章標題',
  content: '文章內容',
  img: 'cover.jpg',
  category_id: 1,
  user_id: 1,
  nickname: '作者',
  created_time: new Date('2025-01-01'),
  updated_time: new Date('2025-01-01'),
} as ArticleListItem;

const articleDetail: ArticleDetailRow = {
  auid: 'a-001',
  title: '測試文章標題',
  content: '文章內容',
  img: 'cover.jpg',
  category_id: 1,
  user_id: 1,
  created_time: new Date('2025-01-01'),
  updated_time: new Date('2025-01-01'),
} as ArticleDetailRow;

// ── App builder ───────────────────────────────────────────────────────────────

function buildApp(service: ArticleService) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/article', createArticleRouter(service));
  // 基本 error handler（捕捉 next(err)）
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ status: 'error', message: err.message });
  });
  return app;
}

// ── GET /api/article ──────────────────────────────────────────────────────────

describe('GET /api/article', () => {
  let service: ArticleService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有文章 → 200 + 陣列', async () => {
    vi.mocked(service.getArticles).mockResolvedValue([articleItem]);

    const res = await request(buildApp(service)).get('/api/article');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].auid).toBe('a-001');
    expect(service.getArticles).toHaveBeenCalledWith({ useNickname: true });
  });

  it('無文章 → 200 + 文字訊息', async () => {
    vi.mocked(service.getArticles).mockResolvedValue([]);

    const res = await request(buildApp(service)).get('/api/article');

    expect(res.status).toBe(200);
    expect(res.text).toContain('沒有找到相應的資訊');
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.getArticles).mockRejectedValue(new Error('DB error'));

    const res = await request(buildApp(service)).get('/api/article');

    expect(res.status).toBe(500);
  });
});

// ── GET /api/article/comments ─────────────────────────────────────────────────

describe('GET /api/article/comments', () => {
  let service: ArticleService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有文章 → 200，useNickname=false + categoryId=1', async () => {
    vi.mocked(service.getArticles).mockResolvedValue([articleItem]);

    const res = await request(buildApp(service)).get('/api/article/comments');

    expect(res.status).toBe(200);
    expect(service.getArticles).toHaveBeenCalledWith({ categoryId: 1, useNickname: false });
  });

  it('無文章 → 200 + 文字訊息', async () => {
    vi.mocked(service.getArticles).mockResolvedValue([]);

    const res = await request(buildApp(service)).get('/api/article/comments');

    expect(res.status).toBe(200);
    expect(res.text).toContain('沒有找到相應的資訊');
  });
});

// ── GET /api/article/sharing ──────────────────────────────────────────────────

describe('GET /api/article/sharing', () => {
  let service: ArticleService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有文章 → 200，categoryId=2', async () => {
    vi.mocked(service.getArticles).mockResolvedValue([articleItem]);

    const res = await request(buildApp(service)).get('/api/article/sharing');

    expect(res.status).toBe(200);
    expect(service.getArticles).toHaveBeenCalledWith({ categoryId: 2, useNickname: false });
  });
});

// ── GET /api/article/:auid ────────────────────────────────────────────────────

describe('GET /api/article/:auid', () => {
  let service: ArticleService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有效 auid + 找到文章 → 200 + 詳情', async () => {
    vi.mocked(service.getArticleDetail).mockResolvedValue([articleDetail]);

    const res = await request(buildApp(service)).get('/api/article/a-001');

    expect(res.status).toBe(200);
    expect(res.body[0].auid).toBe('a-001');
    expect(service.getArticleDetail).toHaveBeenCalledWith('a-001');
  });

  it('auid 找不到（回傳 null） → 400', async () => {
    vi.mocked(service.getArticleDetail).mockResolvedValue(null);

    const res = await request(buildApp(service)).get('/api/article/not-exist');

    expect(res.status).toBe(400);
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.getArticleDetail).mockRejectedValue(new Error('DB error'));

    const res = await request(buildApp(service)).get('/api/article/a-001');

    expect(res.status).toBe(500);
  });
});

// ── PUT /api/article/edit/:auid ───────────────────────────────────────────────

describe('PUT /api/article/edit/:auid', () => {
  let service: ArticleService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有效 auid + content → 200 + success', async () => {
    vi.mocked(service.updateArticleContent).mockResolvedValue();

    const res = await request(buildApp(service))
      .put('/api/article/edit/a-001')
      .send({ content: '<p>更新後的內容</p>' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.auid).toBe('a-001');
    expect(service.updateArticleContent).toHaveBeenCalledWith('a-001', '<p>更新後的內容</p>');
  });

  it('content 為空字串 → 400（schema min(1)）', async () => {
    const res = await request(buildApp(service))
      .put('/api/article/edit/a-001')
      .send({ content: '' });

    expect(res.status).toBe(400);
    expect(service.updateArticleContent).not.toHaveBeenCalled();
  });

  it('body 缺少 content → 400', async () => {
    const res = await request(buildApp(service))
      .put('/api/article/edit/a-001')
      .send({});

    expect(res.status).toBe(400);
    expect(service.updateArticleContent).not.toHaveBeenCalled();
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.updateArticleContent).mockRejectedValue(new Error('DB error'));

    const res = await request(buildApp(service))
      .put('/api/article/edit/a-001')
      .send({ content: '內容' });

    expect(res.status).toBe(500);
  });
});
