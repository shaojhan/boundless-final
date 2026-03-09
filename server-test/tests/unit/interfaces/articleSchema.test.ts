import { describe, it, expect } from 'vitest';
import {
  CreateArticleSchema,
  UpdateArticleSchema,
  AuidParamSchema,
} from '../../../src/interfaces/schemas/articleSchema.js';

// ── CreateArticleSchema ────────────────────────────────────────────────────────

describe('CreateArticleSchema', () => {
  it('合法輸入 → 通過，數字欄位 coerce', () => {
    const result = CreateArticleSchema.safeParse({
      title: '測試標題',
      content: '<p>內容</p>',
      category_id: '2',
      user_id: '10',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category_id).toBe(2);
      expect(result.data.user_id).toBe(10);
    }
  });

  it('數字欄位已是 number → 通過', () => {
    const result = CreateArticleSchema.safeParse({
      title: '標題',
      content: '內容',
      category_id: 1,
      user_id: 5,
    });
    expect(result.success).toBe(true);
  });

  it('缺少 title → 失敗', () => {
    const result = CreateArticleSchema.safeParse({
      content: '內容',
      category_id: 1,
      user_id: 5,
    });
    expect(result.success).toBe(false);
  });

  it('缺少 content → 失敗', () => {
    const result = CreateArticleSchema.safeParse({
      title: '標題',
      category_id: 1,
      user_id: 5,
    });
    expect(result.success).toBe(false);
  });

  it('title 為空字串 → 失敗', () => {
    const result = CreateArticleSchema.safeParse({
      title: '',
      content: '內容',
      category_id: 1,
      user_id: 5,
    });
    expect(result.success).toBe(false);
  });

  it('category_id 為 0（非 positive）→ 失敗', () => {
    const result = CreateArticleSchema.safeParse({
      title: '標題',
      content: '內容',
      category_id: 0,
      user_id: 5,
    });
    expect(result.success).toBe(false);
  });
});

// ── UpdateArticleSchema ────────────────────────────────────────────────────────

describe('UpdateArticleSchema', () => {
  it('合法 content → 通過', () => {
    const result = UpdateArticleSchema.safeParse({ content: '<p>Updated</p>' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.content).toBe('<p>Updated</p>');
  });

  it('content 為空字串 → 失敗', () => {
    expect(UpdateArticleSchema.safeParse({ content: '' }).success).toBe(false);
  });

  it('缺少 content → 失敗', () => {
    expect(UpdateArticleSchema.safeParse({}).success).toBe(false);
  });
});

// ── AuidParamSchema ────────────────────────────────────────────────────────────

describe('AuidParamSchema', () => {
  it('合法 auid → 通過', () => {
    const result = AuidParamSchema.safeParse({ auid: 'ABC123DEF456' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.auid).toBe('ABC123DEF456');
  });

  it('空字串 auid → 失敗', () => {
    expect(AuidParamSchema.safeParse({ auid: '' }).success).toBe(false);
  });

  it('缺少 auid → 失敗', () => {
    expect(AuidParamSchema.safeParse({}).success).toBe(false);
  });
});
