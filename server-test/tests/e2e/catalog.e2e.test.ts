/**
 * E2E tests — Catalog (read-only)
 *
 * 測試範圍：透過真實 Express app + 真實 Prisma (DB)，驗證 Instrument 與 Lesson
 * 的讀取端點（不需要 auth、不修改資料）。
 */
import { describe, it, expect, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../src/container.js';

// mail mock（app.ts 的相依鏈中可能載入 mail config）
vi.mock('#configs/mail.js', () => ({
  default: { sendMail: vi.fn().mockResolvedValue(undefined) },
}));

afterAll(async () => {
  await prisma.$disconnect();
});

// ── GET /api/instrument ──────────────────────────────────────────────────────
describe('E2E: GET /api/instrument', () => {
  it('不帶參數 → 200 + { instrument, pageTotal, page }', async () => {
    const res = await request(app).get('/api/instrument');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.instrument)).toBe(true);
    expect(typeof res.body.pageTotal).toBe('number');
    expect(typeof res.body.page).toBe('number');
  });

  it('帶 page 參數 → 200 + 同結構', async () => {
    const res = await request(app).get('/api/instrument').query({ page: 1 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.instrument)).toBe(true);
  });

  it('page 為負數（Zod 驗證） → 400', async () => {
    const res = await request(app).get('/api/instrument').query({ page: -1 });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });
});

// ── GET /api/instrument/categories ──────────────────────────────────────────
describe('E2E: GET /api/instrument/categories', () => {
  it('回傳分類清單 → 200 + 陣列', async () => {
    const res = await request(app).get('/api/instrument/categories');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ── GET /api/instrument/category/:category ───────────────────────────────────
describe('E2E: GET /api/instrument/category/:category', () => {
  it('category=0（全部）→ 200 or 404', async () => {
    const res = await request(app).get('/api/instrument/category/0');

    expect([200, 404]).toContain(res.status);
  });

  it('數字分類 ID → 200 or 404', async () => {
    const res = await request(app).get('/api/instrument/category/1');

    expect([200, 404]).toContain(res.status);
  });

  it('非數字分類（schema 接受任意字串，DB 查無結果）→ 404', async () => {
    // CategoryParamSchema 接受 z.string()，abc! 通過後 Number('abc!') = NaN，DB 查無結果 → 404
    const res = await request(app).get('/api/instrument/category/abc!');

    expect(res.status).toBe(404);
  });
});

// ── GET /api/lesson ──────────────────────────────────────────────────────────
describe('E2E: GET /api/lesson', () => {
  it('不帶參數 → 200 or 404（資料庫現有資料）', async () => {
    const res = await request(app).get('/api/lesson');

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('帶有效 sort 參數 → 200 or 404', async () => {
    const res = await request(app).get('/api/lesson').query({ sort: 'price_asc' });

    expect([200, 404]).toContain(res.status);
  });

  it('不認識的 query 參數（schema strip）→ 200 or 404（不影響結果）', async () => {
    // LessonQuerySchema 只允許 priceLow/priceHigh，其他 key 被 Zod strip 忽略
    const res = await request(app).get('/api/lesson').query({ unknown_param: 'bad' });

    expect([200, 404]).toContain(res.status);
  });
});

// ── GET /api/lesson/categories ───────────────────────────────────────────────
describe('E2E: GET /api/lesson/categories', () => {
  it('回傳分類清單 → 200 + 陣列', async () => {
    const res = await request(app).get('/api/lesson/categories');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ── GET /api/instrument/:id ──────────────────────────────────────────────────
describe('E2E: GET /api/instrument/:id', () => {
  it('不存在的 puid → 400', async () => {
    const res = await request(app).get('/api/instrument/puid-does-not-exist-xyz');

    expect(res.status).toBe(400);
  });
});
