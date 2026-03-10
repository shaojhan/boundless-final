import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '#generated/prisma/client.js';
import { PrismaUserRepository } from '#src/repository/auth/PrismaUserRepository.js';

// ── Prisma mock ────────────────────────────────────────────────────────────────

function makePrisma() {
  return {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    coupon: {
      create: vi.fn(),
    },
  } as unknown as PrismaClient;
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const now = new Date('2025-01-01T00:00:00Z');

function makeUserRow(overrides: Partial<{
  id: number;
  uid: string;
  name: string;
  email: string;
  password: string;
  nickname: string | null;
  phone: string | null;
  birthday: Date;
  img: string | null;
  google_uid: string | null;
  photo_url: string | null;
  my_jam: string | null;
  valid: number;
}> = {}) {
  return {
    id: overrides.id ?? 1,
    uid: overrides.uid ?? 'TESTUID00001',
    name: overrides.name ?? '測試用戶',
    email: overrides.email ?? 'test@example.com',
    password: overrides.password ?? 'hashed_password',
    nickname: overrides.nickname ?? '暱稱',
    phone: overrides.phone ?? null,
    birthday: overrides.birthday ?? new Date('1990-01-01'),
    img: overrides.img ?? null,
    google_uid: overrides.google_uid ?? null,
    photo_url: overrides.photo_url ?? null,
    my_jam: overrides.my_jam ?? null,
    valid: overrides.valid ?? 1,
    created_time: now,
    updated_time: now,
  };
}

function makeUserPublicRow(overrides: Partial<{
  id: number;
  uid: string;
  name: string;
  email: string;
  img: string | null;
  my_jam: string | null;
}> = {}) {
  return {
    id: overrides.id ?? 1,
    uid: overrides.uid ?? 'TESTUID00001',
    name: overrides.name ?? '測試用戶',
    email: overrides.email ?? 'test@example.com',
    img: overrides.img ?? null,
    my_jam: overrides.my_jam ?? null,
  };
}

// ── findById ───────────────────────────────────────────────────────────────────

describe('PrismaUserRepository.findById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到有效用戶 → 回傳 domain User 物件', async () => {
    const prisma = makePrisma();
    const row = makeUserRow({ id: 42, name: '用戶甲' });
    vi.mocked(prisma.user.findFirst).mockResolvedValue(row as any);

    const repo = new PrismaUserRepository(prisma);
    const result = await repo.findById(42);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(42);
    expect(result!.name).toBe('用戶甲');
    expect(result!.passwordHash).toBe('hashed_password');
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 42, valid: 1 },
    });
  });

  it('findFirst 回傳 null → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const repo = new PrismaUserRepository(prisma);
    expect(await repo.findById(999)).toBeNull();
  });

  it('toDomain 正確映射所有欄位', async () => {
    const prisma = makePrisma();
    const row = makeUserRow({
      google_uid: 'google_abc',
      photo_url: 'https://photo.url',
      my_jam: 'JAM001',
      nickname: '我的暱稱',
      phone: '0912345678',
    });
    vi.mocked(prisma.user.findFirst).mockResolvedValue(row as any);

    const repo = new PrismaUserRepository(prisma);
    const result = await repo.findById(1);

    expect(result!.googleUid).toBe('google_abc');
    expect(result!.photoUrl).toBe('https://photo.url');
    expect(result!.myJam).toBe('JAM001');
    expect(result!.nickname).toBe('我的暱稱');
    expect(result!.phone).toBe('0912345678');
  });
});

// ── findByEmail ────────────────────────────────────────────────────────────────

describe('PrismaUserRepository.findByEmail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到用戶 → 回傳 User，where 含 email 和 valid:1', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(makeUserRow() as any);

    const repo = new PrismaUserRepository(prisma);
    const result = await repo.findByEmail('test@example.com');

    expect(result).not.toBeNull();
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'test@example.com', valid: 1 },
    });
  });

  it('找不到 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const repo = new PrismaUserRepository(prisma);
    expect(await repo.findByEmail('notfound@example.com')).toBeNull();
  });
});

// ── findByUid ──────────────────────────────────────────────────────────────────

describe('PrismaUserRepository.findByUid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到用戶 → where 含 uid 和 valid:1', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(makeUserRow() as any);

    const repo = new PrismaUserRepository(prisma);
    await repo.findByUid('TESTUID00001');

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { uid: 'TESTUID00001', valid: 1 },
    });
  });

  it('找不到 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const repo = new PrismaUserRepository(prisma);
    expect(await repo.findByUid('NOTEXIST')).toBeNull();
  });
});

// ── findByGoogleUid ────────────────────────────────────────────────────────────

describe('PrismaUserRepository.findByGoogleUid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到用戶 → 回傳 UserPublic（不含 password）', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(makeUserPublicRow() as any);

    const repo = new PrismaUserRepository(prisma);
    const result = await repo.findByGoogleUid('google_abc');

    expect(result).not.toBeNull();
    expect(result!.id).toBe(1);
    expect((result as any).passwordHash).toBeUndefined();
  });

  it('找不到 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const repo = new PrismaUserRepository(prisma);
    expect(await repo.findByGoogleUid('not_exist')).toBeNull();
  });
});

// ── createUser ─────────────────────────────────────────────────────────────────

describe('PrismaUserRepository.createUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 prisma.user.create，回傳 UserPublic', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.create).mockResolvedValue(makeUserPublicRow({ name: '新用戶' }) as any);

    const repo = new PrismaUserRepository(prisma);
    const result = await repo.createUser({
      name: '新用戶',
      email: 'new@example.com',
      password: 'plaintext',
    });

    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('新用戶');
    expect(result.email).toBe('test@example.com');
  });

  it('建立時傳入的 data 含 valid:1、birthday、uid', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.create).mockResolvedValue(makeUserPublicRow() as any);

    const repo = new PrismaUserRepository(prisma);
    await repo.createUser({ name: 'U', email: 'u@u.com', password: 'pw' });

    const callArg = vi.mocked(prisma.user.create).mock.calls[0][0];
    expect(callArg.data).toMatchObject({ valid: 1, email: 'u@u.com' });
    expect(callArg.data.uid).toHaveLength(12);
    expect(callArg.data.uid).toMatch(/^[A-Za-z0-9]{12}$/);
  });

  it('name 為空字串時，使用 USER-{uid} 作為 name', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.create).mockResolvedValue(makeUserPublicRow() as any);

    const repo = new PrismaUserRepository(prisma);
    await repo.createUser({ name: '', email: 'e@e.com', password: 'pw' });

    const callArg = vi.mocked(prisma.user.create).mock.calls[0][0];
    expect(callArg.data.name).toMatch(/^USER-[A-Za-z0-9]{12}$/);
  });
});

// ── createGoogleUser ───────────────────────────────────────────────────────────

describe('PrismaUserRepository.createGoogleUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 prisma.user.create，data 含 google_uid 且 password 為空字串', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.create).mockResolvedValue(makeUserPublicRow() as any);

    const repo = new PrismaUserRepository(prisma);
    await repo.createGoogleUser({
      googleUid: 'google_xyz',
      email: 'google@example.com',
      name: 'Google 用戶',
      photoUrl: 'https://photo.url',
    });

    const callArg = vi.mocked(prisma.user.create).mock.calls[0][0];
    expect(callArg.data.google_uid).toBe('google_xyz');
    expect(callArg.data.password).toBe('');
    expect(callArg.data.photo_url).toBe('https://photo.url');
  });

  it('name 為 null 時，改用 email 作為 name 和 nickname', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.create).mockResolvedValue(makeUserPublicRow() as any);

    const repo = new PrismaUserRepository(prisma);
    await repo.createGoogleUser({
      googleUid: 'g_id',
      email: 'fallback@example.com',
      name: null,
      photoUrl: null,
    });

    const callArg = vi.mocked(prisma.user.create).mock.calls[0][0];
    expect(callArg.data.name).toBe('fallback@example.com');
    expect(callArg.data.nickname).toBe('fallback@example.com');
  });
});

// ── grantWelcomeCoupon ─────────────────────────────────────────────────────────

describe('PrismaUserRepository.grantWelcomeCoupon', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 prisma.coupon.create，coupon_template_id = 1', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.create).mockResolvedValue({} as any);

    const repo = new PrismaUserRepository(prisma);
    await repo.grantWelcomeCoupon(5);

    expect(prisma.coupon.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ user_id: 5, coupon_template_id: 1 }),
      }),
    );
  });
});
