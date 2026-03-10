import type { UserCouponDetail, RedeemResult } from '#domain/commerce/Coupon.js';

export interface ICouponRepository {
  findByUserId(userId: number): Promise<UserCouponDetail[]>;
  create(userId: number, templateId: number): Promise<boolean>;
  invalidateById(couponId: number): Promise<boolean>;
  redeem(userId: number, couponCode: string): Promise<RedeemResult>;
}
