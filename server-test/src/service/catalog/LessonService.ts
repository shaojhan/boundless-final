import type { IProductRepository, LessonFilters } from '#repository/catalog/IProductRepository.js';
import type { LessonProduct, LessonProductDetail, HomepageLesson } from '#domain/catalog/Product.js';
import type { LessonCategory } from '#domain/catalog/Category.js';

export class LessonService {
  constructor(private readonly repo: IProductRepository) {}

  async getProducts(filters: LessonFilters): Promise<LessonProduct[]> {
    return this.repo.findLessons(filters);
  }

  async getCategories(): Promise<LessonCategory[]> {
    return this.repo.findLessonCategories();
  }

  async getProductsByCategory(categoryId: number | null): Promise<LessonProduct[]> {
    return this.repo.findLessonsByCategory(categoryId);
  }

  async getProductDetail(puid: string): Promise<LessonProductDetail | null> {
    return this.repo.findLessonDetail(puid);
  }

  async getHomepageLessons(): Promise<HomepageLesson[]> {
    return this.repo.findHomepageLessons();
  }
}
