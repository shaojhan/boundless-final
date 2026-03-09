import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '#generated/prisma/client.js';
import { PrismaUserProfileRepository } from '../../../../src/repository/user/PrismaUserProfileRepository.js';

// ── Prisma mock factory ────────────────────────────────────────────────────────

function makePrisma() {
  return {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    jam: {
      findUnique: vi.fn(),
    },
    orderTotal: {
      findMany: vi.fn(),
    },
  } as unknown as PrismaClient;
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const userRow = {
  id: 1,
  uid: 'UID000001',
  name: '測試用戶',
  email: 'test@example.com',
  nickname: '暱稱',
  phone: null,
  birthday: null,
  postcode: null,
  country: null,
  township: null,
  address: null,
  genre_like: '搖滾',
  play_instrument: '吉他',
  info: null,
  gender: 'M',
  privacy: 0,
  google_uid: null,
  my_jam: null,
  photo_url: null,
  my_lesson: null,
  img: null,
  valid: 1,
};

// ── findById ───────────────────────────────────────────────────────────────────

describe('PrismaUserProfileRepository.findById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到用戶 → 回傳 camelCase domain 物件', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(userRow as any);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.findById(1);

    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1, valid: 1 } })
    );
    expect(result).not.toBeNull();
    expect(result!.genreLike).toBe('搖滾');
    expect(result!.playInstrument).toBe('吉他');
    expect(result!.googleUid).toBeNull();
  });

  it('找不到（null）→ 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const repo = new PrismaUserProfileRepository(prisma);
    expect(await repo.findById(999)).toBeNull();
  });
});

// ── findByUid ──────────────────────────────────────────────────────────────────

describe('PrismaUserProfileRepository.findByUid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到用戶 → 回傳 profile', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(userRow as any);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.findByUid('UID000001');

    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { uid: 'UID000001', valid: 1 } })
    );
    expect(result!.uid).toBe('UID000001');
  });

  it('uid 不存在 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const repo = new PrismaUserProfileRepository(prisma);
    expect(await repo.findByUid('GHOST')).toBeNull();
  });
});

// ── getPublicHomepage ──────────────────────────────────────────────────────────

describe('PrismaUserProfileRepository.getPublicHomepage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('用戶不存在 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const repo = new PrismaUserProfileRepository(prisma);
    expect(await repo.getPublicHomepage('GHOST')).toBeNull();
  });

  it('my_jam 為 null → my_jam/my_jamState 均為 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      ...userRow, my_jam: null,
    } as any);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.getPublicHomepage('UID000001');

    expect(result).not.toBeNull();
    expect(result!.my_jam).toBeNull();
    expect(result!.my_jamState).toBeNull();
    expect(prisma.jam.findUnique).not.toHaveBeenCalled();
  });

  it('my_jam 有值 → 查詢 jam 並回傳 name/state', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      ...userRow, my_jam: 'JUID0000001A',
    } as any);
    vi.mocked(prisma.jam.findUnique).mockResolvedValue({
      state: 1, name: '搖滾樂團',
    } as any);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.getPublicHomepage('UID000001');

    expect(prisma.jam.findUnique).toHaveBeenCalledWith({
      where: { juid: 'JUID0000001A' },
      select: { state: true, name: true },
    });
    expect(result!.my_jam).toBe('搖滾樂團');
    expect(result!.my_jamState).toBe(1);
  });

  it('my_jam 有值但 jam 找不到 → my_jam/my_jamState 為 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      ...userRow, my_jam: 'JUID_MISSING',
    } as any);
    vi.mocked(prisma.jam.findUnique).mockResolvedValue(null);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.getPublicHomepage('UID000001');

    expect(result!.my_jam).toBeNull();
    expect(result!.my_jamState).toBeNull();
  });
});

// ── getUserWithJam ─────────────────────────────────────────────────────────────

describe('PrismaUserProfileRepository.getUserWithJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找不到用戶 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const repo = new PrismaUserProfileRepository(prisma);
    expect(await repo.getUserWithJam(999)).toBeNull();
  });

  it('my_jam 有值 → 填入 my_jamState/my_jamname', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      ...userRow, my_jam: 'JUID0000001A',
    } as any);
    vi.mocked(prisma.jam.findUnique).mockResolvedValue({
      state: 0, name: 'JAM-JUID0000001A',
    } as any);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.getUserWithJam(1);

    expect(result!.my_jamState).toBe(0);
    expect(result!.my_jamname).toBe('JAM-JUID0000001A');
  });

  it('my_jam 為 null → my_jamState/my_jamname 為 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      ...userRow, my_jam: null,
    } as any);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.getUserWithJam(1);

    expect(result!.my_jamState).toBeNull();
    expect(result!.my_jamname).toBeNull();
  });
});

// ── updateProfile ──────────────────────────────────────────────────────────────

describe('PrismaUserProfileRepository.updateProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 user.update 並回傳 camelCase profile', async () => {
    const prisma = makePrisma();
    const updatedRow = { ...userRow, nickname: '新暱稱' };
    vi.mocked(prisma.user.update).mockResolvedValue(updatedRow as any);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.updateProfile(1, { nickname: '新暱稱' });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } })
    );
    expect(result.nickname).toBe('新暱稱');
  });

  it('genreLike 欄位映射為 genre_like', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.update).mockResolvedValue(userRow as any);

    const repo = new PrismaUserProfileRepository(prisma);
    await repo.updateProfile(1, { genreLike: '爵士' });

    const callArg = vi.mocked(prisma.user.update).mock.calls[0][0] as any;
    expect(callArg.data.genre_like).toBe('爵士');
    expect(callArg.data.genreLike).toBeUndefined();
  });
});

// ── updateAvatar ───────────────────────────────────────────────────────────────

describe('PrismaUserProfileRepository.updateAvatar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 user.update 更新 img 欄位', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    const repo = new PrismaUserProfileRepository(prisma);
    await repo.updateAvatar(1, 'new_avatar.jpg');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { img: 'new_avatar.jpg' },
    });
  });
});

// ── getOrders ─────────────────────────────────────────────────────────────────

describe('PrismaUserProfileRepository.getOrders', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無訂單 → 回傳空陣列', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.orderTotal.findMany).mockResolvedValue([]);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.getOrders('UID000001');

    expect(result).toEqual([]);
  });

  it('有訂單 → 過濾掉無 orderItems 的訂單', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.orderTotal.findMany).mockResolvedValue([
      {
        id: 10,
        user_id: 'UID000001',
        payment: 1000,
        discount: 0,
        orderItems: [],  // 無項目 → 過濾掉
      },
      {
        id: 11,
        user_id: 'UID000001',
        payment: 500,
        discount: 0,
        orderItems: [
          {
            id: 1,
            order_id: 11,
            product_id: 101,
            quantity: 2,
            ouid: 'OUID001',
            product: { id: 101, name: '商品A', price: 250, type: 1 },
          },
        ],
      },
    ] as any);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.getOrders('UID000001');

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].name).toBe('商品A');
    expect(result[0][0].payment).toBe(500);
  });

  it('多筆訂單各含多個 items → 正確展開', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.orderTotal.findMany).mockResolvedValue([
      {
        id: 20,
        user_id: 'UID000001',
        payment: 3000,
        discount: 200,
        orderItems: [
          { id: 1, product_id: 201, quantity: 1, ouid: 'O1', product: { id: 201, name: '課程A', price: 2000, type: 2 } },
          { id: 2, product_id: 202, quantity: 2, ouid: 'O1', product: { id: 202, name: '樂器B', price: 500, type: 1 } },
        ],
      },
    ] as any);

    const repo = new PrismaUserProfileRepository(prisma);
    const result = await repo.getOrders('UID000001');

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
    expect(result[0][0].name).toBe('課程A');
    expect(result[0][1].name).toBe('樂器B');
  });
});
