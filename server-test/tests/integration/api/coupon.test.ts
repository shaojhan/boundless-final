/**
 * Integration tests — Coupon HTTP layer
 *
 * 測試範圍：createCouponRouter 所有端點的 routing、schema 驗證及回應格式。
 * CouponService 以 vi.fn() mock，隔離 DB 依賴。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createCouponRouter } from '#interfaces/routers/couponRouter.js';
import type { CouponService } from '#service/commerce/CouponService.js';
import type { UserCouponDetail, RedeemResult } from '#domain/commerce/Coupon.js';

// ── Mock service factory ────────────────────────────────────────────────────

function makeService(): CouponService {
  return {
    findAll: vi.fn(),
    create: vi.fn(),
    invalidate: vi.fn(),
    redeem: vi.fn(),
  } as unknown as CouponService;
}

// ── Fixtures ────────────────────────────────────────────────────────────────

const couponDetail: UserCouponDetail = {
  id: 1,
  name: '100元折扣券',
  discount: 100,
  kind: 1,
  type: 1,
  created_time: new Date('2025-01-01'),
  limit_time: '2025-01-08 00:00:00',
  limitNum: 7,
  valid: 1,
  template_id: 3,
};

const redeemSuccess: RedeemResult = {
  success: true,
  message: '兌換成功！',
  coupon: { name: '100元折扣券', discount: 100, kind: 1, type: 1, limit_time: '2025-08-01 00:00:00' },
};

// ── App builder ──────────────────────────────────────────────────────────────

function buildApp(service: CouponService) {
  const app = express();
  app.use(express.json());
  app.use('/api/coupon', createCouponRouter(service));
  return app;
}

// ── GET /api/coupon/FindAll/:user_id ────────────────────────────────────────

describe('GET /api/coupon/FindAll/:user_id', () => {
  let service: CouponService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('回傳 200 與優惠券清單', async () => {
    vi.mocked(service.findAll).mockResolvedValue([couponDetail]);

    const res = await request(buildApp(service)).get('/api/coupon/FindAll/42');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('100元折扣券');
    expect(service.findAll).toHaveBeenCalledWith(42);
  });

  it('無優惠券時回傳空陣列', async () => {
    vi.mocked(service.findAll).mockResolvedValue([]);

    const res = await request(buildApp(service)).get('/api/coupon/FindAll/99');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('service 拋出例外 → 回傳 500', async () => {
    vi.mocked(service.findAll).mockRejectedValue(new Error('DB 連線失敗'));

    const res = await request(buildApp(service)).get('/api/coupon/FindAll/1');

    expect(res.status).toBe(500);
  });
});

// ── POST /api/coupon/Create ─────────────────────────────────────────────────

describe('POST /api/coupon/Create', () => {
  let service: CouponService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid body → 200 + true', async () => {
    vi.mocked(service.create).mockResolvedValue(true);

    const res = await request(buildApp(service))
      .post('/api/coupon/Create')
      .send({ user_id: 42, coupon_template_id: 3 });

    expect(res.status).toBe(200);
    expect(res.body).toBe(true);
    expect(service.create).toHaveBeenCalledWith(42, 3);
  });

  it('缺少 coupon_template_id → 400', async () => {
    const res = await request(buildApp(service))
      .post('/api/coupon/Create')
      .send({ user_id: 42 });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false });
    expect(service.create).not.toHaveBeenCalled();
  });

  it('缺少 user_id → 400', async () => {
    const res = await request(buildApp(service))
      .post('/api/coupon/Create')
      .send({ coupon_template_id: 3 });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false });
  });

  it('空 body → 400', async () => {
    const res = await request(buildApp(service)).post('/api/coupon/Create').send({});

    expect(res.status).toBe(400);
  });

  it('service 回傳 false → 200 + false（業務邏輯層不在此驗證）', async () => {
    vi.mocked(service.create).mockResolvedValue(false);

    const res = await request(buildApp(service))
      .post('/api/coupon/Create')
      .send({ user_id: 42, coupon_template_id: 999 });

    expect(res.status).toBe(200);
    expect(res.body).toBe(false);
  });
});

// ── POST /api/coupon/Update ─────────────────────────────────────────────────

describe('POST /api/coupon/Update', () => {
  let service: CouponService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid id → 200 + true', async () => {
    vi.mocked(service.invalidate).mockResolvedValue(true);

    const res = await request(buildApp(service))
      .post('/api/coupon/Update')
      .send({ id: '10' });

    expect(res.status).toBe(200);
    expect(res.body).toBe(true);
    expect(service.invalidate).toHaveBeenCalledWith(10);
  });

  it('id 不是數字 → 400', async () => {
    const res = await request(buildApp(service))
      .post('/api/coupon/Update')
      .send({ id: 'abc' });

    expect(res.status).toBe(400);
    expect(service.invalidate).not.toHaveBeenCalled();
  });

  it('缺少 id → 400', async () => {
    const res = await request(buildApp(service)).post('/api/coupon/Update').send({});

    expect(res.status).toBe(400);
  });

  it('找不到優惠券 → 200 + false', async () => {
    vi.mocked(service.invalidate).mockResolvedValue(false);

    const res = await request(buildApp(service))
      .post('/api/coupon/Update')
      .send({ id: '999' });

    expect(res.status).toBe(200);
    expect(res.body).toBe(false);
  });
});

// ── POST /api/coupon/Redeem ─────────────────────────────────────────────────

describe('POST /api/coupon/Redeem', () => {
  let service: CouponService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid body → 200 + success result', async () => {
    vi.mocked(service.redeem).mockResolvedValue(redeemSuccess);

    const res = await request(buildApp(service))
      .post('/api/coupon/Redeem')
      .send({ user_id: 42, coupon_code: 'SAVE100' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('兌換成功！');
    expect(service.redeem).toHaveBeenCalledWith(42, 'SAVE100');
  });

  it('coupon_code 空字串 → 400（min(1) 驗證失敗）', async () => {
    const res = await request(buildApp(service))
      .post('/api/coupon/Redeem')
      .send({ user_id: 42, coupon_code: '' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false });
    expect(service.redeem).not.toHaveBeenCalled();
  });

  it('缺少 coupon_code → 400', async () => {
    const res = await request(buildApp(service))
      .post('/api/coupon/Redeem')
      .send({ user_id: 42 });

    expect(res.status).toBe(400);
  });

  it('缺少 user_id → 400', async () => {
    const res = await request(buildApp(service))
      .post('/api/coupon/Redeem')
      .send({ coupon_code: 'SAVE100' });

    expect(res.status).toBe(400);
  });

  it('折扣碼無效 → 200 + success=false', async () => {
    vi.mocked(service.redeem).mockResolvedValue({
      success: false,
      message: '折扣碼無效或已過期',
    });

    const res = await request(buildApp(service))
      .post('/api/coupon/Redeem')
      .send({ user_id: 42, coupon_code: 'BADCODE' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.coupon).toBeUndefined();
  });

  it('service 拋出例外 → 500 + success=false', async () => {
    vi.mocked(service.redeem).mockRejectedValue(new Error('unexpected'));

    const res = await request(buildApp(service))
      .post('/api/coupon/Redeem')
      .send({ user_id: 42, coupon_code: 'CRASH' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
