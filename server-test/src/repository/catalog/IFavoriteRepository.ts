import type { FavoriteItem } from '#domain/catalog/Favorite.js';

export interface IFavoriteRepository {
  findByUser(userId: number): Promise<FavoriteItem[]>;
  findStatus(userId: number, pid: number): Promise<boolean>;
  add(userId: number, pid: number): Promise<void>;
  remove(userId: number, pid: number): Promise<void>;
}
