import type { IRecommendationRepository } from '#repository/recommendation/IRecommendationRepository.js';
import type { RecommendedProduct, PersonalizedResult } from '#domain/recommendation/Recommendation.js';

export class RecommendationService {
  constructor(private readonly repo: IRecommendationRepository) {}

  getPopularInstruments(limit = 4): Promise<RecommendedProduct[]> {
    return this.repo.findPopularProducts(1, limit);
  }

  getPopularLessons(limit = 4): Promise<RecommendedProduct[]> {
    return this.repo.findPopularProducts(2, limit);
  }

  getCoPurchased(productId: number, type: 1 | 2, limit = 5): Promise<RecommendedProduct[]> {
    return this.repo.findCoPurchasedProducts(productId, type, limit);
  }

  getSimilar(productId: number, type: 1 | 2, limit = 5): Promise<RecommendedProduct[]> {
    return this.repo.findSimilarProducts(productId, type, limit);
  }

  getPersonalized(userId: number, limit = 6): Promise<PersonalizedResult> {
    return this.repo.findPersonalizedProducts(userId, limit);
  }

  trackView(productId: number, userId: number | null): Promise<void> {
    return this.repo.trackView(productId, userId);
  }
}
