import type { IAdminRepository, AdminProductFilters } from '#repository/admin/IAdminRepository.js';

export class AdminService {
  constructor(private readonly repo: IAdminRepository) {}

  getProducts(filters: AdminProductFilters) {
    return this.repo.findAllProducts(filters);
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
