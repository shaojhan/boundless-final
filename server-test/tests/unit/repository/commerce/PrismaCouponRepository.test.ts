import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '#generated/prisma/client.js';
import { PrismaCouponRepository } from '../../../../src/repository/commerce/PrismaCouponRepository.js';

// ── Prisma mock factory ────────────────────────────────────────────────────────

function makePrisma() {
  return {
    coupon: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    couponTemplate: {
      findFirst: vi.fn(),
    },
  } as unknown as PrismaClient;
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const now = new Date('2025-06-01T00:00:00Z');

function makeCouponRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    user_id: 42,
    coupon_template_id: 3,
    created_time: now,
    valid: 1,
    couponTemplate: {
      id: 3,
      name: '100元折扣券',
      discount: '100',
      kind: 1,
      type: 1,
    },
    ...overrides,
  };
}

function makeTemplateRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 3,
    name: '100元折扣券',
    discount: '100',
    kind: 1,
    type: 1,
    requirement: null,
    coupon_code: 'SAVE100',
    valid: 1,
    ...overrides,
  };
}

// ── findByUserId ───────────────────────────────────────────────────────────────

describe('PrismaCouponRepository.findByUserId', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無優惠券 → 回傳空陣列', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.findMany).mockResolvedValue([]);

    const repo = new PrismaCouponRepository(prisma);
    const result = await repo.findByUserId(42);

    expect(result).toEqual([]);
  });

  it('正確計算 limit_time（+7天）和 limitNum（=7）', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.findMany).mockResolvedValue([
      makeCouponRow() as any,
    ]);

    const repo = new PrismaCouponRepository(prisma);
    const result = await repo.findByUserId(42);

    expect(result).toHaveLength(1);
    expect(result[0].limitNum).toBe(7);
    expect(result[0].limit_time).toMatch(/2025-06-08/);
  });

  it('discount 轉為 number', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.findMany).mockResolvedValue([
      makeCouponRow() as any,
    ]);

    const repo = new PrismaCouponRepository(prisma);
    const result = await repo.findByUserId(42);

    expect(typeof result[0].discount).toBe('number');
    expect(result[0].discount).toBe(100);
  });

  it('couponTemplate 為 null → name/discount/kind/type/template_id 為 undefined', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.findMany).mockResolvedValue([
      makeCouponRow({ couponTemplate: null }) as any,
    ]);

    const repo = new PrismaCouponRepository(prisma);
    const result = await repo.findByUserId(42);

    expect(result[0].name).toBeUndefined();
    expect(result[0].discount).toBeUndefined();
    expect(result[0].template_id).toBeUndefined();
  });

  it('回傳多張優惠券', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.findMany).mockResolvedValue([
      makeCouponRow({ id: 10 }) as any,
      makeCouponRow({ id: 11, valid: 0 }) as any,
    ]);

    const repo = new PrismaCouponRepository(prisma);
    const result = await repo.findByUserId(42);

    expect(result).toHaveLength(2);
    expect(result[1].valid).toBe(0);
  });
});

// ── create ─────────────────────────────────────────────────────────────────────

describe('PrismaCouponRepository.create', () => {
  beforeEach(() => vi.clearAllMocks());

  it('成功建立 → 回傳 true', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.create).mockResolvedValue({} as any);

    const repo = new PrismaCouponRepository(prisma);
    expect(await repo.create(42, 3)).toBe(true);

    expect(prisma.coupon.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_id: 42,
        coupon_template_id: 3,
        valid: 1,
      }),
    });
  });

  it('DB 拋出例外 → 回傳 false', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.create).mockRejectedValue(new Error('DB error'));

    const repo = new PrismaCouponRepository(prisma);
    expect(await repo.create(42, 3)).toBe(false);
  });
});

// ── invalidateById ─────────────────────────────────────────────────────────────

describe('PrismaCouponRepository.invalidateById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('成功更新 valid=0 → 回傳 true', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.update).mockResolvedValue({} as any);

    const repo = new PrismaCouponRepository(prisma);
    expect(await repo.invalidateById(10)).toBe(true);

    expect(prisma.coupon.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { valid: 0 },
    });
  });

  it('DB 拋出例外 → 回傳 false', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.update).mockRejectedValue(new Error('not found'));

    const repo = new PrismaCouponRepository(prisma);
    expect(await repo.invalidateById(999)).toBe(false);
  });
});

// ── redeem ─────────────────────────────────────────────────────────────────────

describe('PrismaCouponRepository.redeem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('折扣碼不存在或 valid=0 → success=false', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.couponTemplate.findFirst).mockResolvedValue(null);

    const repo = new PrismaCouponRepository(prisma);
    const result = await repo.redeem(42, 'INVALID');

    expect(result.success).toBe(false);
    expect(result.message).toBe('折扣碼無效或已過期');
    expect(prisma.coupon.findFirst).not.toHaveBeenCalled();
  });

  it('用戶已擁有此優惠券（valid=1）→ success=false', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.couponTemplate.findFirst).mockResolvedValue(
      makeTemplateRow() as any
    );
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue({ id: 10 } as any);

    const repo = new PrismaCouponRepository(prisma);
    const result = await repo.redeem(42, 'SAVE100');

    expect(result.success).toBe(false);
    expect(result.message).toBe('您已擁有此優惠券');
    expect(prisma.coupon.create).not.toHaveBeenCalled();
  });

  it('成功兌換 → success=true，回傳 coupon 資訊', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.couponTemplate.findFirst).mockResolvedValue(
      makeTemplateRow() as any
    );
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.coupon.create).mockResolvedValue({} as any);

    const repo = new PrismaCouponRepository(prisma);
    const result = await repo.redeem(42, 'SAVE100');

    expect(result.success).toBe(true);
    expect(result.message).toBe('兌換成功！');
    expect(result.coupon).toBeDefined();
    expect(result.coupon!.name).toBe('100元折扣券');
    expect(result.coupon!.discount).toBe(100);
    expect(result.coupon!.limit_time).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('建立優惠券時查詢使用大寫的 couponCode', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.couponTemplate.findFirst).mockResolvedValue(
      makeTemplateRow() as any
    );
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.coupon.create).mockResolvedValue({} as any);

    const repo = new PrismaCouponRepository(prisma);
    await repo.redeem(42, 'SAVE100');

    expect(prisma.couponTemplate.findFirst).toHaveBeenCalledWith({
      where: { coupon_code: 'SAVE100', valid: 1 },
    });
  });

  it('DB 拋出例外 → 回傳 success=false，伺服器錯誤訊息', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.couponTemplate.findFirst).mockRejectedValue(new Error('DB error'));

    const repo = new PrismaCouponRepository(prisma);
    const result = await repo.redeem(42, 'SAVE100');

    expect(result.success).toBe(false);
    expect(result.message).toBe('伺服器錯誤，請稍後再試');
  });
});
