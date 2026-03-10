import { describe, it, expect } from 'vitest';
import type {
  CartEntry,
  ProductRow,
  PriceResult,
  OrderInput,
} from '#src/domain/commerce/Cart.js';

// ── CartEntry 型別結構測試 ──────────────────────────────────────────────────────

describe('CartEntry domain type', () => {
  it('包含 id 和 qty', () => {
    const entry: CartEntry = { id: 1, qty: 2 };
    expect(entry.id).toBe(1);
    expect(entry.qty).toBe(2);
  });
});

// ── ProductRow 型別結構測試 ─────────────────────────────────────────────────────

describe('ProductRow domain type', () => {
  it('type=1 為樂器', () => {
    const product: ProductRow = { id: 10, price: 500, type: 1 };
    expect(product.type).toBe(1);
  });

  it('type=2 為課程', () => {
    const product: ProductRow = { id: 20, price: 3000, type: 2 };
    expect(product.type).toBe(2);
  });
});

// ── PriceResult 型別結構測試 ────────────────────────────────────────────────────

describe('PriceResult domain type', () => {
  it('finalPayment = totalPrice - totalDiscount', () => {
    const result: PriceResult = {
      lessonTotal: 3000,
      instrumentTotal: 1000,
      lessonDiscount: 200,
      instrumentDiscount: 100,
      totalPrice: 4000,
      totalDiscount: 300,
      finalPayment: 3700,
    };

    expect(result.finalPayment).toBe(result.totalPrice - result.totalDiscount);
  });

  it('無折扣時 finalPayment = totalPrice', () => {
    const result: PriceResult = {
      lessonTotal: 2000,
      instrumentTotal: 0,
      lessonDiscount: 0,
      instrumentDiscount: 0,
      totalPrice: 2000,
      totalDiscount: 0,
      finalPayment: 2000,
    };

    expect(result.finalPayment).toBe(result.totalPrice);
  });
});

// ── OrderInput 型別結構測試 ─────────────────────────────────────────────────────

describe('OrderInput domain type', () => {
  it('userId 為整數（JWT id），userUid 為字串（DB uid）', () => {
    const input: OrderInput = {
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

    expect(typeof input.userId).toBe('number');
    expect(typeof input.userUid).toBe('string');
  });

  it('lessonCUID / instrumentCUID 可為 null', () => {
    const input: OrderInput = {
      phone: '0912',
      country: '台',
      township: '區',
      postcode: '100',
      address: '路',
      transportationstate: '0',
      cartEntries: [],
      lessonCUID: null,
      instrumentCUID: null,
      userId: 1,
      userUid: 'UID000001',
    };

    expect(input.lessonCUID).toBeNull();
    expect(input.instrumentCUID).toBeNull();
  });
});
