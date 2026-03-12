import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock mail transporter to avoid SMTP config at import time
vi.mock('#configs/mail', () => ({
  default: { sendMail: vi.fn().mockResolvedValue(undefined) },
}));

import type { ICartRepository, ProductPrice, DiscountRule } from '#src/repository/commerce/ICartRepository.js';
import type { CartEntry, OrderInput } from '#src/domain/commerce/Cart.js';
import { CartService } from '#src/service/commerce/CartService.js';

// ── Mock repository factory ────────────────────────────────────────────────────

function makeRepo(): ICartRepository {
  return {
    findProductPrices: vi.fn(),
    findProductStocks: vi.fn(),
    findValidCoupon: vi.fn(),
    findCouponTemplate: vi.fn(),
    createOrderTransaction: vi.fn(),
    findUserByUid: vi.fn(),
    findProductsInfo: vi.fn(),
  };
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const instrumentProduct: ProductPrice = { id: 1, price: 1000, type: 1 };
const lessonProduct: ProductPrice = { id: 2, price: 3000, type: 2 };

// ── calcPrice — 基本小計 ────────────────────────────────────────────────────────

describe('CartService.calcPrice — 基本小計', () => {
  beforeEach(() => vi.clearAllMocks());

  it('樂器（type=1）price × qty', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 3 }], 42, null, null
    );

    expect(result.instrumentTotal).toBe(3000);
    expect(result.lessonTotal).toBe(0);
    expect(result.finalPayment).toBe(3000);
  });

  it('課程（type=2）price 不乘 qty', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([lessonProduct]);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 2, qty: 5 }], 42, null, null
    );

    expect(result.lessonTotal).toBe(3000);  // 固定 3000，不乘 5
    expect(result.instrumentTotal).toBe(0);
    expect(result.finalPayment).toBe(3000);
  });

  it('樂器 + 課程混合計算', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([
      instrumentProduct,
      lessonProduct,
    ]);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 2 }, { id: 2, qty: 1 }], 42, null, null
    );

    expect(result.instrumentTotal).toBe(2000);
    expect(result.lessonTotal).toBe(3000);
    expect(result.totalPrice).toBe(5000);
    expect(result.finalPayment).toBe(5000);
  });

  it('product 找不到 → 略過該項（continue）', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([]);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 99, qty: 1 }], 42, null, null
    );

    expect(result.totalPrice).toBe(0);
    expect(result.finalPayment).toBe(0);
  });
});

// ── calcPrice — qty 驗證 ────────────────────────────────────────────────────────

describe('CartService.calcPrice — qty 驗證', () => {
  beforeEach(() => vi.clearAllMocks());

  it('qty=0 → 拋出 400 錯誤', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);

    const service = new CartService(repo);
    const err = await service.calcPrice(
      [{ id: 1, qty: 0 }], 42, null, null
    ).catch((e) => e);

    expect(err.message).toMatch(/數量不合法/);
    expect(err.statusCode).toBe(400);
  });

  it('qty=-1 → 拋出 400 錯誤', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);

    const service = new CartService(repo);
    const err = await service.calcPrice(
      [{ id: 1, qty: -1 }], 42, null, null
    ).catch((e) => e);

    expect(err.statusCode).toBe(400);
  });

  it('qty 小數 → Math.trunc 後有效（qty=2.7 → 2）', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 2.7 as unknown as number }], 42, null, null
    );

    expect(result.instrumentTotal).toBe(2000);  // 1000 * 2
  });
});

// ── calcPrice — 折扣計算（type=1 固定金額）───────────────────────────────────

describe('CartService.calcPrice — 固定金額折扣（type=1）', () => {
  beforeEach(() => vi.clearAllMocks());

  const fixedTemplate: DiscountRule = { discount: 100, type: 1, requirement: null };

  it('無門檻 → 折扣 = min(discount, subtotal)', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);
    vi.mocked(repo.findValidCoupon).mockResolvedValue({ id: 10 });
    vi.mocked(repo.findCouponTemplate).mockResolvedValue(fixedTemplate);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 1 }], 42, null, '5'  // instrumentCUID='5'
    );

    expect(result.instrumentDiscount).toBe(100);
    expect(result.finalPayment).toBe(900);
  });

  it('折扣 > subtotal → 折扣 = subtotal（min 保護）', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([
      { id: 1, price: 50, type: 1 },
    ]);
    vi.mocked(repo.findValidCoupon).mockResolvedValue({ id: 10 });
    vi.mocked(repo.findCouponTemplate).mockResolvedValue(fixedTemplate);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 1 }], 42, null, '5'
    );

    expect(result.instrumentDiscount).toBe(50);  // min(100, 50)
    expect(result.finalPayment).toBe(0);
  });

  it('門檻未達 → 不折扣', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);
    vi.mocked(repo.findValidCoupon).mockResolvedValue({ id: 10 });
    vi.mocked(repo.findCouponTemplate).mockResolvedValue({
      discount: 200,
      type: 1,
      requirement: 2000,  // 門檻 2000，subtotal=1000
    });

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 1 }], 42, null, '5'
    );

    expect(result.instrumentDiscount).toBe(0);
    expect(result.finalPayment).toBe(1000);
  });
});

// ── calcPrice — 折扣計算（type=2 百分比）────────────────────────────────────────

describe('CartService.calcPrice — 百分比折扣（type=2）', () => {
  beforeEach(() => vi.clearAllMocks());

  it('discount=0.9（九折）→ Math.round(subtotal * 0.1)', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([lessonProduct]);
    vi.mocked(repo.findValidCoupon).mockResolvedValue({ id: 20 });
    vi.mocked(repo.findCouponTemplate).mockResolvedValue({
      discount: 0.9,
      type: 2,
      requirement: null,
    });

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 2, qty: 1 }], 42, '7', null  // lessonCUID='7'
    );

    // Math.round(3000 * (1 - 0.9)) = Math.round(300) = 300
    expect(result.lessonDiscount).toBe(300);
    expect(result.finalPayment).toBe(2700);
  });
});

// ── calcPrice — cuid 無效值 ──────────────────────────────────────────────────────

describe('CartService.calcPrice — cuid 無效值不套用折扣', () => {
  beforeEach(() => vi.clearAllMocks());

  it("cuid='null' → 不查詢折扣", async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 1 }], 42, null, 'null'
    );

    expect(repo.findValidCoupon).not.toHaveBeenCalled();
    expect(result.instrumentDiscount).toBe(0);
  });

  it("cuid='undefined' → 不查詢折扣", async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 1 }], 42, null, 'undefined'
    );

    expect(repo.findValidCoupon).not.toHaveBeenCalled();
    expect(result.instrumentDiscount).toBe(0);
  });

  it('cuid=null → 不查詢折扣', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 1 }], 42, null, null
    );

    expect(repo.findValidCoupon).not.toHaveBeenCalled();
    expect(result.instrumentDiscount).toBe(0);
  });

  it("cuid 非數字字串（'abc'）→ isNaN → 不折扣", async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 1 }], 42, null, 'abc'
    );

    expect(repo.findValidCoupon).not.toHaveBeenCalled();
    expect(result.instrumentDiscount).toBe(0);
  });

  it('coupon 不存在 → 不折扣', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);
    vi.mocked(repo.findValidCoupon).mockResolvedValue(null);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 1 }], 42, null, '5'
    );

    expect(result.instrumentDiscount).toBe(0);
  });

  it('couponTemplate 不存在 → 不折扣', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);
    vi.mocked(repo.findValidCoupon).mockResolvedValue({ id: 10 });
    vi.mocked(repo.findCouponTemplate).mockResolvedValue(null);

    const service = new CartService(repo);
    const result = await service.calcPrice(
      [{ id: 1, qty: 1 }], 42, null, '5'
    );

    expect(result.instrumentDiscount).toBe(0);
  });
});

// ── submitOrder ────────────────────────────────────────────────────────────────

describe('CartService.submitOrder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('計算後呼叫 repo.createOrderTransaction', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findProductPrices).mockResolvedValue([instrumentProduct]);
    vi.mocked(repo.createOrderTransaction).mockResolvedValue();
    vi.mocked(repo.findUserByUid).mockResolvedValue(null);  // fire-and-forget early return

    const orderInput: OrderInput = {
      phone: '0912345678',
      country: '台灣',
      township: '中正區',
      postcode: '100',
      address: '某路1號',
      transportationstate: '1',
      cartEntries: [{ id: 1, qty: 2 }],
      lessonCUID: null,
      instrumentCUID: null,
      userId: 42,
      userUid: 'UID000001',
    };

    const service = new CartService(repo);
    await service.submitOrder(orderInput);

    expect(repo.createOrderTransaction).toHaveBeenCalledOnce();
    const [callInput, callPriceResult, ouid] =
      vi.mocked(repo.createOrderTransaction).mock.calls[0];

    expect(callInput).toBe(orderInput);
    expect(callPriceResult.instrumentTotal).toBe(2000);
    expect(typeof ouid).toBe('string');
    expect(ouid).toHaveLength(12);
  });
});
