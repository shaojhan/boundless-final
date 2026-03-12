import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IUserRepository } from '#src/repository/auth/IUserRepository.js';
import type { IRefreshTokenRepository } from '#src/repository/auth/IRefreshTokenRepository.js';
import type { IOtpRepository } from '#src/repository/auth/IOtpRepository.js';
import type { User } from '#src/domain/auth/User.js';
import { AuthError } from '#src/domain/auth/AuthError.js';

// Mock the password-hash helpers before importing AuthService
vi.mock('#db-helpers/password-hash', () => ({
  compareHash: vi.fn(),
  generateHash: vi.fn(),
}));
vi.mock('dotenv/config.js', () => ({}));

import * as passwordHash from '#db-helpers/password-hash.js';
import { AuthService } from '#src/service/auth/AuthService.js';

// ── Fixtures ───────────────────────────────────────────────────────────────────

const mockUser: User = {
  id: 1,
  uid: 'uid-001',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: 'hashed_pw',
  nickname: null,
  phone: null,
  birthday: new Date('2000-01-01'),
  img: null,
  googleUid: null,
  photoUrl: null,
  myJam: null,
  valid: 1,
  isAdmin: false,
  createdTime: new Date(),
  updatedTime: new Date(),
};

const mockUserPublic = {
  id: mockUser.id,
  uid: mockUser.uid,
  name: mockUser.name,
  email: mockUser.email,
  img: mockUser.img,
  myJam: mockUser.myJam,
  isAdmin: false,
};

// ── Mock repositories ──────────────────────────────────────────────────────────

function makeRepos() {
  const userRepo: IUserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByUid: vi.fn(),
    findByGoogleUid: vi.fn(),
    createUser: vi.fn(),
    createGoogleUser: vi.fn(),
    grantWelcomeCoupon: vi.fn(),
  };
  const tokenRepo: IRefreshTokenRepository = {
    create: vi.fn().mockResolvedValue('refresh-token-xyz'),
    findValid: vi.fn(),
    delete: vi.fn(),
    deleteByUserId: vi.fn(),
  };
  const otpRepo: IOtpRepository = {
    createOrRefresh: vi.fn(),
    updatePassword: vi.fn(),
  };
  return { userRepo, tokenRepo, otpRepo };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('AuthService.login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('成功登入回傳 token + user', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(userRepo.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordHash.compareHash).mockResolvedValue(true);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const result = await service.login('test@example.com', 'correct_pw');

    expect(result.token).toBeTruthy();
    expect(result.refreshToken).toBe('refresh-token-xyz');
    expect(result.user.email).toBe('test@example.com');
    expect(tokenRepo.create).toHaveBeenCalledWith(mockUser.id);
  });

  it('帳號不存在 → 拋出 AuthError', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(userRepo.findByEmail).mockResolvedValue(null);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    await expect(service.login('no@one.com', 'pw')).rejects.toThrow(AuthError);
  });

  it('密碼錯誤 → 拋出 AuthError INVALID_CREDENTIALS', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(userRepo.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordHash.compareHash).mockResolvedValue(false);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const err = await service.login('test@example.com', 'wrong').catch((e) => e);

    expect(err).toBeInstanceOf(AuthError);
    expect(err.code).toBe('INVALID_CREDENTIALS');
    expect(err.httpStatus).toBe(400);
  });
});

describe('AuthService.register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('成功註冊，並發放歡迎優惠券', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepo.createUser).mockResolvedValue(mockUserPublic);
    vi.mocked(userRepo.grantWelcomeCoupon).mockResolvedValue();

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    await service.register('New User', 'new@example.com', 'password123');

    expect(userRepo.createUser).toHaveBeenCalledWith({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });
    expect(userRepo.grantWelcomeCoupon).toHaveBeenCalledWith(mockUserPublic.id);
  });

  it('Email 已存在 → 拋出 AuthError EMAIL_EXISTS', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(userRepo.findByEmail).mockResolvedValue(mockUser);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const err = await service.register('X', 'test@example.com', 'pw').catch((e) => e);

    expect(err).toBeInstanceOf(AuthError);
    expect(err.code).toBe('EMAIL_EXISTS');
  });
});

describe('AuthService.refresh', () => {
  beforeEach(() => vi.clearAllMocks());

  it('有效 refresh token → 輪換並回傳新 token', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(tokenRepo.findValid).mockResolvedValue({ userId: mockUser.id });
    vi.mocked(userRepo.findById).mockResolvedValue(mockUser);
    vi.mocked(tokenRepo.delete).mockResolvedValue();
    vi.mocked(tokenRepo.create).mockResolvedValue('new-refresh-token');

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const result = await service.refresh('old-refresh-token');

    expect(tokenRepo.delete).toHaveBeenCalledWith('old-refresh-token');
    expect(tokenRepo.create).toHaveBeenCalledWith(mockUser.id);
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.user.id).toBe(mockUser.id);
  });

  it('無效 refresh token → 拋出 INVALID_REFRESH_TOKEN', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(tokenRepo.findValid).mockResolvedValue(null);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const err = await service.refresh('bad-token').catch((e) => e);

    expect(err).toBeInstanceOf(AuthError);
    expect(err.code).toBe('INVALID_REFRESH_TOKEN');
    expect(err.httpStatus).toBe(401);
  });

  it('找不到對應 user → 刪除 token 並拋出 USER_NOT_FOUND', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(tokenRepo.findValid).mockResolvedValue({ userId: 999 });
    vi.mocked(userRepo.findById).mockResolvedValue(null);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const err = await service.refresh('orphaned-token').catch((e) => e);

    expect(tokenRepo.delete).toHaveBeenCalledWith('orphaned-token');
    expect(err).toBeInstanceOf(AuthError);
    expect(err.code).toBe('USER_NOT_FOUND');
  });
});

describe('AuthService.logout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('有 refresh token → 刪除', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    await service.logout('some-token');
    expect(tokenRepo.delete).toHaveBeenCalledWith('some-token');
  });

  it('無 refresh token → 不呼叫 delete', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    await service.logout(undefined);
    expect(tokenRepo.delete).not.toHaveBeenCalled();
  });
});

describe('AuthService.requestOtp', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 otpRepo.createOrRefresh', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(otpRepo.createOrRefresh).mockResolvedValue('123456');

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const token = await service.requestOtp('user@example.com');

    expect(otpRepo.createOrRefresh).toHaveBeenCalledWith('user@example.com');
    expect(token).toBe('123456');
  });

  it('Email 不存在或冷卻中 → 回傳 null', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(otpRepo.createOrRefresh).mockResolvedValue(null);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    expect(await service.requestOtp('unknown@example.com')).toBeNull();
  });
});

describe('AuthService.googleLogin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('有效 Google token → 查找已存在使用者 → 回傳 token + user', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(userRepo.findByGoogleUid).mockResolvedValue(mockUserPublic);
    vi.mocked(tokenRepo.create).mockResolvedValue('refresh-g-token');

    // Mock global fetch
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ sub: 'g-uid-001', email: 'g@example.com', name: 'Google User' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const result = await service.googleLogin('valid-google-access-token');

    expect(result.token).toBeTruthy();
    expect(result.refreshToken).toBe('refresh-g-token');
    expect(userRepo.findByGoogleUid).toHaveBeenCalledWith('g-uid-001');
    expect(userRepo.createGoogleUser).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('Google token 對應的使用者不存在 → 建立新帳號', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(userRepo.findByGoogleUid).mockResolvedValue(null);
    vi.mocked(userRepo.createGoogleUser).mockResolvedValue(mockUserPublic);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ sub: 'g-uid-new', email: 'new@example.com', name: 'New Google', picture: 'https://pic.url' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    await service.googleLogin('new-google-token');

    expect(userRepo.createGoogleUser).toHaveBeenCalledWith({
      googleUid: 'g-uid-new',
      email: 'new@example.com',
      name: 'New Google',
      photoUrl: 'https://pic.url',
    });

    vi.unstubAllGlobals();
  });

  it('Google API 回傳非 ok → 拋出 INVALID_GOOGLE_TOKEN', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal('fetch', fetchMock);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const err = await service.googleLogin('bad-token').catch((e) => e);

    expect(err).toBeInstanceOf(AuthError);
    expect(err.code).toBe('INVALID_GOOGLE_TOKEN');
    expect(err.httpStatus).toBe(401);

    vi.unstubAllGlobals();
  });

  it('Google 回傳資料缺少 sub → 拋出 INCOMPLETE_GOOGLE_USER', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ email: 'no-sub@example.com' }), // no sub
    });
    vi.stubGlobal('fetch', fetchMock);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const err = await service.googleLogin('partial-token').catch((e) => e);

    expect(err).toBeInstanceOf(AuthError);
    expect(err.code).toBe('INCOMPLETE_GOOGLE_USER');

    vi.unstubAllGlobals();
  });
});

describe('AuthService.resetPassword', () => {
  beforeEach(() => vi.clearAllMocks());

  it('成功重設密碼回傳 true，並撤銷所有 refresh token', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(passwordHash.generateHash).mockResolvedValue('hashed_new_pw');
    vi.mocked(otpRepo.updatePassword).mockResolvedValue(3); // userId on success

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    const ok = await service.resetPassword('user@example.com', 'valid_token', 'newPassword');

    expect(passwordHash.generateHash).toHaveBeenCalledWith('newPassword');
    expect(otpRepo.updatePassword).toHaveBeenCalledWith('user@example.com', 'valid_token', 'hashed_new_pw');
    expect(tokenRepo.deleteByUserId).toHaveBeenCalledWith(3);
    expect(ok).toBe(true);
  });

  it('OTP 無效 → 回傳 false，不撤銷 refresh token', async () => {
    const { userRepo, tokenRepo, otpRepo } = makeRepos();
    vi.mocked(passwordHash.generateHash).mockResolvedValue('hashed_new_pw');
    vi.mocked(otpRepo.updatePassword).mockResolvedValue(null);

    const service = new AuthService(userRepo, tokenRepo, otpRepo);
    expect(await service.resetPassword('user@example.com', 'wrong', 'newPassword')).toBe(false);
    expect(tokenRepo.deleteByUserId).not.toHaveBeenCalled();
  });
});
