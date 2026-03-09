import { z } from 'zod';

export const InstrumentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  brandSelect: z.coerce.number().int().optional(),
  priceLow: z.coerce.number().int().optional(),
  priceHigh: z.coerce.number().int().optional(),
  promotion: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export const LessonQuerySchema = z.object({
  priceLow: z.coerce.number().int().optional(),
  priceHigh: z.coerce.number().int().optional(),
});

export const CategoryParamSchema = z.object({
  category: z.string(),
});
