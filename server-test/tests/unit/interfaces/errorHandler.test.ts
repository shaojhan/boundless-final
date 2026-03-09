import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError, z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../src/interfaces/middlewares/errorHandler.js';

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

const req = {} as Request;
const next = vi.fn() as unknown as NextFunction;

describe('errorHandler middleware', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ZodError → 400 with validation details', () => {
    // Generate a real ZodError
    const schema = z.object({ name: z.string() });
    let zodErr: ZodError;
    try {
      schema.parse({ name: 123 });
    } catch (e) {
      zodErr = e as ZodError;
    }

    const res = makeRes();
    errorHandler(zodErr!, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Validation failed' }),
    );
  });

  it('Error with "不存在" → 404', () => {
    const res = makeRes();
    errorHandler(new Error('訂單不存在'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: '訂單不存在' });
  });

  it('Error with "not found" → 404', () => {
    const res = makeRes();
    errorHandler(new Error('resource not found'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('Unknown error → 500', () => {
    const res = makeRes();
    errorHandler(new Error('DB connection failed'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
