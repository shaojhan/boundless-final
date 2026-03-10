import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArticleService } from '#src/service/article/ArticleService.js';
import type { IArticleRepository } from '#src/repository/article/IArticleRepository.js';
import type {
  ArticleListItem,
  ArticleDetailRow,
} from '#src/domain/article/Article.js';

// ── Fixtures ───────────────────────────────────────────────────────────────────

const now = new Date('2025-01-01T00:00:00Z');

const mockListItem: ArticleListItem = {
  id: 1,
  auid: 'ABC123DEF456',
  title: '測試文章',
  content: '<p>內容</p>',
  img: 'cover.jpg',
  category_id: 1,
  user_id: 10,
  state: 1,
  created_time: now,
  valid: 1,
  updated_time: null,
  published_time: null,
  category_name: '留言分享',
  article_author_name: '作者A',
  article_author_img: null,
  comment_likes: null,
  user_name: null,
  user_img: null,
};

const mockDetailRow: ArticleDetailRow = {
  id: 1,
  auid: 'ABC123DEF456',
  title: '測試文章',
  content: '<p>內容</p>',
  img: 'cover.jpg',
  category_id: 1,
  user_id: 10,
  state: 1,
  created_time: now,
  valid: 1,
  updated_time: null,
  published_time: null,
  category_name: '留言分享',
  comment_content: '好文',
  comment_created_time: now,
  comment_likes: 3,
  user_name: '讀者B',
  user_img: null,
};

function makeRepo(): IArticleRepository {
  return {
    findArticles: vi.fn(),
    findArticleByAuid: vi.fn(),
    createArticle: vi.fn(),
    updateArticleContent: vi.fn(),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ArticleService.getArticles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無 opts → 回傳所有文章', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findArticles).mockResolvedValue([mockListItem]);

    const service = new ArticleService(repo);
    const result = await service.getArticles({});

    expect(result).toHaveLength(1);
    expect(result[0].auid).toBe('ABC123DEF456');
    expect(repo.findArticles).toHaveBeenCalledWith({});
  });

  it('傳入 categoryId 給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findArticles).mockResolvedValue([]);

    const service = new ArticleService(repo);
    await service.getArticles({ categoryId: 1, useNickname: false });

    expect(repo.findArticles).toHaveBeenCalledWith({ categoryId: 1, useNickname: false });
  });

  it('空結果 → 回傳空陣列', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findArticles).mockResolvedValue([]);

    const service = new ArticleService(repo);
    expect(await service.getArticles({ categoryId: 99 })).toHaveLength(0);
  });
});

describe('ArticleService.getArticleDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到文章 → 回傳 detail 陣列', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findArticleByAuid).mockResolvedValue([mockDetailRow]);

    const service = new ArticleService(repo);
    const result = await service.getArticleDetail('ABC123DEF456');

    expect(result).toHaveLength(1);
    expect(result![0].comment_content).toBe('好文');
    expect(repo.findArticleByAuid).toHaveBeenCalledWith('ABC123DEF456');
  });

  it('找不到文章 → 回傳 null', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findArticleByAuid).mockResolvedValue(null);

    const service = new ArticleService(repo);
    expect(await service.getArticleDetail('NONEXIST')).toBeNull();
  });
});

describe('ArticleService.createArticle', () => {
  beforeEach(() => vi.clearAllMocks());

  it('建立文章 → 回傳 auid', async () => {
    const repo = makeRepo();
    vi.mocked(repo.createArticle).mockResolvedValue('NEWUID000001');

    const service = new ArticleService(repo);
    const auid = await service.createArticle({
      title: '新文章',
      content: '<p>Hello</p>',
      img: 'new.jpg',
      category_id: 2,
      user_id: 5,
    });

    expect(auid).toBe('NEWUID000001');
    expect(repo.createArticle).toHaveBeenCalledWith({
      title: '新文章',
      content: '<p>Hello</p>',
      img: 'new.jpg',
      category_id: 2,
      user_id: 5,
    });
  });
});

describe('ArticleService.updateArticleContent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('更新內容 → 呼叫 repo 並正確傳參', async () => {
    const repo = makeRepo();
    vi.mocked(repo.updateArticleContent).mockResolvedValue();

    const service = new ArticleService(repo);
    await service.updateArticleContent('ABC123DEF456', '<p>Updated</p>');

    expect(repo.updateArticleContent).toHaveBeenCalledWith('ABC123DEF456', '<p>Updated</p>');
  });
});
