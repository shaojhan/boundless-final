import { z } from 'zod';

/** POST /api/article/upload body (after multer parses multipart form) */
export const CreateArticleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category_id: z.coerce.number().int().positive(),
  user_id: z.coerce.number().int().positive(),
});

/** PUT /api/article/edit/:auid body */
export const UpdateArticleSchema = z.object({
  content: z.string().min(1),
});

/** GET /api/article/:auid param */
export const AuidParamSchema = z.object({
  auid: z.string().min(1),
});
