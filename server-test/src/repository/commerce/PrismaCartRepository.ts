import type { PrismaClient } from '#generated/prisma/client.js';
import type { ICartRepository, ProductPrice, ProductInfo, DiscountRule, UserEmailInfo } from './ICartRepository.js';
import type { CartEntry, OrderInput, PriceResult } from '../../domain/commerce/Cart.js';

export class PrismaCartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findProductPrices(ids: number[]): Promise<ProductPrice[]> {
    const rows = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, price: true, type: true },
    });
    return rows.map((r) => ({ id: r.id, price: Number(r.price), type: r.type }));
  }

  async findValidCoupon(userId: number, templateId: number): Promise<{ id: number } | null> {
    return this.prisma.coupon.findFirst({
      where: { coupon_template_id: templateId, user_id: userId, valid: 1 },
      select: { id: true },
    });
  }

  async findCouponTemplate(templateId: number): Promise<DiscountRule | null> {
    const row = await this.prisma.couponTemplate.findFirst({
      where: { id: templateId, valid: 1 },
      select: { discount: true, type: true, requirement: true },
    });
    if (!row) return null;
    return {
      discount: Number(row.discount),
      type: row.type,
      requirement: row.requirement !== null ? Number(row.requirement) : null,
    };
  }

  async createOrderTransaction(
    orderInput: OrderInput,
    priceResult: PriceResult,
    ouid: string
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const orderTotalRecord = await tx.orderTotal.create({
        data: {
          user_id: orderInput.userUid,
          payment: priceResult.finalPayment,
          transportation_state: orderInput.transportationstate,
          phone: orderInput.phone,
          discount: priceResult.totalDiscount,
          postcode: parseInt(orderInput.postcode),
          country: orderInput.country,
          township: orderInput.township,
          address: orderInput.address,
          created_time: new Date(),
          ouid,
        },
      });

      await tx.orderItem.createMany({
        data: orderInput.cartEntries.map((v) => ({
          order_id: orderTotalRecord.id,
          product_id: v.id,
          quantity: Math.trunc(Number(v.qty)),
          ouid,
        })),
      });

      if (orderInput.lessonCUID && orderInput.lessonCUID !== 'null') {
        await tx.coupon.updateMany({
          where: {
            coupon_template_id: parseInt(orderInput.lessonCUID),
            user_id: orderInput.userId,
          },
          data: { valid: 0 },
        });
      }
      if (orderInput.instrumentCUID && orderInput.instrumentCUID !== 'null') {
        await tx.coupon.updateMany({
          where: {
            coupon_template_id: parseInt(orderInput.instrumentCUID),
            user_id: orderInput.userId,
          },
          data: { valid: 0 },
        });
      }
    });
  }

  async findUserByUid(uid: string): Promise<UserEmailInfo | null> {
    return this.prisma.user.findFirst({
      where: { uid },
      select: { email: true, nickname: true },
    });
  }

  async findProductsInfo(ids: number[]): Promise<ProductInfo[]> {
    const rows = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, price: true, type: true },
    });
    return rows.map((r) => ({ id: r.id, name: r.name, price: Number(r.price), type: r.type }));
  }
}
