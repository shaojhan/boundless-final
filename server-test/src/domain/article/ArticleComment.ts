/**
 * ArticleComment Domain Entity
 * Pure TypeScript — no Prisma / Express imports.
 */
export interface ArticleComment {
  id: number;
  article_id: number;
  user_id: number;
  content: string;
  likes: number;
  created_time: Date;
  updated_time: Date | null;
  valid: number;
}
