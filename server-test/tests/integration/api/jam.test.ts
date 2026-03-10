/**
 * Integration tests — Jam HTTP layer
 *
 * 測試範圍：createJamRouter 所有端點的路由、schema 驗證、回應格式及錯誤處理。
 * JamService 以 vi.fn() mock。
 * PUT /editInfo（multer 單檔上傳）屬 E2E 範疇，此處略過。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createJamRouter } from '#interfaces/routers/jamRouter.js';
import type { JamService } from '#service/jam/JamService.js';

// ── Mock service factory ──────────────────────────────────────────────────────

function makeService(): JamService {
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
  } as unknown as JamService;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const jamListResult = { data: [], total: 0, page: 1 };
const formedJamListResult = { data: [], total: 0, page: 1 };

const recruitingJam = {
  status: 'recruiting',
  juid: 'j-001',
  title: 'Test Jam',
  degree: 1,
  genre: '流行',
  region: '台北',
  players: '[]',
  description: '招募中',
};

const validCreateJamBody = {
  uid: 'u-001',
  title: '一起來 Jam',
  degree: '2',
  genre: '流行',
  former: '主唱',
  players: '[]',
  region: '台北',
  condition: '需有演出經驗',
  description: '歡迎加入',
};

const validApplyBody = {
  juid: 'j-001',
  former_uid: 'u-001',
  applier_uid: 'u-002',
  applier_play: '3',
  message: '請讓我加入',
};

// ── App builder ───────────────────────────────────────────────────────────────

function buildApp(service: JamService) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/jam', createJamRouter(service));
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ status: 'error', message: err.message });
  });
  return app;
}

// ── GET /api/jam/allJam ───────────────────────────────────────────────────────

describe('GET /api/jam/allJam', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('無 query params → 200 + 結果', async () => {
    vi.mocked(service.findJams).mockResolvedValue(jamListResult as any);

    const res = await request(buildApp(service)).get('/api/jam/allJam');

    expect(res.status).toBe(200);
    expect(service.findJams).toHaveBeenCalledWith({
      degree: undefined,
      genre: undefined,
      player: undefined,
      region: undefined,
      order: 'asc',
      page: undefined,
    });
  });

  it('order=DESC → 傳遞 desc 給 service', async () => {
    vi.mocked(service.findJams).mockResolvedValue(jamListResult as any);

    await request(buildApp(service)).get('/api/jam/allJam?order=DESC');

    expect(service.findJams).toHaveBeenCalledWith(expect.objectContaining({ order: 'desc' }));
  });

  it('order=ASC → 傳遞 asc 給 service', async () => {
    vi.mocked(service.findJams).mockResolvedValue(jamListResult as any);

    await request(buildApp(service)).get('/api/jam/allJam?order=ASC');

    expect(service.findJams).toHaveBeenCalledWith(expect.objectContaining({ order: 'asc' }));
  });

  it('order 無效值 → 400（schema enum 驗證）', async () => {
    const res = await request(buildApp(service)).get('/api/jam/allJam?order=INVALID');

    expect(res.status).toBe(400);
    expect(service.findJams).not.toHaveBeenCalled();
  });

  it('genre + region 篩選 → 傳遞給 service', async () => {
    vi.mocked(service.findJams).mockResolvedValue(jamListResult as any);

    await request(buildApp(service)).get('/api/jam/allJam?genre=流行&region=台北');

    expect(service.findJams).toHaveBeenCalledWith(
      expect.objectContaining({ genre: '流行', region: '台北' }),
    );
  });

  it('service 拋出例外 → 500', async () => {
    vi.mocked(service.findJams).mockRejectedValue(new Error('DB error'));

    const res = await request(buildApp(service)).get('/api/jam/allJam');

    expect(res.status).toBe(500);
  });
});

// ── GET /api/jam/singleJam/:juid ──────────────────────────────────────────────

describe('GET /api/jam/singleJam/:juid', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有效 juid → 200 + jam 資料', async () => {
    vi.mocked(service.findJamByJuid).mockResolvedValue(recruitingJam as any);

    const res = await request(buildApp(service)).get('/api/jam/singleJam/j-001');

    expect(res.status).toBe(200);
    expect(res.body.juid).toBe('j-001');
    expect(service.findJamByJuid).toHaveBeenCalledWith('j-001', undefined);
  });

  it('帶 uid 路徑 → uid 傳給 service', async () => {
    vi.mocked(service.findJamByJuid).mockResolvedValue(recruitingJam as any);

    await request(buildApp(service)).get('/api/jam/singleJam/j-001/u-002');

    expect(service.findJamByJuid).toHaveBeenCalledWith('j-001', 'u-002');
  });

  it('status=formed → 200 + { status: formed }', async () => {
    vi.mocked(service.findJamByJuid).mockResolvedValue({ status: 'formed' } as any);

    const res = await request(buildApp(service)).get('/api/jam/singleJam/j-999');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('formed');
  });

  it('status=error → 400', async () => {
    vi.mocked(service.findJamByJuid).mockResolvedValue({ status: 'error' } as any);

    const res = await request(buildApp(service)).get('/api/jam/singleJam/j-bad');

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });
});

// ── GET /api/jam/getMyApply/:uid ──────────────────────────────────────────────

describe('GET /api/jam/getMyApply/:uid', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('有申請記錄 → 200 + data', async () => {
    vi.mocked(service.findMyApplies).mockResolvedValue([{ id: 1 }] as any);

    const res = await request(buildApp(service)).get('/api/jam/getMyApply/u-001');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.findMyApplies).toHaveBeenCalledWith('u-001');
  });

  it('無申請記錄（null） → 400', async () => {
    vi.mocked(service.findMyApplies).mockResolvedValue(null);

    const res = await request(buildApp(service)).get('/api/jam/getMyApply/u-001');

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });
});

// ── GET /api/jam/allFormedJam ─────────────────────────────────────────────────

describe('GET /api/jam/allFormedJam', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('無 query → 200', async () => {
    vi.mocked(service.findFormedJams).mockResolvedValue(formedJamListResult as any);

    const res = await request(buildApp(service)).get('/api/jam/allFormedJam');

    expect(res.status).toBe(200);
    expect(service.findFormedJams).toHaveBeenCalledWith({
      search: undefined,
      genre: undefined,
      region: undefined,
      order: 'asc',
      page: undefined,
    });
  });

  it('search 關鍵字 → 傳遞給 service', async () => {
    vi.mocked(service.findFormedJams).mockResolvedValue(formedJamListResult as any);

    await request(buildApp(service)).get('/api/jam/allFormedJam?search=rock');

    expect(service.findFormedJams).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'rock' }),
    );
  });
});

// ── POST /api/jam/form ────────────────────────────────────────────────────────

describe('POST /api/jam/form', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid body → 200 + juid', async () => {
    vi.mocked(service.createJam).mockResolvedValue('j-new');

    const res = await request(buildApp(service))
      .post('/api/jam/form')
      .send(validCreateJamBody);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.juid).toBe('j-new');
    expect(service.createJam).toHaveBeenCalledOnce();
  });

  it('缺少 title → 400', async () => {
    const { title: _t, ...body } = validCreateJamBody;
    const res = await request(buildApp(service)).post('/api/jam/form').send(body);

    expect(res.status).toBe(400);
    expect(service.createJam).not.toHaveBeenCalled();
  });

  it('缺少 description → 400', async () => {
    const { description: _d, ...body } = validCreateJamBody;
    const res = await request(buildApp(service)).post('/api/jam/form').send(body);

    expect(res.status).toBe(400);
    expect(service.createJam).not.toHaveBeenCalled();
  });
});

// ── POST /api/jam/apply ───────────────────────────────────────────────────────

describe('POST /api/jam/apply', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid body → 200 + success', async () => {
    vi.mocked(service.createApply).mockResolvedValue();

    const res = await request(buildApp(service))
      .post('/api/jam/apply')
      .send(validApplyBody);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.createApply).toHaveBeenCalledOnce();
  });

  it('缺少 juid → 400', async () => {
    const { juid: _j, ...body } = validApplyBody;
    const res = await request(buildApp(service)).post('/api/jam/apply').send(body);

    expect(res.status).toBe(400);
    expect(service.createApply).not.toHaveBeenCalled();
  });

  it('缺少 applier_uid → 400', async () => {
    const { applier_uid: _a, ...body } = validApplyBody;
    const res = await request(buildApp(service)).post('/api/jam/apply').send(body);

    expect(res.status).toBe(400);
    expect(service.createApply).not.toHaveBeenCalled();
  });
});

// ── PUT /api/jam/updateForm ───────────────────────────────────────────────────

describe('PUT /api/jam/updateForm', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid body → 200 + success', async () => {
    vi.mocked(service.updateJamForm).mockResolvedValue();

    const res = await request(buildApp(service))
      .put('/api/jam/updateForm')
      .send({ juid: 'j-001', title: '新標題', condition: '', description: '更新說明' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.updateJamForm).toHaveBeenCalledWith('j-001', {
      title: '新標題',
      condition: '',
      description: '更新說明',
    });
  });

  it('缺少 juid → 400', async () => {
    const res = await request(buildApp(service))
      .put('/api/jam/updateForm')
      .send({ title: '新標題', condition: '', description: '更新說明' });

    expect(res.status).toBe(400);
    expect(service.updateJamForm).not.toHaveBeenCalled();
  });
});

// ── PUT /api/jam/cancelApply ──────────────────────────────────────────────────

describe('PUT /api/jam/cancelApply', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid id → 200 + success', async () => {
    vi.mocked(service.cancelApply).mockResolvedValue();

    const res = await request(buildApp(service))
      .put('/api/jam/cancelApply')
      .send({ id: 5 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.cancelApply).toHaveBeenCalledWith(5);
  });

  it('缺少 id → 400', async () => {
    const res = await request(buildApp(service)).put('/api/jam/cancelApply').send({});

    expect(res.status).toBe(400);
    expect(service.cancelApply).not.toHaveBeenCalled();
  });
});

// ── PUT /api/jam/deleteApply ──────────────────────────────────────────────────

describe('PUT /api/jam/deleteApply', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid id → 200 + success', async () => {
    vi.mocked(service.deleteApply).mockResolvedValue();

    const res = await request(buildApp(service))
      .put('/api/jam/deleteApply')
      .send({ id: 7 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.deleteApply).toHaveBeenCalledWith(7);
  });

  it('缺少 id → 400', async () => {
    const res = await request(buildApp(service)).put('/api/jam/deleteApply').send({});

    expect(res.status).toBe(400);
  });
});

// ── PUT /api/jam/decideApply ──────────────────────────────────────────────────

describe('PUT /api/jam/decideApply', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('核准申請 → 200 + success + state', async () => {
    vi.mocked(service.decideApply).mockResolvedValue('success');

    const res = await request(buildApp(service))
      .put('/api/jam/decideApply')
      .send({ id: 3, state: 1 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.state).toBe(1);
  });

  it('取消申請（service 回傳 cancel）→ 200 + cancel', async () => {
    vi.mocked(service.decideApply).mockResolvedValue('cancel');

    const res = await request(buildApp(service))
      .put('/api/jam/decideApply')
      .send({ id: 3, state: 2 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancel');
  });

  it('缺少 state → 400', async () => {
    const res = await request(buildApp(service))
      .put('/api/jam/decideApply')
      .send({ id: 3 });

    expect(res.status).toBe(400);
    expect(service.decideApply).not.toHaveBeenCalled();
  });
});

// ── PUT /api/jam/disband ──────────────────────────────────────────────────────

describe('PUT /api/jam/disband', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid body → 200 + success', async () => {
    vi.mocked(service.disbandJam).mockResolvedValue();

    const res = await request(buildApp(service))
      .put('/api/jam/disband')
      .send({ juid: 'j-001', ids: '["u-001","u-002"]' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.disbandJam).toHaveBeenCalledWith('j-001', ['u-001', 'u-002']);
  });

  it('缺少 juid → 400', async () => {
    const res = await request(buildApp(service))
      .put('/api/jam/disband')
      .send({ ids: '[]' });

    expect(res.status).toBe(400);
    expect(service.disbandJam).not.toHaveBeenCalled();
  });
});

// ── PUT /api/jam/quit ─────────────────────────────────────────────────────────

describe('PUT /api/jam/quit', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid body → 200 + success', async () => {
    vi.mocked(service.quitJam).mockResolvedValue();

    const res = await request(buildApp(service))
      .put('/api/jam/quit')
      .send({ id: 10, juid: 'j-001', playname: '主唱' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.quitJam).toHaveBeenCalledWith(10, 'j-001', '主唱');
  });

  it('缺少 playname → 400', async () => {
    const res = await request(buildApp(service))
      .put('/api/jam/quit')
      .send({ id: 10, juid: 'j-001' });

    expect(res.status).toBe(400);
    expect(service.quitJam).not.toHaveBeenCalled();
  });
});

// ── PUT /api/jam/formRightNow ─────────────────────────────────────────────────

describe('PUT /api/jam/formRightNow', () => {
  let service: JamService;

  beforeEach(() => {
    service = makeService();
    vi.clearAllMocks();
  });

  it('valid juid → 200 + success', async () => {
    vi.mocked(service.formJamNow).mockResolvedValue();

    const res = await request(buildApp(service))
      .put('/api/jam/formRightNow')
      .send({ juid: 'j-001' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(service.formJamNow).toHaveBeenCalledWith('j-001');
  });

  it('缺少 juid → 400', async () => {
    const res = await request(buildApp(service)).put('/api/jam/formRightNow').send({});

    expect(res.status).toBe(400);
    expect(service.formJamNow).not.toHaveBeenCalled();
  });
});
