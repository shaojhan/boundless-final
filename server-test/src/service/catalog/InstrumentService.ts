import type { IProductRepository, InstrumentFilters } from '../../repository/catalog/IProductRepository.js';
import type { InstrumentProduct, InstrumentProductDetail } from '../../domain/catalog/Product.js';
import type { InstrumentCategory } from '../../domain/catalog/Category.js';

export class InstrumentService {
  constructor(private readonly repo: IProductRepository) {}

  async getProducts(
    filters: InstrumentFilters,
  ): Promise<{ instrument: InstrumentProduct[]; pageTotal: number; page: number }> {
    const page = filters.page ?? 1;
    const { items, total } = await this.repo.findInstruments(filters);
    const pageTotal = Math.ceil(total / 20);
    return { instrument: items, pageTotal, page };
  }

  async getCategories(): Promise<InstrumentCategory[]> {
    return this.repo.findInstrumentCategories();
  }

  async getProductsByCategory(categoryId: number | null): Promise<InstrumentProduct[]> {
    return this.repo.findInstrumentsByCategory(categoryId);
  }

  async getProductDetail(puid: string): Promise<InstrumentProductDetail | null> {
    return this.repo.findInstrumentDetail(puid);
  }
}
