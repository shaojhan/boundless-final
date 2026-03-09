import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessonService } from '../../../../src/service/catalog/LessonService.js';
import type { IProductRepository } from '../../../../src/repository/catalog/IProductRepository.js';
import type { LessonProduct, LessonProductDetail, HomepageLesson } from '../../../../src/domain/catalog/Product.js';
import type { LessonCategory } from '../../../../src/domain/catalog/Category.js';

// ── Fixtures ───────────────────────────────────────────────────────────────────

const mockLesson: LessonProduct = {
  id: 1,
  puid: 'L001',
  name: '吉他入門課',
  img: '/img/lesson.jpg',
  price: 3000,
  lesson_category_id: 1,
  lesson_category_name: '吉他',
  teacher_name: '王老師',
  teacher_img: null,
  teacher_info: null,
  outline: null,
  achievement: null,
  suitable: null,
  homework: null,
  length: 8,
  sales: 120,
  valid: 1,
  review_count: 5,
  average_rating: 4.5,
};

const mockCategory: LessonCategory = { id: 1, name: '吉他', valid: 1 };

const mockHomepageLesson: HomepageLesson = {
  img: '/img/lesson.jpg',
  puid: 'L001',
  lesson_category_name: '吉他',
};

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

describe('LessonService.getProducts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳課程列表', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findLessons).mockResolvedValue([mockLesson]);

    const service = new LessonService(repo);
    const result = await service.getProducts({});

    expect(result).toHaveLength(1);
    expect(result[0].puid).toBe('L001');
    expect(repo.findLessons).toHaveBeenCalledWith({});
  });

  it('傳入價格篩選條件到 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findLessons).mockResolvedValue([]);

    const service = new LessonService(repo);
    await service.getProducts({ priceLow: 1000, priceHigh: 5000 });

    expect(repo.findLessons).toHaveBeenCalledWith({ priceLow: 1000, priceHigh: 5000 });
  });
});

describe('LessonService.getCategories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳課程分類列表', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findLessonCategories).mockResolvedValue([mockCategory]);

    const service = new LessonService(repo);
    const result = await service.getCategories();

    expect(result).toEqual([mockCategory]);
    expect(repo.findLessonCategories).toHaveBeenCalledOnce();
  });
});

describe('LessonService.getProductsByCategory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('傳入 categoryId 給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findLessonsByCategory).mockResolvedValue([mockLesson]);

    const service = new LessonService(repo);
    const result = await service.getProductsByCategory(1);

    expect(result).toHaveLength(1);
    expect(repo.findLessonsByCategory).toHaveBeenCalledWith(1);
  });

  it('categoryId = null 代表全部分類', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findLessonsByCategory).mockResolvedValue([]);

    const service = new LessonService(repo);
    await service.getProductsByCategory(null);

    expect(repo.findLessonsByCategory).toHaveBeenCalledWith(null);
  });
});

describe('LessonService.getProductDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到課程 → 回傳 detail', async () => {
    const repo = makeRepo();
    const mockDetail: LessonProductDetail = {
      data: [mockLesson],
      product_review: [],
      youwilllike: [],
    };
    vi.mocked(repo.findLessonDetail).mockResolvedValue(mockDetail);

    const service = new LessonService(repo);
    const result = await service.getProductDetail('L001');

    expect(result).toEqual(mockDetail);
    expect(repo.findLessonDetail).toHaveBeenCalledWith('L001');
  });

  it('找不到課程 → 回傳 null', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findLessonDetail).mockResolvedValue(null);

    const service = new LessonService(repo);
    expect(await service.getProductDetail('NONEXIST')).toBeNull();
  });
});

describe('LessonService.getHomepageLessons', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳首頁課程資料', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findHomepageLessons).mockResolvedValue([mockHomepageLesson]);

    const service = new LessonService(repo);
    const result = await service.getHomepageLessons();

    expect(result).toHaveLength(1);
    expect(result[0].lesson_category_name).toBe('吉他');
    expect(repo.findHomepageLessons).toHaveBeenCalledOnce();
  });

  it('無課程時回傳空陣列', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findHomepageLessons).mockResolvedValue([]);

    const service = new LessonService(repo);
    expect(await service.getHomepageLessons()).toEqual([]);
  });
});
