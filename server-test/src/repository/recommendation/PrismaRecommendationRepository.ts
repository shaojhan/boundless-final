import type { PrismaClient } from '#generated/prisma/client.js';
import type { IRecommendationRepository } from './IRecommendationRepository.js';
import type { RecommendedProduct, PersonalizedResult } from '#domain/recommendation/Recommendation.js';

// ── Score weights ─────────────────────────────────────────────────────────────
const W_SALES = 0.4;
const W_FAVORITES = 0.3;
const W_RATING = 0.2; // avg_stars mapped to [0, 20] → multiply by 4
const W_RECENCY = 0.1; // bonus 10 if onshelf within 30 days

// ── Helpers ───────────────────────────────────────────────────────────────────

type RawProduct = {
  id: number;
  puid: string | null;
  name: string | null;
  img: string | null;
  price: number | null;
  discount: unknown;
  discount_state: number | null;
  type: number | null;
  sales: number | null;
  onshelf_time: string | null;
  instrumentCategory: { name: string } | null;
  lessonCategory: { name: string } | null;
  _count: { favorites: number };
  reviews: { stars: number }[];
};

function computeScore(p: RawProduct): number {
  const sales = p.sales ?? 0;
  const favorites = p._count.favorites;
  const avgStars =
    p.reviews.length > 0 ? p.reviews.reduce((a, r) => a + r.stars, 0) / p.reviews.length : 0;
  const recency = isRecentOnshelf(p.onshelf_time) ? 10 : 0;
  return sales * W_SALES + favorites * W_FAVORITES + avgStars * 4 * W_RATING + recency * W_RECENCY;
}

function isRecentOnshelf(onshelfTime: string | null): boolean {
  if (!onshelfTime) return false;
  try {
    const d = new Date(onshelfTime);
    return Date.now() - d.getTime() < 30 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function toRecommended(p: RawProduct): RecommendedProduct {
  return {
    id: p.id,
    puid: p.puid,
    name: p.name,
    img: p.img,
    price: p.price,
    discount: p.discount != null ? Number(p.discount) : null,
    discount_state: p.discount_state,
    type: p.type,
    sales: p.sales,
    category_name: p.instrumentCategory?.name ?? p.lessonCategory?.name ?? null,
    score: computeScore(p),
  };
}

const PRODUCT_INCLUDE = {
  _count: { select: { favorites: true } },
  reviews: { select: { stars: true } },
  instrumentCategory: { select: { name: true } },
  lessonCategory: { select: { name: true } },
} as const;

// ── Repository ────────────────────────────────────────────────────────────────

export class PrismaRecommendationRepository implements IRecommendationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ── Algorithm A: Popularity Score ─────────────────────────────────────────

  async findPopularProducts(type: 1 | 2, limit: number): Promise<RecommendedProduct[]> {
    const rows = await this.prisma.product.findMany({
      where: { type, valid: 1 },
      include: PRODUCT_INCLUDE,
    });
    return (rows as unknown as RawProduct[])
      .map(toRecommended)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // ── Algorithm B: Co-purchase (Collaborative Filtering) ─────────────────────

  async findCoPurchasedProducts(
    productId: number,
    type: 1 | 2,
    limit: number,
  ): Promise<RecommendedProduct[]> {
    // --- OrderItem table (ouid-based orders) ---
    const orderItemOuids = await this.prisma.orderItem.findMany({
      where: { product_id: productId },
      select: { ouid: true },
      distinct: ['ouid'],
    });
    const ouids = orderItemOuids.map((o) => o.ouid);

    const orderItemCounts = ouids.length > 0
      ? await this.prisma.orderItem.groupBy({
          by: ['product_id'],
          where: { ouid: { in: ouids }, NOT: { product_id: productId } },
          _count: { product_id: true },
          orderBy: { _count: { product_id: 'desc' } },
          take: limit * 4,
        })
      : [];

    // --- PurchaseItem table (PurchaseOrder-based) ---
    const purchaseOrderIds = await this.prisma.purchaseItem.findMany({
      where: { product_id: productId },
      select: { order_id: true },
      distinct: ['order_id'],
    });
    const purchaseIds = purchaseOrderIds.map((p) => p.order_id);

    const purchaseItemCounts = purchaseIds.length > 0
      ? await this.prisma.purchaseItem.groupBy({
          by: ['product_id'],
          where: { order_id: { in: purchaseIds }, NOT: { product_id: productId } },
          _count: { product_id: true },
          orderBy: { _count: { product_id: 'desc' } },
          take: limit * 4,
        })
      : [];

    // Merge & deduplicate by product_id, summing counts
    const countMap = new Map<number, number>();
    for (const r of orderItemCounts) countMap.set(r.product_id, (countMap.get(r.product_id) ?? 0) + r._count.product_id);
    for (const r of purchaseItemCounts) countMap.set(r.product_id, (countMap.get(r.product_id) ?? 0) + r._count.product_id);

    if (countMap.size === 0) {
      // No co-purchase data → fall back to content-based
      return this.findSimilarProducts(productId, type, limit);
    }

    const sortedIds = [...countMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit * 2)
      .map(([id]) => id);

    const products = await this.prisma.product.findMany({
      where: { id: { in: sortedIds }, type, valid: 1 },
      include: PRODUCT_INCLUDE,
    });

    const result = (products as unknown as RawProduct[]).map(toRecommended);

    // If still not enough, fill with similar products
    if (result.length < limit) {
      const existing = new Set(result.map((p) => p.id));
      existing.add(productId);
      const fill = await this.findSimilarProducts(productId, type, limit);
      for (const p of fill) {
        if (!existing.has(p.id)) result.push(p);
        if (result.length >= limit) break;
      }
    }

    return result.slice(0, limit);
  }

  // ── Algorithm C: Content-based Similarity ─────────────────────────────────

  async findSimilarProducts(
    productId: number,
    type: 1 | 2,
    limit: number,
  ): Promise<RecommendedProduct[]> {
    const target = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!target) return [];

    const categoryWhere =
      type === 1
        ? { instrument_category_id: target.instrument_category_id ?? undefined }
        : { lesson_category_id: target.lesson_category_id ?? undefined };

    const rows = await this.prisma.product.findMany({
      where: { type, valid: 1, NOT: { id: productId }, ...categoryWhere },
      include: PRODUCT_INCLUDE,
    });

    return (rows as unknown as RawProduct[])
      .map(toRecommended)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // ── Algorithm D: Personalized ─────────────────────────────────────────────

  async findPersonalizedProducts(userId: number, limit: number): Promise<PersonalizedResult> {
    // Gather user's purchased product IDs and their categories
    const purchasedItems = await this.prisma.purchaseItem.findMany({
      where: { purchaseOrder: { user_id: userId } },
      select: {
        product_id: true,
        product: {
          select: {
            type: true,
            instrument_category_id: true,
            lesson_category_id: true,
          },
        },
      },
    });

    // Gather user's favorited products and their categories
    const favorites = await this.prisma.favorite.findMany({
      where: { uid: userId },
      select: {
        pid: true,
        product: {
          select: {
            type: true,
            instrument_category_id: true,
            lesson_category_id: true,
          },
        },
      },
    });

    const purchasedProductIds = new Set(purchasedItems.map((i) => i.product_id));

    // Build category preference counts (weight: purchase=2, favorite=1)
    const instrCatCount = new Map<number, number>();
    const lessonCatCount = new Map<number, number>();

    for (const item of purchasedItems) {
      if (item.product.type === 1 && item.product.instrument_category_id != null) {
        instrCatCount.set(item.product.instrument_category_id, (instrCatCount.get(item.product.instrument_category_id) ?? 0) + 2);
      }
      if (item.product.type === 2 && item.product.lesson_category_id != null) {
        lessonCatCount.set(item.product.lesson_category_id, (lessonCatCount.get(item.product.lesson_category_id) ?? 0) + 2);
      }
    }
    for (const fav of favorites) {
      if (fav.product.type === 1 && fav.product.instrument_category_id != null) {
        instrCatCount.set(fav.product.instrument_category_id, (instrCatCount.get(fav.product.instrument_category_id) ?? 0) + 1);
      }
      if (fav.product.type === 2 && fav.product.lesson_category_id != null) {
        lessonCatCount.set(fav.product.lesson_category_id, (lessonCatCount.get(fav.product.lesson_category_id) ?? 0) + 1);
      }
    }

    // Top preferred categories
    const topInstrCats = [...instrCatCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);
    const topLessonCats = [...lessonCatCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);

    // Fetch candidates from preferred categories, exclude already purchased
    const [instrRows, lessonRows] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          type: 1,
          valid: 1,
          NOT: { id: { in: [...purchasedProductIds] } },
          ...(topInstrCats.length > 0 ? { instrument_category_id: { in: topInstrCats } } : {}),
        },
        include: PRODUCT_INCLUDE,
      }),
      this.prisma.product.findMany({
        where: {
          type: 2,
          valid: 1,
          NOT: { id: { in: [...purchasedProductIds] } },
          ...(topLessonCats.length > 0 ? { lesson_category_id: { in: topLessonCats } } : {}),
        },
        include: PRODUCT_INCLUDE,
      }),
    ]);

    const instruments = (instrRows as unknown as RawProduct[])
      .map(toRecommended)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const lessons = (lessonRows as unknown as RawProduct[])
      .map(toRecommended)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Fallback: if no personalized data, return global popular
    if (instruments.length === 0) {
      const fallback = await this.findPopularProducts(1, limit);
      return { instruments: fallback, lessons };
    }
    if (lessons.length === 0) {
      const fallback = await this.findPopularProducts(2, limit);
      return { instruments, lessons: fallback };
    }

    return { instruments, lessons };
  }

  // ── View Tracking ─────────────────────────────────────────────────────────

  async trackView(productId: number, userId: number | null): Promise<void> {
    await this.prisma.productView.create({
      data: { product_id: productId, user_id: userId },
    });
  }
}
