import { z } from 'zod';

export const PaginationSchema = z.object({
  page:     z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export const UpdateStockSchema = z.object({
  stock: z.number().int().min(0),
});

export const PuidParamSchema = z.object({
  puid: z.string().min(1),
});
