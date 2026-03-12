/**
 * Admin — domain entities
 * Pure TypeScript, no Prisma / Express imports.
 */

export interface AdminProduct {
  id: number;
  puid: string | null;
  name: string | null;
  type: number | null;
  price: number | null;
  stock: number | null;
  sales: number | null;
  valid: number | null;
}

export interface AdminOrderItem {
  product_id: number;
  product_name: string | null;
  quantity: number;
}

export interface AdminOrder {
  id: number;
  ouid: string;
  user_id: string;
  payment: number;
  created_time: Date;
  items: AdminOrderItem[];
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  productCount: number;
}
