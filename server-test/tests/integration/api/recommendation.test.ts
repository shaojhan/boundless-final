/**
 * Integration tests — Recommendation HTTP layer
 *
 * 測試範圍：createRecommendationRouter 所有端點的 routing、schema 驗證及回應格式。
 * RecommendationService 以 vi.fn() mock；PrismaClient.product.findFirst 也被 mock。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createRecommendationRouter } from '#interfaces/routers/recommendationRouter.js';
import type { RecommendationService } from '#service/recommendation/RecommendationService.js';
import type { RecommendedProduct, PersonalizedResult } from '#domain/recommendation/Recommendation.js';

// ── Mock service factory ────────────────────────────────────────────────────

function makeService(): RecommendationService {
  return {
    getPopularInstruments: vi.fn(),
    getPopularLessons: vi.fn(),
    getCoPurchased: vi.fn(),
    getSimilar: vi.fn(),
    getPersonalized: vi.fn(),
    trackView: vi.fn(),
  } as unknown as RecommendationService;
}

// ── Mock Prisma factory ─────────────────────────────────────────────────────

function makePrisma(product: { id: number } | null = { id: 1 }) {
  return {
    product: { findFirst: vi.fn().mockResolvedValue(product) },
  } as any;
}

// ── JWT helper ──────────────────────────────────────────────────────────────

const SECRET = 'test-access-secret-for-vitest';

function makeToken(payload: object = { id: 42, uid: 'u-test', name: 'Test', email: 'test@test.com' }) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

// ── Fixtures ────────────────────────────────────────────────────────────────

const mockProduct: RecommendedProduct = {
  id: 1,
  puid: 'p-001',
  name: '吉他入門',
  img: null,
  img_small: null,
  price: 5000,
  discount: null,
  discount_state: null,
  type: 1,
  sales: 10,
  category_name: '吉他',
  score: 4.2,
};

const mockLesson: RecommendedProduct = {
  ...mockProduct,
  id: 2,
  puid: 'l-001',
  name: '吉他課程',
  type: 2,
};

const mockPersonalized: PersonalizedResult = {
  instruments: [mockProduct],
  lessons: [mockLesson],
};

// ── App builder ──────────────────────────────────────────────────────────────

function buildApp(service: RecommendationService, prisma = makePrisma()) {
  const app = express();
  app.use(express.json());
  app.use('/api/recommendation', createRecommendationRouter(service, prisma));
  return app;
}

// ── GET /api/recommendation/popular/instruments ──────────────────────────────

describe('GET /api/recommendation/popular/instruments', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('回傳 200 與商品清單', async () => {
    vi.mocked(service.getPopularInstruments).mockResolvedValue([mockProduct]);

    const res = await request(buildApp(service)).get('/api/recommendation/popular/instruments');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveLength(1);
    expect(service.getPopularInstruments).toHaveBeenCalledWith(4);
  });

  it('自訂 limit=3 → 以 3 呼叫 service', async () => {
    vi.mocked(service.getPopularInstruments).mockResolvedValue([]);

    const res = await request(buildApp(service)).get('/api/recommendation/popular/instruments?limit=3');

    expect(res.status).toBe(200);
    expect(service.getPopularInstruments).toHaveBeenCalledWith(3);
  });

  it('limit=0 → 400', async () => {
    const res = await request(buildApp(service)).get('/api/recommendation/popular/instruments?limit=0');

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(service.getPopularInstruments).not.toHaveBeenCalled();
  });

  it('limit=21（超過上限）→ 400', async () => {
    const res = await request(buildApp(service)).get('/api/recommendation/popular/instruments?limit=21');

    expect(res.status).toBe(400);
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.getPopularInstruments).mockRejectedValue(new Error('DB error'));

    const res = await request(buildApp(service)).get('/api/recommendation/popular/instruments');

    expect(res.status).toBe(500);
  });
});

// ── GET /api/recommendation/popular/lessons ──────────────────────────────────

describe('GET /api/recommendation/popular/lessons', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('回傳 200 與課程清單', async () => {
    vi.mocked(service.getPopularLessons).mockResolvedValue([mockLesson]);

    const res = await request(buildApp(service)).get('/api/recommendation/popular/lessons');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data[0].type).toBe(2);
    expect(service.getPopularLessons).toHaveBeenCalledWith(4);
  });

  it('自訂 limit=2', async () => {
    vi.mocked(service.getPopularLessons).mockResolvedValue([]);

    const res = await request(buildApp(service)).get('/api/recommendation/popular/lessons?limit=2');

    expect(res.status).toBe(200);
    expect(service.getPopularLessons).toHaveBeenCalledWith(2);
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.getPopularLessons).mockRejectedValue(new Error('error'));

    const res = await request(buildApp(service)).get('/api/recommendation/popular/lessons');

    expect(res.status).toBe(500);
  });
});

// ── GET /api/recommendation/copurchase/:puid ─────────────────────────────────

describe('GET /api/recommendation/copurchase/:puid', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('type=instrument → getCoPurchased(1, 1, 5)', async () => {
    vi.mocked(service.getCoPurchased).mockResolvedValue([mockProduct]);

    const res = await request(buildApp(service))
      .get('/api/recommendation/copurchase/p-001?type=instrument');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.getCoPurchased).toHaveBeenCalledWith(1, 1, 5);
  });

  it('type=lesson → getCoPurchased(1, 2, 5)', async () => {
    vi.mocked(service.getCoPurchased).mockResolvedValue([mockLesson]);

    const res = await request(buildApp(service))
      .get('/api/recommendation/copurchase/p-001?type=lesson');

    expect(res.status).toBe(200);
    expect(service.getCoPurchased).toHaveBeenCalledWith(1, 2, 5);
  });

  it('自訂 limit=3 → getCoPurchased(1, 1, 3)', async () => {
    vi.mocked(service.getCoPurchased).mockResolvedValue([]);

    const res = await request(buildApp(service))
      .get('/api/recommendation/copurchase/p-001?type=instrument&limit=3');

    expect(res.status).toBe(200);
    expect(service.getCoPurchased).toHaveBeenCalledWith(1, 1, 3);
  });

  it('puid 找不到商品 → 404', async () => {
    const prisma = makePrisma(null);

    const res = await request(buildApp(service, prisma))
      .get('/api/recommendation/copurchase/no-such?type=instrument');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(service.getCoPurchased).not.toHaveBeenCalled();
  });

  it('缺少 type → 400', async () => {
    const res = await request(buildApp(service)).get('/api/recommendation/copurchase/p-001');

    expect(res.status).toBe(400);
    expect(service.getCoPurchased).not.toHaveBeenCalled();
  });

  it('type 為無效值 → 400', async () => {
    const res = await request(buildApp(service))
      .get('/api/recommendation/copurchase/p-001?type=unknown');

    expect(res.status).toBe(400);
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.getCoPurchased).mockRejectedValue(new Error('error'));

    const res = await request(buildApp(service))
      .get('/api/recommendation/copurchase/p-001?type=instrument');

    expect(res.status).toBe(500);
  });
});

// ── GET /api/recommendation/similar/:puid ───────────────────────────────────

describe('GET /api/recommendation/similar/:puid', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('type=instrument → getSimilar(1, 1, 5)', async () => {
    vi.mocked(service.getSimilar).mockResolvedValue([mockProduct]);

    const res = await request(buildApp(service))
      .get('/api/recommendation/similar/p-001?type=instrument');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.getSimilar).toHaveBeenCalledWith(1, 1, 5);
  });

  it('type=lesson → getSimilar(1, 2, 5)', async () => {
    vi.mocked(service.getSimilar).mockResolvedValue([mockLesson]);

    const res = await request(buildApp(service))
      .get('/api/recommendation/similar/p-001?type=lesson');

    expect(res.status).toBe(200);
    expect(service.getSimilar).toHaveBeenCalledWith(1, 2, 5);
  });

  it('puid 找不到商品 → 404', async () => {
    const prisma = makePrisma(null);

    const res = await request(buildApp(service, prisma))
      .get('/api/recommendation/similar/no-such?type=instrument');

    expect(res.status).toBe(404);
    expect(service.getSimilar).not.toHaveBeenCalled();
  });

  it('缺少 type → 400', async () => {
    const res = await request(buildApp(service)).get('/api/recommendation/similar/p-001');

    expect(res.status).toBe(400);
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.getSimilar).mockRejectedValue(new Error('error'));

    const res = await request(buildApp(service))
      .get('/api/recommendation/similar/p-001?type=instrument');

    expect(res.status).toBe(500);
  });
});

// ── GET /api/recommendation/personalized ────────────────────────────────────

describe('GET /api/recommendation/personalized', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('無 Authorization header → 401', async () => {
    const res = await request(buildApp(service)).get('/api/recommendation/personalized');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
    expect(service.getPersonalized).not.toHaveBeenCalled();
  });

  it('無效 token → 401', async () => {
    const res = await request(buildApp(service))
      .get('/api/recommendation/personalized')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
    expect(service.getPersonalized).not.toHaveBeenCalled();
  });

  it('有效 token → 200 + data（呼叫 getPersonalized(userId, 6)）', async () => {
    vi.mocked(service.getPersonalized).mockResolvedValue(mockPersonalized);

    const res = await request(buildApp(service))
      .get('/api/recommendation/personalized')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.getPersonalized).toHaveBeenCalledWith(42, 6);
  });

  it('自訂 limit=8', async () => {
    vi.mocked(service.getPersonalized).mockResolvedValue({ instruments: [], lessons: [] });

    const res = await request(buildApp(service))
      .get('/api/recommendation/personalized?limit=8')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(service.getPersonalized).toHaveBeenCalledWith(42, 8);
  });

  it('limit=0 → 400', async () => {
    const res = await request(buildApp(service))
      .get('/api/recommendation/personalized?limit=0')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.getPersonalized).mockRejectedValue(new Error('error'));

    const res = await request(buildApp(service))
      .get('/api/recommendation/personalized')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(500);
  });
});

// ── POST /api/recommendation/view ────────────────────────────────────────────

describe('POST /api/recommendation/view', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('訪客（無 token）→ trackView(productId, null)', async () => {
    vi.mocked(service.trackView).mockResolvedValue();

    const res = await request(buildApp(service))
      .post('/api/recommendation/view')
      .send({ puid: 'p-001' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.trackView).toHaveBeenCalledWith(1, null);
  });

  it('登入使用者 → trackView(productId, userId)', async () => {
    vi.mocked(service.trackView).mockResolvedValue();

    const res = await request(buildApp(service))
      .post('/api/recommendation/view')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ puid: 'p-001' });

    expect(res.status).toBe(200);
    expect(service.trackView).toHaveBeenCalledWith(1, 42);
  });

  it('puid 找不到商品 → 404', async () => {
    const prisma = makePrisma(null);

    const res = await request(buildApp(service, prisma))
      .post('/api/recommendation/view')
      .send({ puid: 'no-such' });

    expect(res.status).toBe(404);
    expect(service.trackView).not.toHaveBeenCalled();
  });

  it('缺少 puid → 400', async () => {
    const res = await request(buildApp(service))
      .post('/api/recommendation/view')
      .send({});

    expect(res.status).toBe(400);
    expect(service.trackView).not.toHaveBeenCalled();
  });

  it('puid 空字串 → 400（min(1) 驗證失敗）', async () => {
    const res = await request(buildApp(service))
      .post('/api/recommendation/view')
      .send({ puid: '' });

    expect(res.status).toBe(400);
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.trackView).mockRejectedValue(new Error('記錄失敗'));

    const res = await request(buildApp(service))
      .post('/api/recommendation/view')
      .send({ puid: 'p-001' });

    expect(res.status).toBe(500);
  });
});
