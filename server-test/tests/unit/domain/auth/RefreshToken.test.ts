import { describe, it, expect } from 'vitest';
import type { RefreshToken } from '../../../../src/domain/auth/RefreshToken.js';

describe('RefreshToken domain entity', () => {
  const makeToken = (expiresAt: Date): RefreshToken => ({
    id: 1,
    token: 'random-token-string-abc',
    userId: 42,
    expiresAt,
    createdAt: new Date('2025-01-01T00:00:00Z'),
  });

  it('contains required fields', () => {
    const t = makeToken(new Date('2025-02-01T00:00:00Z'));
    expect(t.id).toBe(1);
    expect(t.token).toBe('random-token-string-abc');
    expect(t.userId).toBe(42);
  });

  it('expiresAt and createdAt are Date instances', () => {
    const t = makeToken(new Date('2025-02-01T00:00:00Z'));
    expect(t.expiresAt).toBeInstanceOf(Date);
    expect(t.createdAt).toBeInstanceOf(Date);
  });

  it('a token can be checked for expiration using expiresAt', () => {
    const past = makeToken(new Date('2000-01-01T00:00:00Z'));
    const future = makeToken(new Date('2099-01-01T00:00:00Z'));
    const now = new Date();

    expect(past.expiresAt < now).toBe(true);
    expect(future.expiresAt > now).toBe(true);
  });

  it('token is a non-empty string', () => {
    const t = makeToken(new Date());
    expect(typeof t.token).toBe('string');
    expect(t.token.length).toBeGreaterThan(0);
  });
});
