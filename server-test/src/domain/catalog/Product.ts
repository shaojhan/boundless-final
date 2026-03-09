/**
 * Catalog Domain Entities
 * Pure TypeScript — no Prisma / Express imports.
 */

/** Full Instrument product (list + detail) */
export interface InstrumentProduct {
  id: number;
  puid: string | null;
  name: string | null;
  img: string | null;
  img_small: string | null;
  price: number | null;
  discount: number | null;
  discount_state: number | null;
  brand_id: number | null;
  instrument_category_id: number | null;
  category_name: string | null;
  info: string | null;
  specs: string | null;
  stock: number | null;
  sales: number | null;
  valid: number | null;
}

/** Full Lesson product (list) */
export interface LessonProduct {
  id: number;
  puid: string | null;
  name: string | null;
  img: string | null;
  price: number | null;
  lesson_category_id: number | null;
  lesson_category_name: string | null;
  teacher_name: string | null;
  teacher_img: string | null;
  teacher_info: string | null;
  outline: string | null;
  achievement: string | null;
  suitable: string | null;
  homework: number | null;
  length: number | null;
  sales: number | null;
  valid: number | null;
  review_count: number;
  average_rating: number | null;
}

/** Instrument product review (with user fields) */
export interface InstrumentReview {
  id: number;
  product_id: number;
  user_id: number;
  stars: number;
  content: string | null;
  uid: string;
  name: string;
  nickname: string | null;
  img: string | null;
}

/** Lesson product review (user fields spread in) */
export interface LessonReview {
  id: number;
  product_id: number;
  user_id: number;
  stars: number;
  content: string | null;
  // user fields spread in
  uid: string;
  name: string;
  nickname: string | null;
  img: string | null;
  email: string;
}

/** Instrument detail aggregate */
export interface InstrumentProductDetail {
  data: InstrumentProduct;
  reviewData: InstrumentReview[];
  youmaylike: InstrumentProduct[];
}

/** Lesson detail aggregate */
export interface LessonProductDetail {
  data: LessonProduct[];
  product_review: LessonReview[];
  youwilllike: LessonProduct[];
}

/** Homepage lesson item */
export interface HomepageLesson {
  img: string | null;
  puid: string | null;
  lesson_category_name: string;
}
