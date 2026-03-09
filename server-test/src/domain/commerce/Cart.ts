/**
 * Cart — Commerce domain types for cart and order.
 * Pure TypeScript, no Prisma / Express imports.
 */

export interface CartEntry {
  id: number;
  qty: number;
}

export interface ProductRow {
  id: number;
  price: number;
  type: number; // 1=instrument, 2=lesson
}

export interface PriceResult {
  lessonTotal: number;
  instrumentTotal: number;
  lessonDiscount: number;
  instrumentDiscount: number;
  totalPrice: number;
  totalDiscount: number;
  finalPayment: number;
}

export interface OrderInput {
  phone: string;
  country: string;
  township: string;
  postcode: string;
  address: string;
  transportationstate: string;
  cartEntries: CartEntry[];
  lessonCUID: string | null;
  instrumentCUID: string | null;
  userId: number;  // integer id from JWT (for coupon validation)
  userUid: string; // string uid from JWT (for order record)
}
