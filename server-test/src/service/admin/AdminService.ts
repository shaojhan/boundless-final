import type { IAdminRepository, AdminProductFilters } from '#repository/admin/IAdminRepository.js';
import type { CreateProductInput } from '#domain/admin/Admin.js';

export class AdminService {
  constructor(private readonly repo: IAdminRepository) {}

  getProducts(filters: AdminProductFilters) {
    return this.repo.findAllProducts(filters);
  }

  createProduct(input: CreateProductInput) {
    if (!input.name.trim()) {
      throw Object.assign(new Error('商品名稱不可為空'), { statusCode: 400 });
    }
    if (input.price < 0) {
      throw Object.assign(new Error('售價不可為負數'), { statusCode: 400 });
    }
    if (input.type === 1 && input.stock !== undefined && input.stock < 0) {
      throw Object.assign(new Error('庫存數量必須為非負整數'), { statusCode: 400 });
    }
    return this.repo.createProduct(input);
  }

  updateStock(puid: string, stock: number) {
    if (!Number.isInteger(stock) || stock < 0) {
      throw Object.assign(new Error('庫存數量必須為非負整數'), { statusCode: 400 });
    }
    return this.repo.updateProductStock(puid, stock);
  }

  getOrders(filters: { page?: number; pageSize?: number }) {
    return this.repo.findAllOrders(filters);
  }

  getStats() {
    return this.repo.getStats();
  }
}
