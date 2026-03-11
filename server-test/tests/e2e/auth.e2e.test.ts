/**
 * E2E tests — Auth flow
 *
 * 測試範圍：透過真實 Express app + 真實 Prisma (DB)，驗證完整 auth 流程。
 * 不 mock 任何 repository 或 service；僅 mock mail transporter 避免寄信。
 *
 * 流程：register → login → refresh → logout → (refresh 失效)
 * 善後：afterAll 清除測試產生的 user、refreshToken、coupon、otp 紀錄。
 */
import { describe, it, expect, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../src/container.js';

// ── Mock mail（register 後 AuthService 不寄信；但 cart submitOrder 會，一律 mock）
vi.mock('#configs/mail.js', () => ({
  default: { sendMail: vi.fn().mockResolvedValue(undefined) },
}));

// ── 測試用帳號（隨機後綴避免衝突）────────────────────────────────────────────
const TS = Date.now();
const TEST_EMAIL = `e2e_auth_${TS}@example.com`;
const TEST_PASSWORD = 'E2ePass1a';
const TEST_NAME = 'E2E User';

// ── 跨測試共享狀態 ────────────────────────────────────────────────────────────
let userId = 0;
let accessToken = '';
let refreshCookie = '';   // 整條 Set-Cookie 字串

// ── 善後：清除測試資料 ────────────────────────────────────────────────────────
afterAll(async () => {
  if (userId) {
    await prisma.otp.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.refreshToken.deleteMany({ where: { user_id: userId } });
    await prisma.coupon.deleteMany({ where: { user_id: userId } });
    await prisma.user.delete({ where: { id: userId } }).catch(() => {/* 已刪或不存在 */});
  }
  await prisma.$disconnect();
});

// ── POST /api/auth/register ──────────────────────────────────────────────────
describe('E2E: POST /api/auth/register', () => {
  it('新帳號 → 201 + success', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        passwordCheck: TEST_PASSWORD,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
  });

  it('同一 email 重複註冊 → 400 + 帳號已存在訊息', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        passwordCheck: TEST_PASSWORD,
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    // register 端點的錯誤回應不帶 code 欄位，以 message 確認
    expect(res.body.message).toBe('該帳號已存在');
  });
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
describe('E2E: POST /api/auth/login', () => {
  it('正確帳密 → 200 + access token + refreshToken cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe(TEST_EMAIL);

    // 儲存 accessToken 與 userId 供後續測試使用
    accessToken = res.body.token;
    userId = res.body.user.id;

    // 確認 refreshToken cookie 已設定
    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieArr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
    const rtCookie = cookieArr.find((c) => c.startsWith('refreshToken='));
    expect(rtCookie).toBeTruthy();
    refreshCookie = rtCookie as string;
  });

  it('錯誤密碼 → 400 + INVALID_CREDENTIALS', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPass99' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('不存在的 email → 400 + INVALID_CREDENTIALS（防枚舉）', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost_no_exist@example.com', password: TEST_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });
});

// ── POST /api/auth/refresh ───────────────────────────────────────────────────
describe('E2E: POST /api/auth/refresh', () => {
  it('有效 refreshToken cookie → 200 + 新 access token（Token Rotation）', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(typeof res.body.token).toBe('string');
    // refresh token 在 DB 端已 rotate（舊 token 失效）
    // access token 為 JWT，同一秒內可能相同（iat 精度為秒），不斷言內容差異

    // 更新供後續測試使用
    accessToken = res.body.token;
    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieArr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
    const rtCookie = cookieArr.find((c) => c.startsWith('refreshToken='));
    if (rtCookie) refreshCookie = rtCookie;
  });

  it('無 cookie → 401 + NO_REFRESH_TOKEN', async () => {
    const res = await request(app).post('/api/auth/refresh');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_REFRESH_TOKEN');
  });

  it('偽造 refreshToken → 401 + INVALID_REFRESH_TOKEN', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', 'refreshToken=totally_fake_token');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_REFRESH_TOKEN');
  });
});

// ── GET /api/coupon/FindAll (verify welcome coupon) ──────────────────────────
describe('E2E: 新用戶歡迎優惠券', () => {
  it('register 後應自動獲得一張歡迎優惠券', async () => {
    expect(userId).toBeGreaterThan(0);

    const res = await request(app)
      .get(`/api/coupon/FindAll/${userId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
describe('E2E: POST /api/auth/logout', () => {
  it('帶有效 cookie → 200 + cookie 被清除', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', refreshCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : (cookies ?? '');
    expect(cookieStr).toMatch(/refreshToken=;/);
  });

  it('logout 後再次 refresh → 401（token 已撤銷）', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie);

    expect(res.status).toBe(401);
    // 舊 cookie 內的 token 已從 DB 刪除，應視為無效
  });
});
