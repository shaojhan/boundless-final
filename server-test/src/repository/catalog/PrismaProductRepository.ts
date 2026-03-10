import type { PrismaClient } from '#generated/prisma/client.js';
import type { IProductRepository, InstrumentFilters, LessonFilters } from './IProductRepository.js';
import type {
  InstrumentProduct,
  LessonProduct,
  InstrumentProductDetail,
  LessonProductDetail,
  HomepageLesson,
  InstrumentReview,
  LessonReview,
} from '#domain/catalog/Product.js';
import type { InstrumentCategory, LessonCategory } from '#domain/catalog/Category.js';

const DATA_PER_PAGE = 20;

// ── Mappers ──────────────────────────────────────────────────────────────────

type PrismaInstrumentProduct = {
  id: number;
  puid: string | null;
  name: string | null;
  img: string | null;
  img_small: string | null;
  price: number | null;
  discount: unknown;
  discount_state: number | null;
  brand_id: number | null;
  instrument_category_id: number | null;
  info: string | null;
  specs: string | null;
  stock: number | null;
  sales: number | null;
  valid: number | null;
  instrumentCategory: { id: number; parent_id: number | null; name: string } | null;
};

type PrismaLessonProduct = {
  id: number;
  puid: string | null;
  name: string | null;
  img: string | null;
  price: number | null;
  lesson_category_id: number | null;
  outline: string | null;
  achievement: string | null;
  suitable: string | null;
  homework: number | null;
  length: number | null;
  sales: number | null;
  valid: number | null;
  lessonCategory: { id: number; name: string; valid: number } | null;
  teacher: { name: string; img: string | null; info: string | null } | null;
  reviews: { stars: number }[];
};

function toInstrumentProduct(p: PrismaInstrumentProduct): InstrumentProduct {
  return {
    id: p.id,
    puid: p.puid,
    name: p.name,
    img: p.img,
    img_small: p.img_small,
    price: p.price,
    discount: p.discount != null ? Number(p.discount) : null,
    discount_state: p.discount_state,
    brand_id: p.brand_id,
    instrument_category_id: p.instrument_category_id,
    category_name: p.instrumentCategory?.name ?? null,
    info: p.info,
    specs: p.specs,
    stock: p.stock,
    sales: p.sales,
    valid: p.valid,
  };
}

function computeReviewStats(reviews: { stars: number }[]) {
  const review_count = reviews.length;
  const average_rating =
    review_count > 0
      ? reviews.reduce((acc, r) => acc + r.stars, 0) / review_count
      : null;
  return { review_count, average_rating };
}

function toLessonProduct(p: PrismaLessonProduct): LessonProduct {
  return {
    id: p.id,
    puid: p.puid,
    name: p.name,
    img: p.img,
    price: p.price,
    lesson_category_id: p.lesson_category_id,
    lesson_category_name: p.lessonCategory?.name ?? null,
    teacher_name: p.teacher?.name ?? null,
    teacher_img: p.teacher?.img ?? null,
    teacher_info: p.teacher?.info ?? null,
    outline: p.outline,
    achievement: p.achievement,
    suitable: p.suitable,
    homework: p.homework,
    length: p.length,
    sales: p.sales,
    valid: p.valid,
    ...computeReviewStats(p.reviews),
  };
}

// ── Repository ───────────────────────────────────────────────────────────────

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ── Instrument ────────────────────────────────────────────────────────────

  async findInstruments(filters: InstrumentFilters): Promise<{ items: InstrumentProduct[]; total: number }> {
    const page = filters.page ?? 1;
    const skip = (page - 1) * DATA_PER_PAGE;

    const where: Parameters<typeof this.prisma.product.findMany>[0]['where'] = { type: 1 };

    if (filters.brandSelect != null) where.brand_id = filters.brandSelect;
    if (filters.priceLow != null || filters.priceHigh != null) {
      where.price = {};
      if (filters.priceLow != null) where.price.gte = filters.priceLow;
      if (filters.priceHigh != null) where.price.lte = filters.priceHigh;
    }
    if (filters.promotion) where.discount_state = 1;

    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: { instrumentCategory: true },
        skip,
        take: DATA_PER_PAGE,
      }),
    ]);

    return { items: (rows as PrismaInstrumentProduct[]).map(toInstrumentProduct), total };
  }

  async findInstrumentsByCategory(categoryId: number | null): Promise<InstrumentProduct[]> {
    const where: Parameters<typeof this.prisma.product.findMany>[0]['where'] = { type: 1 };
    if (categoryId != null) where.instrument_category_id = categoryId;

    const rows = await this.prisma.product.findMany({
      where,
      include: { instrumentCategory: true },
    });
    return (rows as PrismaInstrumentProduct[]).map(toInstrumentProduct);
  }

  async findInstrumentDetail(puid: string): Promise<InstrumentProductDetail | null> {
    const product = await this.prisma.product.findFirst({
      where: { puid },
      include: { instrumentCategory: true },
    });
    if (!product) return null;

    const data = toInstrumentProduct(product as PrismaInstrumentProduct);

    const reviews = await this.prisma.productReview.findMany({
      where: { product_id: product.id },
      include: {
        user: { select: { uid: true, name: true, nickname: true, img: true } },
      },
    });
    const reviewData: InstrumentReview[] = reviews.map(({ user, ...r }) => ({
      id: r.id,
      product_id: r.product_id,
      user_id: r.user_id,
      stars: r.stars,
      content: r.content,
      uid: user.uid,
      name: user.name,
      nickname: user.nickname,
      img: user.img,
    }));

    const youmaylikeRaw = await this.prisma.product.findMany({
      where: {
        instrument_category_id: product.instrument_category_id ?? undefined,
        type: 1,
      },
      include: { instrumentCategory: true },
      take: 5,
    });
    const youmaylike = (youmaylikeRaw as PrismaInstrumentProduct[]).map(toInstrumentProduct);

    return { data, reviewData, youmaylike };
  }

  async findInstrumentCategories(): Promise<InstrumentCategory[]> {
    return this.prisma.instrumentCategory.findMany({
      select: { id: true, parent_id: true, name: true },
    });
  }

  // ── Lesson ────────────────────────────────────────────────────────────────

  async findLessons(filters: LessonFilters): Promise<LessonProduct[]> {
    const where: Parameters<typeof this.prisma.product.findMany>[0]['where'] = { type: 2 };

    if (filters.priceLow != null && filters.priceHigh != null) {
      where.price = { gte: filters.priceLow, lte: filters.priceHigh };
    }

    const rows = await this.prisma.product.findMany({
      where,
      include: { reviews: true, teacher: true, lessonCategory: true },
      orderBy: { id: 'asc' },
    });
    return (rows as PrismaLessonProduct[]).map(toLessonProduct);
  }

  async findLessonsByCategory(categoryId: number | null): Promise<LessonProduct[]> {
    const where: Parameters<typeof this.prisma.product.findMany>[0]['where'] = { type: 2 };
    if (categoryId != null) where.lesson_category_id = categoryId;

    const rows = await this.prisma.product.findMany({
      where,
      include: { reviews: true, teacher: true, lessonCategory: true },
    });
    return (rows as PrismaLessonProduct[]).map(toLessonProduct);
  }

  async findLessonDetail(puid: string): Promise<LessonProductDetail | null> {
    const product = await this.prisma.product.findFirst({
      where: { puid },
      include: { reviews: true, lessonCategory: true },
    });
    if (!product) return null;

    const lessonData: LessonProduct = toLessonProduct({
      ...product,
      teacher: null,
      reviews: product.reviews,
      lessonCategory: product.lessonCategory,
    } as PrismaLessonProduct);

    const reviewRows = await this.prisma.productReview.findMany({
      where: { product_id: product.id },
      include: { user: true },
    });
    const product_review: LessonReview[] = reviewRows.map(({ user, ...r }) => ({
      id: r.id,
      product_id: r.product_id,
      user_id: r.user_id,
      stars: r.stars,
      content: r.content,
      uid: user.uid,
      name: user.name,
      nickname: user.nickname,
      img: user.img,
      email: user.email,
    }));

    const relatedRaw = await this.prisma.product.findMany({
      where: {
        lesson_category_id: product.lesson_category_id ?? undefined,
        type: 2,
        reviews: { some: {} },
        teacher: { isNot: null },
      },
      include: { reviews: true, teacher: true, lessonCategory: true },
    });
    const youwilllike = (relatedRaw as PrismaLessonProduct[]).map(toLessonProduct);

    return { data: [lessonData], product_review, youwilllike };
  }

  async findLessonCategories(): Promise<LessonCategory[]> {
    return this.prisma.lessonCategory.findMany();
  }

  // ── Homepage ──────────────────────────────────────────────────────────────

  async findHomepageLessons(): Promise<HomepageLesson[]> {
    const rows = await this.prisma.product.findMany({
      where: { lessonCategory: { isNot: null } },
      select: {
        img: true,
        puid: true,
        lessonCategory: { select: { name: true } },
      },
      orderBy: { sales: 'asc' },
      take: 4,
    });
    return rows.map((r) => ({
      img: r.img,
      puid: r.puid,
      lesson_category_name: r.lessonCategory!.name,
    }));
  }
}
