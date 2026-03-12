import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '#generated/prisma/client.js';
import { PrismaJamRepository } from '#src/repository/jam/PrismaJamRepository.js';

// ── Prisma mock factory ────────────────────────────────────────────────────────

function makePrisma() {
  return {
    genre: { findMany: vi.fn() },
    player: { findMany: vi.fn() },
    jam: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    jamApply: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  } as unknown as PrismaClient;
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const now = new Date('2025-06-01T00:00:00Z');
const juid = 'JUID0000001A';

const genres = [{ id: 1, name: '搖滾' }, { id: 2, name: '爵士' }];
const players = [{ id: 1, name: '吉他' }, { id: 2, name: '貝斯' }, { id: 3, name: '鼓手' }];

function makeJamRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    juid,
    former: '{"id":10,"play":1}',
    member: '[]',
    name: null,
    cover_img: null,
    introduce: null,
    works_link: null,
    title: '找吉他手',
    description: '招募有經驗的吉他手',
    degree: 2,
    genre: '[1]',
    players: '[2,3]',
    region: '台北',
    band_condition: '每週練團',
    created_time: now,
    updated_time: null,
    formed_time: null,
    state: 0,
    valid: 1,
    ...overrides,
  };
}

const formerUser = { id: 10, uid: 'FORMER000001', name: '發起人', img: null, nickname: '團長' };

// ── findJams ───────────────────────────────────────────────────────────────────

describe('PrismaJamRepository.findJams', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無篩選條件 → where 含 valid/state/created_time', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue(genres as any);
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findJams({});

    const callArgs = vi.mocked(prisma.jam.findMany).mock.calls[0][0] as any;
    expect(callArgs.where).toMatchObject({ valid: 1, state: 0 });
    expect(callArgs.where.created_time).toBeDefined();
    expect(result.genreData).toHaveLength(2);
    expect(result.playerData).toHaveLength(3);
  });

  it('帶 degree 篩選 → where.degree 對應', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    await repo.findJams({ degree: 3 });

    const callArgs = vi.mocked(prisma.jam.findMany).mock.calls[0][0] as any;
    expect(callArgs.where.degree).toBe(3);
  });

  it('帶 region=all → where 不含 region', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    await repo.findJams({ region: 'all' });

    const callArgs = vi.mocked(prisma.jam.findMany).mock.calls[0][0] as any;
    expect(callArgs.where.region).toBeUndefined();
  });

  it('帶 region=台北 → where.region=台北', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    await repo.findJams({ region: '台北' });

    const callArgs = vi.mocked(prisma.jam.findMany).mock.calls[0][0] as any;
    expect(callArgs.where.region).toBe('台北');
  });

  it('分頁計算正確（page=2）', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.count).mockResolvedValue(25);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findJams({ page: 2 });

    expect(result.pageTotal).toBe(3); // ceil(25/10)
    expect(result.page).toBe(2);
    const callArgs = vi.mocked(prisma.jam.findMany).mock.calls[0][0] as any;
    expect(callArgs.skip).toBe(10); // (2-1)*10
  });

  it('回傳資料正確解析 genre/players/former JSON 欄位', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue(genres as any);
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);
    vi.mocked(prisma.jam.count).mockResolvedValue(1);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([makeJamRow()] as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([formerUser] as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findJams({});

    expect(result.jamData).toHaveLength(1);
    const row = result.jamData[0];
    expect(row.genre).toEqual([1]);
    expect(row.player).toEqual([2, 3]);
    expect(row.former).toEqual({ id: 10, play: 1 });
    expect(row.member).toEqual([]);
    expect(result.formerData[0].uid).toBe('FORMER000001');
  });

  it('jam.findMany 拋出例外 → 回傳空列表', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockRejectedValue(new Error('DB error'));
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findJams({});

    expect(result.jamData).toHaveLength(0);
    expect(result.formerData).toHaveLength(0);
    expect(result.pageTotal).toBe(0);
  });
});

// ── findJamByJuid ──────────────────────────────────────────────────────────────

describe('PrismaJamRepository.findJamByJuid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('樂團已成立（state=1, valid=1）→ 回傳 { status: formed }', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.findFirst).mockResolvedValueOnce(makeJamRow({ state: 1 }) as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findJamByJuid(juid);

    expect(result.status).toBe('formed');
  });

  it('找不到招募貼文 → 回傳 { status: error }', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.findFirst)
      .mockResolvedValueOnce(null)  // checkFormed
      .mockResolvedValueOnce(null); // jamRow
    vi.mocked(prisma.jamApply.findMany).mockResolvedValue([]);
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findJamByJuid(juid);

    expect(result.status).toBe('error');
  });

  it('找到貼文，無申請 → 回傳 { status: success, applyData: [] }', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.findFirst)
      .mockResolvedValueOnce(null)               // checkFormed → null
      .mockResolvedValueOnce(makeJamRow() as any); // jamRow
    vi.mocked(prisma.jamApply.findMany).mockResolvedValue([]);
    vi.mocked(prisma.genre.findMany).mockResolvedValue(genres as any);
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(formerUser as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findJamByJuid(juid);

    expect(result.status).toBe('success');
    expect(result.applyData).toHaveLength(0);
    expect((result.jamData!.former as any).uid).toBe('FORMER000001');
  });

  it('傳入 uid → 查詢 myApplyState', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makeJamRow() as any);
    vi.mocked(prisma.jamApply.findMany)
      .mockResolvedValueOnce([{ state: 0 }] as any) // myApplyState
      .mockResolvedValueOnce([]);                    // applyData
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(formerUser as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findJamByJuid(juid, 'USER00000001');

    expect(result.myApplyState).toHaveLength(1);
    expect(result.myApplyState![0].state).toBe(0);
  });

  it('有成員 → member 欄位正確展開並 enrich', async () => {
    const prisma = makePrisma();
    const rowWithMember = makeJamRow({ member: '[{"id":20,"play":2}]' });
    vi.mocked(prisma.jam.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(rowWithMember as any);
    vi.mocked(prisma.jamApply.findMany).mockResolvedValue([]);
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(formerUser as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 20, uid: 'MEMBER000002', name: '成員A', img: null, nickname: '小A' },
    ] as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findJamByJuid(juid);

    const members = result.jamData!.member as any[];
    expect(members[0].uid).toBe('MEMBER000002');
    expect(members[0].play).toBe('貝斯');
  });
});

// ── findMyApplies ──────────────────────────────────────────────────────────────

describe('PrismaJamRepository.findMyApplies', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無申請 → 回傳 null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jamApply.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    expect(await repo.findMyApplies('USER00000001')).toBeNull();
  });

  it('有申請 → 回傳含 title 和 applier_playname 的陣列', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jamApply.findMany).mockResolvedValue([
      {
        id: 1, juid, former_uid: 'F1', applier_uid: 'U1',
        applier_play: 1, message: '想加入', state: 0,
        created_time: now, valid: 1,
        jam: { title: '找吉他手' },
      },
    ] as any);
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findMyApplies('U1');

    expect(result).not.toBeNull();
    expect(result![0].title).toBe('找吉他手');
    expect(result![0].applier_playname).toBe('吉他');
  });

  it('過期/解散的 juid 被過濾掉', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jamApply.findMany).mockResolvedValue([
      {
        id: 1, juid: 'EXPIREDJUID1', former_uid: 'F', applier_uid: 'U',
        applier_play: 1, message: '', state: 0, created_time: now, valid: 1,
        jam: { title: '過期的組團' },
      },
    ] as any);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([
      { juid: 'EXPIREDJUID1' },
    ] as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findMyApplies('U');

    // 初始查詢有資料，但過濾後為空 → 回傳空陣列（非 null）
    expect(result).toEqual([]);
  });
});

// ── findFormedJams ─────────────────────────────────────────────────────────────

describe('PrismaJamRepository.findFormedJams (additional paths)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('帶 genre 篩選（非 all）→ where.genre 設定', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    await repo.findFormedJams({ genre: '1' });

    const callArgs = vi.mocked(prisma.jam.findMany).mock.calls[0][0] as any;
    expect(callArgs.where.genre).toBeDefined();
  });

  it('帶 genre=all → where 不含 genre', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    await repo.findFormedJams({ genre: 'all' });

    const callArgs = vi.mocked(prisma.jam.findMany).mock.calls[0][0] as any;
    expect(callArgs.where.genre).toBeUndefined();
  });

  it('帶 region（非 all）→ where.region 設定', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    await repo.findFormedJams({ region: '台南' });

    const callArgs = vi.mocked(prisma.jam.findMany).mock.calls[0][0] as any;
    expect(callArgs.where.region).toBe('台南');
  });

  it('genre.findMany 拋出 → genreData = undefined，仍繼續執行', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockRejectedValue(new Error('genre DB error'));
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findFormedJams({});

    expect(result.genreData).toBeUndefined();
    expect(result.jamData).toHaveLength(0);
  });
});

describe('PrismaJamRepository.findFormedJams', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無篩選 → where 含 valid=1, state=1', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue(genres as any);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    await repo.findFormedJams({});

    const callArgs = vi.mocked(prisma.jam.findMany).mock.calls[0][0] as any;
    expect(callArgs.where).toMatchObject({ valid: 1, state: 1 });
  });

  it('帶 search → where.name.contains', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    await repo.findFormedJams({ search: '搖滾' });

    const callArgs = vi.mocked(prisma.jam.findMany).mock.calls[0][0] as any;
    expect(callArgs.where.name).toEqual({ contains: '搖滾' });
  });

  it('回傳資料正確解析 genre JSON', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue(genres as any);
    vi.mocked(prisma.jam.count).mockResolvedValue(1);
    vi.mocked(prisma.jam.findMany).mockResolvedValue([
      { juid, name: '搖滾樂團', cover_img: null, genre: '[1,2]', formed_time: now, region: '台北' },
    ] as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findFormedJams({});

    expect(result.jamData[0].genre).toEqual([1, 2]);
  });

  it('jam.findMany 拋出例外 → 回傳空列表', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.count).mockResolvedValue(0);
    vi.mocked(prisma.jam.findMany).mockRejectedValue(new Error('DB error'));

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findFormedJams({});

    expect(result.jamData).toHaveLength(0);
  });
});

// ── findFormedJamByJuid ────────────────────────────────────────────────────────

describe('PrismaJamRepository.findFormedJamByJuid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('找不到 → 回傳 { status: error }', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.findFirst).mockResolvedValue(null);

    const repo = new PrismaJamRepository(prisma);
    expect((await repo.findFormedJamByJuid(juid)).status).toBe('error');
  });

  it('找到 → status=success，former 有 uid', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue(genres as any);
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);
    vi.mocked(prisma.jam.findFirst).mockResolvedValue({
      juid, former: '{"id":10,"play":1}', member: '[]',
      name: '搖滾樂團', cover_img: null, introduce: null,
      works_link: null, genre: '[1]', region: '台北', formed_time: now,
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(formerUser as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findFormedJamByJuid(juid);

    expect(result.status).toBe('success');
    expect((result.jamData!.former as any).uid).toBe('FORMER000001');
    expect((result.jamData!.genre as number[])).toEqual([1]);
  });
});

// ── findFormedJamByJuid (additional paths) ─────────────────────────────────────

describe('PrismaJamRepository.findFormedJamByJuid (additional paths)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('jam.findFirst.catch → 回傳 { status: error }', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.findFirst).mockRejectedValue(new Error('findFirst error'));

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findFormedJamByJuid(juid);

    expect(result.status).toBe('error');
  });

  it('有成員 → member 正確解析並 enrich', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue(genres as any);
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);
    vi.mocked(prisma.jam.findFirst).mockResolvedValue({
      juid, former: '{"id":10,"play":1}',
      member: '[{"id":20,"play":2}]',
      name: '搖滾樂團', cover_img: null, introduce: null,
      works_link: null, genre: '[1]', region: '台北', formed_time: now,
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(formerUser as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 20, uid: 'MEMBER000002', name: '成員A', img: null, nickname: '小A' },
    ] as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findFormedJamByJuid(juid);

    expect(result.status).toBe('success');
    const members = result.jamData!.member as any[];
    expect(members[0].uid).toBe('MEMBER000002');
    expect(members[0].play).toBe('貝斯');
  });

  it('user.findUnique 拋出 → former 仍有基本欄位', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue([]);
    vi.mocked(prisma.jam.findFirst).mockResolvedValue({
      juid, former: '{"id":10,"play":1}', member: '[]',
      name: '樂團', cover_img: null, introduce: null,
      works_link: null, genre: '[1]', region: '台北', formed_time: now,
    } as any);
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('user lookup error'));
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findFormedJamByJuid(juid);

    // former.uid should be undefined (from failed lookup) but no throw
    expect(result.status).toBe('success');
    expect((result.jamData!.former as any).uid).toBeUndefined();
  });

  it('user.findMany（成員）拋出 → member 仍輸出（memberData=undefined）', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.genre.findMany).mockResolvedValue([]);
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);
    vi.mocked(prisma.jam.findFirst).mockResolvedValue({
      juid, former: '{"id":10,"play":1}',
      member: '[{"id":20,"play":2}]',
      name: '樂團', cover_img: null, introduce: null,
      works_link: null, genre: '[1]', region: '台北', formed_time: now,
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(formerUser as any);
    vi.mocked(prisma.user.findMany).mockRejectedValue(new Error('findMany error'));

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.findFormedJamByJuid(juid);

    expect(result.status).toBe('success');
    const members = result.jamData!.member as any[];
    // uid will be undefined since memberData lookup failed
    expect(members[0].uid).toBeUndefined();
  });
});

// ── createJam ─────────────────────────────────────────────────────────────────

describe('PrismaJamRepository.createJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('依序執行：user.update → jamApply.updateMany → jam.create', async () => {
    const prisma = makePrisma();
    const callOrder: string[] = [];
    vi.mocked(prisma.user.update).mockImplementation((() => { callOrder.push('user.update'); return Promise.resolve({}) as any; }) as any);
    vi.mocked(prisma.jamApply.updateMany).mockImplementation((() => { callOrder.push('jamApply.updateMany'); return Promise.resolve({}) as any; }) as any);
    vi.mocked(prisma.jam.create).mockImplementation((() => { callOrder.push('jam.create'); return Promise.resolve({}) as any; }) as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.createJam(juid, {
      uid: 'USER00000001',
      title: '找吉他手',
      degree: 2,
      genre: '[1]',
      former: '{"id":10,"play":1}',
      players: '[2,3]',
      region: '台北',
      band_condition: '每週練團',
      description: '描述',
    });

    expect(callOrder).toEqual(['user.update', 'jamApply.updateMany', 'jam.create']);
  });

  it('user.update 使用正確 uid', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);
    vi.mocked(prisma.jamApply.updateMany).mockResolvedValue({ count: 0 } as any);
    vi.mocked(prisma.jam.create).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.createJam(juid, {
      uid: 'USER00000001', title: 'T', degree: 1,
      genre: '[1]', former: '{}', players: '[1]',
      region: 'R', band_condition: '', description: 'D',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { uid: 'USER00000001' },
      data: { my_jam: juid },
    });
  });
});

// ── createApply ───────────────────────────────────────────────────────────────

describe('PrismaJamRepository.createApply', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 jamApply.create 並傳入正確欄位', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jamApply.create).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.createApply({
      juid,
      former_uid: 'FORMER000001',
      applier_uid: 'USER00000001',
      applier_play: 2,
      message: '想加入',
    });

    expect(prisma.jamApply.create).toHaveBeenCalledWith({
      data: { juid, former_uid: 'FORMER000001', applier_uid: 'USER00000001', applier_play: 2, message: '想加入' },
    });
  });
});

// ── updateJamForm ─────────────────────────────────────────────────────────────

describe('PrismaJamRepository.updateJamForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('呼叫 jam.update 更新 title/band_condition/description', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.update).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.updateJamForm(juid, {
      title: '新標題',
      condition: '週末排練',
      description: '新描述',
    });

    expect(prisma.jam.update).toHaveBeenCalledWith({
      where: { juid },
      data: expect.objectContaining({
        title: '新標題',
        band_condition: '週末排練',
        description: '新描述',
      }),
    });
  });
});

// ── joinJam ───────────────────────────────────────────────────────────────────

describe('PrismaJamRepository.joinJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('尚有其他所需樂手 → 回傳 success', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.findUnique).mockResolvedValue(
      makeJamRow({ players: '[2,3]', member: '[]' }) as any
    );
    vi.mocked(prisma.jam.update).mockResolvedValue({} as any);
    vi.mocked(prisma.jamApply.updateMany).mockResolvedValue({ count: 0 } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.joinJam(20, 'USER00000002', juid, 2);

    expect(result).toBe('success');
    // players [2,3] → remove 2 → [3], 未成立
    const updateArg = vi.mocked(prisma.jam.update).mock.calls[0][0] as any;
    expect(updateArg.data.state).toBeUndefined();
  });

  it('最後一名樂手入團 → 回傳 form_success，state=1', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.findUnique).mockResolvedValue(
      makeJamRow({ players: '[2]', member: '[]' }) as any
    );
    vi.mocked(prisma.jam.update).mockResolvedValue({} as any);
    vi.mocked(prisma.jamApply.updateMany).mockResolvedValue({ count: 0 } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.joinJam(20, 'USER00000002', juid, 2);

    expect(result).toBe('form_success');
    const updateArg = vi.mocked(prisma.jam.update).mock.calls[0][0] as any;
    expect(updateArg.data.state).toBe(1);
    expect(updateArg.data.name).toBe('JAM-' + juid);
  });

  it('JAM not found → 拋出 Error', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.findUnique).mockResolvedValue(null);

    const repo = new PrismaJamRepository(prisma);
    await expect(repo.joinJam(20, 'U', juid, 2)).rejects.toThrow('JAM not found');
  });
});

// ── cancelApply / deleteApply ─────────────────────────────────────────────────

describe('PrismaJamRepository.cancelApply / deleteApply', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cancelApply → state=3, valid=0', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jamApply.update).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.cancelApply(5);

    expect(prisma.jamApply.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { state: 3, valid: 0 },
    });
  });

  it('deleteApply → state=4, valid=0', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jamApply.update).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.deleteApply(7);

    expect(prisma.jamApply.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { state: 4, valid: 0 },
    });
  });
});

// ── decideApply ───────────────────────────────────────────────────────────────

describe('PrismaJamRepository.decideApply', () => {
  beforeEach(() => vi.clearAllMocks());

  it('申請已取消（valid=0）→ 回傳 cancel，不更新', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jamApply.findFirst).mockResolvedValue({ id: 3 } as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.decideApply(3, 1);

    expect(result).toBe('cancel');
    expect(prisma.jamApply.update).not.toHaveBeenCalled();
  });

  it('申請有效 → 更新 state 並回傳 success', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jamApply.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.jamApply.update).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    const result = await repo.decideApply(3, 1);

    expect(result).toBe('success');
    expect(prisma.jamApply.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { state: 1 },
    });
  });
});

// ── disbandJam ────────────────────────────────────────────────────────────────

describe('PrismaJamRepository.disbandJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('jam.update valid=0，user.updateMany my_jam=null', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.update).mockResolvedValue({} as any);
    vi.mocked(prisma.user.updateMany).mockResolvedValue({ count: 2 } as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.disbandJam(juid, ['U1', 'U2']);

    expect(prisma.jam.update).toHaveBeenCalledWith({ where: { juid }, data: { valid: 0 } });
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { uid: { in: ['U1', 'U2'] } },
      data: { my_jam: null },
    });
  });
});

// ── quitJam ───────────────────────────────────────────────────────────────────

describe('PrismaJamRepository.quitJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('正確移除成員，恢復 players，清空 my_jam', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);
    vi.mocked(prisma.jam.findUnique).mockResolvedValue(
      makeJamRow({ players: '[3]', member: '[{"id":20,"play":2}]' }) as any
    );
    vi.mocked(prisma.jam.update).mockResolvedValue({} as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.quitJam(20, juid, '貝斯');

    const jamUpdateArg = vi.mocked(prisma.jam.update).mock.calls[0][0] as any;
    const memberStr = JSON.parse(jamUpdateArg.data.member);
    const playersStr = JSON.parse(jamUpdateArg.data.players);
    expect(memberStr).toHaveLength(0);        // 成員移除
    expect(playersStr).toContain(2);          // 貝斯(id=2) 歸還
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { my_jam: null },
    });
  });

  it('找不到 playname → 拋出 Error', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);

    const repo = new PrismaJamRepository(prisma);
    await expect(repo.quitJam(20, juid, '不存在的樂器')).rejects.toThrow('player not found');
  });

  it('JAM not found → 拋出 Error', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.player.findMany).mockResolvedValue(players as any);
    vi.mocked(prisma.jam.findUnique).mockResolvedValue(null);

    const repo = new PrismaJamRepository(prisma);
    await expect(repo.quitJam(20, juid, '吉他')).rejects.toThrow('JAM not found');
  });
});

// ── formJamNow ────────────────────────────────────────────────────────────────

describe('PrismaJamRepository.formJamNow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('更新 jam state=1 並刪除所有申請', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.update).mockResolvedValue({} as any);
    vi.mocked(prisma.jamApply.updateMany).mockResolvedValue({ count: 0 } as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.formJamNow(juid);

    expect(prisma.jam.update).toHaveBeenCalledWith({
      where: { juid },
      data: expect.objectContaining({ state: 1, name: 'JAM-' + juid }),
    });
    expect(prisma.jamApply.updateMany).toHaveBeenCalledWith({
      where: { juid },
      data: { state: 4, valid: 0 },
    });
  });
});

// ── editJamInfo ───────────────────────────────────────────────────────────────

describe('PrismaJamRepository.editJamInfo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無 coverImg → updateData 無 cover_img 欄位', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.update).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.editJamInfo(juid, { bandName: '新樂團名', introduce: '介紹', works_link: '' });

    const callArg = vi.mocked(prisma.jam.update).mock.calls[0][0] as any;
    expect(callArg.data.cover_img).toBeUndefined();
    expect(callArg.data.name).toBe('新樂團名');
  });

  it('有 coverImg → updateData 含 cover_img', async () => {
    const prisma = makePrisma();
    vi.mocked(prisma.jam.update).mockResolvedValue({} as any);

    const repo = new PrismaJamRepository(prisma);
    await repo.editJamInfo(
      juid,
      { bandName: '新樂團名', introduce: '介紹', works_link: '' },
      'new_cover.jpg'
    );

    const callArg = vi.mocked(prisma.jam.update).mock.calls[0][0] as any;
    expect(callArg.data.cover_img).toBe('new_cover.jpg');
  });
});
