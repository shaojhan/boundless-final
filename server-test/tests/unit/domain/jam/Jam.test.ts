import { describe, it, expect } from 'vitest';
import type {
  GenreItem,
  PlayerItem,
  JamFormer,
  JamMemberRaw,
  JamListRow,
  JamListResult,
  JamApplyEnriched,
  JamDetailResult,
  FormedJamListRow,
  FormedJamListResult,
  MyApplyItem,
  JamFindOptions,
  FormedJamFindOptions,
  CreateJamInput,
  CreateApplyInput,
  UpdateJamFormInput,
  EditJamInfoInput,
} from '../../../../src/domain/jam/Jam.js';

// ── Lookup tables ──────────────────────────────────────────────────────────────

describe('GenreItem and PlayerItem', () => {
  it('GenreItem has id and name', () => {
    const g: GenreItem = { id: 1, name: '搖滾' };
    expect(g.id).toBe(1);
    expect(g.name).toBe('搖滾');
  });

  it('PlayerItem has id and name', () => {
    const p: PlayerItem = { id: 2, name: '吉他手' };
    expect(p.id).toBe(2);
    expect(p.name).toBe('吉他手');
  });
});

// ── JamFormer / JamMemberRaw ───────────────────────────────────────────────────

describe('JamFormer and JamMemberRaw', () => {
  it('JamFormer has user id and play (instrument) id', () => {
    const f: JamFormer = { id: 10, play: 3 };
    expect(f.id).toBe(10);
    expect(f.play).toBe(3);
  });

  it('JamMemberRaw matches the same shape as JamFormer', () => {
    const m: JamMemberRaw = { id: 20, play: 1 };
    expect(m.id).toBe(20);
    expect(m.play).toBe(1);
  });
});

// ── JamListRow ────────────────────────────────────────────────────────────────

describe('JamListRow', () => {
  const makeRow = (overrides: Partial<JamListRow> = {}): JamListRow => ({
    id: 1,
    juid: 'j-001',
    former: { id: 5, play: 2 },
    member: [],
    name: null,
    title: 'Looking for a bassist',
    description: 'We are a rock band',
    degree: 2,
    genre: [1, 3],
    player: [2],
    region: '台北',
    band_condition: null,
    created_time: new Date('2025-01-01'),
    updated_time: null,
    state: 0,
    valid: 1,
    ...overrides,
  });

  it('genre and player are parsed number arrays', () => {
    const row = makeRow();
    expect(Array.isArray(row.genre)).toBe(true);
    expect(Array.isArray(row.player)).toBe(true);
    expect(row.genre).toContain(1);
    expect(row.player).toContain(2);
  });

  it('name and band_condition are nullable', () => {
    const row = makeRow();
    expect(row.name).toBeNull();
    expect(row.band_condition).toBeNull();
  });

  it('accepts members in the member array', () => {
    const row = makeRow({ member: [{ id: 7, play: 1 }, { id: 8, play: 3 }] });
    expect(row.member).toHaveLength(2);
    expect(row.member[0].id).toBe(7);
  });

  it('updated_time is null initially', () => {
    const row = makeRow({ updated_time: null });
    expect(row.updated_time).toBeNull();
  });
});

// ── JamListResult ─────────────────────────────────────────────────────────────

describe('JamListResult', () => {
  it('aggregates genre/player lookups + jam data + pagination', () => {
    const result: JamListResult = {
      genreData: [{ id: 1, name: '搖滾' }],
      playerData: [{ id: 1, name: '吉他手' }],
      jamData: [],
      formerData: [],
      pageTotal: 0,
      page: 1,
    };
    expect(result.genreData).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.pageTotal).toBe(0);
  });
});

// ── JamApplyEnriched ──────────────────────────────────────────────────────────

describe('JamApplyEnriched', () => {
  it('contains required apply fields plus formatted date string', () => {
    const apply: JamApplyEnriched = {
      id: 1,
      juid: 'j-001',
      former_uid: 'u-001',
      applier_uid: 'u-002',
      applier_play: 2,
      message: 'I want to join!',
      state: 0,
      created_time: '2025-01-01 12:00:00',
      valid: 1,
    };
    expect(apply.state).toBe(0);
    expect(typeof apply.created_time).toBe('string'); // formatted, not Date
  });

  it('optional applier and play fields default to undefined', () => {
    const apply: JamApplyEnriched = {
      id: 2, juid: 'j-002', former_uid: 'u-003', applier_uid: 'u-004',
      applier_play: 1, message: 'Hi', state: 1, created_time: '2025-02-01', valid: 1,
    };
    expect(apply.play).toBeUndefined();
    expect(apply.applier).toBeUndefined();
  });
});

// ── JamDetailResult ───────────────────────────────────────────────────────────

describe('JamDetailResult', () => {
  it('status="formed" when jam is already formed', () => {
    const result: JamDetailResult = { status: 'formed' };
    expect(result.status).toBe('formed');
    expect(result.jamData).toBeUndefined();
  });

  it('status="success" with full data when jam exists', () => {
    const result: JamDetailResult = {
      status: 'success',
      genreData: [{ id: 1, name: '搖滾' }],
      playerData: [],
      jamData: { id: 1, title: 'Test' },
      applyData: [],
      myApplyState: [],
    };
    expect(result.status).toBe('success');
    expect(result.genreData).toHaveLength(1);
  });

  it('status="error" when jam not found', () => {
    const result: JamDetailResult = { status: 'error' };
    expect(result.status).toBe('error');
  });
});

// ── FormedJamListRow & Result ─────────────────────────────────────────────────

describe('FormedJamListRow', () => {
  it('cover_img and formed_time are nullable', () => {
    const row: FormedJamListRow = {
      juid: 'j-001',
      name: null,
      cover_img: null,
      genre: [1],
      formed_time: null,
      region: '台中',
    };
    expect(row.cover_img).toBeNull();
    expect(row.formed_time).toBeNull();
  });

  it('genre is a parsed number array', () => {
    const row: FormedJamListRow = {
      juid: 'j-002', name: 'Rock Band', cover_img: 'band.png',
      genre: [1, 2, 3], formed_time: new Date(), region: '台北',
    };
    expect(row.genre).toHaveLength(3);
  });
});

describe('FormedJamListResult', () => {
  it('genreData is optional (undefined when not loaded)', () => {
    const result: FormedJamListResult = {
      genreData: undefined,
      jamData: [],
      pageTotal: 0,
      page: 1,
    };
    expect(result.genreData).toBeUndefined();
  });
});

// ── MyApplyItem ───────────────────────────────────────────────────────────────

describe('MyApplyItem', () => {
  it('contains all required apply fields plus jam title', () => {
    const item: MyApplyItem = {
      id: 1, juid: 'j-001', former_uid: 'u-001', applier_uid: 'u-002',
      applier_play: 2, message: 'Join request', state: 0,
      created_time: new Date(), valid: 1, title: 'Looking for drummer',
    };
    expect(item.title).toBe('Looking for drummer');
    expect(item.applier_playname).toBeUndefined();
  });
});

// ── Filter options ────────────────────────────────────────────────────────────

describe('JamFindOptions', () => {
  it('all fields are optional', () => {
    const opts: JamFindOptions = {};
    expect(opts.degree).toBeUndefined();
    expect(opts.genre).toBeUndefined();
    expect(opts.page).toBeUndefined();
  });

  it('order accepts asc or desc', () => {
    const asc: JamFindOptions = { order: 'asc' };
    const desc: JamFindOptions = { order: 'desc' };
    expect(asc.order).toBe('asc');
    expect(desc.order).toBe('desc');
  });
});

describe('FormedJamFindOptions', () => {
  it('search field is optional string', () => {
    const opts: FormedJamFindOptions = { search: '搖滾', region: '台北', page: 2 };
    expect(opts.search).toBe('搖滾');
    expect(opts.page).toBe(2);
  });
});

// ── Input types ───────────────────────────────────────────────────────────────

describe('CreateJamInput', () => {
  it('genre, former, players are JSON strings', () => {
    const input: CreateJamInput = {
      uid: 'u-001',
      title: 'Need a bassist',
      degree: 2,
      genre: '[1,2]',
      former: '{"id":1,"play":2}',
      players: '[1,2,3]',
      region: '台北',
      band_condition: 'No prior band required',
      description: 'We play indie rock',
    };
    // These are JSON strings — parsing must happen in the repository layer
    expect(() => JSON.parse(input.genre)).not.toThrow();
    expect(() => JSON.parse(input.former)).not.toThrow();
    expect(() => JSON.parse(input.players)).not.toThrow();
    expect(JSON.parse(input.genre)).toEqual([1, 2]);
    expect(JSON.parse(input.former)).toEqual({ id: 1, play: 2 });
  });
});

describe('CreateApplyInput', () => {
  it('contains all required apply fields', () => {
    const input: CreateApplyInput = {
      juid: 'j-001',
      former_uid: 'u-001',
      applier_uid: 'u-002',
      applier_play: 3,
      message: 'I can join!',
    };
    expect(input.juid).toBe('j-001');
    expect(input.applier_play).toBe(3);
  });
});

describe('UpdateJamFormInput', () => {
  it('contains title, condition, description', () => {
    const input: UpdateJamFormInput = {
      title: 'Updated title',
      condition: 'New condition',
      description: 'New description',
    };
    expect(input.title).toBe('Updated title');
  });
});

describe('EditJamInfoInput', () => {
  it('contains bandName, introduce, works_link', () => {
    const input: EditJamInfoInput = {
      bandName: 'The Rocks',
      introduce: 'We are a rock band',
      works_link: 'https://youtube.com/watch?v=xyz',
    };
    expect(input.bandName).toBe('The Rocks');
    expect(input.works_link).toBeTruthy();
  });
});
