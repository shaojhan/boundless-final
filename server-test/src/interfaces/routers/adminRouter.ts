import express from 'express';
import { checkAdmin } from '#middleware/checkAdmin.js';
import type { AdminService } from '#service/admin/AdminService.js';
import { PaginationSchema, UpdateStockSchema, PuidParamSchema, CreateProductSchema } from '#interfaces/schemas/adminSchema.js';

export function createAdminRouter(adminService: AdminService) {
  const router = express.Router();

  // Protect all admin routes
  router.use(checkAdmin);

  // GET /api/admin/stats
  router.get('/stats', async (_req, res, next) => {
    try {
      const stats = await adminService.getStats();
      return res.json({ status: 'success', data: stats });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/admin/products?page=1&pageSize=20
  router.get('/products', async (req, res, next) => {
    const parsed = PaginationSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效參數' });
    }
    try {
      const result = await adminService.getProducts(parsed.data);
      return res.json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/products
  router.post('/products', async (req, res, next) => {
    const parsed = CreateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效參數', details: parsed.error.flatten() });
    }
    try {
      const product = await adminService.createProduct(parsed.data as import('#domain/admin/Admin.js').CreateProductInput);
      return res.status(201).json({ status: 'success', data: product });
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
      return res.status(statusCode).json({ status: 'error', message: (err as Error).message });
    }
  });

  // PATCH /api/admin/products/:puid/stock
  router.patch('/products/:puid/stock', async (req, res, next) => {
    const paramParsed = PuidParamSchema.safeParse(req.params);
    const bodyParsed = UpdateStockSchema.safeParse(req.body);
    if (!paramParsed.success || !bodyParsed.success) {
      return res.status(400).json({ status: 'error', message: '無效參數' });
    }
    try {
      const product = await adminService.updateStock(paramParsed.data.puid, bodyParsed.data.stock);
      if (!product) {
        return res.status(404).json({ status: 'error', message: '找不到商品' });
      }
      return res.json({ status: 'success', data: product });
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
      return res.status(statusCode).json({ status: 'error', message: (err as Error).message });
    }
  });

  // GET /api/admin/orders?page=1&pageSize=20
  router.get('/orders', async (req, res, next) => {
    const parsed = PaginationSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效參數' });
    }
    try {
      const result = await adminService.getOrders(parsed.data);
      return res.json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
