import type { PrismaClient } from '#generated/prisma/client.js';
import { randomBytes } from 'crypto';
import type { IAdminRepository, AdminProductFilters } from './IAdminRepository.js';
import type { AdminProduct, AdminOrder, AdminStats, CreateProductInput } from '#domain/admin/Admin.js';

const DEFAULT_PAGE_SIZE = 20;

export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllProducts(filters: AdminProductFilters): Promise<{ items: AdminProduct[]; total: number }> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const [total, rows] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.findMany({
        select: { id: true, puid: true, name: true, type: true, price: true, stock: true, sales: true, valid: true },
        orderBy: { id: 'asc' },
        skip,
        take: pageSize,
      }),
    ]);

    const items: AdminProduct[] = rows.map((r) => ({
      id: r.id,
      puid: r.puid,
      name: r.name,
      type: r.type,
      price: r.price !== null ? Number(r.price) : null,
      stock: r.stock,
      sales: r.sales,
      valid: r.valid,
    }));

    return { items, total };
  }

  async updateProductStock(puid: string, stock: number): Promise<AdminProduct | null> {
    const product = await this.prisma.product.findFirst({ where: { puid } });
    if (!product) return null;

    const updated = await this.prisma.product.update({
      where: { id: product.id },
      select: { id: true, puid: true, name: true, type: true, price: true, stock: true, sales: true, valid: true },
      data: { stock },
    });

    return {
      id: updated.id,
      puid: updated.puid,
      name: updated.name,
      type: updated.type,
      price: updated.price !== null ? Number(updated.price) : null,
      stock: updated.stock,
      sales: updated.sales,
      valid: updated.valid,
    };
  }

  async createProduct(input: CreateProductInput): Promise<AdminProduct> {
    const puid = randomBytes(6).toString('hex'); // 12-char hex string
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const created = await this.prisma.product.create({
      select: { id: true, puid: true, name: true, type: true, price: true, stock: true, sales: true, valid: true },
      data: {
        puid,
        name: input.name,
        type: input.type,
        price: input.price,
        stock: input.type === 1 ? (input.stock ?? 0) : null,
        sales: 0,
        valid: 1,
        instrument_category_id: input.instrument_category_id ?? null,
        lesson_category_id: input.lesson_category_id ?? null,
        created_time: now,
        onshelf_time: now,
        updated_time: now,
      },
    });

    return {
      id: created.id,
      puid: created.puid,
      name: created.name,
      type: created.type,
      price: created.price !== null ? Number(created.price) : null,
      stock: created.stock,
      sales: created.sales,
      valid: created.valid,
    };
  }

  async findAllOrders(filters: { page?: number; pageSize?: number }): Promise<{ items: AdminOrder[]; total: number }> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const [total, rows] = await Promise.all([
      this.prisma.orderTotal.count(),
      this.prisma.orderTotal.findMany({
        orderBy: { created_time: 'desc' },
        skip,
        take: pageSize,
        include: {
          orderItems: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    const items: AdminOrder[] = rows.map((o) => ({
      id: o.id,
      ouid: o.ouid ?? '',
      user_id: o.user_id ?? '',
      payment: o.payment !== null ? Number(o.payment) : 0,
      created_time: o.created_time ?? new Date(),
      items: o.orderItems.map((item) => ({
        product_id: item.product_id ?? 0,
        product_name: item.product?.name ?? null,
        quantity: item.quantity ?? 0,
      })),
    }));

    return { items, total };
  }

  async getStats(): Promise<AdminStats> {
    const [totalOrders, revenueAgg, productCount] = await Promise.all([
      this.prisma.orderTotal.count(),
      this.prisma.orderTotal.aggregate({ _sum: { payment: true } }),
      this.prisma.product.count({ where: { valid: 1 } }),
    ]);

    return {
      totalOrders,
      totalRevenue: Number(revenueAgg._sum.payment ?? 0),
      productCount,
    };
  }
}
