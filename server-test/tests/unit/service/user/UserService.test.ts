import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IUserProfileRepository } from '../../../../src/repository/user/IUserProfileRepository.js';
import type {
  UserProfile,
  PublicUserHomepage,
  UserWithJam,
} from '../../../../src/domain/user/UserProfile.js';
import { UserService } from '../../../../src/service/user/UserService.js';

// ── Fixtures ───────────────────────────────────────────────────────────────────

const mockProfile: UserProfile = {
  id: 1,
  uid: 'UID000001',
  name: '測試用戶',
  email: 'test@example.com',
  nickname: '暱稱',
  phone: null,
  birthday: null,
  postcode: null,
  country: null,
  township: null,
  address: null,
  genreLike: null,
  playInstrument: null,
  info: null,
  gender: null,
  privacy: 0,
  googleUid: null,
  myJam: null,
  photoUrl: null,
  myLesson: null,
  img: null,
  valid: 1,
};

const mockHomepage: PublicUserHomepage = {
  email: 'test@example.com',
  nickname: '暱稱',
  phone: null,
  birthday: null,
  genre_like: null,
  play_instrument: null,
  info: null,
  gender: null,
  privacy: 0,
  my_jam: null,
  my_jamState: null,
  photo_url: null,
  img: null,
};

const mockUserWithJam: UserWithJam = {
  id: 1,
  uid: 'UID000001',
  name: '測試用戶',
  email: 'test@example.com',
  nickname: '暱稱',
  phone: null,
  birthday: null,
  postcode: null,
  country: null,
  township: null,
  address: null,
  genre_like: null,
  play_instrument: null,
  info: null,
  gender: null,
  privacy: null,
  google_uid: null,
  my_jam: null,
  photo_url: null,
  my_lesson: null,
  img: null,
  my_jamState: null,
  my_jamname: null,
};

// ── Mock repository factory ────────────────────────────────────────────────────

function makeRepo(): IUserProfileRepository {
  return {
    findById: vi.fn(),
    findByUid: vi.fn(),
    getPublicHomepage: vi.fn(),
    getUserWithJam: vi.fn(),
    updateProfile: vi.fn(),
    updateAvatar: vi.fn(),
    getOrders: vi.fn(),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('UserService.getProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.findById 並回傳結果', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findById).mockResolvedValue(mockProfile);

    const service = new UserService(repo);
    const result = await service.getProfile(1);

    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(result).toBe(mockProfile);
  });

  it('找不到用戶 → 回傳 null', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findById).mockResolvedValue(null);

    const service = new UserService(repo);
    expect(await service.getProfile(999)).toBeNull();
  });
});

describe('UserService.getProfileByUid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.findByUid 並回傳結果', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findByUid).mockResolvedValue(mockProfile);

    const service = new UserService(repo);
    const result = await service.getProfileByUid('UID000001');

    expect(repo.findByUid).toHaveBeenCalledWith('UID000001');
    expect(result?.email).toBe('test@example.com');
  });

  it('uid 不存在 → 回傳 null', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findByUid).mockResolvedValue(null);

    const service = new UserService(repo);
    expect(await service.getProfileByUid('NOTEXIST')).toBeNull();
  });
});

describe('UserService.getPublicHomepage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.getPublicHomepage 並回傳結果', async () => {
    const repo = makeRepo();
    vi.mocked(repo.getPublicHomepage).mockResolvedValue(mockHomepage);

    const service = new UserService(repo);
    const result = await service.getPublicHomepage('UID000001');

    expect(repo.getPublicHomepage).toHaveBeenCalledWith('UID000001');
    expect(result?.email).toBe('test@example.com');
  });

  it('找不到 → 回傳 null', async () => {
    const repo = makeRepo();
    vi.mocked(repo.getPublicHomepage).mockResolvedValue(null);

    const service = new UserService(repo);
    expect(await service.getPublicHomepage('GHOST')).toBeNull();
  });
});

describe('UserService.getUserWithJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.getUserWithJam 並回傳結果', async () => {
    const repo = makeRepo();
    vi.mocked(repo.getUserWithJam).mockResolvedValue(mockUserWithJam);

    const service = new UserService(repo);
    const result = await service.getUserWithJam(1);

    expect(repo.getUserWithJam).toHaveBeenCalledWith(1);
    expect(result?.id).toBe(1);
  });

  it('找不到 → 回傳 null', async () => {
    const repo = makeRepo();
    vi.mocked(repo.getUserWithJam).mockResolvedValue(null);

    const service = new UserService(repo);
    expect(await service.getUserWithJam(999)).toBeNull();
  });
});

describe('UserService.updateProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.updateProfile 並回傳更新後的 profile', async () => {
    const repo = makeRepo();
    const updated = { ...mockProfile, nickname: '新暱稱' };
    vi.mocked(repo.updateProfile).mockResolvedValue(updated);

    const service = new UserService(repo);
    const result = await service.updateProfile(1, { nickname: '新暱稱' });

    expect(repo.updateProfile).toHaveBeenCalledWith(1, { nickname: '新暱稱' });
    expect(result.nickname).toBe('新暱稱');
  });
});

describe('UserService.updateAvatar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.updateAvatar 並傳入 img', async () => {
    const repo = makeRepo();
    vi.mocked(repo.updateAvatar).mockResolvedValue();

    const service = new UserService(repo);
    await service.updateAvatar(1, 'new_avatar.jpg');

    expect(repo.updateAvatar).toHaveBeenCalledWith(1, 'new_avatar.jpg');
  });
});

describe('UserService.getOrders', () => {
  beforeEach(() => vi.clearAllMocks());

  it('委派給 repo.getOrders 並回傳訂單列表', async () => {
    const repo = makeRepo();
    const orders = [[{ id: 1, name: '商品A' }], [{ id: 2, name: '商品B' }]];
    vi.mocked(repo.getOrders).mockResolvedValue(orders);

    const service = new UserService(repo);
    const result = await service.getOrders('UID000001');

    expect(repo.getOrders).toHaveBeenCalledWith('UID000001');
    expect(result).toHaveLength(2);
  });

  it('無訂單 → 回傳空陣列', async () => {
    const repo = makeRepo();
    vi.mocked(repo.getOrders).mockResolvedValue([]);

    const service = new UserService(repo);
    expect(await service.getOrders('UID000001')).toEqual([]);
  });
});
