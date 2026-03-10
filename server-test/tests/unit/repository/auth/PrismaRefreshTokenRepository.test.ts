import crypto from 'crypto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '#generated/prisma/client.js';
import { PrismaRefreshTokenRepository } from '#src/repository/auth/PrismaRefreshTokenRepository.js';

// ── Helper ─────────────────────────────────────────────────────────────────────

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex');
}

// ── Prisma mock ────────────────────────────────────────────────────────────────

function makePrisma() {
  return {
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
  } as unknown as PrismaClient;
}

// ── create ─────────────────────────────────────────────────────────────────────

describe('PrismaRefreshTokenRepository.create', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳 128 字元 hex 明文 token', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

    const repo = new PrismaRefreshTokenRepository(prisma);
    const token = await repo.create(42);

    expect(token).toHaveLength(128);
    expect(token).toMatch(/^[0-9a-f]{128}$/);
  });

  it('DB 儲存的是 token 的 SHA-256 hash，而非明文', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

    const repo = new PrismaRefreshTokenRepository(prisma);
    const token = await repo.create(42);

    const callArg = vi.mocked(prisma.refreshToken.create).mock.calls[0][0];
    const storedToken = callArg.data.token as string;

    expect(storedToken).toBe(sha256(token));
    expect(storedToken).not.toBe(token);
    expect(storedToken).toHaveLength(64); // SHA-256 hex
  });

  it('create 傳入 user_id 和未過期的 expires_at', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

    const beforeCall = Date.now();
    const repo = new PrismaRefreshTokenRepository(prisma);
    await repo.create(7);
    const afterCall = Date.now();

    const callArg = vi.mocked(prisma.refreshToken.create).mock.calls[0][0];
    expect(callArg.data.user_id).toBe(7);

    const expiresAt = callArg.data.expires_at as Date;
    const ttlMs = 7 * 24 * 60 * 60 * 1000;
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(beforeCall + ttlMs - 100);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(afterCall + ttlMs + 100);
  });

  it('兩次呼叫產生不同 token', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

    const repo = new PrismaRefreshTokenRepository(prisma);
    const t1 = await repo.create(1);
    const t2 = await repo.create(1);

    expect(t1).not.toBe(t2);
  });
});

// ── findValid ──────────────────────────────────────────────────────────────────

describe('PrismaRefreshTokenRepository.findValid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到有效 token → 回傳 { userId }', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue({ user_id: 5 } as any);

    const repo = new PrismaRefreshTokenRepository(prisma);
    const result = await repo.findValid('valid_token_abc');

    expect(result).toEqual({ userId: 5 });
  });

  it('找不到（過期或不存在）→ 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(null);

    const repo = new PrismaRefreshTokenRepository(prisma);
    expect(await repo.findValid('expired_token')).toBeNull();
  });

  it('查詢 where 含 SHA-256 hash（非明文 token）且 expires_at.gt = 現在時間附近', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(null);

    const beforeCall = Date.now();
    const repo = new PrismaRefreshTokenRepository(prisma);
    await repo.findValid('some_token');

    const callArg = vi.mocked(prisma.refreshToken.findFirst).mock.calls[0][0];
    expect(callArg.where!.token).toBe(sha256('some_token'));
    expect(callArg.where!.token).not.toBe('some_token');
    const gtDate = (callArg.where!.expires_at as any).gt as Date;
    expect(gtDate.getTime()).toBeGreaterThanOrEqual(beforeCall - 100);
    expect(gtDate.getTime()).toBeLessThanOrEqual(Date.now() + 100);
  });
});

// ── delete ─────────────────────────────────────────────────────────────────────

describe('PrismaRefreshTokenRepository.delete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 prisma.refreshToken.deleteMany，where 含 SHA-256 hash（非明文）', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 } as any);

    const repo = new PrismaRefreshTokenRepository(prisma);
    await repo.delete('token_to_delete');

    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { token: sha256('token_to_delete') },
    });
  });
});

// ── deleteByUserId ─────────────────────────────────────────────────────────────

describe('PrismaRefreshTokenRepository.deleteByUserId', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 prisma.refreshToken.deleteMany，where 含 user_id', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 2 } as any);

    const repo = new PrismaRefreshTokenRepository(prisma);
    await repo.deleteByUserId(42);

    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { user_id: 42 },
    });
  });

  it('userId 不同，確認正確的 id 傳入', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 0 } as any);

    const repo = new PrismaRefreshTokenRepository(prisma);
    await repo.deleteByUserId(7);

    const callArg = vi.mocked(prisma.refreshToken.deleteMany).mock.calls[0][0];
    expect(callArg.where).toEqual({ user_id: 7 });
  });
});
