import { describe, it, expect } from 'vitest';
import type {
  Article,
  ArticleListItem,
  ArticleDetailRow,
  CreateArticleInput,
} from '../../../../src/domain/article/Article.js';

// ── Factory ────────────────────────────────────────────────────────────────────

const makeArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 1,
  auid: 'a-001',
  title: 'Test Article',
  content: '<p>Hello World</p>',
  img: 'cover.png',
  category_id: 2,
  user_id: 10,
  state: 1, // published
  created_time: new Date('2025-01-01T00:00:00Z'),
  valid: 1,
  updated_time: null,
  published_time: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});

// ── Article state rules ────────────────────────────────────────────────────────

describe('Article state values', () => {
  it('state=0 represents a draft', () => {
    const draft = makeArticle({ state: 0, published_time: null });
    expect(draft.state).toBe(0);
    expect(draft.published_time).toBeNull();
  });

  it('state=1 represents a published article', () => {
    const published = makeArticle({ state: 1, published_time: new Date() });
    expect(published.state).toBe(1);
    expect(published.published_time).toBeInstanceOf(Date);
  });

  it('state=2 represents a deleted article', () => {
    const deleted = makeArticle({ state: 2, valid: 0 });
    expect(deleted.state).toBe(2);
    expect(deleted.valid).toBe(0);
  });
});

// ── Nullable fields ────────────────────────────────────────────────────────────

describe('Article nullable fields', () => {
  it('updated_time is null when never edited', () => {
    const a = makeArticle({ updated_time: null });
    expect(a.updated_time).toBeNull();
  });

  it('updated_time is a Date after editing', () => {
    const a = makeArticle({ updated_time: new Date('2025-06-01') });
    expect(a.updated_time).toBeInstanceOf(Date);
  });

  it('published_time is null for drafts', () => {
    const draft = makeArticle({ state: 0, published_time: null });
    expect(draft.published_time).toBeNull();
  });
});

// ── ArticleListItem (extends Article) ─────────────────────────────────────────

describe('ArticleListItem', () => {
  it('extends Article with author and comment fields', () => {
    const item: ArticleListItem = {
      ...makeArticle(),
      category_name: '音樂',
      article_author_name: 'Alice',
      article_author_img: 'alice.png',
      comment_likes: 5,
      user_name: 'Alice',
      user_img: 'alice.png',
    };
    expect(item.category_name).toBe('音樂');
    expect(item.article_author_name).toBe('Alice');
    expect(item.comment_likes).toBe(5);
  });

  it('author and comment fields are nullable', () => {
    const item: ArticleListItem = {
      ...makeArticle(),
      category_name: '音樂',
      article_author_name: null,
      article_author_img: null,
      comment_likes: null,
      user_name: null,
      user_img: null,
    };
    expect(item.article_author_name).toBeNull();
    expect(item.comment_likes).toBeNull();
  });
});

// ── ArticleDetailRow ──────────────────────────────────────────────────────────

describe('ArticleDetailRow', () => {
  it('includes comment fields (one row per comment)', () => {
    const row: ArticleDetailRow = {
      ...makeArticle(),
      category_name: '音樂',
      comment_content: 'Great article!',
      comment_created_time: new Date(),
      comment_likes: 3,
      user_name: 'Bob',
      user_img: 'bob.png',
    };
    expect(row.comment_content).toBe('Great article!');
    expect(row.comment_likes).toBe(3);
  });

  it('comment fields are null when article has no comments', () => {
    const row: ArticleDetailRow = {
      ...makeArticle(),
      category_name: '音樂',
      comment_content: null,
      comment_created_time: null,
      comment_likes: null,
      user_name: null,
      user_img: null,
    };
    expect(row.comment_content).toBeNull();
    expect(row.comment_created_time).toBeNull();
  });
});

// ── CreateArticleInput ────────────────────────────────────────────────────────

describe('CreateArticleInput', () => {
  it('requires title, content, img, category_id, and user_id', () => {
    const input: CreateArticleInput = {
      title: 'New Article',
      content: '<p>Content</p>',
      img: 'cover.png',
      category_id: 1,
      user_id: 5,
    };
    expect(input.title).toBe('New Article');
    expect(input.user_id).toBe(5);
    expect(input.category_id).toBe(1);
  });
});
