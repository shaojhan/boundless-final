import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IRecommendationRepository } from '#src/repository/recommendation/IRecommendationRepository.js';
import type { RecommendedProduct, PersonalizedResult } from '#src/domain/recommendation/Recommendation.js';
import { RecommendationService } from '#src/service/recommendation/RecommendationService.js';

// ── Mock repository factory ────────────────────────────────────────────────────

function makeRepo(): IRecommendationRepository {
  return {
    findPopularProducts: vi.fn(),
    findCoPurchasedProducts: vi.fn(),
    findSimilarProducts: vi.fn(),
    findPersonalizedProducts: vi.fn(),
    trackView: vi.fn(),
  };
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const mockProduct: RecommendedProduct = {
  id: 1,
  puid: 'p-001',
  name: '吉他入門',
  img: null,
  img_small: null,
  price: 5000,
  discount: null,
  discount_state: null,
  type: 1,
  sales: 10,
  category_name: '吉他',
  score: 4.2,
};

const mockLesson: RecommendedProduct = {
  ...mockProduct,
  id: 2,
  puid: 'l-001',
  name: '吉他課程',
  type: 2,
};

const mockPersonalized: PersonalizedResult = {
  instruments: [mockProduct],
  lessons: [mockLesson],
};

// ── getPopularInstruments ──────────────────────────────────────────────────────

describe('RecommendationService.getPopularInstruments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('預設 limit=4 呼叫 findPopularProducts(1, 4)', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPopularProducts).mockResolvedValue([mockProduct]);

    const service = new RecommendationService(repo);
    const result = await service.getPopularInstruments();

    expect(repo.findPopularProducts).toHaveBeenCalledWith(1, 4);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe(1);
  });

  it('自訂 limit 傳入 findPopularProducts(1, limit)', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPopularProducts).mockResolvedValue([]);

    const service = new RecommendationService(repo);
    await service.getPopularInstruments(8);

    expect(repo.findPopularProducts).toHaveBeenCalledWith(1, 8);
  });

  it('無商品時回傳空陣列', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPopularProducts).mockResolvedValue([]);

    const service = new RecommendationService(repo);
    expect(await service.getPopularInstruments()).toEqual([]);
  });

  it('repo 拋出例外 → 錯誤向上傳遞', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPopularProducts).mockRejectedValue(new Error('DB error'));

    const service = new RecommendationService(repo);
    await expect(service.getPopularInstruments()).rejects.toThrow('DB error');
  });
});

// ── getPopularLessons ──────────────────────────────────────────────────────────

describe('RecommendationService.getPopularLessons', () => {
  beforeEach(() => vi.clearAllMocks());

  it('預設 limit=4 呼叫 findPopularProducts(2, 4)', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPopularProducts).mockResolvedValue([mockLesson]);

    const service = new RecommendationService(repo);
    const result = await service.getPopularLessons();

    expect(repo.findPopularProducts).toHaveBeenCalledWith(2, 4);
    expect(result[0].type).toBe(2);
  });

  it('自訂 limit 傳入 findPopularProducts(2, limit)', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPopularProducts).mockResolvedValue([]);

    const service = new RecommendationService(repo);
    await service.getPopularLessons(6);

    expect(repo.findPopularProducts).toHaveBeenCalledWith(2, 6);
  });

  it('repo 拋出例外 → 錯誤向上傳遞', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPopularProducts).mockRejectedValue(new Error('連線逾時'));

    const service = new RecommendationService(repo);
    await expect(service.getPopularLessons()).rejects.toThrow('連線逾時');
  });
});

// ── getCoPurchased ─────────────────────────────────────────────────────────────

describe('RecommendationService.getCoPurchased', () => {
  beforeEach(() => vi.clearAllMocks());

  it('type=1（instrument）委派給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findCoPurchasedProducts).mockResolvedValue([mockProduct]);

    const service = new RecommendationService(repo);
    const result = await service.getCoPurchased(10, 1, 5);

    expect(repo.findCoPurchasedProducts).toHaveBeenCalledWith(10, 1, 5);
    expect(result).toHaveLength(1);
  });

  it('type=2（lesson）委派給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findCoPurchasedProducts).mockResolvedValue([mockLesson]);

    const service = new RecommendationService(repo);
    await service.getCoPurchased(20, 2, 5);

    expect(repo.findCoPurchasedProducts).toHaveBeenCalledWith(20, 2, 5);
  });

  it('預設 limit=5', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findCoPurchasedProducts).mockResolvedValue([]);

    const service = new RecommendationService(repo);
    await service.getCoPurchased(10, 1);

    expect(repo.findCoPurchasedProducts).toHaveBeenCalledWith(10, 1, 5);
  });

  it('無共購商品 → 回傳空陣列', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findCoPurchasedProducts).mockResolvedValue([]);

    const service = new RecommendationService(repo);
    expect(await service.getCoPurchased(99, 1)).toEqual([]);
  });

  it('repo 拋出例外 → 錯誤向上傳遞', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findCoPurchasedProducts).mockRejectedValue(new Error('查詢失敗'));

    const service = new RecommendationService(repo);
    await expect(service.getCoPurchased(10, 1)).rejects.toThrow('查詢失敗');
  });
});

// ── getSimilar ─────────────────────────────────────────────────────────────────

describe('RecommendationService.getSimilar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.findSimilarProducts', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findSimilarProducts).mockResolvedValue([mockProduct]);

    const service = new RecommendationService(repo);
    const result = await service.getSimilar(10, 1, 5);

    expect(repo.findSimilarProducts).toHaveBeenCalledWith(10, 1, 5);
    expect(result).toHaveLength(1);
  });

  it('預設 limit=5', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findSimilarProducts).mockResolvedValue([]);

    const service = new RecommendationService(repo);
    await service.getSimilar(10, 2);

    expect(repo.findSimilarProducts).toHaveBeenCalledWith(10, 2, 5);
  });

  it('type=2（lesson）委派正確', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findSimilarProducts).mockResolvedValue([mockLesson]);

    const service = new RecommendationService(repo);
    await service.getSimilar(5, 2, 3);

    expect(repo.findSimilarProducts).toHaveBeenCalledWith(5, 2, 3);
  });

  it('repo 拋出例外 → 錯誤向上傳遞', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findSimilarProducts).mockRejectedValue(new Error('相似查詢失敗'));

    const service = new RecommendationService(repo);
    await expect(service.getSimilar(10, 1)).rejects.toThrow('相似查詢失敗');
  });
});

// ── getPersonalized ────────────────────────────────────────────────────────────

describe('RecommendationService.getPersonalized', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.findPersonalizedProducts 並回傳結果', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPersonalizedProducts).mockResolvedValue(mockPersonalized);

    const service = new RecommendationService(repo);
    const result = await service.getPersonalized(42);

    expect(repo.findPersonalizedProducts).toHaveBeenCalledWith(42, 6);
    expect(result.instruments).toHaveLength(1);
    expect(result.lessons).toHaveLength(1);
  });

  it('預設 limit=6', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPersonalizedProducts).mockResolvedValue(mockPersonalized);

    const service = new RecommendationService(repo);
    await service.getPersonalized(42);

    expect(repo.findPersonalizedProducts).toHaveBeenCalledWith(42, 6);
  });

  it('自訂 limit 傳入 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPersonalizedProducts).mockResolvedValue({ instruments: [], lessons: [] });

    const service = new RecommendationService(repo);
    await service.getPersonalized(42, 10);

    expect(repo.findPersonalizedProducts).toHaveBeenCalledWith(42, 10);
  });

  it('無歷史紀錄 → 回傳空 instruments/lessons', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPersonalizedProducts).mockResolvedValue({ instruments: [], lessons: [] });

    const service = new RecommendationService(repo);
    const result = await service.getPersonalized(99);

    expect(result.instruments).toEqual([]);
    expect(result.lessons).toEqual([]);
  });

  it('repo 拋出例外 → 錯誤向上傳遞', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findPersonalizedProducts).mockRejectedValue(new Error('個人化查詢失敗'));

    const service = new RecommendationService(repo);
    await expect(service.getPersonalized(42)).rejects.toThrow('個人化查詢失敗');
  });
});

// ── trackView ─────────────────────────────────────────────────────────────────

describe('RecommendationService.trackView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('登入使用者 → trackView(productId, userId)', async () => {
    const repo = makeRepo();
    vi.mocked(repo.trackView).mockResolvedValue();

    const service = new RecommendationService(repo);
    await service.trackView(1, 42);

    expect(repo.trackView).toHaveBeenCalledWith(1, 42);
  });

  it('訪客（未登入）→ trackView(productId, null)', async () => {
    const repo = makeRepo();
    vi.mocked(repo.trackView).mockResolvedValue();

    const service = new RecommendationService(repo);
    await service.trackView(1, null);

    expect(repo.trackView).toHaveBeenCalledWith(1, null);
  });

  it('repo 拋出例外 → 錯誤向上傳遞', async () => {
    const repo = makeRepo();
    vi.mocked(repo.trackView).mockRejectedValue(new Error('記錄瀏覽失敗'));

    const service = new RecommendationService(repo);
    await expect(service.trackView(1, 42)).rejects.toThrow('記錄瀏覽失敗');
  });
});
