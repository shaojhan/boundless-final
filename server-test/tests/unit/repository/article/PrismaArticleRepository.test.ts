import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '#generated/prisma/client.js';
import { PrismaArticleRepository } from '#src/repository/article/PrismaArticleRepository.js';

// ── Prisma mock ────────────────────────────────────────────────────────────────

function makePrisma() {
  return {
    article: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
  } as unknown as PrismaClient;
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const now = new Date('2025-06-01T00:00:00Z');
const commentTime = new Date('2025-06-02T00:00:00Z');

/** 基礎 Prisma article row（無留言）*/
function makeRawArticle(overrides: Partial<{
  auid: string;
  authorNickname: string | null;
  authorName: string;
  comments: unknown[];
}> = {}) {
  return {
    id: 1,
    auid: overrides.auid ?? 'AUID00000001',
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
    category: { name: '留言分享' },
    author: {
      name: overrides.authorName ?? '真名',
      nickname: overrides.authorNickname ?? '暱稱',
      img: null,
    },
    comments: overrides.comments ?? [],
  };
}

const twoComments = [
  {
    content: '第一則留言',
    created_time: commentTime,
    likes: 5,
    commenter: { name: '讀者A', img: null },
  },
  {
    content: '第二則留言',
    created_time: commentTime,
    likes: 2,
    commenter: { name: '讀者B', img: '/b.jpg' },
  },
];

// ── findArticles ───────────────────────────────────────────────────────────────

describe('PrismaArticleRepository.findArticles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無 opts → findMany 不帶 where 條件，回傳 flat row', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findMany).mockResolvedValue([makeRawArticle()] as any);

    const repo = new PrismaArticleRepository(prisma);
    const result = await repo.findArticles({});

    expect(result).toHaveLength(1);
    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('帶 categoryId → where 含 category_id', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findMany).mockResolvedValue([]);

    const repo = new PrismaArticleRepository(prisma);
    await repo.findArticles({ categoryId: 2 });

    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { category_id: 2 } }),
    );
  });

  it('帶 userId → where 含 user_id', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findMany).mockResolvedValue([]);

    const repo = new PrismaArticleRepository(prisma);
    await repo.findArticles({ userId: 5 });

    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { user_id: 5 } }),
    );
  });

  it('useNickname=true（預設）→ article_author_name = author.nickname', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findMany).mockResolvedValue([
      makeRawArticle({ authorNickname: '暱稱版', authorName: '真名版' }),
    ] as any);

    const repo = new PrismaArticleRepository(prisma);
    const result = await repo.findArticles({});

    expect(result[0].article_author_name).toBe('暱稱版');
  });

  it('useNickname=false → article_author_name = author.name', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findMany).mockResolvedValue([
      makeRawArticle({ authorNickname: '暱稱版', authorName: '真名版' }),
    ] as any);

    const repo = new PrismaArticleRepository(prisma);
    const result = await repo.findArticles({ useNickname: false });

    expect(result[0].article_author_name).toBe('真名版');
  });

  it('文章無留言 → 回傳 1 row，comment 欄位皆 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findMany).mockResolvedValue([
      makeRawArticle({ comments: [] }),
    ] as any);

    const repo = new PrismaArticleRepository(prisma);
    const result = await repo.findArticles({});

    expect(result).toHaveLength(1);
    expect(result[0].comment_likes).toBeNull();
    expect(result[0].user_name).toBeNull();
    expect(result[0].user_img).toBeNull();
  });

  it('文章有 2 則留言 → 回傳 2 rows（每則留言各一列）', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findMany).mockResolvedValue([
      makeRawArticle({ comments: twoComments }),
    ] as any);

    const repo = new PrismaArticleRepository(prisma);
    const result = await repo.findArticles({});

    expect(result).toHaveLength(2);
    expect(result[0].comment_likes).toBe(5);
    expect(result[0].user_name).toBe('讀者A');
    expect(result[1].comment_likes).toBe(2);
    expect(result[1].user_name).toBe('讀者B');
    expect(result[1].user_img).toBe('/b.jpg');
  });

  it('多篇文章各有留言 → flatMap 正確展開', async () => {
    const prisma = makePrisma();
    const a1 = makeRawArticle({ auid: 'A001', comments: [twoComments[0]] });
    const a2 = { ...makeRawArticle({ auid: 'A002' }), id: 2, comments: [] };
    vi.mocked(prisma.article.findMany).mockResolvedValue([a1, a2] as any);

    const repo = new PrismaArticleRepository(prisma);
    const result = await repo.findArticles({});

    expect(result).toHaveLength(2); // a1 → 1 row, a2 → 1 row
    expect(result[0].auid).toBe('A001');
    expect(result[1].auid).toBe('A002');
  });
});

// ── findArticleByAuid ──────────────────────────────────────────────────────────

describe('PrismaArticleRepository.findArticleByAuid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找到文章（無留言）→ 回傳 1 row，comment 欄位皆 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findFirst).mockResolvedValue(makeRawArticle() as any);

    const repo = new PrismaArticleRepository(prisma);
    const result = await repo.findArticleByAuid('AUID00000001');

    expect(result).toHaveLength(1);
    expect(result![0].comment_content).toBeNull();
    expect(result![0].comment_created_time).toBeNull();
    expect(result![0].comment_likes).toBeNull();
    expect(result![0].user_name).toBeNull();
  });

  it('找到文章（有 2 則留言）→ 回傳 2 rows，含留言內容', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findFirst).mockResolvedValue(
      makeRawArticle({ comments: twoComments }) as any,
    );

    const repo = new PrismaArticleRepository(prisma);
    const result = await repo.findArticleByAuid('AUID00000001');

    expect(result).toHaveLength(2);
    expect(result![0].comment_content).toBe('第一則留言');
    expect(result![0].comment_created_time).toEqual(commentTime);
    expect(result![1].comment_content).toBe('第二則留言');
    expect(result![1].comment_likes).toBe(2);
  });

  it('findFirst 回傳 null → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findFirst).mockResolvedValue(null);

    const repo = new PrismaArticleRepository(prisma);
    expect(await repo.findArticleByAuid('NOTEXIST')).toBeNull();
  });

  it('findFirst 拋出例外 → .catch 攔截 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.findFirst).mockRejectedValue(new Error('DB error'));

    const repo = new PrismaArticleRepository(prisma);
    expect(await repo.findArticleByAuid('BADAUID')).toBeNull();
  });
});

// ── createArticle ──────────────────────────────────────────────────────────────

describe('PrismaArticleRepository.createArticle', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 prisma.article.create 並傳入正確欄位（state=0）', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.create).mockResolvedValue({} as any);

    const repo = new PrismaArticleRepository(prisma);
    const auid = await repo.createArticle({
      title: '新文章',
      content: '<p>Hello</p>',
      img: 'new.jpg',
      category_id: 2,
      user_id: 5,
    });

    const callArg = vi.mocked(prisma.article.create).mock.calls[0][0];
    expect(callArg.data).toMatchObject({
      title: '新文章',
      content: '<p>Hello</p>',
      img: 'new.jpg',
      category_id: 2,
      user_id: 5,
      state: 0,
    });
    // auid 傳給 create 的值應與回傳值一致
    expect(callArg.data.auid).toBe(auid);
  });

  it('回傳 12 位英數字組成的 auid', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.create).mockResolvedValue({} as any);

    const repo = new PrismaArticleRepository(prisma);
    const auid = await repo.createArticle({
      title: 'T',
      content: 'C',
      img: 'i.jpg',
      category_id: 1,
      user_id: 1,
    });

    expect(auid).toHaveLength(12);
    expect(auid).toMatch(/^[A-Za-z0-9]{12}$/);
  });
});

// ── updateArticleContent ───────────────────────────────────────────────────────

describe('PrismaArticleRepository.updateArticleContent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 prisma.article.updateMany 並傳入正確 where + data', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.article.updateMany).mockResolvedValue({ count: 1 } as any);

    const repo = new PrismaArticleRepository(prisma);
    await repo.updateArticleContent('AUID00000001', '<p>Updated</p>');

    expect(prisma.article.updateMany).toHaveBeenCalledWith({
      where: { auid: 'AUID00000001' },
      data: { content: '<p>Updated</p>' },
    });
  });
});
