import { describe, it, expect } from 'vitest';
import type {
  InstrumentProduct,
  LessonProduct,
  InstrumentReview,
  LessonReview,
  InstrumentProductDetail,
  LessonProductDetail,
  HomepageLesson,
} from '../../../../src/domain/catalog/Product.js';

// ── Factories ──────────────────────────────────────────────────────────────────

const makeInstrument = (overrides: Partial<InstrumentProduct> = {}): InstrumentProduct => ({
  id: 1,
  puid: 'p-001',
  name: 'Acoustic Guitar',
  img: 'guitar.png',
  img_small: 'guitar_small.png',
  price: 3000,
  discount: 2700,
  discount_state: 1,
  brand_id: 10,
  instrument_category_id: 2,
  category_name: '吉他',
  info: 'Product description',
  specs: 'Full specs',
  stock: 5,
  sales: 20,
  valid: 1,
  ...overrides,
});

const makeLesson = (overrides: Partial<LessonProduct> = {}): LessonProduct => ({
  id: 1,
  puid: 'l-001',
  name: 'Beginner Guitar',
  img: 'lesson.png',
  price: 1200,
  lesson_category_id: 3,
  lesson_category_name: '吉他',
  teacher_name: 'John',
  teacher_img: 'john.png',
  teacher_info: 'Professional guitarist',
  outline: 'Course outline',
  achievement: 'What you will learn',
  suitable: 'Beginners',
  homework: 1,
  length: 12,
  sales: 50,
  valid: 1,
  review_count: 10,
  average_rating: 4.5,
  ...overrides,
});

// ── InstrumentProduct ──────────────────────────────────────────────────────────

describe('InstrumentProduct', () => {
  it('has required id field', () => {
    const p = makeInstrument();
    expect(p.id).toBe(1);
  });

  it('all non-id fields are nullable', () => {
    const p = makeInstrument({
      puid: null, name: null, img: null, img_small: null,
      price: null, discount: null, discount_state: null,
      brand_id: null, instrument_category_id: null, category_name: null,
      info: null, specs: null, stock: null, sales: null, valid: null,
    });
    expect(p.puid).toBeNull();
    expect(p.price).toBeNull();
    expect(p.valid).toBeNull();
  });

  it('discount_state distinguishes discounted vs full-price', () => {
    const discounted = makeInstrument({ discount_state: 1, price: 3000, discount: 2700 });
    const fullPrice = makeInstrument({ discount_state: 0, discount: null });
    expect(discounted.discount_state).toBe(1);
    expect(discounted.discount).toBeLessThan(discounted.price!);
    expect(fullPrice.discount_state).toBe(0);
  });
});

// ── LessonProduct ──────────────────────────────────────────────────────────────

describe('LessonProduct', () => {
  it('review_count is a non-nullable number', () => {
    const l = makeLesson();
    expect(typeof l.review_count).toBe('number');
  });

  it('average_rating is nullable', () => {
    const noRating = makeLesson({ average_rating: null });
    expect(noRating.average_rating).toBeNull();
  });

  it('average_rating accepts numeric values', () => {
    const l = makeLesson({ average_rating: 4.8 });
    expect(l.average_rating).toBeCloseTo(4.8);
  });

  it('homework flag accepts 0 or 1', () => {
    expect(makeLesson({ homework: 1 }).homework).toBe(1);
    expect(makeLesson({ homework: 0 }).homework).toBe(0);
  });
});

// ── Review entities ───────────────────────────────────────────────────────────

describe('InstrumentReview', () => {
  it('contains user profile fields alongside review data', () => {
    const r: InstrumentReview = {
      id: 1, product_id: 10, user_id: 5,
      stars: 5, content: 'Great!',
      uid: 'u-abc', name: 'Alice', nickname: 'Ali', img: null,
    };
    expect(r.stars).toBe(5);
    expect(r.uid).toBe('u-abc');
    expect(r.img).toBeNull();
  });
});

describe('LessonReview', () => {
  it('includes email field (extra vs InstrumentReview)', () => {
    const r: LessonReview = {
      id: 2, product_id: 1, user_id: 3,
      stars: 4, content: null,
      uid: 'u-xyz', name: 'Bob', nickname: null, img: 'bob.png',
      email: 'bob@example.com',
    };
    expect(r.email).toBe('bob@example.com');
    expect(r.content).toBeNull();
  });
});

// ── Aggregate results ─────────────────────────────────────────────────────────

describe('InstrumentProductDetail', () => {
  it('groups data, reviewData, and youmaylike', () => {
    const detail: InstrumentProductDetail = {
      data: makeInstrument(),
      reviewData: [],
      youmaylike: [makeInstrument({ id: 2, puid: 'p-002' })],
    };
    expect(detail.data.id).toBe(1);
    expect(detail.reviewData).toHaveLength(0);
    expect(detail.youmaylike).toHaveLength(1);
  });
});

describe('LessonProductDetail', () => {
  it('groups data array, product_review, and youwilllike', () => {
    const detail: LessonProductDetail = {
      data: [makeLesson()],
      product_review: [],
      youwilllike: [],
    };
    expect(detail.data).toHaveLength(1);
  });
});

// ── HomepageLesson ────────────────────────────────────────────────────────────

describe('HomepageLesson', () => {
  it('contains img, puid (nullable), and category name (non-null)', () => {
    const item: HomepageLesson = { img: 'banner.png', puid: 'l-001', lesson_category_name: '吉他' };
    expect(item.lesson_category_name).toBe('吉他');

    const nullItem: HomepageLesson = { img: null, puid: null, lesson_category_name: '鋼琴' };
    expect(nullItem.img).toBeNull();
    expect(nullItem.puid).toBeNull();
  });
});
