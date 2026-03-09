import { describe, it, expect } from 'vitest';
import type { Otp } from '../../../../src/domain/auth/Otp.js';

describe('Otp domain entity', () => {
  const now = new Date();

  const makeOtp = (): Otp => ({
    id: 1,
    userId: 10,
    email: 'user@example.com',
    token: '123456',
    expTimestamp: BigInt(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    createdAt: now,
    updatedAt: now,
  });

  it('contains required fields', () => {
    const otp = makeOtp();
    expect(otp.id).toBe(1);
    expect(otp.userId).toBe(10);
    expect(otp.email).toBe('user@example.com');
    expect(otp.token).toBe('123456');
  });

  it('expTimestamp is a BigInt', () => {
    const otp = makeOtp();
    expect(typeof otp.expTimestamp).toBe('bigint');
  });

  it('can check OTP expiration using expTimestamp vs current timestamp', () => {
    const expiredOtp: Otp = { ...makeOtp(), expTimestamp: BigInt(Date.now() - 1000) };
    const validOtp: Otp = { ...makeOtp(), expTimestamp: BigInt(Date.now() + 15 * 60 * 1000) };

    const nowMs = BigInt(Date.now());
    expect(expiredOtp.expTimestamp < nowMs).toBe(true);
    expect(validOtp.expTimestamp > nowMs).toBe(true);
  });

  it('createdAt and updatedAt are Date instances', () => {
    const otp = makeOtp();
    expect(otp.createdAt).toBeInstanceOf(Date);
    expect(otp.updatedAt).toBeInstanceOf(Date);
  });

  it('token is a string (typically numeric OTP)', () => {
    const otp = makeOtp();
    expect(typeof otp.token).toBe('string');
    expect(otp.token).toMatch(/^\d{6}$/);
  });
});
