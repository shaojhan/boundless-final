import { describe, it, expect } from 'vitest';
import type { InstrumentCategory, LessonCategory } from '#src/domain/catalog/Category.js';

describe('InstrumentCategory', () => {
  it('top-level category has null parent_id', () => {
    const root: InstrumentCategory = { id: 1, parent_id: null, name: '樂器' };
    expect(root.parent_id).toBeNull();
  });

  it('sub-category references a parent', () => {
    const sub: InstrumentCategory = { id: 3, parent_id: 1, name: '吉他' };
    expect(sub.parent_id).toBe(1);
  });

  it('name is a non-empty string', () => {
    const c: InstrumentCategory = { id: 2, parent_id: null, name: '鋼琴' };
    expect(c.name.length).toBeGreaterThan(0);
  });
});

describe('LessonCategory', () => {
  it('valid flag can be 0 or 1', () => {
    const active: LessonCategory = { id: 1, name: '吉他課', valid: 1 };
    const inactive: LessonCategory = { id: 2, name: '鋼琴課', valid: 0 };
    expect(active.valid).toBe(1);
    expect(inactive.valid).toBe(0);
  });

  it('has id, name, valid fields', () => {
    const c: LessonCategory = { id: 5, name: '烏克麗麗', valid: 1 };
    expect(c.id).toBe(5);
    expect(c.name).toBe('烏克麗麗');
  });
});
