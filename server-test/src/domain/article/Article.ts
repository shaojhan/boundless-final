/**
 * Article Domain Entities
 * Pure TypeScript — no Prisma / Express imports.
 */

/** Core Article entity */
export interface Article {
  id: number;
  auid: string;
  title: string;
  content: string;
  img: string;
  category_id: number;
  user_id: number;
  /** 0 = draft, 1 = published, 2 = deleted */
  state: number;
  created_time: Date;
  valid: number;
  updated_time: Date | null;
  published_time: Date | null;
}

/** Flat article row returned by list endpoints (includes category + author + comment fields) */
export interface ArticleListItem extends Article {
  category_name: string;
  article_author_name: string | null;
  article_author_img: string | null;
  comment_likes: number | null;
  user_name: string | null;
  user_img: string | null;
}

/** Flat row returned by GET /:auid (one row per comment) */
export interface ArticleDetailRow {
  id: number;
  auid: string;
  title: string;
  content: string;
  img: string;
  category_id: number;
  user_id: number;
  state: number;
  created_time: Date;
  valid: number;
  updated_time: Date | null;
  published_time: Date | null;
  category_name: string;
  comment_content: string | null;
  comment_created_time: Date | null;
  comment_likes: number | null;
  user_name: string | null;
  user_img: string | null;
}

/** Input for creating a new article */
export interface CreateArticleInput {
  title: string;
  content: string;
  img: string;
  category_id: number;
  user_id: number;
}
