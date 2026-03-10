import crypto from 'crypto';
import type { PrismaClient } from '#generated/prisma/client.js';
import type { IRefreshTokenRepository } from './IRefreshTokenRepository.js';

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: number): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + TTL_MS);

    await this.prisma.refreshToken.create({
      data: { token: hashToken(token), user_id: userId, expires_at: expiresAt },
    });
    return token;
  }

  async findValid(token: string): Promise<{ userId: number } | null> {
    const row = await this.prisma.refreshToken.findFirst({
      where: { token: hashToken(token), expires_at: { gt: new Date() } },
      select: { user_id: true },
    });
    return row ? { userId: row.user_id } : null;
  }

  async delete(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token: hashToken(token) } });
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { user_id: userId } });
  }
}
