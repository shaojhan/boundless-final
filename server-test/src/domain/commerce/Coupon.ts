/**
 * Coupon — Commerce domain types for coupons.
 * Pure TypeScript, no Prisma / Express imports.
 */

export interface CouponTemplate {
  id: number;
  name: string;
  discount: number;
  kind: number;
  type: number;         // 1=fixed amount, 2=percentage
  requirement: number | null;
  couponCode: string | null;
  valid: number;
}

export interface UserCoupon {
  id: number;
  userId: number;
  templateId: number;
  createdTime: Date;
  valid: number;
}

/** Enriched coupon returned to client (coupon + template data) */
export interface UserCouponDetail {
  id: number;
  name: string | undefined;
  discount: number | undefined;
  kind: number | undefined;
  type: number | undefined;
  created_time: Date;
  limit_time: string;
  limitNum: number;
  valid: number;
  template_id: number | undefined;
}

export interface RedeemResult {
  success: boolean;
  message: string;
  coupon?: {
    name: string;
    discount: number;
    kind: number;
    type: number;
    limit_time: string;
  };
}
