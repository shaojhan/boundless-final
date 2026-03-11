/**
 * E2E tests — Cart flow
 *
 * 測試範圍：透過真實 Express app + 真實 Prisma (DB)，驗證 cart 兩個端點：
 *   POST /api/cart/calculate  — 價格試算（需 JWT）
 *   POST /api/cart/form       — 訂單送出（需 JWT，寫入 DB）
 *
 * 前置：beforeAll 建立測試用 user，login 取得 JWT。
 * 善後：afterAll 刪除測試 user、訂單及相關紀錄。
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../src/container.js';

// ── Mock mail（submitOrder 會寄確認信）───────────────────────────────────────
vi.mock('#configs/mail.js', () => ({
  default: { sendMail: vi.fn().mockResolvedValue(undefined) },
}));

// ── 測試帳號（隨機後綴避免衝突）─────────────────────────────────────────────
const TS = Date.now();
const TEST_EMAIL = `e2e_cart_${TS}@example.com`;
const TEST_PASSWORD = 'CartPass1a';

// ── 跨測試共享狀態 ────────────────────────────────────────────────────────────
let userId = 0;
let userUid = '';
let accessToken = '';
let productId = 0;   // 從 DB 撈取的實際商品 ID

// ── 便利函式 ──────────────────────────────────────────────────────────────────
function authHeader() {
  return { Authorization: `Bearer ${accessToken}` };
}

function cartdata(items: Array<{ id: number; qty: number }>) {
  return JSON.stringify(items);
}

// ── 前置：建立 user + login + 取得真實 productId ──────────────────────────────
beforeAll(async () => {
  // 1. register
  await request(app)
    .post('/api/auth/register')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD, passwordCheck: TEST_PASSWORD });

  // 2. login → 取得 JWT
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

  accessToken = loginRes.body.token as string;
  userId = loginRes.body.user.id as number;
  userUid = loginRes.body.user.uid as string;

  // 3. 從 DB 取一個有效商品 ID（type=1 instrument，qty 才有意義）
  const product = await prisma.product.findFirst({
    where: { valid: 1, type: 1 },
    select: { id: true },
  });
  if (product) productId = product.id;
});

// ── 善後：清除測試資料 ────────────────────────────────────────────────────────
afterAll(async () => {
  if (userUid) {
    // 刪除由 submitOrder 建立的 orderItem / orderTotal
    const orders = await prisma.orderTotal.findMany({
      where: { user_id: userUid },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);
    if (orderIds.length) {
      await prisma.orderItem.deleteMany({ where: { order_id: { in: orderIds } } });
      await prisma.orderTotal.deleteMany({ where: { id: { in: orderIds } } });
    }
  }
  if (userId) {
    await prisma.otp.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.refreshToken.deleteMany({ where: { user_id: userId } });
    await prisma.coupon.deleteMany({ where: { user_id: userId } });
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  }
  await prisma.$disconnect();
});

// ── POST /api/cart/calculate ──────────────────────────────────────────────────
describe('E2E: POST /api/cart/calculate', () => {
  it('無 Authorization → 401', async () => {
    const res = await request(app)
      .post('/api/cart/calculate')
      .send({ cartdata: cartdata([{ id: 1, qty: 1 }]) });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });

  it('無效 token → 401', async () => {
    const res = await request(app)
      .post('/api/cart/calculate')
      .set('Authorization', 'Bearer fake.jwt.token')
      .send({ cartdata: cartdata([{ id: 1, qty: 1 }]) });

    expect(res.status).toBe(401);
  });

  it('缺少 cartdata → 400', async () => {
    const res = await request(app)
      .post('/api/cart/calculate')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('有效 token + 存在商品 → 200 + 價格結構', async () => {
    if (!productId) return; // 若 DB 無商品則跳過

    const res = await request(app)
      .post('/api/cart/calculate')
      .set(authHeader())
      .send({ cartdata: cartdata([{ id: productId, qty: 1 }]) });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(typeof res.body.finalPayment).toBe('number');
    expect(typeof res.body.totalPrice).toBe('number');
    expect(typeof res.body.totalDiscount).toBe('number');
    expect(typeof res.body.lessonTotal).toBe('number');
    expect(typeof res.body.instrumentTotal).toBe('number');
  });

  it('商品不存在（ID=0）→ 200，金額皆 0（service 略過不在 map 裡的商品）', async () => {
    const res = await request(app)
      .post('/api/cart/calculate')
      .set(authHeader())
      .send({ cartdata: cartdata([{ id: 0, qty: 1 }]) });

    expect(res.status).toBe(200);
    expect(res.body.finalPayment).toBe(0);
  });

  it('qty 為負數 → 400（service 拋出 statusCode 400）', async () => {
    if (!productId) return;

    const res = await request(app)
      .post('/api/cart/calculate')
      .set(authHeader())
      .send({ cartdata: cartdata([{ id: productId, qty: -1 }]) });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('cartdata 非合法 JSON → 500（JSON.parse 拋例外）', async () => {
    const res = await request(app)
      .post('/api/cart/calculate')
      .set(authHeader())
      .send({ cartdata: 'not-json' });

    expect(res.status).toBe(500);
    expect(res.body.status).toBe('error');
  });
});

// ── POST /api/cart/form ───────────────────────────────────────────────────────
describe('E2E: POST /api/cart/form', () => {
  const validFormBody = () => ({
    phone: '0912345678',
    country: '台北市',
    township: '中正區',
    postcode: '100',
    address: '中山南路 1 號',
    transportationstate: '宅配',
    cartdata: productId ? cartdata([{ id: productId, qty: 1 }]) : cartdata([{ id: 0, qty: 1 }]),
  });

  it('無 Authorization → 401', async () => {
    const res = await request(app)
      .post('/api/cart/form')
      .send(validFormBody());

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });

  it('缺少 phone → 400', async () => {
    const { phone: _p, ...body } = validFormBody();

    const res = await request(app)
      .post('/api/cart/form')
      .set(authHeader())
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('缺少 address → 400', async () => {
    const { address: _a, ...body } = validFormBody();

    const res = await request(app)
      .post('/api/cart/form')
      .set(authHeader())
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('缺少 cartdata → 400', async () => {
    const { cartdata: _cd, ...body } = validFormBody();

    const res = await request(app)
      .post('/api/cart/form')
      .set(authHeader())
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('有效請求 → 200 + 訂單寫入 DB', async () => {
    const res = await request(app)
      .post('/api/cart/form')
      .set(authHeader())
      .send(validFormBody());

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    // 驗證 DB 確實寫入 orderTotal
    const order = await prisma.orderTotal.findFirst({
      where: { user_id: userUid },
    });
    expect(order).not.toBeNull();
    expect(order?.phone).toBe('0912345678');
    expect(order?.address).toBe('中山南路 1 號');
  });
});
