import type {
  InstrumentProduct,
  LessonProduct,
  InstrumentProductDetail,
  LessonProductDetail,
  HomepageLesson,
} from '#domain/catalog/Product.js';
import type { InstrumentCategory, LessonCategory } from '#domain/catalog/Category.js';

export interface InstrumentFilters {
  page?: number;
  brandSelect?: number;
  priceLow?: number;
  priceHigh?: number;
  promotion?: boolean;
}

export interface LessonFilters {
  priceLow?: number;
  priceHigh?: number;
}

export interface IProductRepository {
  // ── Instrument ──────────────────────────────────────────────────────────────
  findInstruments(filters: InstrumentFilters): Promise<{ items: InstrumentProduct[]; total: number }>;
  findInstrumentsByCategory(categoryId: number | null): Promise<InstrumentProduct[]>;
  findInstrumentDetail(puid: string): Promise<InstrumentProductDetail | null>;
  findInstrumentCategories(): Promise<InstrumentCategory[]>;

  // ── Lesson ───────────────────────────────────────────────────────────────────
  findLessons(filters: LessonFilters): Promise<LessonProduct[]>;
  findLessonsByCategory(categoryId: number | null): Promise<LessonProduct[]>;
  findLessonDetail(puid: string): Promise<LessonProductDetail | null>;
  findLessonCategories(): Promise<LessonCategory[]>;

  // ── Homepage ─────────────────────────────────────────────────────────────────
  findHomepageLessons(): Promise<HomepageLesson[]>;
}
