import type { AdminProduct, AdminOrder, AdminStats, CreateProductInput } from '#domain/admin/Admin.js';

export interface AdminProductFilters {
  page?: number;
  pageSize?: number;
}

export interface IAdminRepository {
  findAllProducts(filters: AdminProductFilters): Promise<{ items: AdminProduct[]; total: number }>;
  updateProductStock(puid: string, stock: number): Promise<AdminProduct | null>;
  createProduct(input: CreateProductInput): Promise<AdminProduct>;
  findAllOrders(filters: { page?: number; pageSize?: number }): Promise<{ items: AdminOrder[]; total: number }>;
  getStats(): Promise<AdminStats>;
}
