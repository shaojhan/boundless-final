import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '#generated/prisma/client.js';
import { PrismaProductRepository } from '../../../../src/repository/catalog/PrismaProductRepository.js';

// ── Prisma mock ────────────────────────────────────────────────────────────────

function makePrisma() {
  return {
    product: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    productReview: {
      findMany: vi.fn(),
    },
    instrumentCategory: {
      findMany: vi.fn(),
    },
    lessonCategory: {
      findMany: vi.fn(),
    },
  } as unknown as PrismaClient;
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

function makeInstrumentRow(overrides: Partial<{
  id: number;
  puid: string;
  name: string;
  price: number;
  discount_state: number | null;
  brand_id: number | null;
  instrument_category_id: number | null;
}> = {}) {
  return {
    id: overrides.id ?? 1,
    puid: overrides.puid ?? 'PUID000001',
    name: overrides.name ?? '測試吉他',
    img: 'guitar.jpg',
    img_small: 'guitar_small.jpg',
    price: overrides.price ?? 5000,
    discount: null,
    discount_state: overrides.discount_state ?? null,
    brand_id: overrides.brand_id ?? null,
    instrument_category_id: overrides.instrument_category_id ?? 1,
    info: '說明',
    specs: '規格',
    stock: 10,
    sales: 3,
    valid: 1,
    instrumentCategory: { id: 1, parent_id: null, name: '吉他' },
  };
}

function makeLessonRow(overrides: Partial<{
  id: number;
  puid: string;
  name: string;
  price: number;
  lesson_category_id: number | null;
}> = {}) {
  return {
    id: overrides.id ?? 10,
    puid: overrides.puid ?? 'LPUID00001',
    name: overrides.name ?? '吉他入門課',
    img: 'lesson.jpg',
    price: overrides.price ?? 3000,
    lesson_category_id: overrides.lesson_category_id ?? 2,
    outline: '課綱',
    achievement: '成就',
    suitable: '適合對象',
    homework: 0,
    length: 60,
    sales: 5,
    valid: 1,
    lessonCategory: { id: 2, name: '吉他', valid: 1 },
    teacher: { name: '林老師', img: null, info: '資歷' },
    reviews: [{ stars: 5 }, { stars: 4 }],
  };
}

// ── findInstruments ────────────────────────────────────────────────────────────

describe('PrismaProductRepository.findInstruments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無 filters → where 只含 type:1，回傳 items 和 total', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.count).mockResolvedValue(1);
    vi.mocked(prisma.product.findMany).mockResolvedValue([makeInstrumentRow()] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findInstruments({});

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(prisma.product.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 1 }) }),
    );
  });

  it('帶 brandSelect → where 含 brand_id', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.count).mockResolvedValue(0);
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const repo = new PrismaProductRepository(prisma);
    await repo.findInstruments({ brandSelect: 3 });

    expect(prisma.product.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ brand_id: 3 }) }),
    );
  });

  it('帶 priceLow 和 priceHigh → where.price 含 gte/lte', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.count).mockResolvedValue(0);
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const repo = new PrismaProductRepository(prisma);
    await repo.findInstruments({ priceLow: 1000, priceHigh: 5000 });

    const countArg = vi.mocked(prisma.product.count).mock.calls[0][0];
    expect((countArg.where!.price as any).gte).toBe(1000);
    expect((countArg.where!.price as any).lte).toBe(5000);
  });

  it('帶 promotion:true → where 含 discount_state:1', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.count).mockResolvedValue(0);
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const repo = new PrismaProductRepository(prisma);
    await repo.findInstruments({ promotion: true });

    expect(prisma.product.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ discount_state: 1 }) }),
    );
  });

  it('discount 不為 null 時 → 轉成 number', async () => {
    const prisma = makePrisma();
    const row = { ...makeInstrumentRow(), discount: BigInt(200) };
    vi.mocked(prisma.product.count).mockResolvedValue(1);
    vi.mocked(prisma.product.findMany).mockResolvedValue([row] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findInstruments({});

    expect(result.items[0].discount).toBe(200);
  });

  it('category_name 來自 instrumentCategory.name', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.count).mockResolvedValue(1);
    vi.mocked(prisma.product.findMany).mockResolvedValue([makeInstrumentRow()] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findInstruments({});

    expect(result.items[0].category_name).toBe('吉他');
  });
});

// ── findInstrumentsByCategory ──────────────────────────────────────────────────

describe('PrismaProductRepository.findInstrumentsByCategory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('categoryId 為 null → where 只含 type:1', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const repo = new PrismaProductRepository(prisma);
    await repo.findInstrumentsByCategory(null);

    const callArg = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(callArg.where).toEqual({ type: 1 });
  });

  it('categoryId 有值 → where 含 instrument_category_id', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([makeInstrumentRow()] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findInstrumentsByCategory(1);

    const callArg = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(callArg.where).toEqual({ type: 1, instrument_category_id: 1 });
    expect(result).toHaveLength(1);
  });
});

// ── findInstrumentDetail ───────────────────────────────────────────────────────

describe('PrismaProductRepository.findInstrumentDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('product 不存在 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

    const repo = new PrismaProductRepository(prisma);
    expect(await repo.findInstrumentDetail('NOT_EXIST')).toBeNull();
  });

  it('找到 product → 回傳 { data, reviewData, youmaylike }', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findFirst).mockResolvedValue(makeInstrumentRow() as any);
    vi.mocked(prisma.productReview.findMany).mockResolvedValue([
      {
        id: 1,
        product_id: 1,
        user_id: 10,
        stars: 4,
        content: '不錯',
        user: { uid: 'UID001', name: '王小明', nickname: '明明', img: null },
      },
    ] as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([makeInstrumentRow()] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findInstrumentDetail('PUID000001');

    expect(result).not.toBeNull();
    expect(result!.data.puid).toBe('PUID000001');
    expect(result!.reviewData).toHaveLength(1);
    expect(result!.reviewData[0].stars).toBe(4);
    expect(result!.youmaylike).toHaveLength(1);
  });
});

// ── findInstrumentCategories ───────────────────────────────────────────────────

describe('PrismaProductRepository.findInstrumentCategories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳 instrumentCategory 清單', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.instrumentCategory.findMany).mockResolvedValue([
      { id: 1, parent_id: null, name: '弦樂器' },
      { id: 2, parent_id: 1, name: '吉他' },
    ] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findInstrumentCategories();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('弦樂器');
  });
});

// ── findLessons ────────────────────────────────────────────────────────────────

describe('PrismaProductRepository.findLessons', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無 filters → where 只含 type:2，回傳 LessonProduct 陣列', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([makeLessonRow()] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findLessons({});

    expect(result).toHaveLength(1);
    const callArg = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(callArg.where).toEqual({ type: 2 });
  });

  it('帶 priceLow 和 priceHigh → where.price 含 gte/lte', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const repo = new PrismaProductRepository(prisma);
    await repo.findLessons({ priceLow: 500, priceHigh: 3000 });

    const callArg = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect((callArg.where!.price as any).gte).toBe(500);
    expect((callArg.where!.price as any).lte).toBe(3000);
  });

  it('review_count 和 average_rating 由 reviews 計算', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([makeLessonRow()] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findLessons({});

    expect(result[0].review_count).toBe(2);
    expect(result[0].average_rating).toBeCloseTo(4.5);
  });

  it('無 reviews → review_count=0, average_rating=null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { ...makeLessonRow(), reviews: [] },
    ] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findLessons({});

    expect(result[0].review_count).toBe(0);
    expect(result[0].average_rating).toBeNull();
  });
});

// ── findLessonsByCategory ──────────────────────────────────────────────────────

describe('PrismaProductRepository.findLessonsByCategory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('categoryId 為 null → where 只含 type:2', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const repo = new PrismaProductRepository(prisma);
    await repo.findLessonsByCategory(null);

    const callArg = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(callArg.where).toEqual({ type: 2 });
  });

  it('categoryId 有值 → where 含 lesson_category_id', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([makeLessonRow()] as any);

    const repo = new PrismaProductRepository(prisma);
    await repo.findLessonsByCategory(2);

    const callArg = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(callArg.where).toEqual({ type: 2, lesson_category_id: 2 });
  });
});

// ── findLessonDetail ───────────────────────────────────────────────────────────

describe('PrismaProductRepository.findLessonDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('product 不存在 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

    const repo = new PrismaProductRepository(prisma);
    expect(await repo.findLessonDetail('NOT_EXIST')).toBeNull();
  });

  it('找到 product → 回傳 { data, product_review, youwilllike }', async () => {
    const prisma = makePrisma();
    const lessonRow = makeLessonRow();
    vi.mocked(prisma.product.findFirst).mockResolvedValue(lessonRow as any);
    vi.mocked(prisma.productReview.findMany).mockResolvedValue([
      {
        id: 1,
        product_id: 10,
        user_id: 5,
        stars: 5,
        content: '很棒',
        user: { uid: 'UID001', name: '陳小花', nickname: null, img: null, email: 'chen@example.com' },
      },
    ] as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([lessonRow] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findLessonDetail('LPUID00001');

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(1);
    expect(result!.data[0].puid).toBe('LPUID00001');
    expect(result!.product_review).toHaveLength(1);
    expect(result!.product_review[0].stars).toBe(5);
    expect(result!.youwilllike).toHaveLength(1);
  });
});

// ── findLessonCategories ───────────────────────────────────────────────────────

describe('PrismaProductRepository.findLessonCategories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳 lessonCategory 清單', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.lessonCategory.findMany).mockResolvedValue([
      { id: 1, name: '鋼琴', valid: 1 },
      { id: 2, name: '吉他', valid: 1 },
    ] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findLessonCategories();

    expect(result).toHaveLength(2);
    expect(result[1].name).toBe('吉他');
  });
});

// ── findHomepageLessons ────────────────────────────────────────────────────────

describe('PrismaProductRepository.findHomepageLessons', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳最多 4 筆，每筆含 img、puid、lesson_category_name', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { img: 'a.jpg', puid: 'P001', lessonCategory: { name: '鋼琴' } },
      { img: 'b.jpg', puid: 'P002', lessonCategory: { name: '吉他' } },
    ] as any);

    const repo = new PrismaProductRepository(prisma);
    const result = await repo.findHomepageLessons();

    expect(result).toHaveLength(2);
    expect(result[0].lesson_category_name).toBe('鋼琴');
    expect(result[0].img).toBe('a.jpg');
    expect(result[0].puid).toBe('P001');
  });

  it('查詢 where 含 lessonCategory isNot null，take 4，orderBy sales asc', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const repo = new PrismaProductRepository(prisma);
    await repo.findHomepageLessons();

    const callArg = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(callArg.where).toEqual({ lessonCategory: { isNot: null } });
    expect(callArg.take).toBe(4);
    expect(callArg.orderBy).toEqual({ sales: 'asc' });
  });
});
