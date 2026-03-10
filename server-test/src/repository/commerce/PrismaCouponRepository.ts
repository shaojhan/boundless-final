import { format, addDays, differenceInDays } from 'date-fns';
import type { PrismaClient } from '#generated/prisma/client.js';
import type { ICouponRepository } from './ICouponRepository.js';
import type { UserCouponDetail, RedeemResult } from '#domain/commerce/Coupon.js';

export class PrismaCouponRepository implements ICouponRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: number): Promise<UserCouponDetail[]> {
    const coupons = await this.prisma.coupon.findMany({
      where: { user_id: userId },
      include: { couponTemplate: true },
    });

    return coupons.map((v) => {
      const tmpl = v.couponTemplate;
      const limit_time = format(
        addDays(new Date(v.created_time), 7),
        'yyyy-MM-dd HH:mm:ss'
      );
      return {
        id: v.id,
        name: tmpl?.name,
        discount: tmpl ? Number(tmpl.discount) : undefined,
        kind: tmpl?.kind ?? undefined,
        type: tmpl?.type ?? undefined,
        created_time: v.created_time,
        limit_time,
        limitNum: differenceInDays(new Date(limit_time), new Date(v.created_time)),
        valid: v.valid,
        template_id: tmpl?.id,
      };
    });
  }

  async create(userId: number, templateId: number): Promise<boolean> {
    try {
      await this.prisma.coupon.create({
        data: {
          user_id: userId,
          coupon_template_id: templateId,
          created_time: new Date(),
          valid: 1,
        },
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async invalidateById(couponId: number): Promise<boolean> {
    try {
      await this.prisma.coupon.update({
        where: { id: couponId },
        data: { valid: 0 },
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async redeem(userId: number, couponCode: string): Promise<RedeemResult> {
    try {
      const tmpl = await this.prisma.couponTemplate.findFirst({
        where: { coupon_code: couponCode, valid: 1 },
      });
      if (!tmpl) {
        return { success: false, message: '折扣碼無效或已過期' };
      }

      const existing = await this.prisma.coupon.findFirst({
        where: { user_id: userId, coupon_template_id: tmpl.id, valid: 1 },
      });
      if (existing) {
        return { success: false, message: '您已擁有此優惠券' };
      }

      const now = new Date();
      await this.prisma.coupon.create({
        data: {
          user_id: userId,
          coupon_template_id: tmpl.id,
          created_time: now,
          valid: 1,
        },
      });

      const limit_time = format(addDays(now, 7), 'yyyy-MM-dd HH:mm:ss');
      return {
        success: true,
        message: '兌換成功！',
        coupon: {
          name: tmpl.name,
          discount: Number(tmpl.discount),
          kind: tmpl.kind,
          type: tmpl.type,
          limit_time,
        },
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: '伺服器錯誤，請稍後再試' };
    }
  }
}
