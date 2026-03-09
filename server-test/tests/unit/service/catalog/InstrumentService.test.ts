import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstrumentService } from '../../../../src/service/catalog/InstrumentService.js';
import type { IProductRepository } from '../../../../src/repository/catalog/IProductRepository.js';
import type { InstrumentProduct, InstrumentProductDetail } from '../../../../src/domain/catalog/Product.js';
import type { InstrumentCategory } from '../../../../src/domain/catalog/Category.js';

// ── Fixtures ───────────────────────────────────────────────────────────────────

const mockInstrument: InstrumentProduct = {
  id: 1,
  puid: 'P001',
  name: '吉他 A',
  img: '/img/guitar.jpg',
  img_small: null,
  price: 5000,
  discount: null,
  discount_state: 0,
  brand_id: 1,
  instrument_category_id: 2,
  category_name: '吉他',
  info: null,
  specs: null,
  stock: 10,
  sales: 50,
  valid: 1,
};

const mockCategory: InstrumentCategory = { id: 2, parent_id: null, name: '吉他' };

function makeRepo(): IProductRepository {
  return {
    findInstruments: vi.fn(),
    findInstrumentsByCategory: vi.fn(),
    findInstrumentDetail: vi.fn(),
    findInstrumentCategories: vi.fn(),
    findLessons: vi.fn(),
    findLessonsByCategory: vi.fn(),
    findLessonDetail: vi.fn(),
    findLessonCategories: vi.fn(),
    findHomepageLessons: vi.fn(),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('InstrumentService.getProducts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳商品列表、pageTotal 和 page', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findInstruments).mockResolvedValue({ items: [mockInstrument], total: 45 });

    const service = new InstrumentService(repo);
    const result = await service.getProducts({ page: 2 });

    expect(result.instrument).toHaveLength(1);
    expect(result.page).toBe(2);
    expect(result.pageTotal).toBe(3); // Math.ceil(45 / 20) = 3
    expect(repo.findInstruments).toHaveBeenCalledWith({ page: 2 });
  });

  it('空結果時 pageTotal = 0', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findInstruments).mockResolvedValue({ items: [], total: 0 });

    const service = new InstrumentService(repo);
    const result = await service.getProducts({});

    expect(result.instrument).toHaveLength(0);
    expect(result.pageTotal).toBe(0);
    expect(result.page).toBe(1); // default page
  });

  it('傳入篩選條件到 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findInstruments).mockResolvedValue({ items: [], total: 0 });

    const service = new InstrumentService(repo);
    await service.getProducts({ brandSelect: 3, priceLow: 1000, priceHigh: 9999, promotion: true });

    expect(repo.findInstruments).toHaveBeenCalledWith({
      brandSelect: 3,
      priceLow: 1000,
      priceHigh: 9999,
      promotion: true,
    });
  });
});

describe('InstrumentService.getCategories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳分類列表', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findInstrumentCategories).mockResolvedValue([mockCategory]);

    const service = new InstrumentService(repo);
    const result = await service.getCategories();

    expect(result).toEqual([mockCategory]);
    expect(repo.findInstrumentCategories).toHaveBeenCalledOnce();
  });
});

describe('InstrumentService.getProductsByCategory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('傳入 categoryId 給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findInstrumentsByCategory).mockResolvedValue([mockInstrument]);

    const service = new InstrumentService(repo);
    const result = await service.getProductsByCategory(2);

    expect(result).toHaveLength(1);
    expect(repo.findInstrumentsByCategory).toHaveBeenCalledWith(2);
  });

  it('categoryId = null 代表全部分類', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findInstrumentsByCategory).mockResolvedValue([]);

    const service = new InstrumentService(repo);
    await service.getProductsByCategory(null);

    expect(repo.findInstrumentsByCategory).toHaveBeenCalledWith(null);
  });
});

describe('InstrumentService.getProductDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到商品 → 回傳 detail', async () => {
    const repo = makeRepo();
    const mockDetail: InstrumentProductDetail = {
      data: mockInstrument,
      reviewData: [],
      youmaylike: [],
    };
    vi.mocked(repo.findInstrumentDetail).mockResolvedValue(mockDetail);

    const service = new InstrumentService(repo);
    const result = await service.getProductDetail('P001');

    expect(result).toEqual(mockDetail);
    expect(repo.findInstrumentDetail).toHaveBeenCalledWith('P001');
  });

  it('找不到商品 → 回傳 null', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findInstrumentDetail).mockResolvedValue(null);

    const service = new InstrumentService(repo);
    expect(await service.getProductDetail('NONEXIST')).toBeNull();
  });
});
