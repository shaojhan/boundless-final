import type { ICouponRepository } from '../../repository/commerce/ICouponRepository.js';
import type { UserCouponDetail, RedeemResult } from '../../domain/commerce/Coupon.js';

export class CouponService {
  constructor(private readonly repo: ICouponRepository) {}

  async findAll(userId: number): Promise<UserCouponDetail[]> {
    return this.repo.findByUserId(userId);
  }

  async create(userId: number, templateId: number): Promise<boolean> {
    return this.repo.create(userId, templateId);
  }

  async invalidate(couponId: number): Promise<boolean> {
    return this.repo.invalidateById(couponId);
  }

  async redeem(userId: number, couponCode: string): Promise<RedeemResult> {
    return this.repo.redeem(userId, couponCode.trim().toUpperCase());
  }
}
