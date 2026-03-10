import type { PrismaClient } from '#generated/prisma/client.js';
import type {
  IArticleRepository,
  ArticleFindOptions,
} from './IArticleRepository.js';
import type {
  ArticleListItem,
  ArticleDetailRow,
  CreateArticleInput,
} from '#domain/article/Article.js';

// ── UID generator (moved from routes/article.ts) ─────────────────────────────

function generateUid(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uid = '';
  for (let i = 0; i < 12; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uid;
}

// ── Prisma shape types ────────────────────────────────────────────────────────

type PrismaArticleWithRelations = {
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
  category: { name: string };
  author: { name: string; nickname: string | null; img: string | null };
  comments: Array<{
    content: string;
    created_time: Date;
    likes: number;
    commenter: { name: string; img: string | null };
  }>;
};

// ── Mappers (absorbs lib/article-flatten.ts logic) ───────────────────────────

function flattenForList(
  article: PrismaArticleWithRelations,
  useNickname: boolean
): ArticleListItem[] {
  const { category, author, comments, ...fields } = article;
  const base = {
    ...fields,
    category_name: category.name,
    article_author_name: useNickname ? author.nickname : author.name,
    article_author_img: author.img,
  };
  if (comments.length === 0) {
    return [{ ...base, comment_likes: null, user_name: null, user_img: null }];
  }
  return comments.map((c) => ({
    ...base,
    comment_likes: c.likes,
    user_name: c.commenter.name,
    user_img: c.commenter.img,
  }));
}

function flattenForDetail(
  article: PrismaArticleWithRelations
): ArticleDetailRow[] {
  const { category, comments, author: _author, ...fields } = article;
  const base = { ...fields, category_name: category.name };
  if (comments.length === 0) {
    return [
      {
        ...base,
        comment_content: null,
        comment_created_time: null,
        comment_likes: null,
        user_name: null,
        user_img: null,
      },
    ];
  }
  return comments.map((c) => ({
    ...base,
    comment_content: c.content,
    comment_created_time: c.created_time,
    comment_likes: c.likes,
    user_name: c.commenter.name,
    user_img: c.commenter.img,
  }));
}

// ── Repository ────────────────────────────────────────────────────────────────

export class PrismaArticleRepository implements IArticleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findArticles(opts: ArticleFindOptions): Promise<ArticleListItem[]> {
    const useNickname = opts.useNickname !== false; // default true
    const articles = await this.prisma.article.findMany({
      where: {
        ...(opts.categoryId !== undefined
          ? { category_id: opts.categoryId }
          : {}),
        ...(opts.userId !== undefined ? { user_id: opts.userId } : {}),
      },
      include: {
        category: true,
        author: { select: { name: true, nickname: true, img: true } },
        comments: {
          include: { commenter: { select: { name: true, img: true } } },
        },
      },
      orderBy: { id: 'asc' },
    });
    return articles.flatMap((a) =>
      flattenForList(a as PrismaArticleWithRelations, useNickname)
    );
  }

  async findArticleByAuid(auid: string): Promise<ArticleDetailRow[] | null> {
    const article = await this.prisma.article
      .findFirst({
        where: { auid },
        include: {
          category: true,
          author: { select: { name: true, nickname: true, img: true } },
          comments: {
            include: { commenter: { select: { name: true, img: true } } },
          },
        },
      })
      .catch(() => undefined);

    if (!article) return null;
    return flattenForDetail(article as PrismaArticleWithRelations);
  }

  async createArticle(data: CreateArticleInput): Promise<string> {
    const auid = generateUid();
    await this.prisma.article.create({
      data: {
        auid,
        title: data.title,
        content: data.content,
        img: data.img,
        category_id: data.category_id,
        user_id: data.user_id,
        state: 0,
      },
    });
    return auid;
  }

  async updateArticleContent(auid: string, content: string): Promise<void> {
    await this.prisma.article.updateMany({
      where: { auid },
      data: { content },
    });
  }
}
