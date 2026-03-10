import { describe, it, expect } from 'vitest';
import type {
  UserProfile,
  PublicUserHomepage,
  UserWithJam,
  UpdateProfileInput,
} from '#src/domain/user/UserProfile.js';

// ── UserProfile 型別結構測試 ────────────────────────────────────────────────────

describe('UserProfile domain type', () => {
  it('必要欄位齊全', () => {
    const profile: UserProfile = {
      id: 1,
      uid: 'UID000001',
      name: '測試用戶',
      email: 'test@example.com',
      nickname: null,
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

    expect(profile.id).toBe(1);
    expect(profile.email).toBe('test@example.com');
    expect(profile.valid).toBe(1);
  });

  it('camelCase 欄位名稱正確（非 snake_case）', () => {
    const profile: UserProfile = {
      id: 2,
      uid: 'UID000002',
      name: 'U2',
      email: 'u2@example.com',
      nickname: '暱稱',
      phone: '0912345678',
      birthday: new Date('2000-06-15'),
      postcode: 100,
      country: '台灣',
      township: '中正區',
      address: '某路1號',
      genreLike: '搖滾',
      playInstrument: '吉他',
      info: '自我介紹',
      gender: 'M',
      privacy: 1,
      googleUid: 'google-uid-xyz',
      myJam: 'JUID0000001A',
      photoUrl: 'https://example.com/photo.jpg',
      myLesson: null,
      img: 'avatar.jpg',
      valid: 1,
    };

    expect(profile.genreLike).toBe('搖滾');
    expect(profile.playInstrument).toBe('吉他');
    expect(profile.googleUid).toBe('google-uid-xyz');
    expect(profile.myJam).toBe('JUID0000001A');
    expect(profile.photoUrl).toBe('https://example.com/photo.jpg');
  });
});

// ── PublicUserHomepage 型別結構測試 ─────────────────────────────────────────────

describe('PublicUserHomepage domain type', () => {
  it('不含 id/uid/name（隱私考量）', () => {
    const homepage: PublicUserHomepage = {
      email: 'pub@example.com',
      nickname: '公開暱稱',
      phone: null,
      birthday: null,
      genre_like: '爵士',
      play_instrument: '鋼琴',
      info: null,
      gender: null,
      privacy: 0,
      my_jam: '搖滾樂團',
      my_jamState: 1,
      photo_url: null,
      img: null,
    };

    expect(homepage.email).toBe('pub@example.com');
    expect(homepage.my_jam).toBe('搖滾樂團');
    expect(homepage.my_jamState).toBe(1);
    // @ts-expect-error — id 不在 PublicUserHomepage
    expect(homepage.id).toBeUndefined();
  });

  it('my_jam / my_jamState 可為 null（未入團）', () => {
    const homepage: PublicUserHomepage = {
      email: 'solo@example.com',
      nickname: null,
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

    expect(homepage.my_jam).toBeNull();
    expect(homepage.my_jamState).toBeNull();
  });
});

// ── UserWithJam 型別結構測試 ─────────────────────────────────────────────────────

describe('UserWithJam domain type', () => {
  it('含 my_jamState 和 my_jamname 擴充欄位', () => {
    const uwj: UserWithJam = {
      id: 1,
      uid: 'UID000001',
      name: '用戶',
      email: 'u@example.com',
      nickname: null,
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
      my_jam: 'JUID0000001A',
      photo_url: null,
      my_lesson: null,
      img: null,
      my_jamState: 0,
      my_jamname: 'JAM-JUID0000001A',
    };

    expect(uwj.my_jamState).toBe(0);
    expect(uwj.my_jamname).toBe('JAM-JUID0000001A');
    // snake_case（DB 欄位映射）
    expect(uwj.genre_like).toBeNull();
  });
});

// ── UpdateProfileInput 型別結構測試 ─────────────────────────────────────────────

describe('UpdateProfileInput domain type', () => {
  it('所有欄位皆為可選', () => {
    // 空物件應合法
    const emptyInput: UpdateProfileInput = {};
    expect(emptyInput).toEqual({});
  });

  it('部分欄位更新', () => {
    const partial: UpdateProfileInput = {
      nickname: '新暱稱',
      phone: null,
      privacy: 1,
    };

    expect(partial.nickname).toBe('新暱稱');
    expect(partial.phone).toBeNull();
    expect(partial.email).toBeUndefined();
  });
});
