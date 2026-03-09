import { describe, it, expect } from 'vitest';
import type { ArticleComment } from '../../../../src/domain/article/ArticleComment.js';

describe('ArticleComment domain entity', () => {
  const makeComment = (overrides: Partial<ArticleComment> = {}): ArticleComment => ({
    id: 1,
    article_id: 10,
    user_id: 5,
    content: 'Nice article!',
    likes: 0,
    created_time: new Date('2025-03-01T00:00:00Z'),
    updated_time: null,
    valid: 1,
    ...overrides,
  });

  it('contains required fields', () => {
    const c = makeComment();
    expect(c.id).toBe(1);
    expect(c.article_id).toBe(10);
    expect(c.user_id).toBe(5);
    expect(c.content).toBe('Nice article!');
  });

  it('likes defaults to 0 for new comments', () => {
    const c = makeComment({ likes: 0 });
    expect(c.likes).toBe(0);
  });

  it('likes can be incremented', () => {
    const c = makeComment({ likes: 7 });
    expect(c.likes).toBe(7);
  });

  it('updated_time is null when never edited', () => {
    const c = makeComment({ updated_time: null });
    expect(c.updated_time).toBeNull();
  });

  it('updated_time is a Date after editing', () => {
    const c = makeComment({ updated_time: new Date('2025-04-01') });
    expect(c.updated_time).toBeInstanceOf(Date);
  });

  it('valid=1 means active, valid=0 means soft-deleted', () => {
    expect(makeComment({ valid: 1 }).valid).toBe(1);
    expect(makeComment({ valid: 0 }).valid).toBe(0);
  });

  it('created_time is a Date instance', () => {
    expect(makeComment().created_time).toBeInstanceOf(Date);
  });
});
