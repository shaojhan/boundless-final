import type { IFavoriteRepository } from '#repository/catalog/IFavoriteRepository.js';
import type { FavoriteItem } from '#domain/catalog/Favorite.js';

export class FavoriteService {
  constructor(private readonly repo: IFavoriteRepository) {}

  async getUserFavorites(userId: number): Promise<FavoriteItem[]> {
    return this.repo.findByUser(userId);
  }

  async getStatus(userId: number, pid: number): Promise<boolean> {
    return this.repo.findStatus(userId, pid);
  }

  async add(userId: number, pid: number): Promise<void> {
    return this.repo.add(userId, pid);
  }

  async remove(userId: number, pid: number): Promise<void> {
    return this.repo.remove(userId, pid);
  }
}
