import { describe, it, expect } from 'vitest';
import { AuthError } from '../../../../src/domain/auth/AuthError.js';

describe('AuthError', () => {
  it('is an instance of Error', () => {
    const err = new AuthError('test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AuthError);
  });

  it('sets name to "AuthError"', () => {
    expect(new AuthError('msg').name).toBe('AuthError');
  });

  it('sets message correctly', () => {
    expect(new AuthError('something went wrong').message).toBe('something went wrong');
  });

  it('defaults httpStatus to 400', () => {
    expect(new AuthError('msg').httpStatus).toBe(400);
  });

  it('accepts custom httpStatus', () => {
    expect(new AuthError('msg', 'CODE', 401).httpStatus).toBe(401);
  });

  it('accepts optional code', () => {
    expect(new AuthError('msg', 'INVALID_CREDENTIALS').code).toBe('INVALID_CREDENTIALS');
  });

  it('code defaults to undefined when not provided', () => {
    expect(new AuthError('msg').code).toBeUndefined();
  });
});
