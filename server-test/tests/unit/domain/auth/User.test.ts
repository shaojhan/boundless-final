import { describe, it, expect } from 'vitest';
import type { User, UserPublic, NewUserInput, GoogleUserInput } from '../../../../src/domain/auth/User.js';

describe('User domain entity', () => {
  const now = new Date();

  const makeUser = (): User => ({
    id: 1,
    uid: 'u-abc123',
    name: 'Alice',
    email: 'alice@example.com',
    passwordHash: '$2b$10$hash',
    nickname: null,
    phone: null,
    birthday: new Date('2000-01-01'),
    img: null,
    googleUid: null,
    photoUrl: null,
    myJam: null,
    valid: 1,
    createdTime: now,
    updatedTime: now,
  });

  it('required fields are present', () => {
    const u = makeUser();
    expect(u.id).toBe(1);
    expect(u.uid).toBe('u-abc123');
    expect(u.email).toBe('alice@example.com');
    expect(u.passwordHash).toBeTruthy();
    expect(u.valid).toBe(1);
  });

  it('nullable fields accept null', () => {
    const u = makeUser();
    expect(u.nickname).toBeNull();
    expect(u.phone).toBeNull();
    expect(u.img).toBeNull();
    expect(u.googleUid).toBeNull();
    expect(u.photoUrl).toBeNull();
    expect(u.myJam).toBeNull();
  });

  it('nullable fields accept string values', () => {
    const u: User = { ...makeUser(), nickname: 'Ali', phone: '0912345678', img: 'avatar.png', myJam: 'j-001' };
    expect(u.nickname).toBe('Ali');
    expect(u.phone).toBe('0912345678');
    expect(u.img).toBe('avatar.png');
    expect(u.myJam).toBe('j-001');
  });

  it('birthday and timestamps are Date instances', () => {
    const u = makeUser();
    expect(u.birthday).toBeInstanceOf(Date);
    expect(u.createdTime).toBeInstanceOf(Date);
    expect(u.updatedTime).toBeInstanceOf(Date);
  });
});

describe('UserPublic projection', () => {
  it('contains only public-safe fields', () => {
    const pub: UserPublic = {
      id: 1,
      uid: 'u-abc123',
      name: 'Alice',
      email: 'alice@example.com',
      img: null,
      myJam: null,
    };
    expect(pub).not.toHaveProperty('passwordHash');
    expect(pub).not.toHaveProperty('googleUid');
    expect(pub.img).toBeNull();
    expect(pub.myJam).toBeNull();
  });

  it('img and myJam accept string values', () => {
    const pub: UserPublic = { id: 2, uid: 'u-xyz', name: 'Bob', email: 'bob@example.com', img: 'bob.png', myJam: 'j-999' };
    expect(pub.img).toBe('bob.png');
    expect(pub.myJam).toBe('j-999');
  });
});

describe('NewUserInput', () => {
  it('requires name, email, and password', () => {
    const input: NewUserInput = {
      name: 'Carol',
      email: 'carol@example.com',
      password: 'secret123',
    };
    expect(input.name).toBe('Carol');
    expect(input.email).toBe('carol@example.com');
    expect(input.password).toBe('secret123');
  });
});

describe('GoogleUserInput', () => {
  it('requires googleUid, email, and name; photoUrl is optional', () => {
    const input: GoogleUserInput = {
      googleUid: 'goog-uid-1',
      email: 'dan@gmail.com',
      name: 'Dan',
    };
    expect(input.googleUid).toBe('goog-uid-1');
    expect(input.photoUrl).toBeUndefined();
  });

  it('accepts optional photoUrl', () => {
    const input: GoogleUserInput = {
      googleUid: 'goog-uid-2',
      email: 'eve@gmail.com',
      name: 'Eve',
      photoUrl: 'https://lh3.googleusercontent.com/photo.jpg',
    };
    expect(input.photoUrl).toBe('https://lh3.googleusercontent.com/photo.jpg');
  });
});
