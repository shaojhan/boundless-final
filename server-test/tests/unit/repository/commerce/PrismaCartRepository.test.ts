import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '#generated/prisma/client.js';
import { PrismaCartRepository } from '../../../../src/repository/commerce/PrismaCartRepository.js';
import type { OrderInput, PriceResult } from '../../../../src/domain/commerce/Cart.js';

// ── Prisma mock factory ────────────────────────────────────────────────────────

function makePrisma() {
  const tx = {
    orderTotal: { create: vi.fn() },
    orderItem: { createMany: vi.fn() },
    coupon: { updateMany: vi.fn() },
  };
  return {
    product: { findMany: vi.fn() },
    coupon: { findFirst: vi.fn() },
    couponTemplate: { findFirst: vi.fn() },
    user: { findFirst: vi.fn() },
    $transaction: vi.fn().mockImplementation((fn: (tx: typeof tx) => Promise<unknown>) =>
      fn(tx)
    ),
    _tx: tx,  // 方便測試存取 transaction mock
  } as unknown as PrismaClient & { _tx: typeof tx };
}

// ── findProductPrices ──────────────────────────────────────────────────────────

describe('PrismaCartRepository.findProductPrices', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳 price 轉為 number', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 1, price: '1000' as any, type: 1 },
      { id: 2, price: '3000' as any, type: 2 },
    ] as any);

    const repo = new PrismaCartRepository(prisma);
    const result = await repo.findProductPrices([1, 2]);

    expect(result).toHaveLength(2);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].price).toBe(1000);
    expect(result[1].price).toBe(3000);
  });

  it('查詢 where: id in 傳入的陣列', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const repo = new PrismaCartRepository(prisma);
    await repo.findProductPrices([3, 4, 5]);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { id: { in: [3, 4, 5] } },
      select: { id: true, price: true, type: true },
    });
  });
});

// ── findValidCoupon ────────────────────────────────────────────────────────────

describe('PrismaCartRepository.findValidCoupon', () => {
  beforeEach(() => vi.clearAllMocks());

  it('有效優惠券 → 回傳 { id }', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue({ id: 10 } as any);

    const repo = new PrismaCartRepository(prisma);
    const result = await repo.findValidCoupon(42, 3);

    expect(prisma.coupon.findFirst).toHaveBeenCalledWith({
      where: { coupon_template_id: 3, user_id: 42, valid: 1 },
      select: { id: true },
    });
    expect(result).toEqual({ id: 10 });
  });

  it('無有效優惠券 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null);

    const repo = new PrismaCartRepository(prisma);
    expect(await repo.findValidCoupon(42, 99)).toBeNull();
  });
});

// ── findCouponTemplate ─────────────────────────────────────────────────────────

describe('PrismaCartRepository.findCouponTemplate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到模板 → 回傳 DiscountRule（discount/requirement 轉 number）', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.couponTemplate.findFirst).mockResolvedValue({
      discount: '100' as any,
      type: 1,
      requirement: '500' as any,
    } as any);

    const repo = new PrismaCartRepository(prisma);
    const result = await repo.findCouponTemplate(3);

    expect(result).not.toBeNull();
    expect(typeof result!.discount).toBe('number');
    expect(result!.discount).toBe(100);
    expect(typeof result!.requirement).toBe('number');
    expect(result!.requirement).toBe(500);
    expect(result!.type).toBe(1);
  });

  it('requirement 為 null → 保持 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.couponTemplate.findFirst).mockResolvedValue({
      discount: '0.9' as any,
      type: 2,
      requirement: null,
    } as any);

    const repo = new PrismaCartRepository(prisma);
    const result = await repo.findCouponTemplate(5);

    expect(result!.requirement).toBeNull();
  });

  it('找不到模板（valid=0 或不存在）→ 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.couponTemplate.findFirst).mockResolvedValue(null);

    const repo = new PrismaCartRepository(prisma);
    expect(await repo.findCouponTemplate(99)).toBeNull();
  });
});

// ── findUserByUid ──────────────────────────────────────────────────────────────

describe('PrismaCartRepository.findUserByUid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到用戶 → 回傳 email/nickname', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      email: 'user@example.com', nickname: '暱稱',
    } as any);

    const repo = new PrismaCartRepository(prisma);
    const result = await repo.findUserByUid('UID000001');

    expect(result!.email).toBe('user@example.com');
    expect(result!.nickname).toBe('暱稱');
  });

  it('找不到 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const repo = new PrismaCartRepository(prisma);
    expect(await repo.findUserByUid('GHOST')).toBeNull();
  });
});

// ── findProductsInfo ───────────────────────────────────────────────────────────

describe('PrismaCartRepository.findProductsInfo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳包含 name 和 price（number）的資訊', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 1, name: '吉他', price: '1000' as any, type: 1 },
    ] as any);

    const repo = new PrismaCartRepository(prisma);
    const result = await repo.findProductsInfo([1]);

    expect(result[0].name).toBe('吉他');
    expect(result[0].price).toBe(1000);
    expect(typeof result[0].price).toBe('number');
  });
});

// ── createOrderTransaction ────────────────────────────────────────────────────

describe('PrismaCartRepository.createOrderTransaction', () => {
  beforeEach(() => vi.clearAllMocks());

  const baseOrderInput: OrderInput = {
    phone: '0912345678',
    country: '台灣',
    township: '中正區',
    postcode: '100',
    address: '某路1號',
    transportationstate: '1',
    cartEntries: [{ id: 1, qty: 2 }, { id: 2, qty: 1 }],
    lessonCUID: null,
    instrumentCUID: null,
    userId: 42,
    userUid: 'UID000001',
  };

  const basePriceResult: PriceResult = {
    lessonTotal: 0,
    instrumentTotal: 2000,
    lessonDiscount: 0,
    instrumentDiscount: 0,
    totalPrice: 2000,
    totalDiscount: 0,
    finalPayment: 2000,
  };

  it('建立 orderTotal 後建立 orderItems', async () => {
    const prisma = makePrisma();
    const tx = (prisma as any)._tx;
    tx.orderTotal.create.mockResolvedValue({ id: 100 });
    tx.orderItem.createMany.mockResolvedValue({ count: 2 });

    const repo = new PrismaCartRepository(prisma);
    await repo.createOrderTransaction(baseOrderInput, basePriceResult, 'OUID000001AB');

    expect(tx.orderTotal.create).toHaveBeenCalledOnce();
    expect(tx.orderItem.createMany).toHaveBeenCalledWith({
      data: [
        { order_id: 100, product_id: 1, quantity: 2, ouid: 'OUID000001AB' },
        { order_id: 100, product_id: 2, quantity: 1, ouid: 'OUID000001AB' },
      ],
    });
  });

  it('lessonCUID 有效 → 作廢對應 coupon', async () => {
    const prisma = makePrisma();
    const tx = (prisma as any)._tx;
    tx.orderTotal.create.mockResolvedValue({ id: 101 });
    tx.orderItem.createMany.mockResolvedValue({ count: 1 });
    tx.coupon.updateMany.mockResolvedValue({ count: 1 });

    const repo = new PrismaCartRepository(prisma);
    await repo.createOrderTransaction(
      { ...baseOrderInput, lessonCUID: '7' },
      basePriceResult,
      'OUID000001AB'
    );

    expect(tx.coupon.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { coupon_template_id: 7, user_id: 42 },
        data: { valid: 0 },
      })
    );
  });

  it("lessonCUID='null' → 不作廢 coupon", async () => {
    const prisma = makePrisma();
    const tx = (prisma as any)._tx;
    tx.orderTotal.create.mockResolvedValue({ id: 102 });
    tx.orderItem.createMany.mockResolvedValue({ count: 1 });

    const repo = new PrismaCartRepository(prisma);
    await repo.createOrderTransaction(
      { ...baseOrderInput, lessonCUID: 'null' },
      basePriceResult,
      'OUID000001AB'
    );

    expect(tx.coupon.updateMany).not.toHaveBeenCalled();
  });

  it('instrumentCUID 有效 → 作廢對應 coupon', async () => {
    const prisma = makePrisma();
    const tx = (prisma as any)._tx;
    tx.orderTotal.create.mockResolvedValue({ id: 103 });
    tx.orderItem.createMany.mockResolvedValue({ count: 1 });
    tx.coupon.updateMany.mockResolvedValue({ count: 1 });

    const repo = new PrismaCartRepository(prisma);
    await repo.createOrderTransaction(
      { ...baseOrderInput, instrumentCUID: '5' },
      basePriceResult,
      'OUID000001AB'
    );

    expect(tx.coupon.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { coupon_template_id: 5, user_id: 42 },
        data: { valid: 0 },
      })
    );
  });

  it('orderTotal.create 傳入正確欄位', async () => {
    const prisma = makePrisma();
    const tx = (prisma as any)._tx;
    tx.orderTotal.create.mockResolvedValue({ id: 104 });
    tx.orderItem.createMany.mockResolvedValue({ count: 1 });

    const repo = new PrismaCartRepository(prisma);
    await repo.createOrderTransaction(baseOrderInput, basePriceResult, 'OUID000001AB');

    const createArg = tx.orderTotal.create.mock.calls[0][0] as any;
    expect(createArg.data.user_id).toBe('UID000001');
    expect(createArg.data.payment).toBe(2000);
    expect(createArg.data.discount).toBe(0);
    expect(createArg.data.postcode).toBe(100);
    expect(createArg.data.ouid).toBe('OUID000001AB');
  });
});
