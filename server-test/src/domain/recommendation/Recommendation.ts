/**
 * Recommendation Domain Entities
 * Pure TypeScript — no Prisma / Express imports.
 */

/** Lightweight product card used in all recommendation results */
export interface RecommendedProduct {
  id: number;
  puid: string | null;
  name: string | null;
  img: string | null;
  img_small: string | null;
  price: number | null;
  discount: number | null;
  discount_state: number | null;
  /** 1 = instrument, 2 = lesson */
  type: number | null;
  sales: number | null;
  category_name: string | null;
  /** Computed popularity score (higher = more recommended) */
  score: number;
}

/** Result shape for personalized recommendations */
export interface PersonalizedResult {
  instruments: RecommendedProduct[];
  lessons: RecommendedProduct[];
}
