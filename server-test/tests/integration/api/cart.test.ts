/**
 * Integration tests — Cart HTTP layer
 *
 * 測試範圍：createCartRouter 的路由、JWT 驗證（checkToken）、schema 驗證及回應格式。
 * CartService 以 vi.fn() mock；mail transporter mock 避免寄信。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createCartRouter } from '#interfaces/routers/cartRouter.js';
import type { CartService } from '#service/commerce/CartService.js';
import type { PriceResult } from '#domain/commerce/Cart.js';

// ── Mock mail（CartService.submitOrder 會寄信） ───────────────────────────────
vi.mock('#configs/mail.js', () => ({
  default: { sendMail: vi.fn().mockResolvedValue(undefined) },
}));

// ── JWT helper ────────────────────────────────────────────────────────────────

const SECRET = 'test-access-secret-for-vitest'; // 與 tests/setup.ts 一致

function makeToken(payload: object = { id: 1, uid: 'u-test', name: 'Test', email: 'test@test.com' }) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

// ── Mock service factory ──────────────────────────────────────────────────────

function makeService(): CartService {
  return {
    calcPrice: vi.fn(),
    submitOrder: vi.fn(),
  } as unknown as CartService;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const priceResult: PriceResult = {
  lessonTotal: 3000,
  instrumentTotal: 2000,
  lessonDiscount: 100,
  instrumentDiscount: 0,
  totalPrice: 5000,
  totalDiscount: 100,
  finalPayment: 4900,
};

const validCartData = JSON.stringify([{ id: 1, qty: 1 }]);

const validFormBody = {
  phone: '0912345678',
  country: '台北市',
  township: '中正區',
  postcode: '100',
  address: '中山南路1號',
  transportationstate: '宅配',
  cartdata: validCartData,
};

// ── App builder ───────────────────────────────────────────────────────────────

function buildApp(service: CartService) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/cart', createCartRouter(service));
  return app;
}

// ── POST /api/cart/calculate ──────────────────────────────────────────────────

describe('POST /api/cart/calculate', () => {
  let service: CartService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('無 Authorization header → 401', async () => {
    const res = await request(buildApp(service))
      .post('/api/cart/calculate')
      .send({ cartdata: validCartData });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
    expect(service.calcPrice).not.toHaveBeenCalled();
  });

  it('過期或無效 token → 401', async () => {
    const res = await request(buildApp(service))
      .post('/api/cart/calculate')
      .set('Authorization', 'Bearer invalid.token.here')
      .send({ cartdata: validCartData });

    expect(res.status).toBe(401);
    expect(service.calcPrice).not.toHaveBeenCalled();
  });

  it('有效 token + valid body → 200 + 價格結果', async () => {
    vi.mocked(service.calcPrice).mockResolvedValue(priceResult);

    const res = await request(buildApp(service))
      .post('/api/cart/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ cartdata: validCartData });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.finalPayment).toBe(4900);
    expect(service.calcPrice).toHaveBeenCalledWith(
      [{ id: 1, qty: 1 }],
      1,     // userId from JWT
      null,  // lessonCUID not sent
      null,  // instrumentCUID not sent
    );
  });

  it('帶 lessonCUID → 傳遞給 service', async () => {
    vi.mocked(service.calcPrice).mockResolvedValue(priceResult);

    await request(buildApp(service))
      .post('/api/cart/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ cartdata: validCartData, lessonCUID: 'coupon-abc' });

    expect(service.calcPrice).toHaveBeenCalledWith(
      expect.any(Array),
      1,
      'coupon-abc',
      null,
    );
  });

  it('缺少 cartdata → 400', async () => {
    const res = await request(buildApp(service))
      .post('/api/cart/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({});

    expect(res.status).toBe(400);
    expect(service.calcPrice).not.toHaveBeenCalled();
  });

  it('cartdata 非合法 JSON → service 拋 400 → 回傳 400', async () => {
    const err = Object.assign(new Error('商品數量不合法'), { statusCode: 400 });
    vi.mocked(service.calcPrice).mockRejectedValue(err);

    const res = await request(buildApp(service))
      .post('/api/cart/calculate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ cartdata: JSON.stringify([{ id: 1, qty: -1 }]) });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });
});

// ── POST /api/cart/form ───────────────────────────────────────────────────────

describe('POST /api/cart/form', () => {
  let service: CartService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('無 Authorization header → 401', async () => {
    const res = await request(buildApp(service))
      .post('/api/cart/form')
      .send(validFormBody);

    expect(res.status).toBe(401);
    expect(service.submitOrder).not.toHaveBeenCalled();
  });

  it('有效 token + valid body → 200 + success', async () => {
    vi.mocked(service.submitOrder).mockResolvedValue();

    const res = await request(buildApp(service))
      .post('/api/cart/form')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(validFormBody);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.submitOrder).toHaveBeenCalledOnce();
  });

  it('userId + uid 來自 JWT decoded → 傳遞給 service', async () => {
    vi.mocked(service.submitOrder).mockResolvedValue();
    const token = makeToken({ id: 42, uid: 'u-xyz', name: 'Bob', email: 'bob@test.com' });

    await request(buildApp(service))
      .post('/api/cart/form')
      .set('Authorization', `Bearer ${token}`)
      .send(validFormBody);

    const call = vi.mocked(service.submitOrder).mock.calls[0][0];
    expect(call.userId).toBe(42);
    expect(call.userUid).toBe('u-xyz');
  });

  it('缺少 phone → 400', async () => {
    const { phone: _phone, ...body } = validFormBody;
    const res = await request(buildApp(service))
      .post('/api/cart/form')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(body);

    expect(res.status).toBe(400);
    expect(service.submitOrder).not.toHaveBeenCalled();
  });

  it('缺少 address → 400', async () => {
    const { address: _address, ...body } = validFormBody;
    const res = await request(buildApp(service))
      .post('/api/cart/form')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(body);

    expect(res.status).toBe(400);
    expect(service.submitOrder).not.toHaveBeenCalled();
  });

  it('缺少 cartdata → 400', async () => {
    const { cartdata: _cd, ...body } = validFormBody;
    const res = await request(buildApp(service))
      .post('/api/cart/form')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(body);

    expect(res.status).toBe(400);
    expect(service.submitOrder).not.toHaveBeenCalled();
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.submitOrder).mockRejectedValue(new Error('DB error'));

    const res = await request(buildApp(service))
      .post('/api/cart/form')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(validFormBody);

    expect(res.status).toBe(500);
  });
});
