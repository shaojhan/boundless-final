import type {
  ArticleListItem,
  ArticleDetailRow,
  CreateArticleInput,
} from '../../domain/article/Article.js';

export interface ArticleFindOptions {
  categoryId?: number;
  userId?: number;
  /** true = use author.nickname (default); false = use author.name */
  useNickname?: boolean;
}

export interface IArticleRepository {
  findArticles(opts: ArticleFindOptions): Promise<ArticleListItem[]>;
  findArticleByAuid(auid: string): Promise<ArticleDetailRow[] | null>;
  createArticle(data: CreateArticleInput): Promise<string>; // returns auid
  updateArticleContent(auid: string, content: string): Promise<void>;
}
