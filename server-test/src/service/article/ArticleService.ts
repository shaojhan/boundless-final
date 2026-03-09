import type {
  IArticleRepository,
  ArticleFindOptions,
} from '../../repository/article/IArticleRepository.js';
import type {
  ArticleListItem,
  ArticleDetailRow,
  CreateArticleInput,
} from '../../domain/article/Article.js';

export class ArticleService {
  constructor(private readonly repo: IArticleRepository) {}

  async getArticles(opts: ArticleFindOptions): Promise<ArticleListItem[]> {
    return this.repo.findArticles(opts);
  }

  async getArticleDetail(auid: string): Promise<ArticleDetailRow[] | null> {
    return this.repo.findArticleByAuid(auid);
  }

  async createArticle(data: CreateArticleInput): Promise<string> {
    return this.repo.createArticle(data);
  }

  async updateArticleContent(auid: string, content: string): Promise<void> {
    return this.repo.updateArticleContent(auid, content);
  }
}
