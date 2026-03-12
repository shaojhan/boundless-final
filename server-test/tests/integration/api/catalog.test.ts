/**
 * Integration tests — Catalog Index HTTP layer
 *
 * 測試範圍：createCatalogIndexRouter 的首頁端點。
 * LessonService 以 vi.fn() mock。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createCatalogIndexRouter } from '#interfaces/routers/catalogIndexRouter.js';
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

// ── App builder ───────────────────────────────────────────────────────────────

function buildApp(service: LessonService) {
  const app = express();
  app.use(express.json());
  app.use('/api', createCatalogIndexRouter(service));
  return app;
}

// ── GET /api/ ─────────────────────────────────────────────────────────────────

describe('GET /api/ (catalogIndexRouter)', () => {
  let service: LessonService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有資料 → 200 + { status: success, data }', async () => {
    vi.mocked(service.getHomepageLessons).mockResolvedValue([mockLesson] as any);

    const res = await request(buildApp(service)).get('/api/');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].name).toBe('吉他入門');
  });

  it('無資料 → 200 + { status: success, data: [] }', async () => {
    vi.mocked(service.getHomepageLessons).mockResolvedValue([]);

    const res = await request(buildApp(service)).get('/api/');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual([]);
  });

  it('service 拋出例外 → next(err)', async () => {
    vi.mocked(service.getHomepageLessons).mockRejectedValue(new Error('DB error'));

    const res = await request(buildApp(service)).get('/api/');

    expect(res.status).toBe(500);
  });
});
