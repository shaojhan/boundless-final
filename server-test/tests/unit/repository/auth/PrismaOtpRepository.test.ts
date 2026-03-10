import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '#generated/prisma/client.js';
import { PrismaOtpRepository } from '#src/repository/auth/PrismaOtpRepository.js';

// ── Prisma mock ────────────────────────────────────────────────────────────────

function makePrisma() {
  return {
    user: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    otp: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaClient;
}

// ── createOrRefresh ────────────────────────────────────────────────────────────

describe('PrismaOtpRepository.createOrRefresh', () => {
  beforeEach(() => vi.clearAllMocks());

  it('email 不存在用戶 → 回傳 null，不呼叫 otp 方法', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const repo = new PrismaOtpRepository(prisma);
    const result = await repo.createOrRefresh('notfound@example.com');

    expect(result).toBeNull();
    expect(prisma.otp.findFirst).not.toHaveBeenCalled();
    expect(prisma.otp.create).not.toHaveBeenCalled();
  });

  it('用戶存在且無 OTP 紀錄 → 呼叫 prisma.otp.create，回傳 token', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 1 } as any);
    vi.mocked(prisma.otp.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.otp.create).mockResolvedValue({} as any);

    const repo = new PrismaOtpRepository(prisma);
    const result = await repo.createOrRefresh('user@example.com');

    expect(prisma.otp.create).toHaveBeenCalledTimes(1);
    expect(prisma.otp.update).not.toHaveBeenCalled();
    expect(typeof result).toBe('string');
    expect(result!.length).toBeGreaterThan(0);
  });

  it('token 使用高熵隨機字串（長度 ≥ 40，非全數字）', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 7 } as any);
    vi.mocked(prisma.otp.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.otp.create).mockResolvedValue({} as any);

    const repo = new PrismaOtpRepository(prisma);
    const result = await repo.createOrRefresh('user@example.com');

    // base64url from 32 random bytes → 43 chars; must not be purely numeric (6-digit TOTP)
    expect(result!.length).toBeGreaterThanOrEqual(40);
    expect(/^\d{6}$/.test(result!)).toBe(false);
  });

  it('otp.create 傳入 user_id、email、token、exp_timestamp', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 7 } as any);
    vi.mocked(prisma.otp.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.otp.create).mockResolvedValue({} as any);

    const repo = new PrismaOtpRepository(prisma);
    await repo.createOrRefresh('user@example.com', 30, 60);

    const callArg = vi.mocked(prisma.otp.create).mock.calls[0][0];
    expect(callArg.data.user_id).toBe(7);
    expect(callArg.data.email).toBe('user@example.com');
    expect(typeof callArg.data.token).toBe('string');
    expect(typeof callArg.data.exp_timestamp).toBe('bigint');
  });

  it('兩次呼叫產生不同 token（隨機性）', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 1 } as any);
    vi.mocked(prisma.otp.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.otp.create).mockResolvedValue({} as any);

    const repo = new PrismaOtpRepository(prisma);
    const t1 = await repo.createOrRefresh('user@example.com');
    const t2 = await repo.createOrRefresh('user@example.com');

    expect(t1).not.toBe(t2);
  });

  it('OTP 已存在且超過 cooldown → 呼叫 update 並回傳新 token', async () => {
    const prisma = makePrisma();
    const expMinutes = 30;
    const expMs = expMinutes * 60 * 1000;
    // created 2 minutes ago → beyond 60s cooldown
    const existingExp = BigInt(Date.now() - 2 * 60 * 1000 + expMs);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 1 } as any);
    vi.mocked(prisma.otp.findFirst).mockResolvedValue({
      id: 10,
      exp_timestamp: existingExp,
    } as any);
    vi.mocked(prisma.otp.update).mockResolvedValue({} as any);

    const repo = new PrismaOtpRepository(prisma);
    const result = await repo.createOrRefresh('user@example.com', expMinutes, 60);

    expect(prisma.otp.update).toHaveBeenCalledTimes(1);
    expect(prisma.otp.create).not.toHaveBeenCalled();
    expect(typeof result).toBe('string');
  });

  it('OTP 已存在且在 cooldown 內 → 回傳 null，不更新', async () => {
    const prisma = makePrisma();
    const expMinutes = 30;
    const expMs = expMinutes * 60 * 1000;
    // created 10 seconds ago → within 60s cooldown
    const existingExp = BigInt(Date.now() - 10 * 1000 + expMs);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 1 } as any);
    vi.mocked(prisma.otp.findFirst).mockResolvedValue({
      id: 10,
      exp_timestamp: existingExp,
    } as any);

    const repo = new PrismaOtpRepository(prisma);
    const result = await repo.createOrRefresh('user@example.com', expMinutes, 60);

    expect(result).toBeNull();
    expect(prisma.otp.update).not.toHaveBeenCalled();
    expect(prisma.otp.create).not.toHaveBeenCalled();
  });
});

// ── updatePassword ─────────────────────────────────────────────────────────────

describe('PrismaOtpRepository.updatePassword', () => {
  beforeEach(() => vi.clearAllMocks());

  it('OTP 不存在 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.otp.findFirst).mockResolvedValue(null);

    const repo = new PrismaOtpRepository(prisma);
    const result = await repo.updatePassword('user@example.com', 'wrong_token', 'newhash');

    expect(result).toBeNull();
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('OTP 已過期 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.otp.findFirst).mockResolvedValue({
      id: 5,
      user_id: 1,
      exp_timestamp: BigInt(Date.now() - 1000), // expired 1 second ago
    } as any);

    const repo = new PrismaOtpRepository(prisma);
    const result = await repo.updatePassword('user@example.com', 'token', 'newhash');

    expect(result).toBeNull();
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('OTP 有效 → updateMany 更新密碼、delete OTP、回傳 user_id', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.otp.findFirst).mockResolvedValue({
      id: 5,
      user_id: 3,
      exp_timestamp: BigInt(Date.now() + 10 * 60 * 1000), // still valid
    } as any);
    vi.mocked(prisma.user.updateMany).mockResolvedValue({ count: 1 } as any);
    vi.mocked(prisma.otp.delete).mockResolvedValue({} as any);

    const repo = new PrismaOtpRepository(prisma);
    const result = await repo.updatePassword('user@example.com', 'correct_token', 'new_hash');

    expect(result).toBe(3);
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { password: 'new_hash' },
    });
    expect(prisma.otp.delete).toHaveBeenCalledWith({ where: { id: 5 } });
  });
});
