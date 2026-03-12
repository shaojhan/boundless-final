import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ICouponRepository } from '#src/repository/commerce/ICouponRepository.js';
import type { UserCouponDetail, RedeemResult } from '#src/domain/commerce/Coupon.js';
import { CouponService } from '#src/service/commerce/CouponService.js';

// ── Mock repository factory ────────────────────────────────────────────────────

function makeRepo(): ICouponRepository {
  return {
    findByUserId: vi.fn(),
    create: vi.fn(),
    invalidateById: vi.fn(),
    redeem: vi.fn(),
  };
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const mockDetail: UserCouponDetail = {
  id: 10,
  name: '100元折扣券',
  discount: 100,
  kind: 1,
  type: 1,
  created_time: new Date('2025-01-01'),
  limit_time: '2025-01-08 00:00:00',
  limitNum: 7,
  valid: 1,
  template_id: 3,
};

const redeemSuccess: RedeemResult = {
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

// ── findAll ────────────────────────────────────────────────────────────────────

describe('CouponService.findAll', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.findByUserId 並回傳清單', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findByUserId).mockResolvedValue([mockDetail]);

    const service = new CouponService(repo);
    const result = await service.findAll(42);

    expect(repo.findByUserId).toHaveBeenCalledWith(42);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('100元折扣券');
  });

  it('無優惠券 → 回傳空陣列', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findByUserId).mockResolvedValue([]);

    const service = new CouponService(repo);
    expect(await service.findAll(42)).toEqual([]);
  });

  it('repo 拋出例外 → 錯誤向上傳遞', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findByUserId).mockRejectedValue(new Error('DB 連線失敗'));

    const service = new CouponService(repo);
    await expect(service.findAll(42)).rejects.toThrow('DB 連線失敗');
  });
});

// ── create ─────────────────────────────────────────────────────────────────────

describe('CouponService.create', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.create 並回傳 true', async () => {
    const repo = makeRepo();
    vi.mocked(repo.create).mockResolvedValue(true);

    const service = new CouponService(repo);
    const ok = await service.create(42, 3);

    expect(repo.create).toHaveBeenCalledWith(42, 3);
    expect(ok).toBe(true);
  });

  it('建立失敗 → 回傳 false', async () => {
    const repo = makeRepo();
    vi.mocked(repo.create).mockResolvedValue(false);

    const service = new CouponService(repo);
    expect(await service.create(42, 999)).toBe(false);
  });

  it('repo 拋出例外 → 錯誤向上傳遞', async () => {
    const repo = makeRepo();
    vi.mocked(repo.create).mockRejectedValue(new Error('寫入失敗'));

    const service = new CouponService(repo);
    await expect(service.create(42, 3)).rejects.toThrow('寫入失敗');
  });
});

// ── invalidate ─────────────────────────────────────────────────────────────────

describe('CouponService.invalidate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.invalidateById 並回傳 true', async () => {
    const repo = makeRepo();
    vi.mocked(repo.invalidateById).mockResolvedValue(true);

    const service = new CouponService(repo);
    const ok = await service.invalidate(10);

    expect(repo.invalidateById).toHaveBeenCalledWith(10);
    expect(ok).toBe(true);
  });

  it('找不到優惠券 → 回傳 false', async () => {
    const repo = makeRepo();
    vi.mocked(repo.invalidateById).mockResolvedValue(false);

    const service = new CouponService(repo);
    expect(await service.invalidate(999)).toBe(false);
  });

  it('repo 拋出例外 → 錯誤向上傳遞', async () => {
    const repo = makeRepo();
    vi.mocked(repo.invalidateById).mockRejectedValue(new Error('更新失敗'));

    const service = new CouponService(repo);
    await expect(service.invalidate(10)).rejects.toThrow('更新失敗');
  });
});

// ── redeem ─────────────────────────────────────────────────────────────────────

describe('CouponService.redeem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.redeem 並回傳結果', async () => {
    const repo = makeRepo();
    vi.mocked(repo.redeem).mockResolvedValue(redeemSuccess);

    const service = new CouponService(repo);
    const result = await service.redeem(42, 'SAVE100');

    expect(repo.redeem).toHaveBeenCalledWith(42, 'SAVE100');
    expect(result.success).toBe(true);
  });

  it('couponCode 前後空白被 trim', async () => {
    const repo = makeRepo();
    vi.mocked(repo.redeem).mockResolvedValue(redeemSuccess);

    const service = new CouponService(repo);
    await service.redeem(42, '  SAVE100  ');

    expect(repo.redeem).toHaveBeenCalledWith(42, 'SAVE100');
  });

  it('couponCode 轉為大寫', async () => {
    const repo = makeRepo();
    vi.mocked(repo.redeem).mockResolvedValue(redeemSuccess);

    const service = new CouponService(repo);
    await service.redeem(42, 'save100');

    expect(repo.redeem).toHaveBeenCalledWith(42, 'SAVE100');
  });

  it('trim + toUpperCase 同時套用', async () => {
    const repo = makeRepo();
    vi.mocked(repo.redeem).mockResolvedValue(redeemSuccess);

    const service = new CouponService(repo);
    await service.redeem(42, '  save100  ');

    expect(repo.redeem).toHaveBeenCalledWith(42, 'SAVE100');
  });

  it('兌換失敗 → 回傳 success=false', async () => {
    const repo = makeRepo();
    vi.mocked(repo.redeem).mockResolvedValue({
      success: false,
      message: '折扣碼無效或已過期',
    });

    const service = new CouponService(repo);
    const result = await service.redeem(42, 'INVALID');

    expect(result.success).toBe(false);
    expect(result.coupon).toBeUndefined();
  });

  it('已是大寫 → 原樣傳遞（idempotent）', async () => {
    const repo = makeRepo();
    vi.mocked(repo.redeem).mockResolvedValue(redeemSuccess);

    const service = new CouponService(repo);
    await service.redeem(42, 'SAVE100');

    expect(repo.redeem).toHaveBeenCalledWith(42, 'SAVE100');
  });

  it('僅空白字元 → trim 後傳空字串給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.redeem).mockResolvedValue({
      success: false,
      message: '折扣碼無效或已過期',
    });

    const service = new CouponService(repo);
    await service.redeem(42, '   ');

    expect(repo.redeem).toHaveBeenCalledWith(42, '');
  });

  it('repo 拋出例外 → 錯誤向上傳遞', async () => {
    const repo = makeRepo();
    vi.mocked(repo.redeem).mockRejectedValue(new Error('兌換 DB 錯誤'));

    const service = new CouponService(repo);
    await expect(service.redeem(42, 'SAVE100')).rejects.toThrow('兌換 DB 錯誤');
  });
});
