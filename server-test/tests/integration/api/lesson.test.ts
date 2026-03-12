/**
 * Integration tests — Lesson HTTP layer
 *
 * 測試範圍：createLessonRouter 所有端點的 routing、schema 驗證及回應格式。
 * LessonService 以 vi.fn() mock。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createLessonRouter } from '#interfaces/routers/lessonRouter.js';
import type { LessonService } from '#service/catalog/LessonService.js';

// ── Mock service factory ───────────────────────────────────────────────────────

function makeService(): LessonService {
  return {
    getProducts: vi.fn(),
    getCategories: vi.fn(),
    getProductsByCategory: vi.fn(),
    getProductDetail: vi.fn(),
    getHomepageLessons: vi.fn(),
  } as unknown as LessonService;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockLesson = { id: 1, name: '吉他入門', category_id: 2, price: 1000 };
const mockCategory = { id: 2, name: '弦樂器' };

// ── App builder ───────────────────────────────────────────────────────────────

function buildApp(service: LessonService) {
  const app = express();
  app.use(express.json());
  app.use('/api/lesson', createLessonRouter(service));
  return app;
}

// ── GET /api/lesson ───────────────────────────────────────────────────────────

describe('GET /api/lesson', () => {
  let service: LessonService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有資料 → 200 + 陣列', async () => {
    vi.mocked(service.getProducts).mockResolvedValue([mockLesson] as any);

    const res = await request(buildApp(service)).get('/api/lesson');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('吉他入門');
  });

  it('無資料 → 404', async () => {
    vi.mocked(service.getProducts).mockResolvedValue([]);

    const res = await request(buildApp(service)).get('/api/lesson');

    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });

  it('帶 priceLow/priceHigh query → service 被正確呼叫', async () => {
    vi.mocked(service.getProducts).mockResolvedValue([mockLesson] as any);

    await request(buildApp(service)).get('/api/lesson?priceLow=500&priceHigh=2000');

    expect(service.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ priceLow: 500, priceHigh: 2000 }),
    );
  });
});

// ── GET /api/lesson/categories ────────────────────────────────────────────────

describe('GET /api/lesson/categories', () => {
  let service: LessonService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有分類 → 200 + 陣列', async () => {
    vi.mocked(service.getCategories).mockResolvedValue([mockCategory] as any);

    const res = await request(buildApp(service)).get('/api/lesson/categories');

    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('弦樂器');
  });

  it('service 拋出例外 → next(err) 傳遞', async () => {
    vi.mocked(service.getCategories).mockRejectedValue(new Error('DB error'));

    // Without error handler, Express will return 500
    const res = await request(buildApp(service)).get('/api/lesson/categories');

    expect(res.status).toBe(500);
  });
});

// ── GET /api/lesson/category/:category ───────────────────────────────────────

describe('GET /api/lesson/category/:category', () => {
  let service: LessonService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有效 category id → 200 + 陣列', async () => {
    vi.mocked(service.getProductsByCategory).mockResolvedValue([mockLesson] as any);

    const res = await request(buildApp(service)).get('/api/lesson/category/2');

    expect(res.status).toBe(200);
    expect(service.getProductsByCategory).toHaveBeenCalledWith(2);
  });

  it('category=0 → categoryId=null', async () => {
    vi.mocked(service.getProductsByCategory).mockResolvedValue([mockLesson] as any);

    await request(buildApp(service)).get('/api/lesson/category/0');

    expect(service.getProductsByCategory).toHaveBeenCalledWith(null);
  });

  it('無資料 → 404', async () => {
    vi.mocked(service.getProductsByCategory).mockResolvedValue([]);

    const res = await request(buildApp(service)).get('/api/lesson/category/99');

    expect(res.status).toBe(404);
  });
});

// ── GET /api/lesson/:id ───────────────────────────────────────────────────────

describe('GET /api/lesson/:id', () => {
  let service: LessonService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('找到 → 200 + detail', async () => {
    vi.mocked(service.getProductDetail).mockResolvedValue(mockLesson as any);

    const res = await request(buildApp(service)).get('/api/lesson/lesson-abc');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('吉他入門');
    expect(service.getProductDetail).toHaveBeenCalledWith('lesson-abc');
  });

  it('找不到 → 404', async () => {
    vi.mocked(service.getProductDetail).mockResolvedValue(null);

    const res = await request(buildApp(service)).get('/api/lesson/no-such-id');

    expect(res.status).toBe(404);
  });

  it('service 拋出例外 → next(err)', async () => {
    vi.mocked(service.getProductDetail).mockRejectedValue(new Error('DB error'));

    const res = await request(buildApp(service)).get('/api/lesson/err-id');

    expect(res.status).toBe(500);
  });
});
