import type { PrismaClient } from '#generated/prisma/client.js';
import type { IFavoriteRepository } from './IFavoriteRepository.js';
import type { FavoriteItem } from '#domain/catalog/Favorite.js';

export class PrismaFavoriteRepository implements IFavoriteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUser(userId: number): Promise<FavoriteItem[]> {
    const rows = await this.prisma.favorite.findMany({
      where: { uid: userId },
      orderBy: { created_at: 'desc' },
      include: {
        product: {
          select: { id: true, puid: true, name: true, price: true, img: true, type: true },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      pid: row.pid,
      puid: row.product.puid ?? '',
      name: row.product.name ?? '',
      price: row.product.price ?? null,
      img: row.product.img ?? null,
      type: row.product.type ?? null,
      created_at: row.created_at,
    }));
  }

  async findStatus(userId: number, pid: number): Promise<boolean> {
    const row = await this.prisma.favorite.findFirst({
      where: { uid: userId, pid },
    });
    return row !== null;
  }

  async add(userId: number, pid: number): Promise<void> {
    const existing = await this.prisma.favorite.findFirst({
      where: { uid: userId, pid },
    });
    if (existing) return;

    const now = new Date();
    await this.prisma.favorite.create({
      data: { uid: userId, pid, created_at: now, updated_at: now },
    });
  }

  async remove(userId: number, pid: number): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: { uid: userId, pid },
    });
  }
}
