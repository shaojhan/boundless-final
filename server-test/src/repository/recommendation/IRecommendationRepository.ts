import type { RecommendedProduct, PersonalizedResult } from '#domain/recommendation/Recommendation.js';

export interface IRecommendationRepository {
  /** Algorithm A: weighted popularity score (sales + favorites + rating + recency) */
  findPopularProducts(type: 1 | 2, limit: number): Promise<RecommendedProduct[]>;

  /** Algorithm B: collaborative filtering — items bought together in same orders */
  findCoPurchasedProducts(productId: number, type: 1 | 2, limit: number): Promise<RecommendedProduct[]>;

  /** Algorithm C: content-based — same category, sorted by popularity */
  findSimilarProducts(productId: number, type: 1 | 2, limit: number): Promise<RecommendedProduct[]>;

  /** Algorithm D: personalized — based on user's purchase + favorite categories */
  findPersonalizedProducts(userId: number, limit: number): Promise<PersonalizedResult>;

  /** Track a product page view */
  trackView(productId: number, userId: number | null): Promise<void>;
}
