/**
 * Integration tests — Auth HTTP layer
 *
 * 測試範圍：createAuthRouter 所有端點的 routing、schema 驗證、cookie 設定及回應格式。
 * AuthService 以 vi.fn() mock；mail transporter 也被 mock（避免實際寄信）。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createAuthRouter } from '#interfaces/routers/authRouter.js';
import { AuthError } from '#domain/auth/AuthError.js';
import type { AuthService, LoginPayload } from '#service/auth/AuthService.js';
import type { UserPublic } from '#domain/auth/User.js';

// ── Mock mail transporter（避免寄信） ────────────────────────────────────────
vi.mock('#configs/mail.js', () => ({
  default: { sendMail: vi.fn().mockResolvedValue(undefined) },
}));

// ── Mock service factory ─────────────────────────────────────────────────────

function makeService(): AuthService {
  return {
    login: vi.fn(),
    register: vi.fn(),
    googleLogin: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    requestOtp: vi.fn(),
    resetPassword: vi.fn(),
  } as unknown as AuthService;
}

// ── Fixtures ────────────────────────────────────────────────────────────────

const mockUser: UserPublic = {
  id: 1,
  uid: 'u-abc123',
  name: 'Test User',
  email: 'test@example.com',
  img: null,
  myJam: null,
  isAdmin: false,
};

const mockPayload: LoginPayload = {
  token: 'access.token.here',
  refreshToken: 'refresh.token.here',
  user: mockUser,
};

// ── App builder ──────────────────────────────────────────────────────────────

function buildApp(service: AuthService) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', createAuthRouter(service));
  return app;
}

// ── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  let service: AuthService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有效憑證 → 200 + token + user', async () => {
    vi.mocked(service.login).mockResolvedValue(mockPayload);

    const res = await request(buildApp(service))
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBe('access.token.here');
    expect(res.body.user.email).toBe('test@example.com');
    expect(service.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('有效登入 → 設定 refreshToken cookie', async () => {
    vi.mocked(service.login).mockResolvedValue(mockPayload);

    const res = await request(buildApp(service))
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : (cookies ?? '');
    expect(cookieStr).toContain('refreshToken=refresh.token.here');
  });

  it('帳號或密碼錯誤 → 400 + INVALID_CREDENTIALS', async () => {
    vi.mocked(service.login).mockRejectedValue(
      new AuthError('使用者帳號或密碼錯誤。', 'INVALID_CREDENTIALS', 400),
    );

    const res = await request(buildApp(service))
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'badpass' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('缺少 email → 400（schema 驗證）', async () => {
    const res = await request(buildApp(service))
      .post('/api/auth/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(service.login).not.toHaveBeenCalled();
  });

  it('email 格式無效 → 400（schema 驗證）', async () => {
    const res = await request(buildApp(service))
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(service.login).not.toHaveBeenCalled();
  });

  it('缺少 password → 400（schema 驗證）', async () => {
    const res = await request(buildApp(service))
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
    expect(service.login).not.toHaveBeenCalled();
  });
});

// ── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  let service: AuthService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有效資料 → 201 + success', async () => {
    vi.mocked(service.register).mockResolvedValue();

    const res = await request(buildApp(service))
      .post('/api/auth/register')
      .send({ name: 'New User', email: 'new@example.com', password: 'Password1', passwordCheck: 'Password1' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(service.register).toHaveBeenCalledWith('New User', 'new@example.com', 'Password1');
  });

  it('帳號已存在 → 400 + EMAIL_EXISTS', async () => {
    vi.mocked(service.register).mockRejectedValue(
      new AuthError('該帳號已存在', 'EMAIL_EXISTS', 400),
    );

    const res = await request(buildApp(service))
      .post('/api/auth/register')
      .send({ name: 'Dup User', email: 'dup@example.com', password: 'Password1', passwordCheck: 'Password1' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('該帳號已存在');
  });

  it('name 省略時預設空字串 → 201', async () => {
    vi.mocked(service.register).mockResolvedValue();

    const res = await request(buildApp(service))
      .post('/api/auth/register')
      .send({ email: 'new@example.com', password: 'Password1', passwordCheck: 'Password1' });

    expect(res.status).toBe(201);
    expect(service.register).toHaveBeenCalledWith('', 'new@example.com', 'Password1');
  });

  it('密碼格式不符（過短） → 400（schema regex）', async () => {
    const res = await request(buildApp(service))
      .post('/api/auth/register')
      .send({ name: 'User', email: 'new@example.com', password: 'Ab1', passwordCheck: 'Ab1' });

    expect(res.status).toBe(400);
    expect(service.register).not.toHaveBeenCalled();
  });

  it('兩次密碼不一致 → 400', async () => {
    const res = await request(buildApp(service))
      .post('/api/auth/register')
      .send({ name: 'User', email: 'new@example.com', password: 'Password1', passwordCheck: 'Password2' });

    expect(res.status).toBe(400);
    expect(service.register).not.toHaveBeenCalled();
  });
});

// ── POST /api/auth/refresh ───────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  let service: AuthService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有效 cookie → 200 + 新 token', async () => {
    vi.mocked(service.refresh).mockResolvedValue(mockPayload);

    const res = await request(buildApp(service))
      .post('/api/auth/refresh')
      .set('Cookie', 'refreshToken=valid.refresh.token');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBe('access.token.here');
    expect(service.refresh).toHaveBeenCalledWith('valid.refresh.token');
  });

  it('無 refreshToken cookie → 401 + NO_REFRESH_TOKEN', async () => {
    const res = await request(buildApp(service)).post('/api/auth/refresh');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_REFRESH_TOKEN');
    expect(service.refresh).not.toHaveBeenCalled();
  });

  it('token 已失效 → AuthError → 清除 cookie + 401', async () => {
    vi.mocked(service.refresh).mockRejectedValue(
      new AuthError('Refresh token 已失效', 'INVALID_REFRESH_TOKEN', 401),
    );

    const res = await request(buildApp(service))
      .post('/api/auth/refresh')
      .set('Cookie', 'refreshToken=expired.token');

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.code).toBe('INVALID_REFRESH_TOKEN');
    // refreshToken cookie 應被清除（maxAge=0）
    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : (cookies ?? '');
    expect(cookieStr).toMatch(/refreshToken=;/);
  });
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  let service: AuthService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('帶 cookie → 200 + 清除 cookie', async () => {
    vi.mocked(service.logout).mockResolvedValue();

    const res = await request(buildApp(service))
      .post('/api/auth/logout')
      .set('Cookie', 'refreshToken=some.token');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.logout).toHaveBeenCalledWith('some.token');
    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : (cookies ?? '');
    expect(cookieStr).toMatch(/refreshToken=;/);
  });

  it('無 cookie → 仍回傳 200（graceful logout）', async () => {
    vi.mocked(service.logout).mockResolvedValue();

    const res = await request(buildApp(service)).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(service.logout).toHaveBeenCalledWith(undefined);
  });
});

// ── POST /api/auth/otp ───────────────────────────────────────────────────────

describe('POST /api/auth/otp', () => {
  let service: AuthService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有效 email → 200 + success（無論帳號是否存在）', async () => {
    vi.mocked(service.requestOtp).mockResolvedValue('123456');

    const res = await request(buildApp(service))
      .post('/api/auth/otp')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.requestOtp).toHaveBeenCalledWith('user@example.com');
  });

  it('帳號不存在時 requestOtp 回傳 null → 仍回傳 200（防枚舉）', async () => {
    vi.mocked(service.requestOtp).mockResolvedValue(null);

    const res = await request(buildApp(service))
      .post('/api/auth/otp')
      .send({ email: 'ghost@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('缺少 email → error（schema 驗證）', async () => {
    const res = await request(buildApp(service)).post('/api/auth/otp').send({});

    expect(res.body.status).toBe('error');
    expect(service.requestOtp).not.toHaveBeenCalled();
  });
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────

describe('POST /api/auth/reset-password', () => {
  let service: AuthService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有效資料 → 200 + success', async () => {
    vi.mocked(service.resetPassword).mockResolvedValue(true);

    const res = await request(buildApp(service))
      .post('/api/auth/reset-password')
      .send({ email: 'user@example.com', token: '123456', password: 'NewPass1a' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.resetPassword).toHaveBeenCalledWith('user@example.com', '123456', 'NewPass1a');
  });

  it('OTP 驗證失敗 → error', async () => {
    vi.mocked(service.resetPassword).mockResolvedValue(false);

    const res = await request(buildApp(service))
      .post('/api/auth/reset-password')
      .send({ email: 'user@example.com', token: 'wrongotp', password: 'NewPass1a' });

    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('修改密碼失敗');
  });

  it('缺少 token → error（schema 驗證）', async () => {
    const res = await request(buildApp(service))
      .post('/api/auth/reset-password')
      .send({ email: 'user@example.com', password: 'NewPass1a' });

    expect(res.body.status).toBe('error');
    expect(service.resetPassword).not.toHaveBeenCalled();
  });
});
