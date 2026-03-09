import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JamService } from '../../../../src/service/jam/JamService.js';
import type { IJamRepository } from '../../../../src/repository/jam/IJamRepository.js';
import type {
  JamListResult,
  JamDetailResult,
  MyApplyItem,
  FormedJamListResult,
  FormedJamDetailResult,
} from '../../../../src/domain/jam/Jam.js';

// ── Fixtures ───────────────────────────────────────────────────────────────────

const now = new Date('2025-01-01T00:00:00Z');

const mockJamListResult: JamListResult = {
  genreData: [{ id: 1, name: '搖滾' }],
  playerData: [{ id: 1, name: '吉他' }],
  jamData: [],
  formerData: [],
  pageTotal: 0,
  page: 1,
};

const mockJamDetailSuccess: JamDetailResult = {
  status: 'success',
  genreData: [{ id: 1, name: '搖滾' }],
  playerData: [{ id: 1, name: '吉他' }],
  jamData: { juid: 'JUID0000001A' },
  applyData: [],
  myApplyState: [],
};

const mockMyApply: MyApplyItem = {
  id: 1,
  juid: 'JUID0000001A',
  former_uid: 'FORMER000001',
  applier_uid: 'USER00000001',
  applier_play: 1,
  message: '想加入',
  state: 0,
  created_time: now,
  valid: 1,
  title: '找吉他手',
  applier_playname: '吉他',
};

const mockFormedListResult: FormedJamListResult = {
  genreData: [{ id: 1, name: '搖滾' }],
  jamData: [],
  pageTotal: 0,
  page: 1,
};

const mockFormedDetailSuccess: FormedJamDetailResult = {
  status: 'success',
  genreData: [{ id: 1, name: '搖滾' }],
  jamData: { juid: 'JUID0000001A' },
};

function makeRepo(): IJamRepository {
  return {
    findJams: vi.fn(),
    findJamByJuid: vi.fn(),
    findMyApplies: vi.fn(),
    findFormedJams: vi.fn(),
    findFormedJamByJuid: vi.fn(),
    createJam: vi.fn(),
    createApply: vi.fn(),
    updateJamForm: vi.fn(),
    joinJam: vi.fn(),
    cancelApply: vi.fn(),
    deleteApply: vi.fn(),
    decideApply: vi.fn(),
    disbandJam: vi.fn(),
    quitJam: vi.fn(),
    formJamNow: vi.fn(),
    editJamInfo: vi.fn(),
  };
}

// ── findJams ───────────────────────────────────────────────────────────────────

describe('JamService.findJams', () => {
  beforeEach(() => vi.clearAllMocks());

  it('傳入 opts → 委派給 repo 並回傳結果', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findJams).mockResolvedValue(mockJamListResult);

    const service = new JamService(repo);
    const result = await service.findJams({ genre: '1', page: 2 });

    expect(result).toBe(mockJamListResult);
    expect(repo.findJams).toHaveBeenCalledWith({ genre: '1', page: 2 });
  });
});

// ── findJamByJuid ──────────────────────────────────────────────────────────────

describe('JamService.findJamByJuid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('status=success → 回傳詳細資料', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findJamByJuid).mockResolvedValue(mockJamDetailSuccess);

    const service = new JamService(repo);
    const result = await service.findJamByJuid('JUID0000001A', 'USER00000001');

    expect(result.status).toBe('success');
    expect(repo.findJamByJuid).toHaveBeenCalledWith('JUID0000001A', 'USER00000001');
  });

  it('status=formed → 回傳 formed', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findJamByJuid).mockResolvedValue({ status: 'formed' });

    const service = new JamService(repo);
    const result = await service.findJamByJuid('JUID0000001A');

    expect(result.status).toBe('formed');
    expect(repo.findJamByJuid).toHaveBeenCalledWith('JUID0000001A', undefined);
  });

  it('status=error → 回傳 error', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findJamByJuid).mockResolvedValue({ status: 'error' });

    const service = new JamService(repo);
    expect((await service.findJamByJuid('NOTEXIST')).status).toBe('error');
  });
});

// ── findMyApplies ──────────────────────────────────────────────────────────────

describe('JamService.findMyApplies', () => {
  beforeEach(() => vi.clearAllMocks());

  it('有申請資料 → 回傳陣列', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findMyApplies).mockResolvedValue([mockMyApply]);

    const service = new JamService(repo);
    const result = await service.findMyApplies('USER00000001');

    expect(result).toHaveLength(1);
    expect(result![0].juid).toBe('JUID0000001A');
    expect(repo.findMyApplies).toHaveBeenCalledWith('USER00000001');
  });

  it('無申請資料 → repo 回傳 null → 服務也回傳 null', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findMyApplies).mockResolvedValue(null);

    const service = new JamService(repo);
    expect(await service.findMyApplies('NOBODY')).toBeNull();
  });
});

// ── findFormedJams ─────────────────────────────────────────────────────────────

describe('JamService.findFormedJams', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派 opts 給 repo 並回傳結果', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findFormedJams).mockResolvedValue(mockFormedListResult);

    const service = new JamService(repo);
    const result = await service.findFormedJams({ search: '搖滾', page: 1 });

    expect(result).toBe(mockFormedListResult);
    expect(repo.findFormedJams).toHaveBeenCalledWith({ search: '搖滾', page: 1 });
  });
});

// ── findFormedJamByJuid ────────────────────────────────────────────────────────

describe('JamService.findFormedJamByJuid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('status=success → 回傳樂團詳細', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findFormedJamByJuid).mockResolvedValue(mockFormedDetailSuccess);

    const service = new JamService(repo);
    const result = await service.findFormedJamByJuid('JUID0000001A');

    expect(result.status).toBe('success');
    expect(repo.findFormedJamByJuid).toHaveBeenCalledWith('JUID0000001A');
  });
});

// ── createJam ─────────────────────────────────────────────────────────────────

describe('JamService.createJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('生成 12 位英數字 juid 並傳給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.createJam).mockResolvedValue();

    const service = new JamService(repo);
    const juid = await service.createJam({
      uid: 'USER00000001',
      title: '找吉他手',
      degree: 2,
      genre: '[1]',
      former: '{"id":10,"play":1}',
      players: '[2,3]',
      region: '台北',
      band_condition: '每週練團',
      description: '希望找到有經驗的吉他手',
    });

    expect(juid).toHaveLength(12);
    expect(juid).toMatch(/^[A-Za-z0-9]{12}$/);
    expect(repo.createJam).toHaveBeenCalledWith(juid, expect.objectContaining({ uid: 'USER00000001' }));
  });

  it('每次呼叫生成不同的 juid', async () => {
    const repo = makeRepo();
    vi.mocked(repo.createJam).mockResolvedValue();

    const service = new JamService(repo);
    const input = {
      uid: 'USER00000001',
      title: 'T',
      degree: 1,
      genre: '[1]',
      former: '{"id":10,"play":1}',
      players: '[2]',
      region: '台北',
      band_condition: '',
      description: 'D',
    };
    const juids = await Promise.all([
      service.createJam(input),
      service.createJam(input),
      service.createJam(input),
    ]);
    const unique = new Set(juids);
    expect(unique.size).toBeGreaterThan(1);
  });
});

// ── createApply ───────────────────────────────────────────────────────────────

describe('JamService.createApply', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.createApply).mockResolvedValue();

    const service = new JamService(repo);
    await service.createApply({
      juid: 'JUID0000001A',
      former_uid: 'FORMER000001',
      applier_uid: 'USER00000001',
      applier_play: 2,
      message: '我想加入',
    });

    expect(repo.createApply).toHaveBeenCalledWith(
      expect.objectContaining({ juid: 'JUID0000001A', applier_play: 2 })
    );
  });
});

// ── updateJamForm ─────────────────────────────────────────────────────────────

describe('JamService.updateJamForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派 juid + data 給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.updateJamForm).mockResolvedValue();

    const service = new JamService(repo);
    await service.updateJamForm('JUID0000001A', {
      title: '新標題',
      condition: '週末練習',
      description: '更新描述',
    });

    expect(repo.updateJamForm).toHaveBeenCalledWith(
      'JUID0000001A',
      expect.objectContaining({ title: '新標題' })
    );
  });
});

// ── joinJam ───────────────────────────────────────────────────────────────────

describe('JamService.joinJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳 success', async () => {
    const repo = makeRepo();
    vi.mocked(repo.joinJam).mockResolvedValue('success');

    const service = new JamService(repo);
    const result = await service.joinJam(10, 'USER00000001', 'JUID0000001A', 2);

    expect(result).toBe('success');
    expect(repo.joinJam).toHaveBeenCalledWith(10, 'USER00000001', 'JUID0000001A', 2);
  });

  it('回傳 form_success（最後一名成員入團）', async () => {
    const repo = makeRepo();
    vi.mocked(repo.joinJam).mockResolvedValue('form_success');

    const service = new JamService(repo);
    expect(await service.joinJam(10, 'U', 'J', 1)).toBe('form_success');
  });
});

// ── cancelApply / deleteApply ─────────────────────────────────────────────────

describe('JamService.cancelApply / deleteApply', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cancelApply 委派 id 給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.cancelApply).mockResolvedValue();

    const service = new JamService(repo);
    await service.cancelApply(5);

    expect(repo.cancelApply).toHaveBeenCalledWith(5);
  });

  it('deleteApply 委派 id 給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.deleteApply).mockResolvedValue();

    const service = new JamService(repo);
    await service.deleteApply(7);

    expect(repo.deleteApply).toHaveBeenCalledWith(7);
  });
});

// ── decideApply ───────────────────────────────────────────────────────────────

describe('JamService.decideApply', () => {
  beforeEach(() => vi.clearAllMocks());

  it('回傳 success', async () => {
    const repo = makeRepo();
    vi.mocked(repo.decideApply).mockResolvedValue('success');

    const service = new JamService(repo);
    const result = await service.decideApply(3, 1);

    expect(result).toBe('success');
    expect(repo.decideApply).toHaveBeenCalledWith(3, 1);
  });

  it('申請已取消 → 回傳 cancel', async () => {
    const repo = makeRepo();
    vi.mocked(repo.decideApply).mockResolvedValue('cancel');

    const service = new JamService(repo);
    expect(await service.decideApply(3, 1)).toBe('cancel');
  });
});

// ── disbandJam ────────────────────────────────────────────────────────────────

describe('JamService.disbandJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派 juid + memberUids 給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.disbandJam).mockResolvedValue();

    const service = new JamService(repo);
    await service.disbandJam('JUID0000001A', ['U1', 'U2']);

    expect(repo.disbandJam).toHaveBeenCalledWith('JUID0000001A', ['U1', 'U2']);
  });
});

// ── quitJam ───────────────────────────────────────────────────────────────────

describe('JamService.quitJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派 userId + juid + playname 給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.quitJam).mockResolvedValue();

    const service = new JamService(repo);
    await service.quitJam(10, 'JUID0000001A', '吉他');

    expect(repo.quitJam).toHaveBeenCalledWith(10, 'JUID0000001A', '吉他');
  });
});

// ── formJamNow ────────────────────────────────────────────────────────────────

describe('JamService.formJamNow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派 juid 給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.formJamNow).mockResolvedValue();

    const service = new JamService(repo);
    await service.formJamNow('JUID0000001A');

    expect(repo.formJamNow).toHaveBeenCalledWith('JUID0000001A');
  });
});

// ── editJamInfo ───────────────────────────────────────────────────────────────

describe('JamService.editJamInfo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('無 coverImg → 委派 undefined', async () => {
    const repo = makeRepo();
    vi.mocked(repo.editJamInfo).mockResolvedValue();

    const service = new JamService(repo);
    await service.editJamInfo('JUID0000001A', {
      bandName: '搖滾樂團',
      introduce: '我們的介紹',
      works_link: 'https://example.com',
    });

    expect(repo.editJamInfo).toHaveBeenCalledWith(
      'JUID0000001A',
      expect.objectContaining({ bandName: '搖滾樂團' }),
      undefined
    );
  });

  it('有 coverImg → 傳遞給 repo', async () => {
    const repo = makeRepo();
    vi.mocked(repo.editJamInfo).mockResolvedValue();

    const service = new JamService(repo);
    await service.editJamInfo(
      'JUID0000001A',
      { bandName: '搖滾樂團', introduce: '介紹', works_link: '' },
      'cover.jpg'
    );

    expect(repo.editJamInfo).toHaveBeenCalledWith(
      'JUID0000001A',
      expect.any(Object),
      'cover.jpg'
    );
  });
});
