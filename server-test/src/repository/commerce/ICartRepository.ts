import type { CartEntry, OrderInput, PriceResult } from '#domain/commerce/Cart.js';

export interface ProductPrice {
  id: number;
  price: number;
  type: number;
}

export interface ProductInfo extends ProductPrice {
  name: string;
}

export interface DiscountRule {
  discount: number;
  type: number;
  requirement: number | null;
}

export interface UserEmailInfo {
  email: string;
  nickname: string | null;
}

export interface ICartRepository {
  findProductPrices(ids: number[]): Promise<ProductPrice[]>;
  findValidCoupon(userId: number, templateId: number): Promise<{ id: number } | null>;
  findCouponTemplate(templateId: number): Promise<DiscountRule | null>;
  createOrderTransaction(
    orderInput: OrderInput,
    priceResult: PriceResult,
    ouid: string
  ): Promise<void>;
  findUserByUid(uid: string): Promise<UserEmailInfo | null>;
  findProductsInfo(ids: number[]): Promise<ProductInfo[]>;
}
