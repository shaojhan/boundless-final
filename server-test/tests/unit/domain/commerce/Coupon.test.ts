import { describe, it, expect } from 'vitest';
import type {
  CouponTemplate,
  UserCoupon,
  UserCouponDetail,
  RedeemResult,
} from '#src/domain/commerce/Coupon.js';

// ── CouponTemplate 型別結構測試 ─────────────────────────────────────────────────

describe('CouponTemplate domain type', () => {
  it('type=1 為固定金額折扣', () => {
    const tmpl: CouponTemplate = {
      id: 1,
      name: '100元折扣券',
      discount: 100,
      kind: 1,
      type: 1,
      requirement: 500,
      couponCode: 'SAVE100',
      valid: 1,
    };

    expect(tmpl.type).toBe(1);
    expect(tmpl.requirement).toBe(500);
    expect(tmpl.couponCode).toBe('SAVE100');
  });

  it('type=2 為百分比折扣，requirement 可為 null', () => {
    const tmpl: CouponTemplate = {
      id: 2,
      name: '九折券',
      discount: 0.9,
      kind: 2,
      type: 2,
      requirement: null,
      couponCode: null,
      valid: 1,
    };

    expect(tmpl.type).toBe(2);
    expect(tmpl.requirement).toBeNull();
    expect(tmpl.couponCode).toBeNull();
  });
});

// ── UserCoupon 型別結構測試 ─────────────────────────────────────────────────────

describe('UserCoupon domain type', () => {
  it('包含用戶 ID 與模板 ID 關聯', () => {
    const coupon: UserCoupon = {
      id: 10,
      userId: 42,
      templateId: 1,
      createdTime: new Date('2025-01-01'),
      valid: 1,
    };

    expect(coupon.userId).toBe(42);
    expect(coupon.templateId).toBe(1);
    expect(coupon.valid).toBe(1);
  });
});

// ── UserCouponDetail 型別結構測試 ───────────────────────────────────────────────

describe('UserCouponDetail domain type', () => {
  it('包含 limit_time 和 limitNum 計算欄位', () => {
    const detail: UserCouponDetail = {
      id: 10,
      name: '100元折扣券',
      discount: 100,
      kind: 1,
      type: 1,
      created_time: new Date('2025-01-01'),
      limit_time: '2025-01-08 00:00:00',
      limitNum: 7,
      valid: 1,
      template_id: 1,
    };

    expect(detail.limit_time).toBe('2025-01-08 00:00:00');
    expect(detail.limitNum).toBe(7);
  });

  it('name/discount/kind/type/template_id 可為 undefined（template 遺失情境）', () => {
    const detail: UserCouponDetail = {
      id: 99,
      name: undefined,
      discount: undefined,
      kind: undefined,
      type: undefined,
      created_time: new Date(),
      limit_time: '2025-12-31 23:59:59',
      limitNum: 0,
      valid: 0,
      template_id: undefined,
    };

    expect(detail.name).toBeUndefined();
    expect(detail.template_id).toBeUndefined();
  });
});

// ── RedeemResult 型別結構測試 ───────────────────────────────────────────────────

describe('RedeemResult domain type', () => {
  it('兌換成功 → success=true，含 coupon 資訊', () => {
    const result: RedeemResult = {
      success: true,
      message: '兌換成功！',
      coupon: {
        name: '100元折扣券',
        discount: 100,
        kind: 1,
        type: 1,
        limit_time: '2025-08-01 00:00:00',
      },
    };

    expect(result.success).toBe(true);
    expect(result.coupon).toBeDefined();
    expect(result.coupon!.name).toBe('100元折扣券');
  });

  it('兌換失敗 → success=false，coupon 為 undefined', () => {
    const result: RedeemResult = {
      success: false,
      message: '折扣碼無效或已過期',
    };

    expect(result.success).toBe(false);
    expect(result.coupon).toBeUndefined();
  });
});
